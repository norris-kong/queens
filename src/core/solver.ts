import type { RegionGrid, Solution } from './types'

/**
 * Finds up to `limit` Solutions of a Region layout by placing one Queen per row,
 * never reusing a column or Region and never touching the Queen in the row above.
 */
export function findSolutions(regions: RegionGrid, limit: number): Solution[] {
  const size = regions.length
  const found: Solution[] = []

  function place(row: number, columns: readonly number[], usedRegions: ReadonlySet<number>): void {
    if (found.length >= limit) return
    if (row === size) {
      found.push(columns)
      return
    }
    const previousCol = columns[row - 1]
    for (let col = 0; col < size; col++) {
      const region = regions[row]?.[col]
      if (region === undefined || usedRegions.has(region) || columns.includes(col)) continue
      if (previousCol !== undefined && Math.abs(previousCol - col) <= 1) continue
      place(row + 1, [...columns, col], new Set([...usedRegions, region]))
    }
  }

  place(0, [], new Set())
  return found
}
