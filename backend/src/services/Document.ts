import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "../database";
import { table } from "../database/schema";
import { generateEmbedding } from "../utils/embedding";

export class DocumentService {
  constructor() { }
  async getDocumentById(id: string) {
    // because id is unique so it will return only one
    return await db.select().from(table.documents).where(eq(table.documents.id, id)).limit(1);
  }
  async getDocumentsByWorkspaceId(workspaceId: string) {
    return await db.select().from(table.documents).where(eq(table.documents.workspaceId, workspaceId));
  }
  async createDocument(userId: string, workspaceId: string, content: string, savingPath?: string, name?: string) {
    const embedding = await generateEmbedding(content);
    return await db.insert(table.documents)
      .values({ title: name, userId, workspaceId, content, savingPath, embedding: embedding.embedding, embedder: embedding.model })
      .returning();
  }
  async updateDocument(id: string, name: string) {
    return await db.update(table.documents).set({ title: name }).where(eq(table.documents.id, id)).returning();
  }
  async deleteDocument(id: string) {
    return await db.delete(table.documents).where(eq(table.documents.id, id)).returning();
  }
}

export const documentService = new Elysia({ name: "document/service" }).decorate("documentService", new DocumentService());