import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileRef, PuzzleFile } from '../src/core/catalog'
import { type DraftProblem, inspectDraft } from '../src/core/draft'
import { puzzleId } from '../src/core/identity'
import { type ParseError, formatPuzzle, parsePuzzle } from '../src/core/puzzleFormat'
import { isValidPuzzleName } from '../src/core/puzzleName'
import { MAX_SIZE, MIN_SIZE } from '../src/core/rules'
import type { Puzzle } from '../src/core/types'

export interface SaveRequest {
  readonly size: number
  readonly name: string
  readonly text: string
  /** The Puzzle Name it was opened under, when editing a stored Puzzle; equal to `name` unless renaming. */
  readonly previousName?: string
}

export type RepositoryError =
  | { readonly kind: 'invalidName' }
  | { readonly kind: 'invalidSize' }
  | { readonly kind: 'unreadable'; readonly error: ParseError }
  | { readonly kind: 'notAPuzzle'; readonly problems: readonly DraftProblem[] }
  | { readonly kind: 'wrongSize'; readonly actualSize: number }
  | { readonly kind: 'nameTaken' }
  | { readonly kind: 'duplicate'; readonly sameAs: FileRef }
  | { readonly kind: 'notFound' }

export type RepositoryResult = { readonly ok: true } | { readonly ok: false; readonly error: RepositoryError }

export interface PuzzleRepository {
  list(): Promise<PuzzleFile[]>
  save(request: SaveRequest): Promise<RepositoryResult>
  remove(size: number, name: string): Promise<RepositoryResult>
}

const PUZZLE_EXTENSION = '.txt'
const SIZE_FOLDER = /^\d+$/
const sizeFolder = (size: number) => String(size).padStart(2, '0')
const failure = (error: RepositoryError): RepositoryResult => ({ ok: false, error })

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

/** Checks a save request on its own, before looking at what is already stored. */
function checkRequest(request: SaveRequest): { ok: true; puzzle: Puzzle } | { ok: false; error: RepositoryError } {
  if (!isValidPuzzleName(request.name)) return { ok: false, error: { kind: 'invalidName' } }
  if (!Number.isInteger(request.size) || request.size < MIN_SIZE || request.size > MAX_SIZE) {
    return { ok: false, error: { kind: 'invalidSize' } }
  }
  const parsed = parsePuzzle(request.text)
  if (!parsed.ok) return { ok: false, error: { kind: 'unreadable', error: parsed.error } }
  const inspection = inspectDraft(parsed.grid)
  if (!inspection.valid) return { ok: false, error: { kind: 'notAPuzzle', problems: inspection.problems } }
  if (inspection.puzzle.size !== request.size) {
    return { ok: false, error: { kind: 'wrongSize', actualSize: inspection.puzzle.size } }
  }
  return { ok: true, puzzle: inspection.puzzle }
}

/** The id of a stored file's layout, or null when the file is not a readable grid. */
function storedId(file: PuzzleFile): string | null {
  const parsed = parsePuzzle(file.text)
  return parsed.ok && parsed.grid.every((row) => row.every((cell) => cell !== null))
    ? puzzleId(parsed.grid as number[][])
    : null
}

/**
 * Reads and writes the Puzzle files under `root`, laid out as `<size>/<name>.txt`. Only valid,
 * distinct Puzzles are ever written, so the library stays playable whatever the editor sends.
 */
export function createPuzzleRepository(root: string): PuzzleRepository {
  const fileOf = (size: number, name: string) => join(root, sizeFolder(size), name + PUZZLE_EXTENSION)

  async function listFolder(folder: string): Promise<PuzzleFile[]> {
    const files = (await readdir(join(root, folder))).filter((file) => file.endsWith(PUZZLE_EXTENSION))
    return Promise.all(
      files.map(async (file) => ({
        size: Number(folder),
        name: file.slice(0, -PUZZLE_EXTENSION.length),
        text: await readFile(join(root, folder, file), 'utf8'),
      })),
    )
  }

  async function list(): Promise<PuzzleFile[]> {
    try {
      const entries = await readdir(root, { withFileTypes: true })
      const folders = entries.filter((entry) => entry.isDirectory() && SIZE_FOLDER.test(entry.name))
      return (await Promise.all(folders.map((folder) => listFolder(folder.name)))).flat()
    } catch (error) {
      if (isMissing(error)) return []
      throw error
    }
  }

  return {
    list,

    async save(request) {
      const checked = checkRequest(request)
      if (!checked.ok) return failure(checked.error)

      const sameSize = (await list()).filter((file) => file.size === request.size)
      const { previousName } = request
      if (previousName !== undefined && !sameSize.some((file) => file.name === previousName)) {
        return failure({ kind: 'notFound' })
      }
      const others = sameSize.filter((file) => file.name !== previousName)
      if (others.some((file) => file.name === request.name)) return failure({ kind: 'nameTaken' })
      const original = others.find((file) => storedId(file) === checked.puzzle.id)
      if (original) return failure({ kind: 'duplicate', sameAs: { size: original.size, name: original.name } })

      await mkdir(join(root, sizeFolder(request.size)), { recursive: true })
      await writeFile(fileOf(request.size, request.name), formatPuzzle(checked.puzzle.regions))
      if (previousName !== undefined && previousName !== request.name) await rm(fileOf(request.size, previousName))
      return { ok: true }
    },

    async remove(size, name) {
      if (!isValidPuzzleName(name)) return failure({ kind: 'invalidName' })
      const stored = (await list()).some((file) => file.size === size && file.name === name)
      if (!stored) return failure({ kind: 'notFound' })
      await rm(fileOf(size, name))
      return { ok: true }
    },
  }
}
