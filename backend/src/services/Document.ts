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
      .values({ title: name, userId, workspaceId, content, savingPath, embedding })
      .returning();
  }
}

export const documentService = new Elysia({ name: "document/service" }).decorate("documentService", new DocumentService());