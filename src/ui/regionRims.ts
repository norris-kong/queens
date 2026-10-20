import type { Coord, DraftGrid } from '../core/types.ts'

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const

/**
 * Where a Cell carries its Region's rim, as class names: `rim-<side>` for each side along the edge of
 * its Region (the Board's own edge included), and `rim-<corner>` for a corner the rim turns around
 * without running along either of the Cell's sides there, which the Cell fills in so the rim has no
 * notch. A Draft's unassigned Cells count as one more Region.
 */
export function rimClasses(regions: DraftGrid, { row, col }: Coord): readonly string[] {
  const region = regions[row]?.[col]
  const differs = (rowStep: number, colStep: number) => regions[row + rowStep]?.[col + colStep] !== region
  const sides = [differs(-1, 0), differs(0, 1), differs(1, 0), differs(0, -1)] as const
  const [top, right, bottom, left] = sides
  const corners = [
    !top && !left && differs(-1, -1),
    !top && !right && differs(-1, 1),
    !bottom && !right && differs(1, 1),
    !bottom && !left && differs(1, -1),
  ]
  return [
    ...SIDES.filter((_, index) => sides[index]).map((side) => `rim-${side}`),
    ...CORNERS.filter((_, index) => corners[index]).map((corner) => `rim-${corner}`),
  ]
}
