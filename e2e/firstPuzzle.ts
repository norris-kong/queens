import { fileURLToPath } from 'node:url'
import { buildCatalog } from '../src/core/catalog.ts'
import type { Coord, Puzzle } from '../src/core/types.ts'
import { routeHash } from '../src/ui/routes.ts'
import { createPuzzleRepository } from '../tools/puzzleRepository.ts'

export interface FirstPuzzle {
  readonly path: string
  readonly puzzle: Puzzle
  readonly solution: readonly Coord[]
  /** A Cell outside the Solution, for placing a wrong Queen. */
  readonly wrongCell: Coord
}

/** The first Puzzle of the library, read the way the game reads it, so tests survive library edits. */
export async function firstPuzzle(): Promise<FirstPuzzle> {
  const files = await createPuzzleRepository(fileURLToPath(new URL('../puzzles', import.meta.url))).list()
  const [group] = buildCatalog(files).sizes
  const entry = group?.puzzles[0]
  if (!group || !entry) throw new Error('The puzzle library is empty; E2E needs at least one Puzzle')
  const solution = entry.puzzle.solution.map((col, row) => ({ row, col }))
  const firstCol = entry.puzzle.solution[0] ?? 0
  return {
    path: routeHash({ page: 'play', size: group.size, name: entry.name }),
    puzzle: entry.puzzle,
    solution,
    wrongCell: { row: 0, col: firstCol === 0 ? 1 : 0 },
  }
}
