import { describe, expect, it } from 'vitest'
import { seedFromText } from './random.ts'

describe('seedFromText', () => {
  it('turns the same text into the same 32-bit seed', () => {
    expect(seedFromText('daily:2026-10-12')).toBe(seedFromText('daily:2026-10-12'))
    expect(Number.isInteger(seedFromText('daily:2026-10-12'))).toBe(true)
    expect(seedFromText('daily:2026-10-12')).toBeGreaterThanOrEqual(0)
    expect(seedFromText('daily:2026-10-12')).toBeLessThan(2 ** 32)
  })

  it('turns neighbouring texts into unrelated seeds', () => {
    expect(seedFromText('daily:2026-10-12')).not.toBe(seedFromText('daily:2026-10-13'))
  })
})
