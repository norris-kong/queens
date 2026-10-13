import { describe, expect, it } from 'vitest'
import { FOUR_BY_FOUR, LINKEDIN_336 } from '../src/core/testing.ts'
import { boardFilesIn, planImport, readBoards, toPuzzleFile } from './linkedInArchive.ts'

const FOUR_TEXT = 'CABB\nCCBB\nCCDD\nDDDD\n'

describe('boardFilesIn', () => {
  it('finds each board file a page names, once', () => {
    const html =
      '<ol data-file="/linkedin-queens/boards/2026-10.7c14a5a3.json"></ol>' +
      '<ol data-file="/linkedin-queens/boards/2026-10.7c14a5a3.json"></ol>' +
      '<ol data-file="/linkedin-queens/boards/2025.9bd49880.json"></ol>'

    expect(boardFilesIn(html)).toEqual(['/linkedin-queens/boards/2026-10.7c14a5a3.json', '/linkedin-queens/boards/2025.9bd49880.json'])
  })
})

describe('readBoards', () => {
  it('reads each puzzle as a grid of Region ids, one digit per Cell', () => {
    const json = { puzzles: { '896': { board: { regions: '2011221122333333' }, grid: { rows: 4, cols: 4 }, date: '2026-10-13' } } }

    expect(readBoards(json)).toEqual({
      ok: true,
      puzzles: [{ number: 896, regions: [[2, 0, 1, 1], [2, 2, 1, 1], [2, 2, 3, 3], [3, 3, 3, 3]] }],
    })
  })

  it('reads Region ids past 9 as letters', () => {
    const json = { puzzles: { '1': { board: { regions: 'a9' }, grid: { rows: 1, cols: 2 } } } }

    expect(readBoards(json)).toMatchObject({ ok: true, puzzles: [{ regions: [[10, 9]] }] })
  })

  it('refuses a file that is not shaped as expected', () => {
    expect(readBoards({ boards: [] })).toMatchObject({ ok: false })
    expect(readBoards({ puzzles: { first: { board: { regions: '' }, grid: { rows: 1, cols: 1 } } } })).toMatchObject({ ok: false })
  })
})

describe('toPuzzleFile', () => {
  it('writes a valid puzzle as a Puzzle file, Regions lettered in reading order', () => {
    const result = toPuzzleFile({ number: 5, regions: [[3, 9, 7, 7], [3, 3, 7, 7], [3, 3, 8, 8], [8, 8, 8, 8]] })

    expect(result).toEqual({ ok: true, file: { number: 5, text: 'ABCC\nAACC\nAADD\nDDDD\n' } })
  })

  it("keeps #336, LinkedIn's April Fools' puzzle with split Regions, and no other number with them", () => {
    const regions = LINKEDIN_336.trim()
      .split('\n')
      .map((row) => [...row].map((letter) => letter.charCodeAt(0) - 'A'.charCodeAt(0)))

    expect(toPuzzleFile({ number: 336, regions })).toMatchObject({ ok: true, file: { number: 336 } })
    expect(toPuzzleFile({ number: 337, regions })).toMatchObject({
      ok: false,
      skipped: { number: 337, problems: [{ kind: 'disconnectedRegions' }] },
    })
  })

  it('skips a broken puzzle and says why', () => {
    expect(toPuzzleFile({ number: 7, regions: [[0, 1]] })).toEqual({
      ok: false,
      skipped: { number: 7, problems: [{ kind: 'notSquare' }] },
    })
  })
})

describe('planImport', () => {
  const file = { number: 5, text: FOUR_TEXT }

  it('adds the numbers not stored yet', () => {
    expect(planImport([file], new Map())).toEqual({ add: [file], differing: [] })
  })

  it('leaves alone a number stored with the same layout', () => {
    expect(planImport([file], new Map([[5, FOUR_BY_FOUR.id]]))).toEqual({ add: [], differing: [] })
  })

  it('keeps a number stored with another layout, and reports it', () => {
    expect(planImport([file], new Map([[5, 'something-else']]))).toEqual({ add: [], differing: [5] })
  })
})
