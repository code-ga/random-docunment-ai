import { streamText, tool, Tool, ModelMessage, stepCountIs } from "ai"
import { eq, inArray } from "drizzle-orm";
import z from "zod";
import { db, table } from "../database";
import { findSimilarDocuments } from "./embedding";
import { aiModel } from './getAiClient';



const instructions = `
You are a neutral AI learning assistant.  
You help users learn and memorize verified information from a document database or tools.

Rules:
1. **Accuracy First** – Never guess. Use DB or tools. If no info: say \`"No reliable information found."\`
2. **Source Always** – When from DB, include: document name + document ID. When from tools, name the tool or URL.
3. **Pre-Quiz Questions** – Before making a quiz, ask only:
   - Topic or document
   - Knowledge level (Beginner/Intermediate/Expert)
   - Scope (All content or specific sections)
4. **DB Check** – Query DB to confirm topic exists before quiz. If missing, suggest alternatives.
5. **Quiz Creation** – Use a tool to generate BOTH flashcards and MCQ from DB content.  
   After each answer, give:
   - Correct/incorrect
   - Correct answer
   - Doc name + doc ID
   - Short explanation
6. **Tool Use** – Always use tools for real-time info, calculations, and quiz generation.
7. **Neutrality** – No opinions or political bias. Present only verified facts.

Format for DB answers:  
Answer: [text]  
Source: [Document DB] - "Doc Name" (Document ID: xyz123)

Format for tool answers:  
Answer: [text]  
Source: [Tool Name]

`

export const streamChat = async (workspaceId: string, chatId: string, userID: string, customTool: { [key: string]: Tool } = {}, conversation: ModelMessage[]) => {
  const tools = {
    search_in_knowledge_base: tool({

      description: "Use this tool to answer questions about documents.",
      inputSchema: z.object({
        query: z.string()
      }),
      async execute({ query }) {
        return await findSimilarDocuments(query, workspaceId);
      }
    }),
    "list_knowledge_base": tool({

      description: "Use this tool to list documents.",
      inputSchema: z.object({}),
      async execute() {
        return await db.select().from(table.documents).where(eq(table.documents.workspaceId, workspaceId));
      }
    }),

    "list_user_quizzes": tool({
      name: "list_user_quizzes",
      description: "Use this tool to list user quizzes.",
      inputSchema: z.object({}),
      async execute() {
        return await db.select().from(table.quizCollection).where(eq(table.quizCollection.userId, userID));
      }
    }),

    "edit_user_quiz": tool({
      name: "edit_user_quiz",
      description: "Use this tool to edit user quizzes.",
      inputSchema: z.object({
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
    }),

    "add_quiz": tool({
      name: "add_quiz",
      description: "Use this tool to add a quiz.",
      inputSchema: z.object({
        data: z.object({
          name: z.string(),
          description: z.string(),
          isPublic: z.boolean()
        })
      }),
      async execute({ data }) {
        return await db.insert(table.quizCollection).values({ ...data, userId: userID }).returning();
      }
    }),
    "add_quiz_question": tool({
      name: "add_quiz_question",
      description: "Use this tool to add a question to a quiz.",
      inputSchema: z.object({
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
    }),

    "edit_quiz_question": tool({
      name: "edit_quiz_question",
      description: "Use this tool to edit a question in a quiz.",
      inputSchema: z.object({
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
    }),
    "list_quiz_question": tool({
      name: "list_quiz_question",
      description: "Use this tool to list questions in a quiz.",
      inputSchema: z.object({
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
    }),

    "get_chat_info": tool({
      name: "get_chat_info",
      description: "Use this tool to get chat info.",
      inputSchema: z.object({
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
    }),
    "get_workspace_info": tool({
      name: "get_workspace_info",
      description: "Use this tool to get workspace info.",
      inputSchema: z.object({}),
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
    }),
    "get_document_info": tool({
      name: "get_document_info",
      description: "Use this tool to get document info.",
      inputSchema: z.object({
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
    }),
    "get_current_chat_info": tool({
      name: "get_current_chat_info",
      description: "Use this tool to get current chat info.",
      inputSchema: z.object({}),
      async execute() {
        return await db.select().from(table.chats).where(eq(table.chats.id, chatId));
      }
    }),
    "get_full_document_with_chunk_by_ids": tool({
      name: "get_full_document_with_chunk_by_ids",
      description: "Use this tool to get full document with chunk by ids.",
      inputSchema: z.object({
        ids: z.array(z.string())
      }),
      async execute({ ids }) {
        return await db.select().from(table.chunks).where(inArray(table.chunks.id, ids));
      }
    })
  }
  // const agent = new Agent({
  //   name: "Study.ai",
  //   instructions,
  //   model,
  //   tools: [searchInKnowledgeBase, listKnowledgeBase, getChatInfo, getWorkspaceInfo, getDocumentInfo, getCurrentChatInfo, getFullDocumentWithChunkByIds, listUserQuiz, editUserQuiz, addQuiz, addQuizQuestion, editQuizQuestion, listQuizQuestion, ...customTool],
  // });
  const stream = streamText({
    model: aiModel,
    temperature: 0,
    messages: [{ role: "system", content: instructions }, ...conversation],
    tools: { ...tools, ...customTool },
    toolChoice: "auto",
    stopWhen: stepCountIs(1000000000000000000000),
  })
  return stream
}

