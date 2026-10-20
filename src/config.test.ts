import { describe, expect, it } from 'vitest'
import { LINKEDIN_REGION_COLORS, REGION_COLORS } from './config.ts'
import { MAX_SIZE } from './core/rules.ts'

describe('config', () => {
  it.each([
    ["the game's own", REGION_COLORS],
    ['LinkedIn', LINKEDIN_REGION_COLORS],
  ])('has a distinct %s colour for every Region of the largest Size', (_, colors) => {
    expect(new Set(colors).size).toBeGreaterThanOrEqual(MAX_SIZE)
  })
})
