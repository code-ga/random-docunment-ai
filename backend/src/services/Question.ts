import Elysia from "elysia";
import { db, table } from "../database";
import { eq } from "drizzle-orm";

export class QuestionService {
  constructor() { }

  async GetQuestionsByQuizID(id: string) {
    return await db.select().from(table.questionnaire).where(eq(table.questionnaire.quizCollectionId, id));
  }

  async GetQuestionByID(id: string) {
    return await db.select().from(table.questionnaire).where(eq(table.questionnaire.id, id)).limit(1);
  }

  async DeleteQuestion(id: string) {
    return await db.delete(table.questionnaire).where(eq(table.questionnaire.id, id)).returning();
  }

  async UpdateQuestion(id: string, updatedData: Partial<{ question: string, answer: string, falseAnswer: string[] }>) {
    return await db.update(table.questionnaire).set({ ...updatedData }).where(eq(table.questionnaire.id, id)).returning();
  }

  async CreateQuestion(question: string, answer: string, quizId: string,userId: string, falseAnswer: string[] = []) {
    return await db.insert(table.questionnaire).values({ question, answer, falseAnswer, quizCollectionId: quizId, userId }).returning();
  }
}

export const questionService = new Elysia({ name: "Question/service" }).decorate("QuestionService", new QuestionService());
