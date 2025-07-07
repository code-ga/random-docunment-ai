import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import apiRouter from "./routes";
import { OpenAPI } from "./libs/auth/openApi";

const PORT = process.env.PORT || 3000;
export const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(cors())
  .use(swagger({
    version: "1.0.0",
    documentation: {
      tags: [{
        name: "auth",
        description: "Authentication endpoints (using better auth for the authentication auth docs is here /api/auth/reference)",
      }],
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  }))
  .use(apiRouter)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app
export * from "./types"