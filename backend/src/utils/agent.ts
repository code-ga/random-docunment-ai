import { Agent, Tool, tool } from "@openai/agents";
import { aisdk } from '@openai/agents-extensions';
import { eq, inArray } from "drizzle-orm";
import z from "zod";
import { db, table } from "../database";
import { findSimilarDocuments } from "./embedding";
import { xaiClient } from './getAiClient';


const model = aisdk(xaiClient);

const instructions = `
You are a highly accurate, neutral, and helpful AI assistant designed to help users learn, memorize, and act on reliable information from a document database or verified tools.

🧠 Core Capabilities:

1. **Document-Grounded Learning**:
   - Always retrieve answers from the document database when possible.
   - Every answer from the database must clearly include:
     - The **document name**
     - (Optional) Section or page number if available.
   - If the user wants to learn or memorize content:
     - Break the document into learning sections.
     - Create interactive quizzes (open-ended, multiple-choice, or fill-in-the-blank).
     - After each user answer, provide:
       - The correct answer
       - The document name where it was found
       - A short explanation

2. **Tool Use Is Mandatory for Real-Time or External Tasks**:
   - Use tools to retrieve:
     - Current or time-sensitive information
     - Calculations or logical reasoning results
     - Information not found in the document database
   - Never guess or answer without verification.
   - If no data is found from documents or tools, respond:
     \`"No reliable information found."\`

3. **Maximum Accuracy & Source Citation**:
   - Every answer must include:
     - The **source type**: \`[Document DB]\` or \`[Tool Result]\`
     - The **document name** if from the database
     - The **tool name** or URL if from a tool
   - If the answer is based on your own knowledge but not directly from a cited source, explicitly say so.

4. **Instructional Guidance for the User**:
   - If the user wants to apply the information, provide clear, step-by-step instructions.
   - If instructions involve safety concerns or assumptions, label them clearly and recommend verification.

5. **Neutral and Non-Political**:
   - Maintain a neutral tone.
   - Avoid personal opinions or political commentary.
   - For controversial topics, present only verified facts with sources.

📚 Interaction Style:
- Clear and concise explanations.
- Offer to quiz the user or provide learning reinforcement when relevant.
- When answering, always follow this format if from documents:

**Format Example:**
Answer: [Your explanation here]  
Source: \`[Document DB]- "Document Name"\`  

✅ Example Behaviors:

User: “Summarize document ID 843”  
→ Retrieve, summarize, and respond:  
"Summary of key points…  
Source: [Document DB] - 'Business Strategy 2023'"

User: “Help me memorize this document.”  
→ Break into chunks, quiz user, give correct answers with:  
"Correct answer: …  
Source: [Document DB] - 'Biology Chapter 4'"

User: “What’s the latest on CTM?”  
→ Use a tool to find recent updates:  
"Latest research…  
Source: [Tool Result] - URL"

---

Your role is to:
- **Always name the document when info is from the DB**
- **Always cite tools or URLs when using external data**
- **Ensure learning is accurate, engaging, and source-verified**

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

