import { z } from 'zod'

/** Shared by the dev server (tools/puzzleEditorPlugin.ts) and the editor page. */
export const EDITOR_API_PATH = '/__editor/puzzles'

export const EDITOR_ERROR_KINDS = [
  'invalidName',
  'invalidSize',
  'unreadable',
  'notAPuzzle',
  'wrongSize',
  'nameTaken',
  'duplicate',
  'notFound',
  'badRequest',
  'serverError',
  'network',
] as const

export type EditorErrorKind = (typeof EDITOR_ERROR_KINDS)[number]

export const editorResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      kind: z.enum(EDITOR_ERROR_KINDS),
      sameAs: z.object({ size: z.number(), name: z.string() }).optional(),
    }),
  }),
])

export type EditorResult = z.infer<typeof editorResultSchema>
