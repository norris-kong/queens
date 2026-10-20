import { describe, expect, it } from 'vitest'
import { LINKEDIN_REGION_COLORS, REGION_COLORS } from '../config.ts'
import { boardStyle, collectionLook } from './look.ts'

describe('look', () => {
  it("draws the game's own Puzzles in its own colours, with rounded Region corners and Cell lines only inside Regions", () => {
    const style = boardStyle('level')

    expect(style.regionColors).toBe(REGION_COLORS)
    expect(style.cornerRadius).toBeGreaterThan(0)
    expect(style.cornerRadius).toBeLessThanOrEqual(0.5)
    expect(style.cellLines).toBe('withinRegions')
  })

  it('draws LinkedIn Puzzles as LinkedIn does: its colours, square corners and a line between every pair of Cells', () => {
    expect(boardStyle('linkedIn')).toEqual({ regionColors: LINKEDIN_REGION_COLORS, cornerRadius: 0, cellLines: 'all' })
  })

  it('gives each collection its look', () => {
    expect(collectionLook('own')).toBe('level')
    expect(collectionLook('linkedIn')).toBe('linkedIn')
  })
})
