import { run } from "@openai/agents";
import Elysia, { t } from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { chatService } from "../services/Chat";
import { workspaceService } from "../services/Workspace";
import { baseResponseType, chatSelectType } from "../types";
import { getAgent } from "../utils/agent";



export const chatRouter = new Elysia({ prefix: "/chats", name: "chats/router" })
  .use(chatService)
  .use(workspaceService)
  .guard({
    detail: {
      security: [{
        cookieAuth: ["__Secure-better-auth.session_token"]
      }],
      tags: ["chats", "authenticated"]
    }
  }, app =>
    app
      .resolve(userMiddleware)
      // List chats by workspace
      .get("/list/:workspaceId", async (ctx) => {
        const { workspaceId } = ctx.params;
        const { id: userId } = ctx.user;
        const workspacePublic = await ctx.workspaceService.isWorkspacePublic(workspaceId);
        if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
        }
        if (workspacePublic.type == "Private" && workspacePublic.userID !== userId) {
          return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
        }
        const chats = await ctx.chatService.getChatsByWorkspaceId(workspaceId);
        return {
          status: 200,
          message: "Chats fetched successfully",
          success: true,
          type: "success",
          data: { chats }
        };
      }, {
        params: t.Object({
          workspaceId: t.String({ description: "Workspace id" })
        }),
        response: {
          200: baseResponseType(t.Object({ chats: t.Array(chatSelectType) })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
      })
      // Get chat by id
      .get("/:id", async (ctx) => {
        const { id } = ctx.params;
        const chat = await ctx.chatService.getChatById(id);
        if (!chat) {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Chat not found" });
        }
        const workspacePublic = await ctx.workspaceService.isWorkspacePublic(chat.workspaceId);
        if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
        }
        if (workspacePublic.type == "Private" && workspacePublic.userID !== ctx.user.id) {
          return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
        }
        return {
          status: 200,
          message: "Chat fetched successfully",
          success: true,
          type: "success",
          data: { chat }
        };
      }, {
        params: t.Object({
          id: t.String()
        }),
        response: {
          200: baseResponseType(t.Object({ chat: chatSelectType })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
      })
      // Create chat
      .post("/chat/:workspaceId", async function* handleChat(ctx) {
        const { id: userId } = ctx.user;
        const { workspaceId } = ctx.params;
        const { message, title, chatId } = ctx.body;
        const workspacePublic = await ctx.workspaceService.isWorkspacePublic(workspaceId);
        if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Workspace not found" });
        }
        if (workspacePublic.type == "Private" && workspacePublic.userID !== userId) {
          return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
        }
        if (chatId) {
          const chat = await ctx.chatService.getChatById(chatId);
          if (!chat) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Chat not found" });
          }
          if (chat.userId !== userId) {
            return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          }
          const response = await run(getAgent(workspaceId), message, { stream: true });
          for await (const chunk of response) {
            yield chunk
          }
        } else {
          const chat = await ctx.chatService.createChat(userId, workspaceId, title);
          if (!chat || chat.length === 0 || !chat[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "Chat not found" });
          }
          // return {
          //   status: 200,
          //   message: "Chat created successfully",
          //   success: true,
          //   type: "success",
          //   data: { chat }
          // };
          yield ({ status: 200, message: "Chat created successfully", success: true, type: "success", data: { chatId: chat[0].id } })
          const response = await run(getAgent(workspaceId), message, { stream: true });
          for await (const chunk of response) {
            yield chunk
          }
        }
        yield ({ status: 200, message: "Completed", success: true, type: "success", data: {} })
      }, {
        params: t.Object({
          workspaceId: t.String({ description: "Workspace id" })
        }),
        body: t.Object({
          message: t.String(),
          title: t.Optional(t.String()),
          chatId: t.Optional(t.String())
        }),
      })
      // Update chat
      .put("/update/:id", async (ctx) => {
        const { id } = ctx.params;
        const { title } = ctx.body;
        const chat = await ctx.chatService.getChatById(id);
        if (!chat) {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Chat not found" });
        }
        if (chat.userId !== ctx.user.id) {
          return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
        }
        const updatedChat = await ctx.chatService.updateChat(id, title);
        return {
          status: 200,
          message: "Chat updated successfully",
          success: true,
          type: "success",
          data: { chat: updatedChat }
        };
      }, {
        params: t.Object({
          id: t.String()
        }),
        body: t.Object({
          title: t.Optional(t.String())
        }),
        response: {
          200: baseResponseType(t.Object({ chat: t.Array(chatSelectType) })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
      })
      // Delete chat
      .delete("/delete/:id", async (ctx) => {
        const { id } = ctx.params;
        const chat = await ctx.chatService.getChatById(id);
        if (!chat) {
          return ctx.status(404, { status: 404, type: "error", success: false, message: "Chat not found" });
        }
        if (chat.userId !== ctx.user.id) {
          return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
        }
        const deletedChat = await ctx.chatService.deleteChat(id);
        return {
          status: 200,
          message: "Chat deleted successfully",
          success: true,
          type: "success",
          data: { chat: deletedChat }
        };
      }, {
        params: t.Object({
          id: t.String()
        }),
        response: {
          200: baseResponseType(t.Object({ chat: t.Array(chatSelectType) })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
      })
  );


