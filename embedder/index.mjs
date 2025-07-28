import express from "express";
import { pipeline } from "@xenova/transformers";

const app = express();
app.use(express.json());

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/distiluse-base-multilingual-cased-v1"
);

app.post("/embed", async (req, res) => {
  const text = req.body.text;
  const result = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });
  res.json({ embedding: Array.from(result.data) });
});

app.listen(3000, () => console.log("Embedder API running on port 3000"));
