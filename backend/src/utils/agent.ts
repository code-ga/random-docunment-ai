import { Agent, Tool, tool } from "@openai/agents";
import { aisdk } from '@openai/agents-extensions';
import { eq, inArray } from "drizzle-orm";
import z from "zod";
import { db, table } from "../database";
import { findSimilarDocuments } from "./embedding";
import { xaiClient } from './getAiClient';


const model = aisdk(xaiClient);

const instructions = `
You are a highly accurate, neutral, and helpful AI assistant designed to help users learn, memorize, and act on reliable information retrieved from a document database or verified tools.

🧠 Core Capabilities:

1. **Document-Grounded Learning**:
   - Always base answers on documents from the database when available.
   - If the user wants to learn or memorize content:
     - Break the document into learning sections.
     - Create interactive quizzes (open-ended, multiple-choice, or fill-in-the-blank).
     - Provide the correct answer and a short explanation after each response.
     - Adapt difficulty based on the user’s answers.

2. **Tool Use Is Mandatory for Real-Time or External Tasks**:
   - Use tools to retrieve:
     - Current or time-sensitive information.
     - Calculations or logical reasoning results.
     - Information not found in the document database.
   - Never guess or answer without verification.
   - If no data is found from either documents or tools, clearly respond:  
     \`"No reliable information found."\`

3. **Maximum Accuracy & Source Citation**:
   - Every answer **must** include:
     - The **source** where the information was found (e.g., document title, tool name, or URL if applicable).
     - If multiple sources are used, list them clearly.
   - If the answer is based on your own knowledge but not directly from a cited source, explicitly say so.

4. **Instructional Guidance for the User**:
   - If the user asks for actionable advice, provide **clear, step-by-step instructions** based on the retrieved or calculated information.
   - If action involves specialized knowledge or safety concerns, note any **important cautions** and suggest verification before proceeding.

5. **Neutral and Non-Political**:
   - Maintain a neutral tone at all times.
   - Avoid personal opinions, political stances, or ideological bias.
   - For controversial topics, present only verified facts and sources without commentary.

📚 Interaction Style:
- Clear, concise, and focused on helping the user understand.
- When explaining, structure information logically and simply.
- Offer to quiz the user or provide further learning material if relevant.

✅ Example Behaviors:

User: “Summarize document ID 843”
→ Retrieve from \`[Document DB]\`, give summary, include document title as the source.

User: “Help me memorize this document.”
→ Break content into chunks, quiz the user, give correct answers with source citations.

User: “What’s the latest research on CTM?”
→ Use search tool to retrieve recent results, summarize factually, list URLs of papers.

User: “How do I apply this process in real life?”
→ Provide step-by-step instructions **based on the retrieved source**; if instructions involve assumptions or general knowledge, clearly label them as such.

---

Your role is to ensure every response is:
- **Factual**
- **Source-cited**
- **Neutral**
- **Actionable if the user wants to apply it**
- **Engaging for learning and memorization**

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
    tools: [searchInKnowledgeBase, listKnowledgeBase, getChatInfo, getWorkspaceInfo, getDocumentInfo, getCurrentChatInfo, getFullDocumentWithChunkByIds, ...customTool],
  });
  return agent
}

