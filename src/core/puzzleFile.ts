import { type DraftProblem, inspectDraft } from './draft.ts'
import { type ParseError, parsePuzzle } from './puzzleFormat.ts'
import type { Puzzle } from './types.ts'

/** Puzzle files live at `puzzles/<two-digit size>/<Puzzle Name>.txt`, e.g. `puzzles/08/spiral.txt`. */
export const PUZZLE_EXTENSION = '.txt'
export const SIZE_FOLDER = /^\d{2}$/

export function sizeFolder(size: number): string {
  return String(size).padStart(2, '0')
}

export type ReadPuzzleResult =
  | { readonly ok: true; readonly puzzle: Puzzle }
  | { readonly ok: false; readonly reason: 'unreadable'; readonly error: ParseError }
  | { readonly ok: false; readonly reason: 'notAPuzzle'; readonly problems: readonly DraftProblem[] }

/** Reads Puzzle-file text into a Puzzle, or says why it is not one. */
export function readPuzzle(text: string): ReadPuzzleResult {
  const parsed = parsePuzzle(text)
  if (!parsed.ok) return { ok: false, reason: 'unreadable', error: parsed.error }
  const inspection = inspectDraft(parsed.grid)
  if (!inspection.valid) return { ok: false, reason: 'notAPuzzle', problems: inspection.problems }
  return { ok: true, puzzle: inspection.puzzle }
}
