import { createSelectSchema } from "drizzle-typebox"
import { Static, t, TSchema } from "elysia"
import { table } from "../database/schema"
import { spread } from "../database/utils"
export const baseResponseType = <T extends TSchema>(schema: T) => t.Object({
  status: t.Number(),
  message: t.String(),
  success: t.Boolean(),
  type: t.String(),
  data: t.Optional(schema)
})
export type BaseResponse<T> = {
  status: number
  message: string
  success: boolean
  type: string
  data: T
}

export const contentType = t.Recursive(Self => t.Object({
  type: t.Optional(t.String()),
  content: t.Optional(t.Array(Self)),
  attrs: t.Optional(t.Record(t.String(), t.Any())),
  marks: t.Optional(t.Array(t.Record(t.String(), t.Any()))),
  text: t.Optional(t.String())
}))


export const userType = createSelectSchema(table.user)

export type User = Static<typeof userType>

// export const workspaceType = spread(table.workspace)

export const workspaceSelectType = createSelectSchema(table.workspace)

export type Workspace = Static<typeof workspaceSelectType>

export const documentSelectType = createSelectSchema(table.documents)

export type Document = Static<typeof documentSelectType>