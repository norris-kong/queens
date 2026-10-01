import type { Coord, DraftGrid, RegionId } from '../../core/types.ts'

export function emptyDraft(size: number): DraftGrid {
  return Array.from({ length: size }, () => Array<RegionId | null>(size).fill(null))
}

/** Returns a new Draft with the given Cells assigned to `region` (null erases them). */
export function paint(draft: DraftGrid, cells: readonly Coord[], region: RegionId | null): DraftGrid {
  const painted = new Set(cells.map((cell) => `${cell.row},${cell.col}`))
  return draft.map((row, r) => row.map((current, c) => (painted.has(`${r},${c}`) ? region : current)))
}

export function hasAssignedCells(draft: DraftGrid): boolean {
  return draft.some((row) => row.some((region) => region !== null))
}
