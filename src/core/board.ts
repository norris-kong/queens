import { filledGrid, replaceCells } from './grid.ts'
import type { Coord } from './types.ts'

export type CellState = 'empty' | 'mark' | 'queen'

/** The player's current state of every Cell, row by row. */
export type Board = readonly (readonly CellState[])[]

export function emptyBoard(size: number): Board {
  return filledGrid<CellState>(size, 'empty')
}

/** True while no Cell holds a Queen or a Mark. */
export function isBoardEmpty(board: Board): boolean {
  return board.every((row) => row.every((state) => state === 'empty'))
}

export function cellAt(board: Board, coord: Coord): CellState | undefined {
  return board[coord.row]?.[coord.col]
}

/** Returns a new Board with the given Cells changed; the original is left untouched. */
export function withCells(board: Board, changes: readonly { readonly coord: Coord; readonly state: CellState }[]): Board {
  return replaceCells(board, changes.map(({ coord, state }) => ({ coord, value: state })))
}
