import Elysia from "elysia";
import betterAuthView from "../libs/auth/auth-view";
import { userRouter } from "./user";
import { workspaceRouter } from "./workspace";
import { documentRouter } from "./document";
import { chatRouter } from "./chats";

const apiRouter = new Elysia({
  prefix: "/api", detail: {
    description: "API For The Forum to help you create your own forum with in a few minutes (using better auth for the authentication auth docs is here /api/auth/reference)",
    tags: ["api"]
  }
})
  .all("/auth/*", betterAuthView)
  .use(userRouter)
  .use(workspaceRouter)
  .use(documentRouter)
  .use(chatRouter)

export default apiRouter