import { describe, expect, it } from 'vitest'
import type { DraftGrid } from '../core/types.ts'
import { boardShapes } from './boardShapes.ts'

const SQUARE = { cornerRadius: 0, cellLines: 'all' } as const
const ROUND = { cornerRadius: 0.3, cellLines: 'withinRegions' } as const

const areaOf = (regions: DraftGrid, region: number | null, style: Parameters<typeof boardShapes>[1]) =>
  boardShapes(regions, style).areas.find((area) => area.region === region)?.path

const count = (path: string | undefined, command: string) => (path ?? '').split(command).length - 1

describe('boardShapes', () => {
  describe('with square corners', () => {
    const halves: DraftGrid = [
      [0, 1],
      [0, 1],
    ]

    it('draws a line on every edge between two Regions', () => {
      expect(boardShapes(halves, SQUARE).regionLines).toBe('M1 0V1M1 1V2')
    })

    it('outlines each Region as one closed path', () => {
      expect(areaOf(halves, 0, SQUARE)).toBe('M1 0L1 2L0 2L0 0L1 0Z')
      expect(areaOf(halves, 1, SQUARE)).toBe('M2 0L2 2L1 2L1 0L2 0Z')
    })

    it('lists the Regions in reading order', () => {
      const regions: DraftGrid = [
        [1, 0],
        [2, 0],
      ]

      expect(boardShapes(regions, SQUARE).areas.map((area) => area.region)).toEqual([1, 0, 2])
    })
  })

  describe('with rounded corners', () => {
    const corner: DraftGrid = [
      [0, 1],
      [1, 1],
    ]

    it('rounds an L-shaped turn in the Region lines', () => {
      expect(boardShapes(corner, ROUND).regionLines).toBe('M1 0V0.7M0 1H0.7M1 0.7A0.3 0.3 0 0 1 0.7 1')
    })

    it('gives both Regions at the turn the same curve, so they meet without a gap', () => {
      expect(areaOf(corner, 0, ROUND)).toBe('M1 0L1 0.7A0.3 0.3 0 0 1 0.7 1L0 1L0 0L1 0Z')
      expect(areaOf(corner, 1, ROUND)).toBe('M2 0L2 2L0 2L0 1L0.7 1A0.3 0.3 0 0 0 1 0.7L1 0L2 0Z')
    })

    it('keeps corners square where three Regions meet', () => {
      const tee: DraftGrid = [
        [0, 1],
        [2, 2],
      ]

      expect(boardShapes(tee, ROUND).regionLines).not.toContain('A')
    })

    it('keeps corners square where Regions only touch diagonally, as two separate pieces', () => {
      const diagonal: DraftGrid = [
        [0, 1],
        [1, 0],
      ]
      const area = areaOf(diagonal, 0, ROUND)

      expect(boardShapes(diagonal, ROUND).regionLines).not.toContain('A')
      expect(count(area, 'M')).toBe(2)
      expect(area).not.toContain('A')
    })

    it('rounds a Region of one Cell on every side, and cuts the same shape out of the Region around it', () => {
      const island: DraftGrid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]
      const shapes = boardShapes(island, ROUND)
      const around = areaOf(island, 0, ROUND)

      expect(count(areaOf(island, 1, ROUND), 'A')).toBe(4)
      expect(count(around, 'M')).toBe(2)
      expect(count(around, 'A')).toBe(4)
      expect(count(shapes.regionLines, 'A')).toBe(4)
    })

    it('leaves the corners of the Board itself to the Board', () => {
      const single: DraftGrid = [[0]]

      expect(areaOf(single, 0, ROUND)).toBe('M1 0L1 1L0 1L0 0L1 0Z')
    })
  })

  describe('Cell corners', () => {
    const NONE = [false, false, false, false]

    it('marks the corner of the Cell that a rounded turn curves around, so overlays on it can follow the curve', () => {
      const corner: DraftGrid = [
        [0, 1],
        [1, 1],
      ]

      expect(boardShapes(corner, ROUND).cellCorners).toEqual([
        [[false, false, true, false], NONE],
        [NONE, NONE],
      ])
    })

    it('marks every corner of a Region of one Cell', () => {
      const island: DraftGrid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]

      expect(boardShapes(island, ROUND).cellCorners[1]?.[1]).toEqual([true, true, true, true])
      expect(boardShapes(island, ROUND).cellCorners.flat().filter((corners) => corners.some(Boolean))).toHaveLength(1)
    })

    it('marks none with square corners', () => {
      const corner: DraftGrid = [
        [0, 1],
        [1, 1],
      ]

      expect(boardShapes(corner, SQUARE).cellCorners.flat()).toEqual([NONE, NONE, NONE, NONE])
    })
  })

  it('outlines the unassigned Cells of a Draft as one more area', () => {
    const draft: DraftGrid = [
      [null, 0],
      [null, 0],
    ]

    expect(areaOf(draft, null, SQUARE)).toBe('M1 0L1 2L0 2L0 0L1 0Z')
  })

  describe('Cell lines', () => {
    const rows: DraftGrid = [
      [0, 0],
      [1, 1],
    ]

    it('can run between every pair of Cells', () => {
      expect(boardShapes(rows, SQUARE).cellLines).toBe('M1 0V2M0 1H2')
    })

    it('can run only inside Regions, leaving Region edges to the Region lines', () => {
      expect(boardShapes(rows, ROUND).cellLines).toBe('M1 0V2')
    })

    it('join up along a Region, so dashes run on without restarting', () => {
      const columns: DraftGrid = [
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
      ]

      expect(boardShapes(columns, ROUND).cellLines).toBe('M1 0V3M0 1H3M0 2H3')
    })
  })
})
