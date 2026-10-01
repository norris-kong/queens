import { describe, expect, it } from 'vitest'
import { formatPuzzle, parsePuzzle } from './puzzleFormat'

describe('parsePuzzle', () => {
  it('reads each letter as the Region of its Cell', () => {
    const result = parsePuzzle('AABB\nAABB\nCCDD\nCCDD\n')

    expect(result).toEqual({
      ok: true,
      grid: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [2, 2, 3, 3],
        [2, 2, 3, 3],
      ],
    })
  })

  it('reads "." as an unassigned Cell', () => {
    const result = parsePuzzle('A.\n.B')

    expect(result).toEqual({ ok: true, grid: [[0, null], [null, 1]] })
  })

  it('accepts Windows line endings and surrounding blank lines', () => {
    const result = parsePuzzle('\r\nAB\r\nBA\r\n\r\n')

    expect(result).toEqual({ ok: true, grid: [[0, 1], [1, 0]] })
  })

  it('rejects empty text', () => {
    expect(parsePuzzle(' \n ')).toEqual({ ok: false, error: { kind: 'empty' } })
  })

  it('rejects a grid whose rows are not all as long as the grid is tall', () => {
    expect(parsePuzzle('AB\nBAA')).toEqual({ ok: false, error: { kind: 'notSquare' } })
  })

  it('rejects a letter past the Size, naming where it is', () => {
    const result = parsePuzzle('AB\nBC')

    expect(result).toEqual({
      ok: false,
      error: { kind: 'invalidCharacter', row: 1, col: 1, char: 'C' },
    })
  })

  it('rejects lowercase letters', () => {
    const result = parsePuzzle('Ab\nBA')

    expect(result).toEqual({
      ok: false,
      error: { kind: 'invalidCharacter', row: 0, col: 1, char: 'b' },
    })
  })
})

describe('formatPuzzle', () => {
  it('writes one letter per Cell and "." for unassigned Cells, ending with a newline', () => {
    const text = formatPuzzle([
      [0, 1, null],
      [2, 2, 1],
      [0, null, 2],
    ])

    expect(text).toBe('AB.\nCCB\nA.C\n')
  })

  it('writes text that reads back as the same grid', () => {
    const grid = [
      [0, 0, 1, 1],
      [0, 2, 2, 1],
      [3, 2, 2, 1],
      [3, 3, 3, 1],
    ]

    expect(parsePuzzle(formatPuzzle(grid))).toEqual({ ok: true, grid })
  })
})
