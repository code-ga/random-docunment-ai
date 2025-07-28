import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "../database";
import { table } from "../database/schema";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { generateEmbedding } from "../utils/embedding";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 6000, chunkOverlap: 1000,
  separators: ["\n\n", "\n", " ", ""]
});
export class DocumentService {
  constructor() { }
  async getDocumentById(id: string) {
    // because id is unique so it will return only one
    return await db.select().from(table.documents).where(eq(table.documents.id, id)).limit(1);
  }
  async getFullDocumentWithChunkById(id: string) {
    return await db
      .select()
      .from(table.documents)
      .where(eq(table.documents.id, id))
      .limit(1)
      .fullJoin(table.chunks, eq(table.chunks.documentId, table.documents.id));
  }
  async getDocumentsByWorkspaceId(workspaceId: string) {
    return await db.select().from(table.documents).where(eq(table.documents.workspaceId, workspaceId));
  }
  async createDocument(userId: string, workspaceId: string, content: string, savingPath?: string, name?: string) {
    // const embedding = await generateEmbedding(content);
    const chunk = await splitter.splitText(content);
    return db.transaction(async db => {
      const chunkIDs = [];
      const document = await db.insert(table.documents)
        .values({ title: name, userId, workspaceId, savingPath })
        .returning();
      if (!document || !document[0]) {
        db.rollback()
        return {
          error: "Failed to create document"
        }
      }
      for (let i = 0; i < chunk.length; i++) {
        const chunkContent = chunk[i];
        if (!chunkContent) continue;
        const chunkEmbedding = await generateEmbedding(chunkContent);
        const insert = await db.insert(table.chunks)
          .values({
            content: chunkContent,
            userId,
            documentId: document[0]?.id,
            workspaceId,
            embedding: chunkEmbedding.embedding,
            embedder: chunkEmbedding.model,
            fromLine: i * 1000,
            toLine: (i + 1) * 1000,
            index: i
          })
          .returning();
        if (!insert || !insert[0]) {
          db.rollback()
          return {
            error: "Failed to create chunk at index " + i + " of document " + document[0]?.id
          }
        }
        chunkIDs.push(insert[0].id);
      }
      return db.update(table.documents).set({ chunkIds: chunkIDs }).where(eq(table.documents.id, document[0]?.id)).returning();
    })

  }
  async updateDocument(id: string, name: string) {
    return await db.update(table.documents).set({ title: name }).where(eq(table.documents.id, id)).returning();
  }
  async deleteDocument(id: string) {
    return await db.delete(table.documents).where(eq(table.documents.id, id)).returning();
  }
}

export const documentService = new Elysia({ name: "document/service" }).decorate("documentService", new DocumentService());