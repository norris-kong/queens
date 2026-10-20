import { describe, expect, it } from 'vitest'
import { LINKEDIN_REGION_COLORS, REGION_COLORS } from '../config.ts'
import { boardStyle, collectionLook } from './look.ts'

describe('look', () => {
  it("draws the game's own Puzzles in its own colours, each Cell a raised tile", () => {
    const style = boardStyle('level')

    expect(style.regionTones.map((tones) => tones.base)).toEqual(REGION_COLORS)
    expect(style.tiles).toBe(true)
  })

  it('draws LinkedIn Puzzles as LinkedIn does: its colours, on flat Cells', () => {
    const style = boardStyle('linkedIn')

    expect(style.regionTones.map((tones) => tones.base)).toEqual(LINKEDIN_REGION_COLORS)
    expect(style.tiles).toBe(false)
  })

  it('gives each collection its look', () => {
    expect(collectionLook('own')).toBe('level')
    expect(collectionLook('linkedIn')).toBe('linkedIn')
  })
})
