import Elysia, { t } from "elysia";
import { quizService } from "../services/Quiz";
import { auth } from "../libs/auth/auth";
import { baseResponseType, quizCollectionSelectType } from "../types";
import { userMiddleware } from "../middlewares/auth-middleware";

export const quizRouter = new Elysia({ prefix: "/quiz", name: "quiz/router" })
  .use(quizService)
  .get("/:id", async (ctx) => {
    const { id } = ctx.params;
    const quiz = await ctx.QuizService.getQuizzesByID(id);
    if (!quiz.length || !quiz[0]) {
      return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
    }
    if (!quiz[0].public) {
      const userSession = await auth.api.getSession({ headers: ctx.request.headers });
      if (!userSession) {
        return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is missing" });
      }
      if (userSession.user.id !== quiz[0].userId) {
        return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
      }
    }

    return {
      status: 200,
      message: "quiz fetched successfully",
      success: true,
      type: "success",
      data: {
        quiz: quiz
      }
    }
  },
    {
      params: t.Object({
        id: t.String()
      }),
      response: {
        200: baseResponseType(t.Object({ quiz: t.Array(quizCollectionSelectType) })),
        404: baseResponseType(t.Null()),
        401: baseResponseType(t.Null()),
      },
    }
  )
  .guard({
    detail: {
      security: [{
        cookieAuth: ["__Secure-better-auth.session_token"]
      }],
      tags: ["workspace", "authenticated"]
    }
  },
    app =>
      app.resolve(userMiddleware)
        .post("/create", async (ctx) => {
          const { name, description, isPublic } = ctx.body;
          const user = ctx.user;
          const quiz = await ctx.QuizService.createQuiz(name, user.id, description, isPublic);
          return {
            status: 201,
            message: "quiz created successfully",
            success: true,
            type: "success",
            data: {
              quiz
            }
          };
        }, {
          body: t.Object({
            name: t.String(),
            description: t.Optional(t.String()),
            isPublic: t.Optional(t.Boolean())
          }),
          response: {
            201: baseResponseType(t.Object({ quiz: t.Array(quizCollectionSelectType) })),
            401: baseResponseType(t.Null())
          }
        })
        .get("/user/all", async (ctx) => {
          const user = ctx.user;
          const quizzes = await ctx.QuizService.getQuizzesByUserID(user.id);
          return {
            status: 200,
            message: "user quizzes fetched successfully",
            success: true,
            type: "success",
            data: {
              quizzes
            }
          };
        }, {
          response: {
            200: baseResponseType(t.Object({ quizzes: t.Array(quizCollectionSelectType) })),
            401: baseResponseType(t.Null())
          }
        })
        .put("/:id", async (ctx) => {
          const { id } = ctx.params;
          const { name, description, isPublic } = ctx.body;
          const user = ctx.user;
          const quiz = await ctx.QuizService.getQuizzesByID(id);
          if (!quiz.length || !quiz[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
          }
          if (quiz[0].userId !== user.id) {
            return ctx.status(403, { status: 403, type: "error", success: false, message: "Forbidden: You do not own this quiz" });
          }
          const updatedQuiz = await ctx.QuizService.updateQuiz(id, { name, description, public: isPublic });
          return {
            status: 200,
            message: "quiz updated successfully",
            success: true,
            type: "success",
            data: {
              quiz: updatedQuiz
            }
          };
        }, {
          params: t.Object({
            id: t.String()
          }),
          body: t.Object({
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            isPublic: t.Optional(t.Boolean())
          }),
          response: {
            200: baseResponseType(t.Object({ quiz: t.Array(quizCollectionSelectType) })),
            404: baseResponseType(t.Null()),
            403: baseResponseType(t.Null()),
            401: baseResponseType(t.Null())
          }
        })
        .delete("/delete", async (ctx) => {
          const { id } = ctx.body;
          const user = ctx.user;
          const quiz = await ctx.QuizService.getQuizzesByID(id);
          if (!quiz.length || !quiz[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
          }
          if (quiz[0].userId !== user.id) {
            return ctx.status(403, { status: 403, type: "error", success: false, message: "Forbidden: You do not own this quiz" });
          }
          await ctx.QuizService.deleteQuiz(id);
          return {
            status: 200,
            message: "quiz deleted successfully",
            success: true,
            type: "success",
            data: null
          };
        }, {
          body: t.Object({
            id: t.String()
          }),
          response: {
            200: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            403: baseResponseType(t.Null()),
            401: baseResponseType(t.Null())
          }
        }).get("/list-quizzes", async (ctx) => {
          const quizzes = await ctx.QuizService.getQuizzesByUserID(ctx.user.id);
          return {
            status: 200,
            message: "quizzes fetched successfully",
            success: true,
            type: "success",
            data: {
              quizzes
            }
          };
        }, {
          response: {
            200: baseResponseType(t.Object({ quizzes: t.Array(quizCollectionSelectType) })),
            401: baseResponseType(t.Null())
          }
        })
  );