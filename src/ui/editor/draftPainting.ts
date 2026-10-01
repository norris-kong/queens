import { filledGrid, replaceCells } from '../../core/grid.ts'
import type { Coord, DraftGrid, RegionId } from '../../core/types.ts'

export function emptyDraft(size: number): DraftGrid {
  return filledGrid<RegionId | null>(size, null)
}

/** Returns a new Draft with the given Cells assigned to `region` (null erases them). */
export function paint(draft: DraftGrid, cells: readonly Coord[], region: RegionId | null): DraftGrid {
  return replaceCells(draft, cells.map((coord) => ({ coord, value: region })))
}

export function hasAssignedCells(draft: DraftGrid): boolean {
  return draft.some((row) => row.some((region) => region !== null))
}
