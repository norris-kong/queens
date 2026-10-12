import { describe, expect, it } from 'vitest'
import { library, linkedInLibrary, misplacedFiles } from './puzzleLibrary.ts'

describe('the bundled Puzzle library', () => {
  it('holds only valid, distinct Puzzles filed under their own Size', () => {
    expect(library.problems).toEqual([])
  })

  it("holds only valid LinkedIn Puzzles, none repeating the author's own", () => {
    expect(linkedInLibrary.problems).toEqual([])
    expect(linkedInLibrary.puzzles.length).toBeGreaterThan(0)
  })

  it('has no Puzzle files outside the two-digit Size folders and the LinkedIn folder', () => {
    expect(misplacedFiles).toEqual([])
  })

  it('offers at least one Puzzle to play', () => {
    expect(library.sizes.flatMap((group) => group.puzzles).length).toBeGreaterThan(0)
  })
})
