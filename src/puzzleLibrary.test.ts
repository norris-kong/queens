import { describe, expect, it } from 'vitest'
import { library } from './puzzleLibrary.ts'

describe('the bundled Puzzle library', () => {
  it('holds only valid, distinct Puzzles filed under their own Size', () => {
    expect(library.problems).toEqual([])
  })

  it('offers at least one Puzzle to play', () => {
    expect(library.sizes.flatMap((group) => group.puzzles).length).toBeGreaterThan(0)
  })
})
