import { describe, expect, it } from 'vitest'
import { readLinkedInArchive } from './linkedInArchive.ts'

const VALID = [
  [2, 0, 1, 1],
  [2, 2, 1, 1],
  [2, 2, 3, 3],
  [3, 3, 3, 3],
]

describe('readLinkedInArchive', () => {
  it('writes each valid archive entry as a Puzzle file named by its LinkedIn number', () => {
    const reading = readLinkedInArchive([{ id: 353, date: '2025/04/18', grid: [], regions: VALID }])

    expect(reading).toEqual({ ok: true, files: [{ number: 353, text: 'CABB\nCCBB\nCCDD\nDDDD\n' }], skipped: [] })
  })

  it('skips broken entries and says why', () => {
    const missingRegion = [
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [2, 2, 2, 2],
      [2, 2, 2, 2],
    ]
    const reading = readLinkedInArchive([
      { id: 77, regions: missingRegion },
      { id: 78, regions: [[0, 1]] },
    ])

    expect(reading).toMatchObject({
      ok: true,
      files: [],
      skipped: [
        { number: 77, problems: [{ kind: 'missingRegions', regions: [3] }] },
        { number: 78, problems: [{ kind: 'notSquare' }] },
      ],
    })
  })

  it('refuses an archive that is not shaped as expected', () => {
    expect(readLinkedInArchive({ puzzles: [] })).toMatchObject({ ok: false })
    expect(readLinkedInArchive([{ id: 'one', regions: VALID }])).toMatchObject({ ok: false })
  })
})
