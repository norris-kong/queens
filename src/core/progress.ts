import { z } from 'zod'
import { type Board, isBoardEmpty } from './board.ts'
import type { Puzzle } from './types.ts'

/** What is kept for one Puzzle between visits. */
export interface PuzzleProgress {
  readonly board: Board
  readonly solveTimeMs: number
  readonly hintsUsed: number
  /** Has this Puzzle ever been Solved? Stays true through a replay, and keeps its tick in the list. */
  readonly everSolved: boolean
}

/** The part of the browser's Storage the store needs, so tests can pass an in-memory one. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

export interface ProgressStore {
  /** The save under `key`, if there is one and it was made for this very Puzzle. */
  load(key: string, puzzle: Puzzle): PuzzleProgress | null
  /** How far the save under `key` got, whichever Puzzle it was made for; enough for a list or calendar. */
  status(key: string): ProgressStatus
  save(key: string, puzzle: Puzzle, progress: PuzzleProgress): void
  /** Drops this store's saves under any other key, e.g. of Puzzles whose Regions were edited. */
  forgetAllExcept(keys: ReadonlySet<string>): void
}

/** Where one Puzzle's progress is kept between visits. */
export interface SaveSlot {
  load(): PuzzleProgress | null
  save(progress: PuzzleProgress): void
}

export function saveSlot(store: ProgressStore, key: string, puzzle: Puzzle): SaveSlot {
  return { load: () => store.load(key, puzzle), save: (progress) => store.save(key, puzzle, progress) }
}

export type ProgressStatus = 'new' | 'inProgress' | 'solved'

/** How a Puzzle shows in the list: ticked once ever Solved, otherwise whether it has been started. */
export function progressStatus(progress: PuzzleProgress | null): ProgressStatus {
  if (progress === null) return 'new'
  if (progress.everSolved) return 'solved'
  // Time spent only looking at a Puzzle does not count as starting it.
  return progress.hintsUsed > 0 || !isBoardEmpty(progress.board) ? 'inProgress' : 'new'
}

/** Where the library's Puzzles keep their saves, one per Puzzle identity (ADR 0001). */
const LIBRARY_PREFIX = 'queens.progress.'

const savedSchema = z.object({
  board: z.array(z.array(z.enum(['empty', 'mark', 'queen']))),
  solveTimeMs: z.number().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  everSolved: z.boolean(),
  /** The Puzzle the save was made for; missing from saves made before it was recorded. */
  puzzleId: z.string().optional(),
})

type Saved = z.infer<typeof savedSchema>

function fitsPuzzle(board: Board, puzzle: Puzzle): boolean {
  return board.length === puzzle.size && board.every((row) => row.length === puzzle.size)
}

/** Reads a save, treating anything unreadable as never played. */
function readSave(raw: string, key: string): Saved | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (error) {
    console.warn(`Ignoring unreadable progress under ${key}`, error)
    return null
  }
  const parsed = savedSchema.safeParse(json)
  if (!parsed.success) {
    console.warn(`Ignoring malformed progress under ${key}`, parsed.error.issues)
    return null
  }
  return parsed.data
}

/**
 * Keeps progress in browser storage, each save under `prefix` + its key. Storage can be unavailable
 * (private mode, blocked site data, full quota), so failures are logged and the game carries on
 * without saving.
 */
export function createProgressStore(storage: StorageLike, prefix = LIBRARY_PREFIX): ProgressStore {
  function read(key: string): Saved | null {
    try {
      const raw = storage.getItem(prefix + key)
      return raw === null ? null : readSave(raw, key)
    } catch (error) {
      console.warn('Progress could not be read from storage', error)
      return null
    }
  }

  return {
    load(key, puzzle) {
      const saved = read(key)
      if (saved === null) return null
      const { puzzleId, ...progress } = saved
      // A generated Puzzle can change under the same key (ADR 0002); its old Board must not carry over.
      if (puzzleId !== undefined && puzzleId !== puzzle.id) return null
      return fitsPuzzle(progress.board, puzzle) ? progress : null
    },
    status: (key) => progressStatus(read(key)),
    save(key, puzzle, progress) {
      try {
        storage.setItem(prefix + key, JSON.stringify({ ...progress, puzzleId: puzzle.id }))
      } catch (error) {
        console.warn('Progress could not be saved to storage', error)
      }
    },
    forgetAllExcept(keys) {
      try {
        const stored = Array.from({ length: storage.length }, (_, index) => storage.key(index))
        const stale = stored.filter(
          (key): key is string => key !== null && key.startsWith(prefix) && !keys.has(key.slice(prefix.length)),
        )
        stale.forEach((key) => storage.removeItem(key))
      } catch (error) {
        console.warn('Old progress could not be cleared from storage', error)
      }
    },
  }
}
