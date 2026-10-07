import { describe, expect, it } from 'vitest'
import { isValidPuzzleName, nextPuzzleName, samePuzzleName } from './puzzleName.ts'

describe('isValidPuzzleName', () => {
  it.each(['Beginner 1', 'Lucky 7', 'difficulty-hard', 'sample_2', 'x'.repeat(40)])('accepts %j', (name) => {
    expect(isValidPuzzleName(name)).toBe(true)
  })

  it.each(['', ' Beginner 1', 'Beginner 1 ', 'Beginner  1', '../escape', 'a.b', 'x'.repeat(41)])(
    'refuses %j',
    (name) => {
      expect(isValidPuzzleName(name)).toBe(false)
    },
  )
})

describe('samePuzzleName', () => {
  it('ignores case, since Puzzle Names are file names', () => {
    expect(samePuzzleName('Beginner 1', 'beginner 1')).toBe(true)
    expect(samePuzzleName('Beginner 1', 'Beginner 2')).toBe(false)
  })
})

describe('nextPuzzleName', () => {
  it('starts a Size at its Level and 1', () => {
    expect(nextPuzzleName(4, [])).toBe('Beginner 1')
  })

  it('follows the highest number its Level already uses, so a new Puzzle lands last', () => {
    expect(nextPuzzleName(4, ['Beginner 1', 'Beginner 3', 'lucky-7'])).toBe('Beginner 4')
  })

  it('counts numbered names whatever their case', () => {
    expect(nextPuzzleName(5, ['easy 2'])).toBe('Easy 3')
  })

  it('ignores names that only look numbered', () => {
    expect(nextPuzzleName(4, ['Easy 9', 'Beginner 2b', 'Beginner-5'])).toBe('Beginner 1')
  })
})
