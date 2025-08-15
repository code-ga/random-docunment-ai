import { and, eq, sql } from 'drizzle-orm';
import { cosineDistance, gt, desc } from 'drizzle-orm';
import { db } from '../database';
import { table } from '../database/schema';

/** Embedding entry for a single input */
export interface EmbeddingEntry {
  object: "embedding";
  index: number;
  embedding: number[];  // length equals model embedding dimension (e.g. 768)
}

/** Usage statistics (token counts) */
export interface UsageInfo {
  prompt_tokens: number;
  total_tokens: number;
}

/** Full response from /v1/embeddings */
export interface EmbeddingsResponse {
  object: "list";
  data: EmbeddingEntry[];
  model: string;     // e.g. "Alibaba‑NLP/gte‑multilingual‑base"
  usage?: UsageInfo | null;
}


// export const generateEmbedding = async (value: string): Promise<{ embedding: number[], model: string }> => {
//   const input = value

//   const url = "http://embedder/v1/embeddings";
//   const body = JSON.stringify({
//     input: [input],
//     model: "Alibaba-NLP/gte-multilingual-base",
//     encoding_format: "float",
//   });
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json",
//     },
//     body,
//     verbose: true, // logs request/res headers to stdout :contentReference[oaicite:1]{index=1}
//   });
//   const result = (await response.json()) as EmbeddingsResponse;
//   return { embedding: result.data[0]?.embedding || [], model: result.model };
// };

export async function generateEmbedding(data: {
  inputs: string
}) {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction",
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} with body: ${await response.text()}`);
  }
  const result = await response.json();
  return { embedding: result as number[], model: "intfloat/multilingual-e5-large" };
}

//TODO: Check result of this please
export const findSimilarDocuments = async (content: string, workspaceId: string) => {
  const embedding = await generateEmbedding({ inputs: content });
  const similarity = sql<number>`1 - (${cosineDistance(table.chunks.embedding, embedding.embedding)})`;
  const similarChunks = await db
    .select({ content: table.chunks.content, id: table.chunks.id, documentId: table.chunks.documentId, similarity, fromLine: table.chunks.fromLine, toLine: table.chunks.toLine, index: table.chunks.index })
    .from(table.chunks)
    .where(and(eq(table.chunks.workspaceId, workspaceId)))
    .orderBy((t) => desc(t.similarity))
    .fullJoin(table.documents, eq(table.chunks.documentId, table.documents.id))
    .limit(4);
  const result = []
  for (let i = 0; i < similarChunks.length; i++) {
    const chunk = similarChunks[i];
    if (!chunk?.documentId) continue
    const document = await db.select().from(table.documents).where(eq(table.documents.id, chunk.documentId)).limit(1);
    result.push({ ...chunk, document: document[0] });
  }
  console.log("embedding.ts -> findSimilarDocuments -> similarChunks", result);
  return result
};