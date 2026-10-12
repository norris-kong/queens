import { readPuzzle } from './puzzleFile.ts'
import type { Puzzle } from './types.ts'

/** A LinkedIn Puzzle file as stored: `puzzles/LinkedIn/<LinkedIn number>.txt`. */
export interface LinkedInFile {
  readonly name: string
  readonly text: string
}

export interface LinkedInEntry {
  /** LinkedIn's own number for the Puzzle, as in "LinkedIn #250". */
  readonly number: number
  readonly puzzle: Puzzle
}

export interface LinkedInProblem {
  readonly kind: 'invalidName' | 'unreadable' | 'notAPuzzle' | 'duplicate'
  readonly name: string
}

export interface LinkedInCatalog {
  readonly puzzles: readonly LinkedInEntry[]
  readonly problems: readonly LinkedInProblem[]
}

const LINKEDIN_NUMBER = /^[1-9]\d*$/

type Checked = { readonly ok: true; readonly entry: LinkedInEntry } | { readonly ok: false; readonly problem: LinkedInProblem }

function checkFile(file: LinkedInFile): Checked {
  if (!LINKEDIN_NUMBER.test(file.name)) return { ok: false, problem: { kind: 'invalidName', name: file.name } }
  const read = readPuzzle(file.text)
  if (!read.ok) return { ok: false, problem: { kind: read.reason, name: file.name } }
  return { ok: true, entry: { number: Number(file.name), puzzle: read.puzzle } }
}

/**
 * Builds the LinkedIn Puzzles in LinkedIn's order. Files that are not valid Puzzles, or that repeat
 * a layout already among `takenIds` (the author's own Puzzles) or an earlier LinkedIn Puzzle, are
 * left out and reported.
 */
export function buildLinkedInCatalog(files: readonly LinkedInFile[], takenIds: ReadonlySet<string>): LinkedInCatalog {
  const checked = files.map(checkFile)
  const entries = checked.flatMap((check) => (check.ok ? [check.entry] : [])).sort((a, b) => a.number - b.number)
  const problems = checked.flatMap((check) => (check.ok ? [] : [check.problem]))
  const seen = new Set(takenIds)
  const puzzles: LinkedInEntry[] = []
  for (const entry of entries) {
    if (seen.has(entry.puzzle.id)) {
      problems.push({ kind: 'duplicate', name: String(entry.number) })
      continue
    }
    seen.add(entry.puzzle.id)
    puzzles.push(entry)
  }
  return { puzzles, problems }
}

/** The LinkedIn Puzzle after this one, or null after the last. */
export function nextLinkedIn(catalog: LinkedInCatalog, number: number): LinkedInEntry | null {
  return catalog.puzzles.find((entry) => entry.number > number) ?? null
}
