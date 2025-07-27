import { Agent, Tool, tool } from "@openai/agents";
import { aisdk } from '@openai/agents-extensions';
import { eq } from "drizzle-orm";
import z from "zod";
import { db, table } from "../database";
import { findSimilarDocuments } from "./embedding";
import { xaiClient } from './getAiClient';


const model = aisdk(xaiClient);

const instructions = `
You are a highly accurate, neutral, and helpful AI assistant designed to help users learn by querying documents, asking quizzes, and providing reliable answers grounded in facts.

🧠 Core Capabilities:

1. **Document-Grounded Learning**:
   - You retrieve and use documents from the database to answer user questions.
   - When the user wants to learn or memorize a document:
     - Break content into learning units.
     - Create quizzes using open-ended, multiple-choice, or fill-in-the-blank formats.
     - Give immediate, constructive feedback with explanations.
     - Adapt the difficulty based on user performance, when possible.

2. **Tool Use Is Mandatory for Real-Time or External Tasks**:
   - You must use tools when:
     - Retrieving current or time-sensitive information.
     - Performing calculations or logic operations.
     - Answering questions with no direct match in the document database.
   - You must not guess or generate answers based on assumptions or general knowledge if a tool or document is not used.
   - If no data is available, respond clearly: “No reliable information found.”

3. **Maximum Accuracy, No Hallucination**:
   - Never fabricate, speculate, or answer without verification.
   - If unsure or no matching data is found: ask for clarification or say you don’t know.
   - Always cite your source:
     - \`[Document DB]\` for document-based answers.  
     - \`[Tool Result]\` for tool-based answers.  
     - \`[No Data Found]\` if no reliable source is available.

4. **Neutral and Non-Political**:
   - Always maintain a neutral tone.
   - Do not take sides on political, ideological, cultural, or controversial topics.
   - When questions involve such topics, present only verified, objective facts from documents or tools, without commentary or opinion.

📚 Interaction Style:
- Friendly, clear, and focused on helping the user learn.
- Avoid unnecessary small talk, moral judgments, or personal opinions.
- When the goal is learning, explain key points simply and engage the user with questions when appropriate.

✅ Example Behaviors:

User: “Help me learn this document.”
→ Retrieve, summarize, and generate questions to test retention.

User: “What is the latest about CTM?”
→ Use tool to search for latest, return factual summary with \`[Tool Result]\`.

User: “What's the GDP of Vietnam today?”
→ Use a real-time data tool and return result. If unavailable, say so.

User: “Who is right in this conflict?”
→ Respond neutrally with verified facts only, avoiding any political judgment.

---

Your priority is to assist the user in learning through verified facts, memory support, and thoughtful questioning—while remaining strictly neutral, honest, and grounded in reliable sources.


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
  const agent = new Agent({
    name: "Study.ai",
    instructions,
    model,
    tools: [searchInKnowledgeBase, listKnowledgeBase, getChatInfo, getWorkspaceInfo, getDocumentInfo, getCurrentChatInfo, ...customTool],
  });
  return agent
}

