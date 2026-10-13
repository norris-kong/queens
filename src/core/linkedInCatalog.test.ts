import { describe, expect, it } from 'vitest'
import { buildLinkedInCatalog, isLinkedInNumber, nextLinkedIn, nextLinkedInNumber, parseLinkedInNumber } from './linkedInCatalog.ts'
import { FOUR_BY_FOUR } from './testing.ts'

const FOUR = 'CABB\nCCBB\nCCDD\nDDDD\n'
const OTHER_FOUR = 'AAAB\nCCBB\nCCCB\nCCDD\n'
const FIVE = 'AAAAA\nAAAAB\nCCDEE\nCCDEE\nCCCEE\n'

describe('buildLinkedInCatalog', () => {
  it("orders LinkedIn Puzzles by LinkedIn's number, not by file name", () => {
    const catalog = buildLinkedInCatalog(
      [
        { name: '100', text: FOUR },
        { name: '9', text: FIVE },
        { name: '20', text: OTHER_FOUR },
      ],
      new Set(),
    )

    expect(catalog.puzzles.map((entry) => entry.number)).toEqual([9, 20, 100])
    expect(catalog.problems).toEqual([])
  })

  it('reports files that are not numbered or not valid Puzzles, and leaves them out', () => {
    const catalog = buildLinkedInCatalog(
      [
        { name: 'volcano', text: FOUR },
        { name: '07', text: OTHER_FOUR },
        { name: '1', text: 'AB\nBAA\n' },
        { name: '2', text: 'AAAA\nBBBB\nCCCC\nDDDD\n' },
      ],
      new Set(),
    )

    expect(catalog.puzzles).toEqual([])
    expect(catalog.problems).toEqual([
      { kind: 'invalidName', name: 'volcano' },
      { kind: 'invalidName', name: '07' },
      { kind: 'unreadable', name: '1' },
      { kind: 'notAPuzzle', name: '2' },
    ])
  })

  it("leaves out a layout already among the author's Puzzles or an earlier LinkedIn Puzzle", () => {
    const catalog = buildLinkedInCatalog(
      [
        { name: '5', text: FOUR },
        { name: '6', text: OTHER_FOUR },
        { name: '7', text: OTHER_FOUR },
      ],
      new Set([FOUR_BY_FOUR.id]),
    )

    expect(catalog.puzzles.map((entry) => entry.number)).toEqual([6])
    expect(catalog.problems).toEqual([
      { kind: 'duplicate', name: '5' },
      { kind: 'duplicate', name: '7' },
    ])
  })
})

describe('nextLinkedIn', () => {
  const catalog = buildLinkedInCatalog(
    [
      { name: '3', text: FOUR },
      { name: '8', text: OTHER_FOUR },
    ],
    new Set(),
  )

  it('skips the numbers missing from the archive', () => {
    expect(nextLinkedIn(catalog, 3)?.number).toBe(8)
  })

  it('has nothing after the last', () => {
    expect(nextLinkedIn(catalog, 8)).toBeNull()
  })
})

describe('isLinkedInNumber', () => {
  it.each([1, 523, 9000])('accepts %i', (number) => {
    expect(isLinkedInNumber(number)).toBe(true)
  })

  it.each([0, -3, 1.5, Number.NaN])('refuses %d', (number) => {
    expect(isLinkedInNumber(number)).toBe(false)
  })
})

describe('parseLinkedInNumber', () => {
  it.each([
    ['523', 523],
    [' 523 ', 523],
    ['0', null],
    ['007', null],
    ['52a', null],
    ['', null],
  ])('reads %j as %j', (text, number) => {
    expect(parseLinkedInNumber(text)).toBe(number)
  })
})

describe('nextLinkedInNumber', () => {
  it('follows the highest number stored', () => {
    const catalog = buildLinkedInCatalog(
      [
        { name: '3', text: FOUR },
        { name: '8', text: OTHER_FOUR },
      ],
      new Set(),
    )

    expect(nextLinkedInNumber(catalog)).toBe(9)
  })

  it('starts at 1 with none stored', () => {
    expect(nextLinkedInNumber(buildLinkedInCatalog([], new Set()))).toBe(1)
  })
})
