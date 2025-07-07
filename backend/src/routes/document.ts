import Elysia, { t } from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { documentService } from "../services/Document";
import { workspaceService } from "../services/Workspace";
import { baseResponseType, documentSelectType } from "../types";

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
        .post("/create/:id", async (ctx) => {
          const { id } = ctx.user;
          const { id: workspaceId } = ctx.params;
          const { name } = ctx.body as { name: string, workspaceId: string };
          const document = await ctx.documentService.createDocument(id, workspaceId, name);
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
            }),
            response: {
              200: baseResponseType(t.Object({ document: t.Array(documentSelectType) })),
            },
          }
        )
  )
