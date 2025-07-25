import { asc, eq } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "../database";
import { chats as chatsTable, messages as messagesTable } from "../database/schema";

export class ChatService {
  constructor() { }

  async getChatsByWorkspaceId(workspaceId: string) {
    return await db.select().from(chatsTable).where(eq(chatsTable.workspaceId, workspaceId));
  }

  async getChatById(id: string) {
    // id is unique, so only one result
    const result = await db.select().from(chatsTable).where(eq(chatsTable.id, id)).limit(1);
    return result[0] || null;
  }

  async createChat(userId: string, workspaceId: string, title?: string) {
    const insert = await db.insert(chatsTable)
      .values({ userId, workspaceId, title: title || "New Chat" })
      .returning();
    return insert;
  }

  async updateChat(id: string, title?: string) {
    const update = await db.update(chatsTable)
      .set({ title })
      .where(eq(chatsTable.id, id))
      .returning();
    return update;
  }

  async deleteChat(id: string) {
    const deleted = await db.delete(chatsTable)
      .where(eq(chatsTable.id, id))
      .returning();
    return deleted;
  }
  async getMessagesByChatId(id: string) {
    return await db.select().from(messagesTable).orderBy((t) => asc(t.index)).where(eq(messagesTable.chatId, id));
  }

  async createUserAndChatBotMessage(chatId: string, userId: string, userContent: string, assistantContent: string) {
    return await db.transaction(async db => {
      const messageIndex = (await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId))).length;
      const userMessage = await db.insert(messagesTable).values({ chatId, userId, role: "user", content: userContent, index: messageIndex }).returning();
      if (!userMessage || !userMessage[0]) throw new Error("Failed to create user message");
      const assistantMessage = await db.insert(messagesTable).values({ chatId, userId, role: "assistant", content: assistantContent, index: messageIndex + 1 }).returning();
      if (!assistantMessage || !assistantMessage[0]) throw new Error("Failed to create assistant message");
      return { userMessage: userMessage[0], assistantMessage: assistantMessage[0] };
    })
  }

  async updateMessage(id: string, content: string) {
    const update = await db.update(messagesTable)
      .set({ content })
      .where(eq(messagesTable.id, id))
      .returning();
    return update;
  }
}

export const chatService = new Elysia({ name: "chat/service" }).decorate("chatService", new ChatService());
