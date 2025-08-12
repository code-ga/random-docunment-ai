import { Agent, Tool, tool } from "@openai/agents";
import { aisdk } from '@openai/agents-extensions';
import { eq, inArray } from "drizzle-orm";
import z from "zod";
import { db, table } from "../database";
import { findSimilarDocuments } from "./embedding";
import { xaiClient } from './getAiClient';


const model = aisdk(xaiClient);

const instructions = `
You are a **neutral AI learning assistant** whose primary purpose is to help users learn, memorize, and understand information stored in a document database.  
You can also use external tools to find the newest information, perform calculations, and generate quizzes.

=====================
Core Objectives:
=====================
1. Answer user questions using only **verified data** from:
   - The document database (primary source).
   - External tools (for real-time information, calculations, or missing data).
2. Always be **neutral** and avoid political or subjective opinions.
3. Make it easy for the user to learn by heart the content using interactive quizzes.

=====================
General Answering Rules:
=====================
- If the answer is from the DB, you must:
  - Provide the exact content found.
  - Include: **document name** and **document ID**.
  - Example:  
    Answer: The water cycle consists of evaporation, condensation, and precipitation.  
    Source: [Document DB] - "Climate Basics" (Document ID: 45a9f2)

- If the answer is from a tool, include:
  - Tool name or URL where the data came from.
  - Example:  
    Answer: The current population of Tokyo is ~37.4 million (2025).  
    Source: [World Population API]

- If no reliable data is found:
  - Say: \`"No reliable information found in the database or tools."\`

=====================
Quiz Creation Flow:
=====================
1. Before generating a quiz, **ask only**:
   - The topic or document they want to learn from.
   - Their knowledge level: Beginner / Intermediate / Expert.
   - The scope: All content or specific sections.
   
2. **DB Validation**:
   - Query the database to ensure the requested topic exists.
   - If it doesn’t exist, provide alternative related topics.

3. **Quiz Generation**:
   - Use a tool to automatically create **both**:
     - Flashcards (question → answer format for memorization).
     - Multiple-choice questions (1 correct + 3 distractors).
   - Quiz should be based only on verified DB content.
   - For each quiz question, show:
     - If the user was correct or not.
     - The correct answer.
     - The document name + document ID.
     - A short explanation for context.

4. The quiz should help reinforce memory, be engaging, and adapt difficulty based on the user’s level.

=====================
Tool Usage:
=====================
- Always use tools when:
  - Information might have changed (e.g., current events, latest research).
  - Performing calculations or generating quizzes.
  - Searching for related resources.
- You must integrate tool results into your answers and still follow the **source inclusion** rule.

=====================
Tone & Style:
=====================
- Be concise but thorough.
- Stay neutral — no political bias or personal opinions.
- Focus on factual accuracy and educational clarity.

=====================
Answer Format for DB-based responses:
=====================
Answer: [text]  
Source: [Document DB] - "Doc Name" (Document ID: xyz123)


`

export const getAgent = (workspaceId: string, chatId: string, userID: string, customTool: Tool[] = []) => {
  const searchInKnowledgeBase = tool({
    name: "search_in_knowledge_base",
    description: "Use this tool to answer questions about documents.",
    parameters: z.object({
      query: z.string()
    }),
    async execute({ query }) {
      return await findSimilarDocuments(query, workspaceId);
    }
  })
  const listKnowledgeBase = tool({
    name: "list_knowledge_base",
    description: "Use this tool to list documents.",
    parameters: z.object({}),
    async execute() {
      return await db.select().from(table.documents).where(eq(table.documents.workspaceId, workspaceId));
    }
  })

  const listUserQuiz = tool({
    name: "list_user_quizzes",
    description: "Use this tool to list user quizzes.",
    parameters: z.object({}),
    async execute() {
      return await db.select().from(table.quizCollection).where(eq(table.quizCollection.userId, userID));
    }
  })

  const editUserQuiz = tool({
    name: "edit_user_quiz",
    description: "Use this tool to edit user quizzes.",
    parameters: z.object({
      id: z.string(),
      data: z.object({
        name: z.string(),
        description: z.string(),
        isPublic: z.boolean()
      }).partial()
    }),
    async execute({ id, data }) {
      const quiz = await db.select().from(table.quizCollection).where(eq(table.quizCollection.id, id)).limit(1);
      if (!quiz.length || !quiz[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Quiz not found"
        }
      }
      if (quiz[0].userId !== userID) {
        return {
          status: 403,
          type: "error",
          success: false,
          message: "You are not authorized to edit this quiz"
        }
      }
      return await db.update(table.quizCollection).set({ ...data }).where(eq(table.quizCollection.id, id)).returning();
    }
  })

  const addQuiz = tool({
    name: "add_quiz",
    description: "Use this tool to add a quiz.",
    parameters: z.object({
      data: z.object({
        name: z.string(),
        description: z.string(),
        isPublic: z.boolean()
      })
    }),
    async execute({ data }) {
      return await db.insert(table.quizCollection).values({ ...data, userId: userID }).returning();
    }
  })

  const addQuizQuestion = tool({
    name: "add_quiz_question",
    description: "Use this tool to add a question to a quiz.",
    parameters: z.object({
      data: z.object({
        question: z.string(),
        answer: z.string(),
        falseAnswer: z.array(z.string()),
        quizCollectionId: z.string(),
        source: z.optional(z.string())
      })
    }),
    async execute({ data }) {
      const quiz = await db.select().from(table.quizCollection).where(eq(table.quizCollection.id, data.quizCollectionId)).limit(1);
      if (!quiz.length || !quiz[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Quiz not found"
        }
      }
      if (quiz[0].userId !== userID) {
        return {
          status: 403,
          type: "error",
          success: false,
          message: "You are not authorized to add a question to this quiz"
        }
      }
      return await db.insert(table.questionnaire).values({ ...data, userId: userID }).returning();
    }
  })

  const editQuizQuestion = tool({
    name: "edit_quiz_question",
    description: "Use this tool to edit a question in a quiz.",
    parameters: z.object({
      id: z.string(),
      data: z.object({
        question: z.string(),
        answer: z.string(),
        falseAnswer: z.array(z.string()),
        source: z.optional(z.string())
      }).partial()
    }),
    async execute({ id, data }) {
      const question = await db.select().from(table.questionnaire).where(eq(table.questionnaire.id, id)).limit(1);
      if (!question.length || !question[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Question not found"
        }
      }
      if (question[0].userId !== userID) {
        return {
          status: 403,
          type: "error",
          success: false,
          message: "You are not authorized to edit this question"
        }
      }
      return await db.update(table.questionnaire).set({ ...data }).where(eq(table.questionnaire.id, id)).returning();
    }
  })

  const listQuizQuestion = tool({
    name: "list_quiz_question",
    description: "Use this tool to list questions in a quiz.",
    parameters: z.object({
      id: z.string()
    }),
    async execute({ id }) {
      const quiz = await db.select().from(table.quizCollection).where(eq(table.quizCollection.id, id)).limit(1);
      if (!quiz.length || !quiz[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Quiz not found"
        }
      }
      if (quiz[0].userId !== userID) {
        return {
          status: 403,
          type: "error",
          success: false,
          message: "You are not authorized to list questions in this quiz"
        }
      }
      return await db.select().from(table.questionnaire).where(eq(table.questionnaire.quizCollectionId, id));
    }
  })

  const getChatInfo = tool({
    name: "get_chat_info",
    description: "Use this tool to get chat info.",
    parameters: z.object({
      chatId: z.string()
    }),
    async execute({ chatId }) {
      const chat = await db.select().from(table.chats).where(eq(table.chats.id, chatId));
      if (!chat.length || !chat[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Chat not found"
        }
      }
      const workspace = await db.select().from(table.workspace).where(eq(table.workspace.id, chat[0].workspaceId));
      if (!workspace.length || !workspace[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Workspace not found"
        }
      }
      if (!workspace[0].public && workspace[0].userId !== userID) {
        return {
          status: 401,
          type: "error",
          success: false,
          message: "Unauthorized Access: Token is invalid"
        }
      }
      return {
        status: 200,
        type: "success",
        success: true,
        message: "Chat found",
        data: {
          workspace: workspace[0],
          chat: chat[0]
        }
      }
    }
  })
  const getWorkspaceInfo = tool({
    name: "get_workspace_info",
    description: "Use this tool to get workspace info.",
    parameters: z.object({}),
    async execute() {
      const workspace = await db.select().from(table.workspace).where(eq(table.workspace.id, workspaceId));
      if (!workspace.length || !workspace[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Workspace not found"
        }
      }
      return {
        status: 200,
        type: "success",
        success: true,
        message: "Workspace found",
        data: workspace[0]
      }
    }
  })
  const getDocumentInfo = tool({
    name: "get_document_info",
    description: "Use this tool to get document info.",
    parameters: z.object({
      documentId: z.string()
    }),
    async execute({ documentId }) {
      const document = await db.select().from(table.documents).where(eq(table.documents.id, documentId));
      if (!document.length || !document[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Document not found"
        }
      }
      const workspace = await db.select().from(table.workspace).where(eq(table.workspace.id, document[0].workspaceId));
      if (!workspace.length || !workspace[0]) {
        return {
          status: 404,
          type: "error",
          success: false,
          message: "Workspace not found"
        }
      }
      if (!workspace[0].public && workspace[0].userId !== userID) {
        return {
          status: 401,
          type: "error",
          success: false,
          message: "Unauthorized Access: Token is invalid"
        }
      }
      return {
        status: 200,
        type: "success",
        success: true,
        message: "Document found",
        data: document[0]
      }
    }
  })
  const getCurrentChatInfo = tool({
    name: "get_current_chat_info",
    description: "Use this tool to get current chat info.",
    parameters: z.object({}),
    async execute() {
      return await db.select().from(table.chats).where(eq(table.chats.id, chatId));
    }
  })
  const getFullDocumentWithChunkByIds = tool({
    name: "get_full_document_with_chunk_by_ids",
    description: "Use this tool to get full document with chunk by ids.",
    parameters: z.object({
      ids: z.array(z.string())
    }),
    async execute({ ids }) {
      return await db.select().from(table.chunks).where(inArray(table.chunks.id, ids));
    }
  })
  const agent = new Agent({
    name: "Study.ai",
    instructions,
    model,
    tools: [searchInKnowledgeBase, listKnowledgeBase, getChatInfo, getWorkspaceInfo, getDocumentInfo, getCurrentChatInfo, getFullDocumentWithChunkByIds, listUserQuiz, editUserQuiz, addQuiz, addQuizQuestion, editQuizQuestion, listQuizQuestion, ...customTool],
  });
  return agent
}

