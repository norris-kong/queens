import type { Board, CellState } from './board.ts'
import type { Coord, Puzzle } from './types.ts'

export type HintKind = 'misplacedQueen' | 'misplacedMark' | 'placeQueen'

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

  const misplacedQueen = cells.find((cell) => cell.state === 'queen' && !inSolution(cell.coord))
  if (misplacedQueen) return { kind: 'misplacedQueen', cell: misplacedQueen.coord }

  const misplacedMark = cells.find((cell) => cell.state === 'mark' && inSolution(cell.coord))
  if (misplacedMark) return { kind: 'misplacedMark', cell: misplacedMark.coord }

  const missingQueen = cells.find((cell) => cell.state !== 'queen' && inSolution(cell.coord))
  return missingQueen ? { kind: 'placeQueen', cell: missingQueen.coord } : null
}
