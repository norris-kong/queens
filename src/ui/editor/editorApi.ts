/** Mirrors the dev server's editor endpoints (tools/puzzleEditorPlugin.ts). */
const API_PATH = '/__editor/puzzles'

export type EditorErrorKind =
  | 'invalidName'
  | 'invalidSize'
  | 'unreadable'
  | 'notAPuzzle'
  | 'wrongSize'
  | 'nameTaken'
  | 'duplicate'
  | 'notFound'
  | 'badRequest'
  | 'serverError'
  | 'network'

export interface EditorError {
  readonly kind: EditorErrorKind
  readonly sameAs?: { readonly size: number; readonly name: string }
}

export type EditorResult = { readonly ok: true } | { readonly ok: false; readonly error: EditorError }

async function post(action: 'save' | 'delete', body: unknown): Promise<EditorResult> {
  try {
    const response = await fetch(`${API_PATH}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return (await response.json()) as EditorResult
  } catch (error) {
    console.error(`Editor ${action} request failed`, error)
    return { ok: false, error: { kind: 'network' } }
  }
}

export const editorApi = {
  save: (request: { size: number; name: string; text: string; previousName?: string }) => post('save', request),
  remove: (size: number, name: string) => post('delete', { size, name }),
}
