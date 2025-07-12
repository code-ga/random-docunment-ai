import Elysia from "elysia";
import { db } from "../database";
import { eq } from "drizzle-orm";
import { table } from "../database/schema";

export class WorkspaceService {
  constructor() { }
  async getWorkspacesByUserId(userId: string) {
    return await db.select().from(table.workspace).where(eq(table.workspace.userId, userId));
  }
  async getWorkspaceById(id: string) {
    // because id is unique so it will return only one
    return await db.select().from(table.workspace).where(eq(table.workspace.id, id)).limit(1);
  }
  async createWorkspace(name: string, userId: string, description?: string, isPublic?: boolean) {
    return await db.insert(table.workspace).values({ name, description, userId, public: isPublic }).returning();
  }
  async deleteWorkspace(id: string) {
    return await db.delete(table.workspace).where(eq(table.workspace.id, id)).returning();
  }
  updateWorkspace(id: string, name?: string, description?: string, isPublic?: boolean) {
    return db.update(table.workspace).set({ name, description, public: isPublic }).where(eq(table.workspace.id, id)).returning();
  }
  async isWorkspacePublic(workspaceId: string) {
    const workspace = await db.select().from(table.workspace).where(eq(table.workspace.id, workspaceId)).limit(1);
    if (!workspace || !workspace.length || !workspace[0]) {
      return {
        success: false,
        type: "Workspace_not_found"
      } as const;
    }
    if (workspace[0].public) {
      return {
        success: true,
        type: "Public"
      } as const;
    }
    return {
      success: false,
      type: "Private",
      userID: workspace[0].userId
    } as const;
  }

  async chat(chatId: string, message: string, workspaceId: string) {

  }
}

export const workspaceService = new Elysia({ name: "workspace/service" }).decorate("workspaceService", new WorkspaceService());