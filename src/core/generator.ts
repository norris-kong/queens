import { inspectDraft, isRegionConnected } from './draft.ts'
import { filledGrid, orthogonalNeighbours, replaceCells } from './grid.ts'
import { pick, type Random, shuffled } from './random.ts'
import { findSolutions } from './solver.ts'
import type { Coord, DraftGrid, Puzzle, RegionGrid, RegionId, Solution } from './types.ts'

/** Fresh starts before giving up; each start picks a new Solution and grows new Regions. */
const MAX_ATTEMPTS = 1000
/** Cell moves allowed per start while removing other Solutions. */
const REPAIR_STEPS_PER_SIZE = 6
/** Other Solutions looked at per move; moving a Cell shared by many of them breaks them all at once. */
const SOLUTIONS_PER_LOOK = 16
/** No Region may grow past this many times the average Region size (which equals the Size). */
const MAX_REGION_SIZE_FACTOR = 2
/** A single-Cell Region gives its Queen away at once, so every Region keeps at least this many Cells. */
const MIN_REGION_SIZE = 2

const range = (count: number) => Array.from({ length: count }, (_, index) => index)

/** Queens in every row and column, never touching: the Solution the Puzzle is built around. */
function randomSolution(size: number, random: Random): Solution {
  for (;;) {
    const columns = shuffled(range(size), random)
    if (columns.every((col, row) => row === 0 || Math.abs(col - (columns[row - 1] ?? -9)) > 1)) return columns
  }
}

function cellsOf(grid: DraftGrid, region: RegionId | null): Coord[] {
  return grid.flatMap((cells, row) => cells.flatMap((cell, col) => (cell === region ? [{ row, col }] : [])))
}

/** Grows one Region per target Queen, taking turns one Cell at a time so sizes stay even. */
function growRegions(size: number, solution: Solution, random: Random): RegionGrid {
  const regionOfRow = shuffled(range(size), random)
  let grid: DraftGrid = replaceCells(
    filledGrid<RegionId | null>(size, null),
    solution.map((col, row) => ({ coord: { row, col }, value: regionOfRow[row] ?? row })),
  )
  while (cellsOf(grid, null).length > 0) {
    for (const region of shuffled(range(size), random)) {
      const frontier = cellsOf(grid, region)
        .flatMap((cell) => orthogonalNeighbours(cell, size))
        .filter((cell) => grid[cell.row]?.[cell.col] === null)
      const next = pick(frontier, random)
      if (next) grid = replaceCells(grid, [{ coord: next, value: region }])
    }
  }
  return grid as RegionGrid
}

/** Queen Cells of the other Solutions that the target does not use, most shared first. */
function cellsToMove(target: Solution, others: readonly Solution[], random: Random): Coord[] {
  const counts = new Map<string, { readonly cell: Coord; count: number }>()
  for (const other of others) {
    other.forEach((col, row) => {
      if (col === target[row]) return
      const key = `${row},${col}`
      const entry = counts.get(key) ?? { cell: { row, col }, count: 0 }
      counts.set(key, { ...entry, count: entry.count + 1 })
    })
  }
  return shuffled([...counts.values()], random)
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.cell)
}

/**
 * Breaks other Solutions by moving one of their Queen Cells into a neighbouring Region, which then
 * holds two of their Queens. The target Solution is untouched because only Cells outside it move.
 */
function breakSolutions(
  regions: RegionGrid,
  target: Solution,
  others: readonly Solution[],
  random: Random,
): RegionGrid | null {
  const size = regions.length
  for (const cell of cellsToMove(target, others, random)) {
    const from = regions[cell.row]?.[cell.col]
    if (from === undefined || cellsOf(regions, from).length <= MIN_REGION_SIZE) continue
    for (const neighbour of shuffled(orthogonalNeighbours(cell, size), random)) {
      const to = regions[neighbour.row]?.[neighbour.col]
      if (to === undefined || to === from) continue
      const moved = replaceCells(regions, [{ coord: cell, value: to }])
      if (isRegionConnected(moved, from)) return moved
    }
  }
  return null
}

function otherSolutions(regions: RegionGrid, target: Solution): Solution[] {
  return findSolutions(regions, SOLUTIONS_PER_LOOK).filter((solution) => solution.some((col, row) => col !== target[row]))
}

/** Moves Cells until the target is the only Solution, or gives up. */
function removeOtherSolutions(regions: RegionGrid, target: Solution, random: Random): RegionGrid | null {
  let current: RegionGrid | null = regions
  for (let step = 0; current && step < regions.length * REPAIR_STEPS_PER_SIZE; step++) {
    const others = otherSolutions(current, target)
    if (others.length === 0) return current
    current = breakSolutions(current, target, others, random)
  }
  return null
}

function hasFairRegionSizes(regions: RegionGrid): boolean {
  const size = regions.length
  return range(size).every((region) => {
    const cells = cellsOf(regions, region).length
    return cells >= MIN_REGION_SIZE && cells <= size * MAX_REGION_SIZE_FACTOR
  })
}

/** Re-letters Regions in reading order, so the top-left Region is always A. */
function inReadingOrder(regions: RegionGrid): RegionGrid {
  const order = [...new Set(regions.flat())]
  return regions.map((cells) => cells.map((region) => order.indexOf(region)))
}

/**
 * Makes a new Puzzle of the given Size: picks a Solution, grows evenly sized Regions around its
 * Queens, then reshapes them until no other Solution remains. Every Region ends up with between
 * 2 Cells and twice the average. Null if every attempt fails.
 */
export function generatePuzzle(size: number, random: Random): Puzzle | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const solution = randomSolution(size, random)
    const regions = removeOtherSolutions(growRegions(size, solution, random), solution, random)
    if (!regions || !hasFairRegionSizes(regions)) continue
    const inspection = inspectDraft(inReadingOrder(regions))
    if (inspection.valid) return inspection.puzzle
  }
  return null
}
