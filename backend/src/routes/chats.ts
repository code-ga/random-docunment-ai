import Elysia, { t } from "elysia";
import { z } from "zod";
import { getSessionFromToken } from "../libs/auth/auth";
import { userMiddleware } from "../middlewares/auth-middleware";
import { chatService } from "../services/Chat";
import { workspaceService } from "../services/Workspace";
import { baseResponseType, chatSelectType, messageSelectType } from "../types";
import { Agent, AgentInputItem, run, RunState, RunStreamEvent, tool } from "@openai/agents";
import { getAgent } from "../utils/agent";
import { createId } from "@paralleldrive/cuid2";

const messageType = z.union([
  z.object({ type: z.enum(["AUTH"]), data: z.object({ token: z.string() }) }),
  z.object({ type: z.enum(["CHAT"]), data: z.object({ message: z.string(), chatId: z.string().optional().nullable() }) })
]);

const authedWebsocket = new Map<string, Awaited<ReturnType<typeof getSessionFromToken>>>()

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
      }).get("/messages/:id", async (ctx) => {
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
        const messages = await ctx.chatService.getMessagesByChatId(id);
        return {
          status: 200,
          message: "Messages fetched successfully",
          success: true,
          type: "success",
          data: { messages }
        };

      }, {
        params: t.Object({
          id: t.String({ description: "Chat id" })
        }),
        response: {
          200: baseResponseType(t.Object({ messages: t.Array(messageSelectType) })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
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
      .delete("/delete", async (ctx) => {
        const { id } = ctx.body;
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
        body: t.Object({
          id: t.String()
        }),
        response: {
          200: baseResponseType(t.Object({ chat: t.Array(chatSelectType) })),
          404: baseResponseType(t.Null()),
          401: baseResponseType(t.Null()),
        },
      })
  ).ws("/chat/:workspaceId", {
    open: async (ctx) => {
      const { workspaceId } = ctx.data.params;

      const workspacePublic = await ctx.data.workspaceService.isWorkspacePublic(workspaceId);
      if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
        ctx.send({ status: 404, type: "error", success: false, message: "Workspace not found" });
        ctx.close();
        return
      }

      // if (workspacePublic.type == "Private" && workspacePublic.userID !== ctx.user.id) {
      //   ctx.send({ status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
      //   ctx.close();
      //   return
      // }
    },
    sendPings: true,
    idleTimeout: 60 * 60 * 1000, // 1 hour
    message: async (ctx, message) => {
      const value = await messageType.safeParseAsync(message);
      if (!value.success) {
        ctx.send({
          status: 400,
          type: "error",
          success: false,
          message: "Invalid message format",
        });
        ctx.close();
        return;
      }

      // const { workspaceId } = ctx.data.params;
      // const workspacePublic = await ctx.data.workspaceService.isWorkspacePublic(workspaceId);
      // if (!workspacePublic || workspacePublic.type === "Workspace_not_found") {
      //   ctx.send({ status: 404, type: "error", success: false, message: "Workspace not found" });
      //   ctx.close();
      //   return
      // }
      if (value.data.type == "AUTH") {
        const token = value.data.data.token;
        const user = await getSessionFromToken(token);
        if (!user) {
          ctx.send({ status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          ctx.close();
          return
        }
        ctx.send({ status: 200, type: "success", success: true, message: "Authenticated successfully", data: { user, type: "AUTH" } });
        authedWebsocket.set(ctx.id, user);
      } else if (value.data.type == "CHAT") {
        const { message, chatId } = value.data.data;
        const session = authedWebsocket.get(ctx.id);
        if (!session) {
          ctx.send({ status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          ctx.close();
          return
        }
        const workspaceId = ctx.data.params.workspaceId;
        const isWorkspacePublic = await ctx.data.workspaceService.isWorkspacePublic(workspaceId);
        if (!isWorkspacePublic || isWorkspacePublic.type === "Workspace_not_found") {
          ctx.send({ status: 404, type: "error", success: false, message: "Workspace not found" });
          ctx.close();
          return
        }
        if (isWorkspacePublic.type == "Private" && isWorkspacePublic.userID !== session.user.id) {
          ctx.send({ status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
          ctx.close();
          return
        }

        const chat = await (async () => {
          if (chatId) {
            const chat = await ctx.data.chatService.getChatById(chatId);
            if (!chat) {
              ctx.send({ status: 404, type: "error", success: false, message: "Chat not found" });
              ctx.close();
              return null
            }
            ctx.send({ status: 200, type: "success", success: true, message: "Chat fetched successfully", data: { chat, type: "CHAT_INFO" } });
            return chat
          } else {
            const chat = await ctx.data.chatService.createChat(session.user.id, workspaceId, "New Chat");
            if (!chat || chat.length === 0 || !chat[0]) {
              ctx.send({ status: 404, type: "error", success: false, message: "Chat not found" });
              ctx.close();
              return null
            }
            ctx.send({ status: 200, type: "success", success: true, message: "Chat created successfully", data: { chat: chat[0], type: "CHAT_INFO" } });
            return chat[0]
          }
        })();
        if (!chat) {
          return
        }
        const messages = await ctx.data.chatService.getMessagesByChatId(chat.id);
        const conversation: AgentInputItem[] = messages.map((message) => {
          if (message.role == "user") {
            return {
              role: "user",
              content: message.content,
              type: "message"
            } as AgentInputItem
          } else {
            return {
              role: message.role,
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text: message.content,
                },
              ],
            } as AgentInputItem
          }
        }).concat({
          role: "user",
          content: message,
          type: "message"
        })
        const changeChatName = tool({
          name: "change_chat_name",
          description: "Use this tool to change the chat id.",
          parameters: z.object({
            chatName: z.string()
          }),
          async execute({ chatName }) {
            // return await db.update(table.chats).set({ title: chatName }).where(eq(table.chats.id, chatId));
            const result = await ctx.data.chatService.updateChat(chat.id, chatName);
            ctx.send({
              status: 200, type: "success", success: true, message: "Chat name changed successfully",
              data: { chat: result, type: "CHAT_INFO_UPDATE" }
            });
            return result
          }
        })
        const response = await run(getAgent(chat.workspaceId, chatId!, session.user.id, [changeChatName]), conversation, { stream: true });
        const { assistantMessage, userMessage } = await ctx.data.chatService.createUserAndChatBotMessage(chat.id, session.user.id, message, "");
        ctx.send({
          status: 200, type: "success", success: true, message: "Message sent successfully", data: {
            message: userMessage,
            type: "USER_MESSAGE"
          }
        })
        for await (const chunk of response.toStream()) {
          // console.log(chunk);
          // ctx.send(chunk);
          if (chunk.type == "raw_model_stream_event") {
            if (chunk.data.type == "model") {
              // console.log("model", chunk.data.event)
            }
            else if (chunk.data.type == "output_text_delta") {
              // console.log("output_text_delta", chunk.data.delta)
              ctx.send({
                status: 200, type: "success", success: true, message: "Message sent successfully", data: {
                  message: {
                    ...assistantMessage,
                    content: chunk.data.delta
                  }
                  , type: "MESSAGE"
                }
              });
            }
            else if (chunk.data.type == "response_done") {
              console.log("response_done", chunk.data.response)
            } else if (chunk.data.type == "response_started") {
              // console.log(chunk.data.type)
            }
          } else if (chunk.type == "agent_updated_stream_event") {
            // console.log(inspect(chunk.agent));
          } else if (chunk.type == "run_item_stream_event") {
            console.log("run_item_stream_event", JSON.stringify(chunk));
            // chunk.name
          } else {
            console.log(chunk);
          }

        }
        if (response.finalOutput) {
          const update = await ctx.data.chatService.updateMessage(assistantMessage.id, response.finalOutput);
          ctx.send({
            status: 200, type: "success", success: true, message: "Message sent successfully", data: {
              message: {
                ...update[0],
                content: response.finalOutput
              }
              , type: "FINAL_MESSAGE"
            }
          });
        }
      }
    }
  });

// function chunkToWebsocketEvent(chunk: RunStreamEvent) {
//   if (chunk.type == "agent_updated_stream_event") {
//     console.log(chunk.agent.instructions)
//   }
//   else if (chunk.type == "raw_model_stream_event") {
//     // chunk.data.data
//   }
//   else if (chunk.type == "run_item_stream_event") {

//   } else {
//     return null
//   }
// }
