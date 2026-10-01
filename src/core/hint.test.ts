import { describe, expect, it } from 'vitest'
import { type CellState, emptyBoard, withCells } from './board.ts'
import { getHint } from './hint.ts'
import { FOUR_BY_FOUR } from './testing.ts'
import type { Coord } from './types.ts'

// FOUR_BY_FOUR's Solution: (0,1) (1,3) (2,0) (3,2).
const at = (row: number, col: number): Coord => ({ row, col })
const boardWith = (...cells: [Coord, CellState][]) =>
  withCells(emptyBoard(4), cells.map(([coord, state]) => ({ coord, state })))

describe('getHint', () => {
  it('points at a misplaced Queen before anything else', () => {
    const board = boardWith([at(0, 1), 'mark'], [at(1, 1), 'queen'])

    expect(getHint(FOUR_BY_FOUR, board)).toEqual({ kind: 'misplacedQueen', cell: at(1, 1) })
  })

  it('points at a Mark covering the Solution when no Queen is misplaced', () => {
    const board = boardWith([at(0, 1), 'queen'], [at(2, 0), 'mark'], [at(3, 3), 'mark'])

    expect(getHint(FOUR_BY_FOUR, board)).toEqual({ kind: 'misplacedMark', cell: at(2, 0) })
  })

  it('points at the next Cell where a Queen belongs when there is no Mistake', () => {
    const board = boardWith([at(0, 1), 'queen'], [at(0, 0), 'mark'])

    expect(getHint(FOUR_BY_FOUR, board)).toEqual({ kind: 'placeQueen', cell: at(1, 3) })
  })

  it('has nothing to say once the Board is Solved', () => {
    const board = boardWith([at(0, 1), 'queen'], [at(1, 3), 'queen'], [at(2, 0), 'queen'], [at(3, 2), 'queen'])

    expect(getHint(FOUR_BY_FOUR, board)).toBeNull()
  })
})
