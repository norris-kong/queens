import { describe, expect, it } from 'vitest'
import type { DraftGrid } from '../core/types.ts'
import { rimClasses } from './regionRims.ts'

describe('rimClasses', () => {
  it("rims a Cell along the Board's edge", () => {
    const regions: DraftGrid = [
      [0, 0],
      [0, 0],
    ]

    expect(rimClasses(regions, { row: 0, col: 0 })).toEqual(['rim-top', 'rim-left'])
  })

  it('rims a Cell along every side that meets another Region', () => {
    const regions: DraftGrid = [
      [0, 1],
      [0, 0],
    ]

    expect(rimClasses(regions, { row: 0, col: 0 })).toEqual(['rim-top', 'rim-right', 'rim-left'])
  })

  it('leaves a Cell in the middle of its Region unrimmed', () => {
    const regions: DraftGrid = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]

    expect(rimClasses(regions, { row: 1, col: 1 })).toEqual([])
  })

  it('fills in the corner of a Cell that a rim turns around, so the rim has no notch there', () => {
    const regions: DraftGrid = [
      [1, 0],
      [0, 0],
    ]

    expect(rimClasses(regions, { row: 1, col: 1 })).toEqual(['rim-right', 'rim-bottom', 'rim-top-left'])
  })

  it('needs no corner where the rim already runs along the Cell', () => {
    const regions: DraftGrid = [
      [1, 1],
      [0, 0],
    ]

    expect(rimClasses(regions, { row: 1, col: 1 })).toEqual(['rim-top', 'rim-right', 'rim-bottom'])
  })

  it('treats the unassigned Cells of a Draft as one more Region', () => {
    const regions: DraftGrid = [
      [null, 0],
      [null, 0],
    ]

    expect(rimClasses(regions, { row: 0, col: 1 })).toEqual(['rim-top', 'rim-right', 'rim-left'])
  })
})
