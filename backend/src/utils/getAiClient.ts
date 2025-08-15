// import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// const aiClient = createOpenAICompatible({
//   apiKey: process.env.AI_API_KEY,
//   // baseURL: "https://openrouter.ai/api/v1",
//   baseURL: "https://ai.hackclub.com//",
//   name: "Open Router",

//   headers: {
//     'HTTP-Referer': 'https://random-docunment-ai.vercel.app/', // Optional. Site URL for rankings on openrouter.ai.
//     'X-Title': 'study.ai', // Optional. Site title for rankings on openrouter.ai.
//   },
// });
// export const aiModel = aiClient("openai/gpt-oss-120b");

import { createAzure } from '@ai-sdk/azure';

const azure = createAzure({
  resourceName: 'gwaddin', // Azure resource name
  apiKey: process.env.AI_API_KEY!,
});

export const aiModel = azure('azure-gpt-4o-mini');