import { z } from 'zod'
import type { DraftProblem } from '../src/core/draft.ts'
import { linkedInRules } from '../src/core/linkedInCatalog.ts'
import { readPuzzle } from '../src/core/puzzleFile.ts'
import { formatPuzzle, type ParseError } from '../src/core/puzzleFormat.ts'
import type { RegionGrid } from '../src/core/types.ts'

/**
 * The community archive of every LinkedIn Queens puzzle, by awa.games (also at
 * linkedinzip.solutions). Its pages name the files holding the boards, a year or a month each.
 */
export const ARCHIVE_ORIGIN = 'https://awa.games'
export const ARCHIVE_PAGE = `${ARCHIVE_ORIGIN}/linkedin-queens/`
/** The first year of LinkedIn Queens; each past year has a page of its own. */
export const FIRST_YEAR = 2024

/** How the archive writes Region ids, one character per Cell. */
const REGION_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

const boardsSchema = z.object({
  puzzles: z.record(
    z.string().regex(/^[1-9]\d*$/),
    z.object({
      board: z.object({ regions: z.string() }),
      grid: z.object({ rows: z.number().int().positive(), cols: z.number().int().positive() }),
    }),
  ),
})

export interface ArchivePuzzle {
  readonly number: number
  readonly regions: RegionGrid
}

export interface LinkedInPuzzleFile {
  readonly number: number
  /** Puzzle-file text, ready to write to `puzzles/LinkedIn/<number>.txt`. */
  readonly text: string
}

export interface SkippedPuzzle {
  readonly number: number
  readonly problems: readonly DraftProblem[] | readonly [ParseError]
}

/** The board files an archive page names, as paths on the archive's site. */
export function boardFilesIn(html: string): string[] {
  return [...new Set([...html.matchAll(/data-file="([^"]+\.json)"/g)].map((match) => match[1] as string))]
}

/** The puzzles in one board file, or the reason it is not shaped as expected. */
export function readBoards(json: unknown): { ok: true; puzzles: ArchivePuzzle[] } | { ok: false; issues: string } {
  const parsed = boardsSchema.safeParse(json)
  if (!parsed.success) return { ok: false, issues: parsed.error.message }
  const puzzles = Object.entries(parsed.data.puzzles).map(([number, { board, grid }]) => ({
    number: Number(number),
    regions: Array.from({ length: grid.rows }, (_, row) =>
      [...board.regions.slice(row * grid.cols, (row + 1) * grid.cols)].map((digit) => REGION_DIGITS.indexOf(digit)),
    ),
  }))
  return { ok: true, puzzles }
}

/** Renumbers Regions 0, 1, 2… in reading order, closing gaps such as a board using ids 0–4 and 6–9. */
function compactRegions(regions: RegionGrid): RegionGrid {
  const order = [...new Set(regions.flat())]
  return regions.map((row) => row.map((region) => order.indexOf(region)))
}

/** An archive puzzle as a Puzzle file, read back the way the game reads it; broken ones are skipped. */
export function toPuzzleFile(puzzle: ArchivePuzzle): { ok: true; file: LinkedInPuzzleFile } | { ok: false; skipped: SkippedPuzzle } {
  const text = formatPuzzle(compactRegions(puzzle.regions))
  const read = readPuzzle(text, linkedInRules(puzzle.number))
  if (read.ok) return { ok: true, file: { number: puzzle.number, text } }
  const problems = read.reason === 'unreadable' ? ([read.error] as const) : read.problems
  return { ok: false, skipped: { number: puzzle.number, problems } }
}

export interface ImportPlan {
  /** Numbers not stored yet, to write. */
  readonly add: readonly LinkedInPuzzleFile[]
  /** Numbers stored with another layout than the archive's; the stored one is kept. */
  readonly differing: readonly number[]
}

/** Which archive puzzles to add, given the layouts already stored (Puzzle ids by number). */
export function planImport(files: readonly LinkedInPuzzleFile[], stored: ReadonlyMap<number, string | null>): ImportPlan {
  const add: LinkedInPuzzleFile[] = []
  const differing: number[] = []
  for (const file of files) {
    if (!stored.has(file.number)) {
      add.push(file)
      continue
    }
    const read = readPuzzle(file.text, linkedInRules(file.number))
    if (read.ok && read.puzzle.id !== stored.get(file.number)) differing.push(file.number)
  }
  return { add, differing: differing.sort((a, b) => a - b) }
}
