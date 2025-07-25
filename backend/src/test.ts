import { createXai } from "@ai-sdk/xai";
import { Agent, run, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions";
import { z } from "zod";
import { inspect } from "bun";

const xai = createXai({
  apiKey: process.env.AI_API_KEY,
});
const model = aisdk(xai("grok-3-fast"));

const weatherTool = tool({
  name: "get_weather",
  description: "Use this tool to get the weather in a city.",
  parameters: z.object({
    city: z.string(),
  }),
  strict: true,
  async execute({ city }) {
    console.log("Getting weather in", city);
    return `The weather in ${city} is sunny.`;
  },
})

const agent = new Agent({
  name: "Study.ai",
  model,
  tools: [weatherTool]
})

const response = await run(agent, "What is the weather in ho chi minh city", { stream: true });

for await (const chunk of response) {
  if (chunk.type == "raw_model_stream_event") {
    if (chunk.data.type == "model") {
      console.log("model", chunk.data.event)
    }
    else if (chunk.data.type == "output_text_delta") {
      console.log("output_text_delta", chunk.data.delta)
    }
    else if (chunk.data.type == "response_done") {
      console.log("response_done", chunk.data.response)
    } else if (chunk.data.type == "response_started") {
      console.log(chunk.data.type)
    }
  } else if (chunk.type == "agent_updated_stream_event") {
    // console.log(inspect(chunk.agent));
  } else if (chunk.type == "run_item_stream_event") {
    console.log("run_item_stream_event", JSON.stringify(chunk));
  } else {
    console.log(chunk);
  }
}

console.log("final output ", response.finalOutput)
console.log("history ", response.history)