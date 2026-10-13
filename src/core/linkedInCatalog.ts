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

/** Whether a number can be one of LinkedIn's: a whole number from 1 up. */
export function isLinkedInNumber(number: number): boolean {
  return Number.isSafeInteger(number) && number >= 1
}

/** A LinkedIn number written as text, as in a file name or the editor; null unless it is one. */
export function parseLinkedInNumber(text: string): number | null {
  const trimmed = text.trim()
  return LINKEDIN_NUMBER.test(trimmed) && isLinkedInNumber(Number(trimmed)) ? Number(trimmed) : null
}

type Checked = { readonly ok: true; readonly entry: LinkedInEntry } | { readonly ok: false; readonly problem: LinkedInProblem }

function checkFile(file: LinkedInFile): Checked {
  const number = file.name === file.name.trim() ? parseLinkedInNumber(file.name) : null
  if (number === null) return { ok: false, problem: { kind: 'invalidName', name: file.name } }
  const read = readPuzzle(file.text)
  if (!read.ok) return { ok: false, problem: { kind: read.reason, name: file.name } }
  return { ok: true, entry: { number, puzzle: read.puzzle } }
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

/** The number after the highest one stored: where the next day's LinkedIn Puzzle usually goes. */
export function nextLinkedInNumber(catalog: LinkedInCatalog): number {
  return Math.max(0, ...catalog.puzzles.map((entry) => entry.number)) + 1
}

/** The LinkedIn Puzzle after this one, or null after the last. */
export function nextLinkedIn(catalog: LinkedInCatalog, number: number): LinkedInEntry | null {
  return catalog.puzzles.find((entry) => entry.number > number) ?? null
}
