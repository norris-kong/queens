import { coordKey } from './grid.ts'
import { puzzleId } from './identity.ts'
import { MAX_SIZE, MIN_SIZE } from './rules.ts'
import { findSolutions } from './solver.ts'
import type { Coord, DraftGrid, Puzzle, RegionGrid, RegionId, Solution } from './types.ts'

export type DraftProblem =
  | { readonly kind: 'sizeOutOfRange'; readonly size: number }
  | { readonly kind: 'unassignedCells'; readonly cells: readonly Coord[] }
  | { readonly kind: 'missingRegions'; readonly regions: readonly RegionId[] }
  | { readonly kind: 'disconnectedRegions'; readonly regions: readonly RegionId[] }
  | { readonly kind: 'noSolution' }
  | { readonly kind: 'multipleSolutions'; readonly solutions: readonly [Solution, Solution] }

export type DraftInspection =
  | { readonly valid: true; readonly puzzle: Puzzle }
  | { readonly valid: false; readonly problems: readonly DraftProblem[] }

/** Enough Solutions to tell "none", "exactly one" and "more than one" apart. */
const SOLUTIONS_TO_FIND = 2

const ORTHOGONAL_STEPS: readonly Coord[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
]

function cellsOf(draft: DraftGrid): { readonly coord: Coord; readonly region: RegionId | null }[] {
  return draft.flatMap((cells, row) => cells.map((region, col) => ({ coord: { row, col }, region })))
}

function findUnassignedCells(draft: DraftGrid): Coord[] {
  return cellsOf(draft)
    .filter((cell) => cell.region === null)
    .map((cell) => cell.coord)
}

function findMissingRegions(draft: DraftGrid): RegionId[] {
  const present = new Set(cellsOf(draft).map((cell) => cell.region))
  return Array.from({ length: draft.length }, (_, region) => region).filter((region) => !present.has(region))
}

/** True when every Cell of the Region can reach the others through up/down/left/right steps. */
function isConnected(draft: DraftGrid, region: RegionId): boolean {
  const members = cellsOf(draft).filter((cell) => cell.region === region)
  const [start] = members
  if (start === undefined) return true

  const reached = new Set([coordKey(start.coord)])
  const frontier = [start.coord]
  while (frontier.length > 0) {
    const current = frontier.pop() as Coord
    for (const step of ORTHOGONAL_STEPS) {
      const next = { row: current.row + step.row, col: current.col + step.col }
      if (draft[next.row]?.[next.col] !== region || reached.has(coordKey(next))) continue
      reached.add(coordKey(next))
      frontier.push(next)
    }
  }
  return reached.size === members.length
}

function findDisconnectedRegions(draft: DraftGrid): RegionId[] {
  return Array.from({ length: draft.length }, (_, region) => region).filter((region) => !isConnected(draft, region))
}

/** Problems with how Cells are assigned to Regions. Only the first two keep Solutions from being counted. */
function findLayoutProblems(draft: DraftGrid): { readonly blocking: DraftProblem[]; readonly disconnected: DraftProblem[] } {
  const unassigned = findUnassignedCells(draft)
  const missing = findMissingRegions(draft)
  const disconnected = findDisconnectedRegions(draft)
  return {
    blocking: [
      ...(unassigned.length > 0 ? [{ kind: 'unassignedCells', cells: unassigned } as const] : []),
      ...(missing.length > 0 ? [{ kind: 'missingRegions', regions: missing } as const] : []),
    ],
    disconnected: disconnected.length > 0 ? [{ kind: 'disconnectedRegions', regions: disconnected }] : [],
  }
}

function solutionProblems(solutions: readonly Solution[]): DraftProblem[] {
  const [first, second] = solutions
  if (first === undefined) return [{ kind: 'noSolution' }]
  return second === undefined ? [] : [{ kind: 'multipleSolutions', solutions: [first, second] }]
}

/**
 * Checks a Draft against every Puzzle condition and, when it meets them all, returns the Puzzle.
 * Solutions are counted as soon as every Cell is assigned and all N Regions are used, even if a
 * Region is still split, so the author sees both problems at once.
 */
export function inspectDraft(draft: DraftGrid): DraftInspection {
  const size = draft.length
  if (size < MIN_SIZE || size > MAX_SIZE) return { valid: false, problems: [{ kind: 'sizeOutOfRange', size }] }

  const layout = findLayoutProblems(draft)
  if (layout.blocking.length > 0) return { valid: false, problems: [...layout.blocking, ...layout.disconnected] }

  const regions = draft as RegionGrid
  const solutions = findSolutions(regions, SOLUTIONS_TO_FIND)
  const problems = [...layout.disconnected, ...solutionProblems(solutions)]
  const [solution] = solutions
  if (problems.length > 0 || solution === undefined) return { valid: false, problems }
  return { valid: true, puzzle: { id: puzzleId(regions), size, regions, solution } }
}
