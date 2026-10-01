import { type DraftProblem, inspectDraft } from './draft.ts'
import { type ParseError, parsePuzzle } from './puzzleFormat.ts'
import { comparePuzzleNames, isValidPuzzleName } from './puzzleName.ts'
import type { Puzzle } from './types.ts'

/** A Puzzle file as stored in the library: `puzzles/<size>/<name>.txt`. */
export interface PuzzleFile {
  readonly size: number
  readonly name: string
  readonly text: string
}

export interface FileRef {
  readonly size: number
  readonly name: string
}

export interface CatalogEntry {
  readonly puzzle: Puzzle
  readonly name: string
  /** 1-based position within its Size, in natural Puzzle Name order; for display only. */
  readonly number: number
}

export interface CatalogSize {
  readonly size: number
  readonly puzzles: readonly CatalogEntry[]
}

export type CatalogProblem =
  | { readonly kind: 'invalidName'; readonly file: FileRef }
  | { readonly kind: 'unreadable'; readonly file: FileRef; readonly error: ParseError }
  | { readonly kind: 'notAPuzzle'; readonly file: FileRef; readonly problems: readonly DraftProblem[] }
  | { readonly kind: 'wrongSizeFolder'; readonly file: FileRef; readonly actualSize: number }
  | { readonly kind: 'duplicate'; readonly file: FileRef; readonly sameAs: FileRef }

export interface Catalog {
  readonly sizes: readonly CatalogSize[]
  readonly problems: readonly CatalogProblem[]
}

type Checked = { readonly ok: true; readonly puzzle: Puzzle } | { readonly ok: false; readonly problem: CatalogProblem }

function checkFile(file: PuzzleFile): Checked {
  const ref = { size: file.size, name: file.name }
  if (!isValidPuzzleName(file.name)) return { ok: false, problem: { kind: 'invalidName', file: ref } }
  const parsed = parsePuzzle(file.text)
  if (!parsed.ok) return { ok: false, problem: { kind: 'unreadable', file: ref, error: parsed.error } }
  const inspection = inspectDraft(parsed.grid)
  if (!inspection.valid) return { ok: false, problem: { kind: 'notAPuzzle', file: ref, problems: inspection.problems } }
  if (inspection.puzzle.size !== file.size) {
    return { ok: false, problem: { kind: 'wrongSizeFolder', file: ref, actualSize: inspection.puzzle.size } }
  }
  return { ok: true, puzzle: inspection.puzzle }
}

function byLibraryOrder(a: FileRef, b: FileRef): number {
  return a.size - b.size || comparePuzzleNames(a.name, b.name)
}

/**
 * Builds the Puzzle library from its files. Files that are not valid Puzzles, sit in the wrong
 * Size folder or repeat an earlier layout are left out and reported as problems.
 */
export function buildCatalog(files: readonly PuzzleFile[]): Catalog {
  const ordered = [...files].sort(byLibraryOrder)
  const accepted: { readonly file: PuzzleFile; readonly puzzle: Puzzle }[] = []
  const problems: CatalogProblem[] = []

  for (const file of ordered) {
    const checked = checkFile(file)
    if (!checked.ok) {
      problems.push(checked.problem)
      continue
    }
    const original = accepted.find((entry) => entry.puzzle.id === checked.puzzle.id)
    if (original) {
      problems.push({
        kind: 'duplicate',
        file: { size: file.size, name: file.name },
        sameAs: { size: original.file.size, name: original.file.name },
      })
      continue
    }
    accepted.push({ file, puzzle: checked.puzzle })
  }

  const sizes = [...new Set(accepted.map((entry) => entry.file.size))].map((size) => ({
    size,
    puzzles: accepted
      .filter((entry) => entry.file.size === size)
      .map((entry, index) => ({ puzzle: entry.puzzle, name: entry.file.name, number: index + 1 })),
  }))
  return { sizes, problems }
}
