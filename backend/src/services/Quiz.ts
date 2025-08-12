import Elysia from "elysia";
import { createId } from '@paralleldrive/cuid2';
import { db } from "../database";
import { eq } from "drizzle-orm";
import { table } from "../database/schema";

export class QuizService {
  constructor() { }

  async getQuizzesByID(id: string) {
    return await db.select().from(table.quizCollection).where(eq(table.quizCollection.id, id)).limit(1);
  }
  async getQuizzesByUserID(id: string) {
    return await db.select().from(table.quizCollection).where(eq(table.quizCollection.userId, id));
  }
  async updateQuiz(id: string, updatedData: Partial<{ name: string, description: string, public: boolean }>) {
    return await db.update(table.quizCollection).set({ ...updatedData }).where(eq(table.quizCollection.id, id)).returning();
  }
  async deleteQuiz(id: string) {
    return await db.delete(table.quizCollection).where(eq(table.quizCollection.id, id)).returning();
  }
  async createQuiz(name: string, userId: string, description?: string, isPublic?: boolean) {
    return await db.insert(table.quizCollection).values({
      id: createId(),
      name,
      description,
      userId,
      public: isPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
  }
  async isQuizAvailable(id: string) {
    const quiz = await db.select().from(table.quizCollection).where(eq(table.quizCollection.id, id)).limit(1);
    if (!quiz || !quiz.length || !quiz[0]) {
      return {
        success: false,
        type: "quiz_not_found"
      } as const;
    }
    if (quiz[0].public) {
      return {
        success: true,
        type: "Public",
        userID: quiz[0].userId
      } as const;
    }
    return {
      success: false,
      type: "Private",
      userID: quiz[0].userId
    } as const;
  }
}

export const quizService = new Elysia({ name: "Quiz/service" }).decorate("QuizService", new QuizService());