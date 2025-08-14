import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const aiClient = createOpenRouter({
  apiKey: process.env.AI_API_KEY,
  headers: {
    'HTTP-Referer': 'https://random-docunment-ai.vercel.app/', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': 'Study AI', // Optional. Site title for rankings on openrouter.ai.
  }
});
export const aiModel = aiClient("openai/gpt-oss-20b:free");