import { createXai } from "@ai-sdk/xai";

const xai = createXai({
  apiKey: process.env.AI_API_KEY,
});
export const aiClient = xai("grok-3-fast")