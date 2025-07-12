import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { table } from "../database/schema";
import { userMiddleware } from "../middlewares/auth-middleware";
import { workspaceService } from "../services/Workspace";
import { baseResponseType, documentSelectType, workspaceSelectType } from "../types";
import { auth } from "../libs/auth/auth";

export const workspaceRouter = new Elysia({ prefix: "/workspace", name: "workspace/router" })
  .use(workspaceService)
  .get("/:id", async (ctx) => {
    const { id } = ctx.params;
    const workspace = await ctx.workspaceService.getWorkspaceById(id);
    if (!workspace.length || !workspace[0]) {
      return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
    }
    if (!workspace[0].public) {
      const userSession = await auth.api.getSession({ headers: ctx.request.headers });
      if (!userSession) {
        return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is missing" });
      }
      if (userSession.user.id !== workspace[0].userId) {
        return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
      }
    }

    return {
      status: 200,
      message: "Workspace fetched successfully",
      success: true,
      type: "success",
      data: {
        workspace: workspace[0]
      }
    }
  },
    {
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: baseResponseType(t.Object({ workspace: workspaceSelectType })),
        404: baseResponseType(t.Null()),
        401: baseResponseType(t.Null()),
      },
    }
  )
  .guard({
    detail: {
      security: [{
        cookieAuth: ["__Secure-better-auth.session_token"]
      }],
      tags: ["workspace", "authenticated"]
    }
  },
    app =>
      app
        .resolve(userMiddleware)
        .get("/list-workspace", async ctx => {
          const { id } = ctx.user;
          const workspace = await ctx.workspaceService.getWorkspacesByUserId(id);
          return {
            status: 200,
            message: "Workspace fetched successfully",
            success: true,
            type: "success",
            data: {
              workspace: workspace
            }
          }
        },
          {
            response: {
              200: baseResponseType(t.Object({ workspace: t.Array(workspaceSelectType) })),
              404: baseResponseType(t.Null()),
            },
          }
        )
        .post("/create", async ctx => {
          const { id } = ctx.user;
          const { name, description, public: isPublic } = ctx.body;
          const workspace = await ctx.workspaceService.createWorkspace(name, id, description, isPublic);
          return {
            status: 200,
            message: "Workspace created successfully",
            success: true,
            type: "success",
            data: {
              workspace: workspace
            }
          }
        },
          {
            body: t.Object({
              name: t.String(),
              description: t.Optional(t.String()),
              public: t.Optional(t.Boolean()),
            }),
            response: {
              200: baseResponseType(t.Object({ workspace: t.Array(workspaceSelectType) })),
            },
          }
        )
        .delete("/delete/:id", async (ctx) => {
          const { id } = ctx.params;
          const alreadyWorkspace = await ctx.workspaceService.getWorkspaceById(id);
          if (!alreadyWorkspace.length || !alreadyWorkspace[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (alreadyWorkspace[0].userId !== ctx.user.id) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const workspace = await ctx.workspaceService.deleteWorkspace(id);
          return {
            status: 200,
            message: "Workspace deleted successfully",
            success: true,
            type: "success",
            data: {
              workspace: workspace
            }
          }
        },
          {
            params: t.Object({
              id: t.String()
            }),
            response: {
              200: baseResponseType(t.Object({ workspace: t.Array(workspaceSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
            },
          }
        )
        .put("/update/:id", async (ctx) => {
          const { id } = ctx.params;
          const { name, description , public: isPublic} = ctx.body;
          const alreadyWorkspace = await ctx.workspaceService.getWorkspaceById(id);
          if (!alreadyWorkspace.length || !alreadyWorkspace[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
          }
          if (alreadyWorkspace[0].userId !== ctx.user.id) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const workspace = await ctx.workspaceService.updateWorkspace(id, name, description, isPublic);
          return {
            status: 200,
            message: "Workspace updated successfully",
            success: true,
            type: "success",
            data: {
              workspace: workspace
            }
          }
        },
          {
            params: t.Object({
              id: t.String()
            }),
            body: t.Object({
              name: t.Optional(t.String()),
              description: t.Optional(t.String()),
              public: t.Optional(t.Boolean()),
            }),
            response: {
              200: baseResponseType(t.Object({ workspace: t.Array(workspaceSelectType) })),
              404: baseResponseType(t.Null()),
              401: baseResponseType(t.Null()),
            },
          }
        )
  )
