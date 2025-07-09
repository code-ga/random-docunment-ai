import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  vector
} from 'drizzle-orm/pg-core';



export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});



export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  workspaces: many(workspace),
  documents: many(documents),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const verificationTokenRelations = relations(verification, ({ one }) => ({
  user: one(user, {
    fields: [verification.identifier],
    references: [user.id],
  }),
}))

const workspace = pgTable("workspace", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  description: text('description'),
  public: boolean('public').notNull().$default(() => false),
  documentIds: text('document_ids').notNull().array().$defaultFn(() => []),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

const documents = pgTable("document", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().$defaultFn(() => createId()),
  content: text('content').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspace.id),
  savingPath: text('saving_path'),
  embedding: vector('embedding', { dimensions: 1536 }),
  embedder: text('embedder'),
  userId: text('user_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
},
  (table) => [
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ]
);

// Chat table
export const chats = pgTable('chats', {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => user.id),
  workspaceId: text('workspace_id').notNull().references(() => workspace.id),
  title: text('title').notNull().$defaultFn(() => "New Chat"),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Message role enum: 'user' or 'assistant'
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

// Message table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: text('chat_id')
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  // tokens: integer('tokens'), // Optional: for tracking usage
});

const documentRelations = relations(documents, ({ one }) => ({
  workspace: one(workspace, {
    fields: [documents.workspaceId],
    references: [workspace.id],
  }),
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
}))

export const workspaceRelations = relations(workspace, ({ many }) => ({
  documents: many(documents),
}))

export const dbRelations = {
  user: userRelations,
  account: accountRelations,
  session: sessionRelations,
  verification: verificationTokenRelations,
  workspace: workspaceRelations,
  documents: documentRelations
}


export const table = {
  user,
  account,
  session,
  verification,
  workspace,
  documents
} as const

export type Table = typeof table