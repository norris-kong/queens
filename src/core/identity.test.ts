import { describe, expect, it } from 'vitest'
import { puzzleId } from './identity'

describe('puzzleId', () => {
  const layout = [
    [2, 0, 1, 1],
    [2, 2, 1, 1],
    [2, 2, 3, 3],
    [3, 3, 3, 3],
  ]

  it('gives the same id to the same Region layout', () => {
    expect(puzzleId(layout)).toBe(puzzleId(layout.map((row) => [...row])))
  })

  it('gives a different id once any Cell moves to another Region', () => {
    const moved = [[2, 0, 1, 1], [2, 2, 2, 1], [2, 2, 3, 3], [3, 3, 3, 3]]

    expect(puzzleId(moved)).not.toBe(puzzleId(layout))
  })

  it('ignores which letter each Region is given, since only the layout matters', () => {
    const relettered = layout.map((row) => row.map((region) => [3, 2, 0, 1][region] as number))

    expect(puzzleId(relettered)).toBe(puzzleId(layout))
  })
})
