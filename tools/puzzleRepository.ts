import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileRef, PuzzleFile } from '../src/core/catalog.ts'
import type { DraftProblem, DraftRules } from '../src/core/draft.ts'
import { puzzleId } from '../src/core/identity.ts'
import { isLinkedInNumber, type LinkedInFile, linkedInRules } from '../src/core/linkedInCatalog.ts'
import { LINKEDIN_FOLDER, PUZZLE_EXTENSION, readPuzzle, SIZE_FOLDER, sizeFolder } from '../src/core/puzzleFile.ts'
import { formatPuzzle, type ParseError, parsePuzzle } from '../src/core/puzzleFormat.ts'
import { isValidPuzzleName, samePuzzleName } from '../src/core/puzzleName.ts'
import { MAX_SIZE, MIN_SIZE } from '../src/core/rules.ts'
import type { Puzzle, RegionGrid } from '../src/core/types.ts'

export interface SaveRequest extends FileRef {
  readonly text: string
  /** The Puzzle Name it was opened under, when editing a stored Puzzle; equal to `name` unless renaming. */
  readonly previousName?: string
}

export interface LinkedInSaveRequest {
  /** LinkedIn's own number for the Puzzle. */
  readonly number: number
  readonly text: string
  /** The number it was opened under, when correcting a stored LinkedIn Puzzle; equal to `number` unless renumbering. */
  readonly previousNumber?: number
}

export type RepositoryError =
  | { readonly kind: 'invalidName' }
  | { readonly kind: 'invalidSize' }
  | { readonly kind: 'invalidNumber' }
  | { readonly kind: 'unreadable'; readonly error: ParseError }
  | { readonly kind: 'notAPuzzle'; readonly problems: readonly DraftProblem[] }
  | { readonly kind: 'wrongSize'; readonly actualSize: number }
  | { readonly kind: 'nameTaken' }
  | { readonly kind: 'numberTaken' }
  | { readonly kind: 'duplicate'; readonly sameAs: FileRef }
  | { readonly kind: 'linkedInDuplicate'; readonly number: number }
  | { readonly kind: 'notFound' }

export type RepositoryResult = { readonly ok: true } | { readonly ok: false; readonly error: RepositoryError }

export interface PuzzleRepository {
  list(): Promise<PuzzleFile[]>
  save(request: SaveRequest): Promise<RepositoryResult>
  remove(size: number, name: string): Promise<RepositoryResult>
  listLinkedIn(): Promise<LinkedInFile[]>
  saveLinkedIn(request: LinkedInSaveRequest): Promise<RepositoryResult>
  removeLinkedIn(number: number): Promise<RepositoryResult>
}

type Checked = { readonly ok: true; readonly puzzle: Puzzle } | { readonly ok: false; readonly error: RepositoryError }

const OK: RepositoryResult = { ok: true }
const failure = (error: RepositoryError): RepositoryResult => ({ ok: false, error })
const fileOf = (root: string, { size, name }: FileRef) => join(root, sizeFolder(size), name + PUZZLE_EXTENSION)
const linkedInFileOf = (root: string, number: number) => join(root, LINKEDIN_FOLDER, number + PUZZLE_EXTENSION)

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

/** Reads a request's text as the game would, refusing anything that is not a valid Puzzle. */
function readRequestPuzzle(text: string, rules: DraftRules = {}): Checked {
  const read = readPuzzle(text, rules)
  if (read.ok) return { ok: true, puzzle: read.puzzle }
  return read.reason === 'unreadable'
    ? { ok: false, error: { kind: 'unreadable', error: read.error } }
    : { ok: false, error: { kind: 'notAPuzzle', problems: read.problems } }
}

/** Checks a save request on its own, before looking at what is already stored. */
function checkRequest(request: SaveRequest): Checked {
  if (!isValidPuzzleName(request.name)) return { ok: false, error: { kind: 'invalidName' } }
  if (!Number.isInteger(request.size) || request.size < MIN_SIZE || request.size > MAX_SIZE) {
    return { ok: false, error: { kind: 'invalidSize' } }
  }
  const read = readRequestPuzzle(request.text)
  if (read.ok && read.puzzle.size !== request.size) {
    return { ok: false, error: { kind: 'wrongSize', actualSize: read.puzzle.size } }
  }
  return read
}

/** The id of a stored file's layout, or null when it is not a fully assigned grid. */
function storedId(file: { readonly text: string }): string | null {
  const parsed = parsePuzzle(file.text)
  if (!parsed.ok || parsed.grid.some((row) => row.includes(null))) return null
  return puzzleId(parsed.grid as RegionGrid)
}

/** Every Puzzle file in a folder of `root`, or none when the folder does not exist. */
async function listFolder(root: string, folder: string): Promise<LinkedInFile[]> {
  let names: string[]
  try {
    names = (await readdir(join(root, folder))).filter((file) => file.endsWith(PUZZLE_EXTENSION))
  } catch (error) {
    if (isMissing(error)) return []
    throw error
  }
  return Promise.all(
    names.map(async (file) => ({
      name: file.slice(0, -PUZZLE_EXTENSION.length),
      text: await readFile(join(root, folder, file), 'utf8'),
    })),
  )
}

async function listPuzzles(root: string): Promise<PuzzleFile[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true })
    const folders = entries.filter((entry) => entry.isDirectory() && SIZE_FOLDER.test(entry.name))
    const listed = await Promise.all(
      folders.map(async (folder) =>
        (await listFolder(root, folder.name)).map((file) => ({ ...file, size: Number(folder.name) })),
      ),
    )
    return listed.flat()
  } catch (error) {
    if (isMissing(error)) return []
    throw error
  }
}

/** A LinkedIn Puzzle already stored with this layout, as an error to report. */
async function linkedInCopy(root: string, puzzle: Puzzle): Promise<RepositoryError | null> {
  const copy = (await listFolder(root, LINKEDIN_FOLDER)).find((file) => storedId(file) === puzzle.id)
  return copy ? { kind: 'linkedInDuplicate', number: Number(copy.name) } : null
}

/** Why this request clashes with the stored Puzzles of its Size, if it does. */
function findClash(request: SaveRequest, puzzle: Puzzle, sameSize: readonly PuzzleFile[]): RepositoryError | null {
  const { previousName } = request
  if (previousName !== undefined && !sameSize.some((file) => file.name === previousName)) return { kind: 'notFound' }
  const others = sameSize.filter((file) => file.name !== previousName)
  if (others.some((file) => samePuzzleName(file.name, request.name))) return { kind: 'nameTaken' }
  const original = others.find((file) => storedId(file) === puzzle.id)
  return original ? { kind: 'duplicate', sameAs: { size: original.size, name: original.name } } : null
}

async function savePuzzle(root: string, request: SaveRequest): Promise<RepositoryResult> {
  const checked = checkRequest(request)
  if (!checked.ok) return failure(checked.error)
  const sameSize = (await listPuzzles(root)).filter((file) => file.size === request.size)
  const clash = findClash(request, checked.puzzle, sameSize) ?? (await linkedInCopy(root, checked.puzzle))
  if (clash) return failure(clash)

  await mkdir(join(root, sizeFolder(request.size)), { recursive: true })
  const { previousName } = request
  if (previousName !== undefined && previousName !== request.name) {
    // Move before writing: on a disk that ignores case, "corner" and "Corner" are the same file.
    await rename(fileOf(root, { size: request.size, name: previousName }), fileOf(root, request))
  }
  await writeFile(fileOf(root, request), formatPuzzle(checked.puzzle.regions))
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
 * Why this LinkedIn request clashes with what is stored, if it does. Repeating another LinkedIn
 * Puzzle is fine, as LinkedIn has rerun some; repeating one of the author's own is not.
 */
async function findLinkedInClash(root: string, request: LinkedInSaveRequest, puzzle: Puzzle): Promise<RepositoryError | null> {
  const { number, previousNumber } = request
  const stored = (await listFolder(root, LINKEDIN_FOLDER)).map((file) => file.name)
  if (previousNumber !== undefined && !stored.includes(String(previousNumber))) return { kind: 'notFound' }
  if (number !== previousNumber && stored.includes(String(number))) return { kind: 'numberTaken' }
  const own = (await listPuzzles(root)).find((file) => storedId(file) === puzzle.id)
  return own ? { kind: 'duplicate', sameAs: { size: own.size, name: own.name } } : null
}

async function saveLinkedInPuzzle(root: string, request: LinkedInSaveRequest): Promise<RepositoryResult> {
  const { number, previousNumber } = request
  if (!isLinkedInNumber(number) || (previousNumber !== undefined && !isLinkedInNumber(previousNumber))) {
    return failure({ kind: 'invalidNumber' })
  }
  const checked = readRequestPuzzle(request.text, linkedInRules(number))
  if (!checked.ok) return failure(checked.error)
  const clash = await findLinkedInClash(root, request, checked.puzzle)
  if (clash) return failure(clash)

  await mkdir(join(root, LINKEDIN_FOLDER), { recursive: true })
  if (previousNumber !== undefined && previousNumber !== number) {
    await rename(linkedInFileOf(root, previousNumber), linkedInFileOf(root, number))
  }
  await writeFile(linkedInFileOf(root, number), formatPuzzle(checked.puzzle.regions))
  return OK
}

async function removeLinkedInPuzzle(root: string, number: number): Promise<RepositoryResult> {
  if (!isLinkedInNumber(number)) return failure({ kind: 'invalidNumber' })
  const stored = (await listFolder(root, LINKEDIN_FOLDER)).some((file) => file.name === String(number))
  if (!stored) return failure({ kind: 'notFound' })
  await rm(linkedInFileOf(root, number))
  return OK
}

/**
 * Reads and writes the Puzzle files under `root`: the author's own, by Size, and the LinkedIn
 * Puzzles, by LinkedIn number. Only valid, distinct Puzzles are ever written, so the library stays
 * playable whatever the editor sends.
 */
export function createPuzzleRepository(root: string): PuzzleRepository {
  return {
    list: () => listPuzzles(root),
    save: (request) => savePuzzle(root, request),
    remove: (size, name) => removePuzzle(root, { size, name }),
    listLinkedIn: () => listFolder(root, LINKEDIN_FOLDER),
    saveLinkedIn: (request) => saveLinkedInPuzzle(root, request),
    removeLinkedIn: (number) => removeLinkedInPuzzle(root, number),
  }
}
