import { describe, expect, it } from 'vitest'
import { library, misplacedFiles } from './puzzleLibrary.ts'

describe('the bundled Puzzle library', () => {
  it('holds only valid, distinct Puzzles filed under their own Size', () => {
    expect(library.problems).toEqual([])
  })

  it('has no Puzzle files outside the two-digit Size folders', () => {
    expect(misplacedFiles).toEqual([])
  })

  it('offers at least one Puzzle to play', () => {
    expect(library.sizes.flatMap((group) => group.puzzles).length).toBeGreaterThan(0)
  })
})
