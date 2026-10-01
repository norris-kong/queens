import type { Coord } from './types'

export type CellState = 'empty' | 'mark' | 'queen'

/** The player's current state of every Cell, row by row. */
export type Board = readonly (readonly CellState[])[]

export function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<CellState>(size).fill('empty'))
}

export function cellAt(board: Board, coord: Coord): CellState | undefined {
  return board[coord.row]?.[coord.col]
}

/** Returns a new Board with the given Cells changed; the original is left untouched. */
export function withCells(board: Board, changes: readonly { readonly coord: Coord; readonly state: CellState }[]): Board {
  const changed = new Map(changes.map((change) => [`${change.coord.row},${change.coord.col}`, change.state]))
  return board.map((cells, row) => cells.map((state, col) => changed.get(`${row},${col}`) ?? state))
}
