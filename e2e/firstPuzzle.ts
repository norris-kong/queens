import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCatalog } from '../src/core/catalog.ts'
import { buildLinkedInCatalog, type LinkedInCatalog } from '../src/core/linkedInCatalog.ts'
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

/** The last Puzzle of the library (the last Master one), whose solving leads on to Nightmare. */
export async function lastPuzzle(): Promise<{ readonly path: string; readonly puzzle: Puzzle }> {
  const files = await createPuzzleRepository(fileURLToPath(new URL('../puzzles', import.meta.url))).list()
  const group = buildCatalog(files).sizes.at(-1)
  const entry = group?.puzzles.at(-1)
  if (!group || !entry) throw new Error('The puzzle library is empty; E2E needs at least one Puzzle')
  return { path: routeHash({ page: 'play', size: group.size, name: entry.name }), puzzle: entry.puzzle }
}

/** The LinkedIn Puzzles, read the way the game reads them. */
export async function linkedInPuzzles(): Promise<LinkedInCatalog> {
  const folder = fileURLToPath(new URL('../puzzles/LinkedIn', import.meta.url))
  const names = (await readdir(folder)).filter((file) => file.endsWith('.txt'))
  const files = await Promise.all(
    names.map(async (file) => ({ name: file.slice(0, -'.txt'.length), text: await readFile(join(folder, file), 'utf8') })),
  )
  return buildLinkedInCatalog(files, new Set())
}
