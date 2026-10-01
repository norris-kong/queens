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
  load(puzzle: Puzzle): PuzzleProgress | null
  save(puzzleId: string, progress: PuzzleProgress): void
  /** Drops saves of Puzzles that are no longer in the library, e.g. after their Regions were edited. */
  forgetAllExcept(puzzleIds: ReadonlySet<string>): void
}

export type ProgressStatus = 'new' | 'inProgress' | 'solved'

/** How a Puzzle shows in the list: ticked once ever Solved, otherwise whether it has been started. */
export function progressStatus(progress: PuzzleProgress | null): ProgressStatus {
  if (progress === null) return 'new'
  if (progress.everSolved) return 'solved'
  // Time spent only looking at a Puzzle does not count as starting it.
  return progress.hintsUsed > 0 || !isBoardEmpty(progress.board) ? 'inProgress' : 'new'
}

const KEY_PREFIX = 'queens.progress.'

const progressSchema = z.object({
  board: z.array(z.array(z.enum(['empty', 'mark', 'queen']))),
  solveTimeMs: z.number().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  everSolved: z.boolean(),
})

function fitsPuzzle(board: Board, puzzle: Puzzle): boolean {
  return board.length === puzzle.size && board.every((row) => row.length === puzzle.size)
}

/** Reads a save, treating anything unreadable or not matching the Puzzle as never played. */
function readProgress(raw: string, puzzle: Puzzle): PuzzleProgress | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (error) {
    console.warn(`Ignoring unreadable progress for Puzzle ${puzzle.id}`, error)
    return null
  }
  const parsed = progressSchema.safeParse(json)
  if (!parsed.success) {
    console.warn(`Ignoring malformed progress for Puzzle ${puzzle.id}`, parsed.error.issues)
    return null
  }
  return fitsPuzzle(parsed.data.board, puzzle) ? parsed.data : null
}

/**
 * Keeps each Puzzle's progress in browser storage. Storage can be unavailable (private mode,
 * blocked site data, full quota), so failures are logged and the game carries on without saving.
 */
export function createProgressStore(storage: StorageLike): ProgressStore {
  return {
    load(puzzle) {
      try {
        const raw = storage.getItem(KEY_PREFIX + puzzle.id)
        return raw === null ? null : readProgress(raw, puzzle)
      } catch (error) {
        console.warn('Progress could not be read from storage', error)
        return null
      }
    },
    save(puzzleId, progress) {
      try {
        storage.setItem(KEY_PREFIX + puzzleId, JSON.stringify(progress))
      } catch (error) {
        console.warn('Progress could not be saved to storage', error)
      }
    },
    forgetAllExcept(puzzleIds) {
      try {
        const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
        const stale = keys.filter(
          (key): key is string => key !== null && key.startsWith(KEY_PREFIX) && !puzzleIds.has(key.slice(KEY_PREFIX.length)),
        )
        stale.forEach((key) => storage.removeItem(key))
      } catch (error) {
        console.warn('Old progress could not be cleared from storage', error)
      }
    },
  }
}
