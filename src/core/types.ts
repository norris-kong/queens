/** Zero-based position of a Cell on the Board. */
export interface Coord {
  readonly row: number
  readonly col: number
}

/** Zero-based Region index; shown to people as the letters A–L. */
export type RegionId = number

/** The Region of every Cell, row by row. `null` is an unassigned Cell, which only a Draft may have. */
export type DraftGrid = readonly (readonly (RegionId | null)[])[]

/** The Region of every Cell, row by row, with every Cell assigned. */
export type RegionGrid = readonly (readonly RegionId[])[]

/** A Solution as the Queen's column in each row: `solution[row] === col`. */
export type Solution = readonly number[]

export interface Puzzle {
  readonly id: string
  readonly size: number
  readonly regions: RegionGrid
  readonly solution: Solution
}
