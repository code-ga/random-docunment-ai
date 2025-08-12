import Elysia, { t } from "elysia";
import { auth } from "../libs/auth/auth";
import { baseResponseType, questionSelectType } from "../types";
import { userMiddleware } from "../middlewares/auth-middleware";
import { questionService } from "../services/Question";
import { quizService } from "../services/Quiz";

export const questionRouter = new Elysia({ prefix: "/question", name: "question/router" })
  .use(questionService)
  .use(quizService)
  .get("/list-question/:quizId", async (ctx) => {
    const { quizId: id } = ctx.params;
    const userSession = await auth.api.getSession({ headers: ctx.request.headers });

    const isQuizAvailable = await ctx.QuizService.isQuizAvailable(id);

    if (isQuizAvailable.type == "quiz_not_found") {
      return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
    }

    if (isQuizAvailable.type == "Private" && isQuizAvailable.userID !== userSession?.user.id) {
      return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
    }
    const question = await ctx.QuestionService.GetQuestionsByQuizID(id);
    // if (!question.length || !question[0]) {
    //   return ctx.status(404, { status: 404, type: "error", success: false, message: "question not found" });
    // }


    return {
      status: 200,
      message: "questions fetched successfully",
      success: true,
      type: "success",
      data: {
        question: question
      }
    }
  },
    {
      params: t.Object({
        quizId: t.String()
      }),
      response: {
        200: baseResponseType(t.Object({ question: t.Array(questionSelectType) })),
        404: baseResponseType(t.Null()),
        401: baseResponseType(t.Null()),
      },
    }
  ).get("/:id", async (ctx) => {
    const { id } = ctx.params;
    const userSession = await auth.api.getSession({ headers: ctx.request.headers });

    const isQuizAvailable = await ctx.QuizService.isQuizAvailable(id);

    if (isQuizAvailable.type == "quiz_not_found") {
      return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
    }

    if (isQuizAvailable.type == "Private" && isQuizAvailable.userID !== userSession?.user.id) {
      return ctx.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is invalid" });
    }

    const question = await ctx.QuestionService.GetQuestionByID(id);
    if (!question.length || !question[0]) {
      return ctx.status(404, { status: 404, type: "error", success: false, message: "question not found" });
    }
    return {
      status: 200,
      message: "question fetched successfully",
      success: true,
      type: "success",
      data: {
        question: question
      }
    }
  })
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
          const { id } = ctx.user;
          const isQuizAvailable = await ctx.QuizService.isQuizAvailable(id);

          if (isQuizAvailable.type == "quiz_not_found") {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "quiz not found" });
          }
          if (isQuizAvailable.userID !== id) {
            return ctx.status(403, { status: 403, type: "error", success: false, message: "Forbidden: You do not own this quiz" });
          }
          const { quizId, question: rawQuestion, answer, falseAnswer } = ctx.body;
          const question = await ctx.QuestionService.CreateQuestion(rawQuestion, answer, quizId, id, falseAnswer);
          if (!question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "question not created" });
          }
          if ("error" in question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: `${question.error}` });
          }
          return {
            status: 200,
            message: "question created successfully",
            success: true,
            type: "success",
            data: {
              question: question
            }
          }
        }, {
          body: t.Object({
            question: t.String(),
            quizId: t.String(),
            falseAnswer: t.Optional(t.Array(t.String())),
            answer: t.String(),
          }),
          response: {
            200: baseResponseType(t.Object({ question: t.Array(questionSelectType) })),
            400: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            401: baseResponseType(t.Null()),
            403: baseResponseType(t.Null()),
          },
        })
        .put("/update/:id", async (ctx) => {
          const { id } = ctx.params;
          const alreadyExists = await ctx.QuestionService.GetQuestionByID(id);
          if (!alreadyExists.length || !alreadyExists[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "question not found" });
          }
          if (alreadyExists[0].userId !== ctx.user.id) {
            return ctx.status(403, { status: 403, type: "error", success: false, message: "Forbidden: You do not own this question" });
          }
          const question = await ctx.QuestionService.UpdateQuestion(id, { ...ctx.body });
          if (!question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "question not updated" });
          }
          if ("error" in question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: `${question.error}` });
          }
          return {
            status: 200,
            message: "question updated successfully",
            success: true,
            type: "success",
            data: {
              question: question
            }
          }
        }, {
          params: t.Object({
            id: t.String()
          }),
          body: t.Partial(t.Object({
            question: t.String(),
            falseAnswer: t.Optional(t.Array(t.String())),
            answer: t.String(),
          })),
          response: {
            200: baseResponseType(t.Object({ question: t.Array(questionSelectType) })),
            400: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            401: baseResponseType(t.Null()),
            403: baseResponseType(t.Null()),
          },
        })
        .delete("/delete", async (ctx) => {
          const { id } = ctx.body;
          const alreadyExists = await ctx.QuestionService.GetQuestionByID(id);
          if (!alreadyExists.length || !alreadyExists[0]) {
            return ctx.status(404, { status: 404, type: "error", success: false, message: "question not found" });
          }
          if (alreadyExists[0].userId !== ctx.user.id) {
            return ctx.status(403, { status: 403, type: "error", success: false, message: "Forbidden: You do not own this question" });
          }
          const question = await ctx.QuestionService.DeleteQuestion(id);
          if (!question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: "question not deleted" });
          }
          if ("error" in question) {
            return ctx.status(400, { status: 400, type: "error", success: false, message: `${question.error}` });
          }
          return {
            status: 200,
            message: "question deleted successfully",
            success: true,
            type: "success",
            data: {
              question: question
            }
          }
        }, {
          body: t.Object({
            id: t.String()
          }),
          response: {
            200: baseResponseType(t.Object({ question: t.Array(questionSelectType) })),
            400: baseResponseType(t.Null()),
            404: baseResponseType(t.Null()),
            401: baseResponseType(t.Null()),
            403: baseResponseType(t.Null()),
          },
        })
  );