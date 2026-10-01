import { puzzleId } from './identity'
import { MAX_SIZE, MIN_SIZE } from './rules'
import { findSolutions } from './solver'
import type { Coord, DraftGrid, Puzzle, RegionGrid, RegionId, Solution } from './types'

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

  const key = (coord: Coord) => `${coord.row},${coord.col}`
  const reached = new Set([key(start.coord)])
  const frontier = [start.coord]
  while (frontier.length > 0) {
    const current = frontier.pop() as Coord
    for (const step of ORTHOGONAL_STEPS) {
      const next = { row: current.row + step.row, col: current.col + step.col }
      if (draft[next.row]?.[next.col] !== region || reached.has(key(next))) continue
      reached.add(key(next))
      frontier.push(next)
    }
  }
  return reached.size === members.length
}

function findDisconnectedRegions(draft: DraftGrid): RegionId[] {
  return Array.from({ length: draft.length }, (_, region) => region).filter((region) => !isConnected(draft, region))
}

function findStructuralProblems(draft: DraftGrid): DraftProblem[] {
  const unassigned = findUnassignedCells(draft)
  const missing = findMissingRegions(draft)
  const disconnected = findDisconnectedRegions(draft)
  return [
    ...(unassigned.length > 0 ? [{ kind: 'unassignedCells', cells: unassigned } as const] : []),
    ...(missing.length > 0 ? [{ kind: 'missingRegions', regions: missing } as const] : []),
    ...(disconnected.length > 0 ? [{ kind: 'disconnectedRegions', regions: disconnected } as const] : []),
  ]
}

/** Checks a Draft against every Puzzle condition and, when it meets them all, returns the Puzzle. */
export function inspectDraft(draft: DraftGrid): DraftInspection {
  const size = draft.length
  if (size < MIN_SIZE || size > MAX_SIZE) return { valid: false, problems: [{ kind: 'sizeOutOfRange', size }] }

  const structural = findStructuralProblems(draft)
  if (structural.length > 0) return { valid: false, problems: structural }

  const regions = draft as RegionGrid
  const [first, second] = findSolutions(regions, SOLUTIONS_TO_FIND)
  if (first === undefined) return { valid: false, problems: [{ kind: 'noSolution' }] }
  if (second !== undefined) {
    return { valid: false, problems: [{ kind: 'multipleSolutions', solutions: [first, second] }] }
  }
  return { valid: true, puzzle: { id: puzzleId(regions), size, regions, solution: first } }
}
