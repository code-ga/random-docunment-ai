import Elysia, { t } from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { documentService } from "../services/Document";
import { workspaceService } from "../services/Workspace";
import { baseResponseType, documentSelectType } from "../types";
import { getContentOfFile as getContentOfFile, isPdfOrDocx } from "../utils/file";

export const documentRouter = new Elysia({ prefix: "/document", name: "document/router" })
  .use(documentService)
  .use(workspaceService)
  .guard({
    detail: {
      security: [{
        cookieAuth: ["__Secure-better-auth.session_token"]
      }],
      tags: ["document", "authenticated"]
    }
  },
    app =>
      app
        .resolve(userMiddleware)
        .get("/list/:id", async (ctx) => {
          const { id } = ctx.params;
          const { id: userId } = ctx.user;
          const workspacePublic = await ctx.workspaceService.isWorkspacePublic(id);
          if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (workspacePublic.type == "Private" && workspacePublic.userID !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const documents = await ctx.documentService.getDocumentsByWorkspaceId(id);
          return {
            status: 200,
            message: "Workspace fetched successfully",
            success: true,
            type: "success",
            data: {
              documents: documents
            }
          }
        },
          {
            params: t.Object({
              id: t.String({
                description: "Workspace id"
              })
            }),
            response: {
              200: baseResponseType(t.Object({ documents: t.Array(documentSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
            },
          }
        ).get("/:id", async (ctx) => {
          const { id } = ctx.params;
          const document = await ctx.documentService.getDocumentById(id);
          if (!document.length || !document[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Document not found" });
          }
          const workspacePublic = await ctx.workspaceService.isWorkspacePublic(document[0].workspaceId);
          if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (workspacePublic.type == "Private" && workspacePublic.userID !== ctx.user.id) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          return {
            status: 200,
            message: "Document fetched successfully",
            success: true,
            type: "success",
            data: {
              document: document
            }
          }
        },
          {
            params: t.Object({
              id: t.String()
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
            },
          }
        )
        .post("/create/:id/from-raw", async (ctx) => {
          const { id } = ctx.user;
          const { id: workspaceId } = ctx.params;
          const { name, content } = ctx.body;
          const document = await ctx.documentService.createDocument(id, workspaceId, content, undefined, name);
          if (!document) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "Document not created" });
          }
          if ("error" in document) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: document.error });
          }
          return {
            status: 200,
            message: "Document created successfully",
            success: true,
            type: "success",
            data: {
              document: document
            }
          }
        },
          {
            params: t.Object({
              id: t.String(
                {
                  description: "Workspace id"
                }
              )
            }),
            body: t.Object({
              name: t.String(),
              content: t.String()
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
              400: baseResponseType(t.Null()),
            },
          }
        )
        .post("/create/:id/from-file", async (ctx) => {
          const { id } = ctx.user;
          const { id: workspaceId } = ctx.params;
          const { name, file } = ctx.body;
          if (!isPdfOrDocx(file.type)) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "Invalid file type" });
          }
          const content = await getContentOfFile(file);
          console.log(content)
          const document = await ctx.documentService.createDocument(id, workspaceId, content, undefined, name);
          if (!document) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "Document not created" });
          }
          if ("error" in document) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: document.error });
          }
          return {
            status: 200,
            message: "Document created successfully",
            success: true,
            type: "success",
            data: {
              document: document
            }
          }
        },
          {
            params: t.Object({
              id: t.String(
                {
                  description: "Workspace id"
                }
              )
            }),
            body: t.Object({
              name: t.String(),
              file: t.File({
                description: "File to upload"
              })
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
              400: baseResponseType(t.Null()),
            },
          }
        )
        .post("/create/:id/from-files", async (ctx) => {
          const { id } = ctx.user;
          const { id: workspaceId } = ctx.params;
          const { files } = ctx.body;
          if (!files.every(file => isPdfOrDocx(file.type))) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "Invalid file type" });
          }
          const documentCreated = await Promise.all(files.map(async (file) => {
            const content = await getContentOfFile(file);
            return { name: file.name, document: await ctx.documentService.createDocument(id, workspaceId, content, undefined, file.name) };
          }))

          return {
            status: 200,
            message: "Document created successfully",
            success: true,
            type: "success",
            data: {
              document: documentCreated
            }
          }
        },
          {
            params: t.Object({
              id: t.String(
                {
                  description: "Workspace id"
                }
              )
            }),
            body: t.Object({
              files: t.Array(t.File())
            }),
            response: {
              200: baseResponseType(t.Object({
                document: t.Array(t.Object({
                  name: t.String(),
                  document: t.Union([t.Array(documentSelectType), t.Object({ error: t.String() })])
                }))
              })),
              400: baseResponseType(t.Null()),
            },
          }

        )
        .put("/update/:id", async (ctx) => {
          const { id } = ctx.params;
          const { name } = ctx.body;
          const { id: userId } = ctx.user;
          const document = await ctx.documentService.getDocumentById(id);
          if (!document.length || !document[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Document not found" });
          }
          const workspacePublic = await ctx.workspaceService.isWorkspacePublic(document[0].workspaceId);
          if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (workspacePublic.type == "Private" && workspacePublic.userID !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }

          if (!document.length || !document[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Document not found" });
          }
          if (document[0].userId !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          if (!name) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "Name is required" });
          }
          const updatedDocument = await ctx.documentService.updateDocument(id, name);
          return {
            status: 200,
            message: "Document updated successfully",
            success: true,
            type: "success",
            data: {
              document: updatedDocument
            }
          }
        },
          {
            params: t.Object({
              id: t.String()
            }),
            body: t.Object({
              name: t.Optional(t.String()),
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
              400: baseResponseType(t.Null()),
            },
          }
        )
        .delete("/delete", async (ctx) => {
          const { id } = ctx.body;
          const { id: userId } = ctx.user;
          const workspacePublic = await ctx.workspaceService.isWorkspacePublic(id);
          if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (workspacePublic.type == "Private" && workspacePublic.userID !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const alreadyExists = await ctx.documentService.getDocumentById(id);
          if (!alreadyExists.length || !alreadyExists[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Document not found" });
          }
          if (alreadyExists[0].userId !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const document = await ctx.documentService.deleteDocument(id);
          return {
            status: 200,
            message: "Document deleted successfully",
            success: true,
            type: "success",
            data: {
              document: document
            }
          }
        },
          {
            body: t.Object({
              id: t.String()
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
            },
          }
        )
  )
