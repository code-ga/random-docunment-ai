import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "../database";
import { chats as chatsTable } from "../database/schema";

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
}

export const chatService = new Elysia({ name: "chat/service" }).decorate("chatService", new ChatService());
