import { describe, expect, it } from 'vitest'
import { findConflicts, isSolved } from './conflicts'
import { type Board, emptyBoard, withCells } from './board'
import { FOUR_BY_FOUR } from './testing'
import type { Coord } from './types'

//   C A B B
//   C C B B
//   C C D D
//   D D D D
const at = (row: number, col: number): Coord => ({ row, col })
const queensAt = (...cells: Coord[]): Board =>
  withCells(emptyBoard(4), cells.map((coord) => ({ coord, state: 'queen' as const })))

describe('findConflicts', () => {
  it('finds none on a Board without Queens', () => {
    expect(findConflicts(FOUR_BY_FOUR, emptyBoard(4))).toEqual([])
  })

  it('stripes the whole Region when two Queens share it', () => {
    const conflicts = findConflicts(FOUR_BY_FOUR, queensAt(at(2, 2), at(3, 0)))

    expect(conflicts).toEqual([
      {
        kind: 'region',
        queens: [at(2, 2), at(3, 0)],
        area: [at(2, 2), at(2, 3), at(3, 0), at(3, 1), at(3, 2), at(3, 3)],
      },
    ])
  })

  it('stripes the whole row when two Queens share it', () => {
    const conflicts = findConflicts(FOUR_BY_FOUR, queensAt(at(0, 0), at(0, 2)))

    expect(conflicts).toEqual([
      { kind: 'row', queens: [at(0, 0), at(0, 2)], area: [at(0, 0), at(0, 1), at(0, 2), at(0, 3)] },
    ])
  })

  it('stripes the whole column when two Queens share it', () => {
    const conflicts = findConflicts(FOUR_BY_FOUR, queensAt(at(0, 3), at(2, 3)))

    expect(conflicts).toEqual([
      { kind: 'column', queens: [at(0, 3), at(2, 3)], area: [at(0, 3), at(1, 3), at(2, 3), at(3, 3)] },
    ])
  })

  it('stripes only the two Cells when Queens touch diagonally', () => {
    const conflicts = findConflicts(FOUR_BY_FOUR, queensAt(at(1, 1), at(2, 2)))

    expect(conflicts).toEqual([{ kind: 'adjacent', queens: [at(1, 1), at(2, 2)], area: [at(1, 1), at(2, 2)] }])
  })

  it('reports both the row and the touching when Queens sit side by side', () => {
    const kinds = findConflicts(FOUR_BY_FOUR, queensAt(at(1, 0), at(1, 1))).map((conflict) => conflict.kind)

    expect(kinds).toEqual(['row', 'region', 'adjacent'])
  })
})

describe('isSolved', () => {
  // The Solution of FOUR_BY_FOUR, columns 1-3-0-2.
  const solution = [at(0, 1), at(1, 3), at(2, 0), at(3, 2)]

  it('is true once all N Queens stand without Conflict, whatever the Marks', () => {
    const board = withCells(queensAt(...solution), [{ coord: at(0, 0), state: 'mark' }])

    expect(isSolved(FOUR_BY_FOUR, board)).toBe(true)
  })

  it('is false with fewer than N Queens', () => {
    expect(isSolved(FOUR_BY_FOUR, queensAt(...solution.slice(0, 3)))).toBe(false)
  })

  it('is false when N Queens are placed but some are in Conflict', () => {
    expect(isSolved(FOUR_BY_FOUR, queensAt(at(0, 1), at(1, 3), at(2, 0), at(3, 1)))).toBe(false)
  })
})
