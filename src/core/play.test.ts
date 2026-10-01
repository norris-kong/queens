import { describe, expect, it } from 'vitest'
import { canUndo, drag, reset, startPlay, tap, undo } from './play'
import { FOUR_BY_FOUR } from './testing'

const at = (row: number, col: number) => ({ row, col })

describe('tap', () => {
  it('cycles a Cell from empty to Mark to Queen and back to empty', () => {
    const once = tap(startPlay(FOUR_BY_FOUR), at(0, 0))
    const twice = tap(once, at(0, 0))
    const thrice = tap(twice, at(0, 0))

    expect([once, twice, thrice].map((play) => play.board[0]?.[0])).toEqual(['mark', 'queen', 'empty'])
  })
})

describe('drag', () => {
  // Row 0 before each drag: Mark, empty, Queen, empty.
  const row0 = tap(tap(tap(startPlay(FOUR_BY_FOUR), at(0, 0)), at(0, 2)), at(0, 2))
  const wholeRow0 = [at(0, 1), at(0, 0), at(0, 2), at(0, 3)]

  it('starting on an empty Cell, Marks every empty Cell it passes and leaves Queens alone', () => {
    const play = drag(row0, [at(0, 1), at(0, 2), at(0, 3)])

    expect(play.board[0]).toEqual(['mark', 'mark', 'queen', 'mark'])
  })

  it('starting on a Mark, erases every Mark it passes and leaves Queens alone', () => {
    const marked = drag(row0, [at(0, 1), at(0, 3)])
    const play = drag(marked, [at(0, 0), ...wholeRow0])

    expect(play.board[0]).toEqual(['empty', 'empty', 'queen', 'empty'])
  })

  it('starting on a Queen, changes nothing', () => {
    const play = drag(row0, [at(0, 2), at(0, 3), at(1, 3)])

    expect(play).toBe(row0)
  })
})

describe('undo and reset', () => {
  it('undoes a whole drag stroke as one Move', () => {
    const before = tap(startPlay(FOUR_BY_FOUR), at(3, 3))
    const dragged = drag(before, [at(0, 0), at(0, 1), at(0, 2), at(0, 3)])

    expect(undo(dragged).board).toEqual(before.board)
  })

  it('clears every Queen and Mark on reset, and undo brings them back', () => {
    const played = tap(tap(tap(startPlay(FOUR_BY_FOUR), at(0, 1)), at(0, 1)), at(2, 2))
    const cleared = reset(played)

    expect(cleared.board.flat().every((state) => state === 'empty')).toBe(true)
    expect(undo(cleared).board).toEqual(played.board)
  })

  it('does not count a reset of an empty Board as a Move', () => {
    expect(canUndo(reset(startPlay(FOUR_BY_FOUR)))).toBe(false)
  })

  it('leaves a Play with nothing to undo unchanged', () => {
    const play = startPlay(FOUR_BY_FOUR)

    expect(undo(play)).toBe(play)
  })
})
