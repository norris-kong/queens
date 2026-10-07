import { describe, expect, it } from 'vitest'
import { levelName } from './level.ts'
import { MAX_SIZE, MIN_SIZE } from './rules.ts'

describe('levelName', () => {
  it('names every Size from Beginner up to Master', () => {
    const sizes = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, index) => MIN_SIZE + index)

    expect(sizes.map(levelName)).toEqual([
      'Beginner',
      'Easy',
      'Relaxed',
      'Normal',
      'Intermediate',
      'Challenging',
      'Hard',
      'Expert',
      'Master',
    ])
  })
})
