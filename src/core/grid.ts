import type { Coord } from './types.ts'

/** A stable string for a Cell, for use as a Set or Map key. */
export function coordKey({ row, col }: Coord): string {
  return `${row},${col}`
}

const ORTHOGONAL_STEPS: readonly Coord[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
]

/** The Cells directly above, below, left and right of `coord` that lie on a `size`×`size` board. */
export function orthogonalNeighbours({ row, col }: Coord, size: number): Coord[] {
  return ORTHOGONAL_STEPS.map((step) => ({ row: row + step.row, col: col + step.col })).filter(
    (next) => next.row >= 0 && next.row < size && next.col >= 0 && next.col < size,
  )
}

export function filledGrid<T>(size: number, value: T): T[][] {
  return Array.from({ length: size }, () => Array<T>(size).fill(value))
}

/** Returns a new grid with the given Cells replaced; the original is left untouched. */
export function replaceCells<T>(
  grid: readonly (readonly T[])[],
  changes: readonly { readonly coord: Coord; readonly value: T }[],
): T[][] {
  const changed = new Map(changes.map((change) => [coordKey(change.coord), change]))
  return grid.map((cells, row) =>
    cells.map((current, col) => {
      const change = changed.get(coordKey({ row, col }))
      return change ? change.value : current
    }),
  )
}
