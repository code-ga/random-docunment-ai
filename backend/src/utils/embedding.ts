import ollama from 'ollama';

// const openai = new OpenAI({
//   // apiKey: process.env['OPENAI_API_KEY'],
//   baseURL: "http://localhost:11434/v1"
// });

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value // .replaceAll('\n', ' ');

  const { embedding } = await ollama.embeddings({
    // model: 'text-embedding-3-small',
    model: "nomic-embed-text",
    // model: "llama3.2",
    prompt: input
  });

  return embedding || [];
};

