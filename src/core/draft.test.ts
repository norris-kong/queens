import { describe, expect, it } from 'vitest'
import { inspectDraft } from './draft'
import { parsePuzzle } from './puzzleFormat'
import type { DraftGrid } from './types'

function grid(text: string): DraftGrid {
  const result = parsePuzzle(text)
  if (!result.ok) throw new Error(`bad fixture: ${result.error.kind}`)
  return result.grid
}

// The solved LinkedIn board in rule/06.jpeg; its Queens are the independent answer.
const LINKEDIN_8X8 = `
AAABBBBB
AAABBBBB
AAABBBCC
AAABBDCC
AAAEDDDC
AFEEEDCC
FFFEGGCC
HFGGGGCC
`

describe('inspectDraft', () => {
  it('turns a Draft with exactly one Solution into a Puzzle holding that Solution', () => {
    const inspection = inspectDraft(grid(LINKEDIN_8X8))

    expect(inspection.valid).toBe(true)
    if (!inspection.valid) return
    expect(inspection.puzzle.size).toBe(8)
    expect(inspection.puzzle.solution).toEqual([6, 2, 7, 5, 3, 1, 4, 0])
  })

  it('reports two different Solutions when a Draft has more than one', () => {
    // One Region per row: only the column orders 1-3-0-2 and 2-0-3-1 keep Queens apart.
    const inspection = inspectDraft(grid('AAAA\nBBBB\nCCCC\nDDDD'))

    expect(inspection.valid).toBe(false)
    if (inspection.valid) return
    expect(inspection.problems).toHaveLength(1)
    const [problem] = inspection.problems
    expect(problem?.kind).toBe('multipleSolutions')
    if (problem?.kind !== 'multipleSolutions') return
    expect([...problem.solutions].sort()).toEqual([
      [1, 3, 0, 2],
      [2, 0, 3, 1],
    ])
  })

  it('reports when a Draft has no Solution', () => {
    // Single-Cell Regions A and B sit side by side in row 0, so both cannot hold a Queen.
    const inspection = inspectDraft(grid('ABCC\nCCCC\nDDDD\nDDDD'))

    expect(inspection).toEqual({ valid: false, problems: [{ kind: 'noSolution' }] })
  })

  it.each([3, 13])('rejects Size %i, which is outside 4 to 12', (size) => {
    const rowsAsRegions = Array.from({ length: size }, (_, row) => Array<number>(size).fill(row))

    expect(inspectDraft(rowsAsRegions)).toEqual({
      valid: false,
      problems: [{ kind: 'sizeOutOfRange', size }],
    })
  })

  it('lists unassigned Cells and absent Regions together, without looking for Solutions', () => {
    // Region D is never used and two Cells are still unassigned.
    const inspection = inspectDraft(grid('AAB.\nAABB\nCCCC\nCC.C'))

    expect(inspection).toEqual({
      valid: false,
      problems: [
        { kind: 'unassignedCells', cells: [{ row: 0, col: 3 }, { row: 3, col: 2 }] },
        { kind: 'missingRegions', regions: [3] },
      ],
    })
  })

  it('reports Regions whose Cells touch only diagonally as not connected', () => {
    // A and B each have two Cells meeting only at a corner.
    const inspection = inspectDraft(grid('ABCC\nBACC\nDDDD\nDDDD'))

    expect(inspection).toEqual({
      valid: false,
      problems: [{ kind: 'disconnectedRegions', regions: [0, 1] }],
    })
  })
})
