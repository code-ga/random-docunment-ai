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


export const findSimilarDocuments = async (content: string, workspaceId: string) => {
  const embedding = await generateEmbedding(content);
  const similarity = sql<number>`1 - (${cosineDistance(table.documents.embedding, embedding.embedding)})`;
  const similarGuides = await db
    .select({ name: table.documents.title, url: table.documents.savingPath, content: table.documents.content, similarity })
    .from(table.documents)
    .where(and(eq(table.documents.workspaceId, workspaceId), gt(similarity, 0.5)))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};