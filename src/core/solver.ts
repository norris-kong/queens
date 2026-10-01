import type { RegionGrid, Solution } from './types.ts'

/** Lookup tables for one Region layout, built once per search. Cells are numbered row * size + col. */
interface Layout {
  readonly size: number
  /** Cells of every row, then every column, then every Region: each needs exactly one Queen. */
  readonly units: readonly Int16Array[]
  /** The three units (row, column, Region) each Cell belongs to. */
  readonly unitsOfCell: readonly (readonly [number, number, number])[]
  /** For each Cell, the Cells a Queen there rules out: its row, column, Region and touching Cells. */
  readonly blocked: readonly Int16Array[]
}

function buildLayout(regions: RegionGrid): Layout {
  const size = regions.length
  const cells = Array.from({ length: size * size }, (_, cell) => ({
    cell,
    row: Math.floor(cell / size),
    col: cell % size,
    region: regions[Math.floor(cell / size)]?.[cell % size] ?? -1,
  }))
  const indices = Array.from({ length: size }, (_, index) => index)
  const units = [
    ...indices.map((row) => Int16Array.from(cells.filter((c) => c.row === row).map((c) => c.cell))),
    ...indices.map((col) => Int16Array.from(cells.filter((c) => c.col === col).map((c) => c.cell))),
    ...indices.map((region) => Int16Array.from(cells.filter((c) => c.region === region).map((c) => c.cell))),
  ]
  const unitsOfCell = cells.map((c) => [c.row, size + c.col, 2 * size + c.region] as const)
  const blocked = cells.map((c) =>
    Int16Array.from(
      cells
        .filter(
          (o) =>
            o.row === c.row ||
            o.col === c.col ||
            o.region === c.region ||
            (Math.abs(o.row - c.row) <= 1 && Math.abs(o.col - c.col) <= 1),
        )
        .map((o) => o.cell),
    ),
  )
  return { size, units, unitsOfCell, blocked }
}

/** The unfilled unit with the fewest open Cells, or null once every unit holds a Queen. */
function tightestUnit(layout: Layout, open: Uint8Array, filled: Uint8Array): Int16Array | null {
  let best: Int16Array | null = null
  let bestCount = Infinity
  for (let unit = 0; unit < layout.units.length; unit++) {
    if (filled[unit]) continue
    const cells = layout.units[unit] as Int16Array
    let count = 0
    for (const cell of cells) count += open[cell] as number
    if (count < bestCount) {
      best = cells
      bestCount = count
      if (count === 0) break
    }
  }
  return best
}

/**
 * Finds up to `limit` Solutions of a Region layout. Each step fills the row, column or Region with the
 * fewest open Cells, and a placed Queen closes every Cell it rules out, so dead ends show up early.
 */
export function findSolutions(regions: RegionGrid, limit: number): Solution[] {
  const layout = buildLayout(regions)
  const { size } = layout
  const found: Solution[] = []

  function search(open: Uint8Array, filled: Uint8Array, queens: readonly number[]): void {
    if (found.length >= limit) return
    const unit = tightestUnit(layout, open, filled)
    if (unit === null) {
      const solution = Array<number>(size)
      for (const cell of queens) solution[Math.floor(cell / size)] = cell % size
      found.push(solution)
      return
    }
    for (const cell of unit) {
      if (!open[cell]) continue
      const nextOpen = open.slice()
      for (const closed of layout.blocked[cell] as Int16Array) nextOpen[closed] = 0
      const nextFilled = filled.slice()
      for (const filledUnit of layout.unitsOfCell[cell] ?? []) nextFilled[filledUnit] = 1
      search(nextOpen, nextFilled, [...queens, cell])
      if (found.length >= limit) return
    }
  }

  search(new Uint8Array(size * size).fill(1), new Uint8Array(layout.units.length), [])
  return found
}
