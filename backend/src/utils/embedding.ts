import { and, eq, sql } from 'drizzle-orm';
import { cosineDistance, gt, desc } from 'drizzle-orm';
import ollama from 'ollama';
import { db } from '../database';
import { table } from '../database/schema';

// const openai = new OpenAI({
//   // apiKey: process.env['OPENAI_API_KEY'],
//   baseURL: "http://localhost:11434/v1"
// });

export const generateEmbedding = async (value: string): Promise<{ embedding: number[], model: string }> => {
  const input = value // .replaceAll('\n', ' ');

  const { embedding } = await ollama.embeddings({
    // model: 'text-embedding-3-small',
    model: "nomic-embed-text",
    // model: "llama3.2",
    prompt: input
  });

  return { embedding: embedding || [], model: "nomic-embed-text" };
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