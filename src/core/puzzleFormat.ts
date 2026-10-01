import type { DraftGrid, RegionId } from './types'

const FIRST_LETTER_CODE = 'A'.charCodeAt(0)
const UNASSIGNED = '.'

export type ParseError =
  | { readonly kind: 'empty' }
  | { readonly kind: 'notSquare' }
  | { readonly kind: 'invalidCharacter'; readonly row: number; readonly col: number; readonly char: string }

export type ParseResult =
  | { readonly ok: true; readonly grid: DraftGrid }
  | { readonly ok: false; readonly error: ParseError }

/** The letter shown for a Region: 0 → "A", 1 → "B", … */
export function regionLetter(region: RegionId): string {
  return String.fromCharCode(FIRST_LETTER_CODE + region)
}

function readCell(char: string, size: number): RegionId | null | undefined {
  if (char === UNASSIGNED) return null
  const region = char.charCodeAt(0) - FIRST_LETTER_CODE
  return char.length === 1 && region >= 0 && region < size ? region : undefined
}

/** Reads a Puzzle file: one line per row, one letter per Cell, "." for an unassigned Cell. */
export function parsePuzzle(text: string): ParseResult {
  const trimmed = text.trim()
  if (trimmed === '') return { ok: false, error: { kind: 'empty' } }

  const rows = trimmed.split(/\r?\n/).map((line) => [...line])
  const size = rows.length
  if (rows.some((row) => row.length !== size)) return { ok: false, error: { kind: 'notSquare' } }

  const grid: (RegionId | null)[][] = []
  for (const [row, chars] of rows.entries()) {
    const cells: (RegionId | null)[] = []
    for (const [col, char] of chars.entries()) {
      const cell = readCell(char, size)
      if (cell === undefined) return { ok: false, error: { kind: 'invalidCharacter', row, col, char } }
      cells.push(cell)
    }
    grid.push(cells)
  }
  return { ok: true, grid }
}

/** Writes a grid in the Puzzle file format read by `parsePuzzle`. */
export function formatPuzzle(grid: DraftGrid): string {
  const lines = grid.map((row) => row.map((cell) => (cell === null ? UNASSIGNED : regionLetter(cell))).join(''))
  return `${lines.join('\n')}\n`
}
