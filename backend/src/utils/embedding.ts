import { and, eq, sql } from 'drizzle-orm';
import { cosineDistance, gt, desc } from 'drizzle-orm';
import { db } from '../database';
import { table } from '../database/schema';



export const generateEmbedding = async (value: string): Promise<{ embedding: number[], model: string }> => {
  const input = value

  const result = await fetch("http://embedder:3000/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: input }),
  });
  return { embedding: Array.from((await result.json() as {embedding: number[]}).embedding) || [], model: "Xenova/distiluse-base-multilingual-cased-v1" };
};

//TODO: Check result of this please
export const findSimilarDocuments = async (content: string, workspaceId: string) => {
  const embedding = await generateEmbedding(content);
  const similarity = sql<number>`1 - (${cosineDistance(table.chunks.embedding, embedding.embedding)})`;
  const similarGuides = await db
    .select({ content: table.chunks.content, id: table.chunks.id, documentId: table.chunks.documentId, similarity })
    .from(table.chunks)
    .where(and(eq(table.chunks.workspaceId, workspaceId), gt(similarity, 0.5)))
    .orderBy((t) => desc(t.similarity))
    .leftJoin(table.documents, eq(table.chunks.documentId, table.documents.id))
    .limit(4);
  console.log("embedding.ts -> findSimilarDocuments -> similarGuides", similarGuides);
  return similarGuides;
};