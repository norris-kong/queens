import { nextLinkedInNumber } from '../../core/linkedInCatalog.ts'
import { nextPuzzleName } from '../../core/puzzleName.ts'
import type { Puzzle } from '../../core/types.ts'
import { library, linkedInLibrary } from '../../puzzleLibrary.ts'
import { findEntry } from '../libraryLookup.ts'

/** Where a Puzzle is saved: among the author's own, or among the LinkedIn Puzzles. */
export type Collection = 'own' | 'linkedIn'

/** What the editor's address asks for: one of the author's Puzzles, a LinkedIn Puzzle, or neither. */
export interface EditorTarget {
  readonly size?: number
  readonly name?: string
  readonly linkedIn?: number
}

/** A stored Puzzle the editor has open. */
export type Opened =
  | { readonly kind: 'own'; readonly size: number; readonly name: string; readonly puzzle: Puzzle }
  | { readonly kind: 'linkedIn'; readonly number: number; readonly puzzle: Puzzle }

export function isTargetGiven(target: EditorTarget): boolean {
  return target.linkedIn !== undefined || target.name !== undefined
}

/** The stored Puzzle `target` points at, or null for a new Draft or one no longer stored. */
export function openTarget(target: EditorTarget): Opened | null {
  if (target.linkedIn !== undefined) {
    const entry = linkedInLibrary.puzzles.find((candidate) => candidate.number === target.linkedIn)
    return entry ? { kind: 'linkedIn', number: entry.number, puzzle: entry.puzzle } : null
  }
  if (target.size === undefined || target.name === undefined) return null
  const located = findEntry(library, target.size, target.name)
  return located ? { kind: 'own', size: located.size, name: located.entry.name, puzzle: located.entry.puzzle } : null
}

/** The name a new Puzzle of this Size is offered, following the ones already in the library. */
export function suggestedName(size: number): string {
  const taken = library.sizes.find((group) => group.size === size)?.puzzles.map((entry) => entry.name) ?? []
  return nextPuzzleName(size, taken)
}

/** The LinkedIn number a new LinkedIn Puzzle is offered: the day after the latest one stored. */
export function suggestedLinkedInNumber(): number {
  return nextLinkedInNumber(linkedInLibrary)
}
