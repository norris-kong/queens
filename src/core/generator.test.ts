import { describe, expect, it } from 'vitest'
import { inspectDraft } from './draft.ts'
import { generatePuzzle } from './generator.ts'
import { seededRandom } from './random.ts'
import type { Puzzle } from './types.ts'

const SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12]
/** Generation time varies with luck, and coverage instrumentation slows it several times over. */
const GENERATION_TIMEOUT_MS = 60_000

/** One Puzzle per Size, generated once and shared by the tests below. */
const generated = new Map<number, Puzzle | null>()
function puzzleOfSize(size: number): Puzzle | null {
  if (!generated.has(size)) generated.set(size, generatePuzzle(size, seededRandom(size)))
  return generated.get(size) ?? null
}

describe('generatePuzzle', () => {
  it.each(SIZES)(
    'makes a valid Puzzle of Size %i',
    (size) => {
      const puzzle = puzzleOfSize(size)

      expect(puzzle?.size).toBe(size)
      expect(puzzle && inspectDraft(puzzle.regions).valid).toBe(true)
    },
    GENERATION_TIMEOUT_MS,
  )

  it.each(SIZES)('keeps every Region of a Size %i Puzzle within twice the average Region size', (size) => {
    const regions = puzzleOfSize(size)?.regions.flat() ?? []
    const regionSizes = Array.from({ length: size }, (_, region) => regions.filter((r) => r === region).length)

    // N Regions share N×N Cells, so the average Region holds N Cells.
    expect(Math.max(...regionSizes)).toBeLessThanOrEqual(2 * size)
  })

  it('makes the same Puzzle from the same seed, and a different one from another seed', () => {
    const first = generatePuzzle(8, seededRandom(42))

    expect(generatePuzzle(8, seededRandom(42))).toEqual(first)
    expect(generatePuzzle(8, seededRandom(43))?.id).not.toBe(first?.id)
  })

  it('letters Regions in reading order, so the top-left Region is A', () => {
    const firstSeen = [...new Set(puzzleOfSize(9)?.regions.flat())]

    expect(firstSeen).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })
})
