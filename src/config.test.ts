import { describe, expect, it } from 'vitest'
import { REGION_COLORS } from './config.ts'
import { MAX_SIZE } from './core/rules.ts'

describe('config', () => {
  it('has a distinct colour for every Region of the largest Size', () => {
    expect(new Set(REGION_COLORS).size).toBeGreaterThanOrEqual(MAX_SIZE)
  })
})
