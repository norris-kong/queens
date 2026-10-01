import { describe, expect, it } from 'vitest'
import { buildCatalog } from './catalog'

const FOUR = 'CABB\nCCBB\nCCDD\nDDDD\n'
const FOUR_MIRRORED = 'BBAC\nBBCC\nDDCC\nDDDD\n'
const FIVE = 'AAAAA\nAAAAB\nCCDEE\nCCDEE\nCCCEE\n'

describe('buildCatalog', () => {
  it('groups Puzzles by Size and numbers them in natural Puzzle Name order', () => {
    const catalog = buildCatalog([
      { size: 4, name: '10-late', text: FOUR },
      { size: 5, name: 'only', text: FIVE },
      { size: 4, name: '2-early', text: FOUR_MIRRORED },
    ])

    const summary = catalog.sizes.map((group) => ({
      size: group.size,
      puzzles: group.puzzles.map((entry) => `#${entry.number} ${entry.name}`),
    }))
    expect(summary).toEqual([
      { size: 4, puzzles: ['#1 2-early', '#2 10-late'] },
      { size: 5, puzzles: ['#1 only'] },
    ])
    expect(catalog.problems).toEqual([])
  })

  it('leaves out a repeated layout, even re-lettered, and names the Puzzle it repeats', () => {
    const relettered = FOUR.replaceAll('A', 'x').replaceAll('D', 'A').replaceAll('x', 'D')
    const catalog = buildCatalog([
      { size: 4, name: 'first', text: FOUR },
      { size: 4, name: 'second', text: relettered },
    ])

    expect(catalog.sizes[0]?.puzzles.map((entry) => entry.name)).toEqual(['first'])
    expect(catalog.problems).toEqual([
      { kind: 'duplicate', file: { size: 4, name: 'second' }, sameAs: { size: 4, name: 'first' } },
    ])
  })

  it('reports files that are not valid Puzzles and leaves them out', () => {
    const catalog = buildCatalog([
      { size: 4, name: 'two-answers', text: 'AAAA\nBBBB\nCCCC\nDDDD\n' },
      { size: 4, name: 'garbled', text: 'AB\nBAA\n' },
      { size: 5, name: 'misfiled', text: FOUR },
      { size: 4, name: 'Bad Name', text: FOUR },
    ])

    expect(catalog.sizes).toEqual([])
    expect(catalog.problems.map((problem) => [problem.kind, problem.file.name])).toEqual([
      ['invalidName', 'Bad Name'],
      ['unreadable', 'garbled'],
      ['notAPuzzle', 'two-answers'],
      ['wrongSizeFolder', 'misfiled'],
    ])
  })
})
