import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { z } from 'zod'
import { createPuzzleRepository, type PuzzleRepository, type RepositoryResult } from './puzzleRepository.ts'

/** Where the editor's requests go; only the dev server answers them. */
export const EDITOR_API_PATH = '/__editor/puzzles'

const MAX_BODY_BYTES = 16 * 1024

const saveSchema = z.object({
  size: z.number().int(),
  name: z.string(),
  text: z.string(),
  previousName: z.string().optional(),
})

const removeSchema = z.object({ size: z.number().int(), name: z.string() })

class BadRequest extends Error {}

async function readJson(request: IncomingMessage): Promise<unknown> {
  // Requiring JSON keeps other web pages from posting here: browsers preflight such cross-site requests.
  if (!request.headers['content-type']?.startsWith('application/json')) throw new BadRequest('JSON body required')
  let size = 0
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    size += (chunk as Buffer).length
    if (size > MAX_BODY_BYTES) throw new BadRequest('Body too large')
    chunks.push(chunk as Buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new BadRequest('Body is not valid JSON')
  }
}

function send(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

async function handle(repository: PuzzleRepository, request: IncomingMessage): Promise<RepositoryResult> {
  const body = await readJson(request)
  if (request.url === '/save') {
    const parsed = saveSchema.safeParse(body)
    if (!parsed.success) throw new BadRequest('Invalid save request')
    return repository.save(parsed.data)
  }
  if (request.url === '/delete') {
    const parsed = removeSchema.safeParse(body)
    if (!parsed.success) throw new BadRequest('Invalid delete request')
    return repository.remove(parsed.data.size, parsed.data.name)
  }
  throw new BadRequest(`Unknown editor action ${request.url ?? ''}`)
}

/** Lets the dev-only Puzzle editor save, rename and delete files under `puzzlesDir`. */
export function puzzleEditorPlugin(puzzlesDir: string): Plugin {
  return {
    name: 'queens-puzzle-editor',
    apply: 'serve',
    configureServer(server) {
      const repository = createPuzzleRepository(puzzlesDir)
      server.middlewares.use(EDITOR_API_PATH, (request, response) => {
        if (request.method !== 'POST') {
          send(response, 405, { ok: false, error: { kind: 'badRequest', message: 'POST only' } })
          return
        }
        handle(repository, request)
          .then((result) => send(response, result.ok ? 200 : 422, result))
          .catch((error: unknown) => {
            if (error instanceof BadRequest) {
              send(response, 400, { ok: false, error: { kind: 'badRequest', message: error.message } })
              return
            }
            server.config.logger.error(`[puzzle editor] ${String(error)}`)
            send(response, 500, { ok: false, error: { kind: 'serverError' } })
          })
      })
    },
  }
}
