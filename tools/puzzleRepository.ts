import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileRef, PuzzleFile } from '../src/core/catalog.ts'
import type { DraftProblem } from '../src/core/draft.ts'
import { puzzleId } from '../src/core/identity.ts'
import { PUZZLE_EXTENSION, readPuzzle, SIZE_FOLDER, sizeFolder } from '../src/core/puzzleFile.ts'
import { formatPuzzle, type ParseError, parsePuzzle } from '../src/core/puzzleFormat.ts'
import { isValidPuzzleName } from '../src/core/puzzleName.ts'
import { MAX_SIZE, MIN_SIZE } from '../src/core/rules.ts'
import type { Puzzle, RegionGrid } from '../src/core/types.ts'

export interface SaveRequest extends FileRef {
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

const OK: RepositoryResult = { ok: true }
const failure = (error: RepositoryError): RepositoryResult => ({ ok: false, error })
const fileOf = (root: string, { size, name }: FileRef) => join(root, sizeFolder(size), name + PUZZLE_EXTENSION)

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

/** Checks a save request on its own, before looking at what is already stored. */
function checkRequest(request: SaveRequest): { ok: true; puzzle: Puzzle } | { ok: false; error: RepositoryError } {
  if (!isValidPuzzleName(request.name)) return { ok: false, error: { kind: 'invalidName' } }
  if (!Number.isInteger(request.size) || request.size < MIN_SIZE || request.size > MAX_SIZE) {
    return { ok: false, error: { kind: 'invalidSize' } }
  }
  const read = readPuzzle(request.text)
  if (!read.ok) {
    return read.reason === 'unreadable'
      ? { ok: false, error: { kind: 'unreadable', error: read.error } }
      : { ok: false, error: { kind: 'notAPuzzle', problems: read.problems } }
  }
  if (read.puzzle.size !== request.size) return { ok: false, error: { kind: 'wrongSize', actualSize: read.puzzle.size } }
  return { ok: true, puzzle: read.puzzle }
}

/** The id of a stored file's layout, or null when it is not a fully assigned grid. */
function storedId(file: PuzzleFile): string | null {
  const parsed = parsePuzzle(file.text)
  if (!parsed.ok || parsed.grid.some((row) => row.includes(null))) return null
  return puzzleId(parsed.grid as RegionGrid)
}

async function listFolder(root: string, folder: string): Promise<PuzzleFile[]> {
  const files = (await readdir(join(root, folder))).filter((file) => file.endsWith(PUZZLE_EXTENSION))
  return Promise.all(
    files.map(async (file) => ({
      size: Number(folder),
      name: file.slice(0, -PUZZLE_EXTENSION.length),
      text: await readFile(join(root, folder, file), 'utf8'),
    })),
  )
}

async function listPuzzles(root: string): Promise<PuzzleFile[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true })
    const folders = entries.filter((entry) => entry.isDirectory() && SIZE_FOLDER.test(entry.name))
    return (await Promise.all(folders.map((folder) => listFolder(root, folder.name)))).flat()
  } catch (error) {
    if (isMissing(error)) return []
    throw error
  }
}

/** Why this request clashes with the stored Puzzles of its Size, if it does. */
function findClash(request: SaveRequest, puzzle: Puzzle, sameSize: readonly PuzzleFile[]): RepositoryError | null {
  const { previousName } = request
  if (previousName !== undefined && !sameSize.some((file) => file.name === previousName)) return { kind: 'notFound' }
  const others = sameSize.filter((file) => file.name !== previousName)
  if (others.some((file) => file.name === request.name)) return { kind: 'nameTaken' }
  const original = others.find((file) => storedId(file) === puzzle.id)
  return original ? { kind: 'duplicate', sameAs: { size: original.size, name: original.name } } : null
}

async function savePuzzle(root: string, request: SaveRequest): Promise<RepositoryResult> {
  const checked = checkRequest(request)
  if (!checked.ok) return failure(checked.error)
  const sameSize = (await listPuzzles(root)).filter((file) => file.size === request.size)
  const clash = findClash(request, checked.puzzle, sameSize)
  if (clash) return failure(clash)

  await mkdir(join(root, sizeFolder(request.size)), { recursive: true })
  await writeFile(fileOf(root, request), formatPuzzle(checked.puzzle.regions))
  const { previousName } = request
  if (previousName !== undefined && previousName !== request.name) {
    await rm(fileOf(root, { size: request.size, name: previousName }))
  }
  return OK
}

async function removePuzzle(root: string, ref: FileRef): Promise<RepositoryResult> {
  if (!isValidPuzzleName(ref.name)) return failure({ kind: 'invalidName' })
  const stored = (await listPuzzles(root)).some((file) => file.size === ref.size && file.name === ref.name)
  if (!stored) return failure({ kind: 'notFound' })
  await rm(fileOf(root, ref))
  return OK
}

/**
 * Reads and writes the Puzzle files under `root`. Only valid, distinct Puzzles are ever written,
 * so the library stays playable whatever the editor sends.
 */
export function createPuzzleRepository(root: string): PuzzleRepository {
  return {
    list: () => listPuzzles(root),
    save: (request) => savePuzzle(root, request),
    remove: (size, name) => removePuzzle(root, { size, name }),
  }
}
