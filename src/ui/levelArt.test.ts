import { describe, expect, it } from 'vitest'
import { MAX_SIZE, MIN_SIZE } from '../core/rules.ts'
import { levelArt } from './levelArt.ts'

const SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, index) => MIN_SIZE + index)

describe('levelArt', () => {
  it.each(SIZES)('has a button, a numbering badge, a Queen and its own colours for Size %i', (size) => {
    const art = levelArt(size)

    expect(art.button).toMatch(/-button/)
    expect(art.stage).toMatch(/-stage/)
    expect(art.logo).toMatch(/-logo/)
    expect(art.ink.fill).not.toBe('#ffffff')
  })

  it("lends a Size outside 4–12 the nearest Level's art", () => {
    expect(levelArt(3).name).toBe('Beginner')
    expect(levelArt(13).name).toBe('Master')
  })
})
