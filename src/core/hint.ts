import type { Board, CellState } from './board'
import type { Coord, Puzzle } from './types'

export type HintKind = 'wrongQueen' | 'wrongMark' | 'placeQueen'

/** A Hint marks one Cell; it never changes the Board. */
export interface Hint {
  readonly kind: HintKind
  readonly cell: Coord
}

function cellsIn(board: Board): { readonly coord: Coord; readonly state: CellState }[] {
  return board.flatMap((cells, row) => cells.map((state, col) => ({ coord: { row, col }, state })))
}

/**
 * Picks the most useful Hint: a misplaced Queen first (it usually causes wrong Marks), then a Mark
 * covering the Solution, then the next Cell where a Queen belongs. Null when nothing is left to place.
 */
export function getHint(puzzle: Puzzle, board: Board): Hint | null {
  const inSolution = (coord: Coord) => puzzle.solution[coord.row] === coord.col
  const cells = cellsIn(board)

  const wrongQueen = cells.find((cell) => cell.state === 'queen' && !inSolution(cell.coord))
  if (wrongQueen) return { kind: 'wrongQueen', cell: wrongQueen.coord }

  const wrongMark = cells.find((cell) => cell.state === 'mark' && inSolution(cell.coord))
  if (wrongMark) return { kind: 'wrongMark', cell: wrongMark.coord }

  const missingQueen = cells.find((cell) => cell.state !== 'queen' && inSolution(cell.coord))
  return missingQueen ? { kind: 'placeQueen', cell: missingQueen.coord } : null
}
