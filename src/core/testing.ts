import { readPuzzle } from './puzzleFile.ts'
import type { Puzzle } from './types.ts'

/** Builds a Puzzle from Puzzle-file text, failing loudly if the fixture is not a valid Puzzle. */
export function puzzleFrom(text: string): Puzzle {
  const read = readPuzzle(text)
  if (!read.ok) throw new Error(`fixture is not a Puzzle: ${JSON.stringify(read)}`)
  return read.puzzle
}

/**
 * A 4×4 Puzzle whose single-Cell Region A forces its only Solution, columns 1-3-0-2:
 *
 *   C A B B
 *   C C B B
 *   C C D D
 *   D D D D
 */
export const FOUR_BY_FOUR = puzzleFrom('CABB\nCCBB\nCCDD\nDDDD')
