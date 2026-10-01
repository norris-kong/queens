import { EDITOR_API_PATH, type EditorResult, editorResultSchema } from './editorProtocol.ts'

export interface SaveRequest {
  readonly size: number
  readonly name: string
  readonly text: string
  readonly previousName?: string
}

async function post(action: 'save' | 'delete', body: unknown): Promise<EditorResult> {
  let response: Response
  try {
    response = await fetch(`${EDITOR_API_PATH}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    console.error(`Editor ${action} request could not reach the dev server`, error)
    return { ok: false, error: { kind: 'network' } }
  }
  // Never trust the response shape: anything unexpected is reported as a server error.
  const parsed = editorResultSchema.safeParse(await response.json().catch(() => null))
  if (parsed.success) return parsed.data
  console.error(`Editor ${action} got an unexpected response (HTTP ${response.status})`, parsed.error.issues)
  return { ok: false, error: { kind: 'serverError' } }
}

export const editorApi = {
  save: (request: SaveRequest) => post('save', request),
  remove: (size: number, name: string) => post('delete', { size, name }),
}
