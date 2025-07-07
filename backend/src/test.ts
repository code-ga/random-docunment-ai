import { generateEmbedding } from "./utils/embedding";

for (const i of (await generateEmbedding("Hello"))) {
  console.log(i);
}