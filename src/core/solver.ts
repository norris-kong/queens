import type { RegionGrid, Solution } from './types.ts'

/** Cell indices (row * size + col) of every row, column and Region: each needs exactly one Queen. */
function unitsOf(regions: RegionGrid): number[][] {
  const size = regions.length
  const indices = Array.from({ length: size }, (_, index) => index)
  const rows = indices.map((row) => indices.map((col) => row * size + col))
  const columns = indices.map((col) => indices.map((row) => row * size + col))
  const byRegion = indices.map((region) =>
    regions.flatMap((cells, row) => cells.flatMap((cellRegion, col) => (cellRegion === region ? [row * size + col] : []))),
  )
  return [...rows, ...columns, ...byRegion]
}

/** For each Cell, the Cells a Queen there rules out: its row, column, Region and touching Cells. */
function blockedBy(regions: RegionGrid): number[][] {
  const size = regions.length
  return Array.from({ length: size * size }, (_, cell) => {
    const row = Math.floor(cell / size)
    const col = cell % size
    const region = regions[row]?.[col]
    return Array.from({ length: size * size }, (_, other) => other).filter((other) => {
      const otherRow = Math.floor(other / size)
      const otherCol = other % size
      return (
        otherRow === row ||
        otherCol === col ||
        regions[otherRow]?.[otherCol] === region ||
        (Math.abs(otherRow - row) <= 1 && Math.abs(otherCol - col) <= 1)
      )
    })
  })
}

/**
 * Finds up to `limit` Solutions of a Region layout. Each step fills the row, column or Region with the
 * fewest open Cells, and a placed Queen closes every Cell it rules out, so dead ends show up early.
 */
export function findSolutions(regions: RegionGrid, limit: number): Solution[] {
  const size = regions.length
  const units = unitsOf(regions)
  const blocked = blockedBy(regions)
  const found: Solution[] = []

  function search(open: readonly boolean[], queens: readonly number[]): void {
    if (found.length >= limit) return
    if (queens.length === size) {
      const solution = Array<number>(size)
      queens.forEach((cell) => (solution[Math.floor(cell / size)] = cell % size))
      found.push(solution)
      return
    }
    const unfilled = units.filter((unit) => !unit.some((cell) => queens.includes(cell)))
    const candidates = unfilled.map((unit) => unit.filter((cell) => open[cell]))
    const tightest = candidates.reduce((best, cells) => (cells.length < best.length ? cells : best))
    for (const cell of tightest) {
      const closed = new Set(blocked[cell])
      search(
        open.map((isOpen, other) => isOpen && !closed.has(other)),
        [...queens, cell],
      )
    }
  }

  search(Array<boolean>(size * size).fill(true), [])
  return found
}
