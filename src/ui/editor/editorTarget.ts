import { DEFAULT_DRAFT_SIZE } from '../../config.ts'
import { nextLinkedInNumber } from '../../core/linkedInCatalog.ts'
import { nextPuzzleName } from '../../core/puzzleName.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'
import type { Puzzle } from '../../core/types.ts'
import { library, linkedInLibrary } from '../../puzzleLibrary.ts'
import { findEntry } from '../libraryLookup.ts'
import type { Collection } from '../routes.ts'

export type { Collection }

/**
 * What the editor's address asks for: one of the author's Puzzles (Size and name), a LinkedIn
 * Puzzle (its number), or a new Draft (perhaps of a given Size, to save in a given collection).
 */
export interface EditorTarget {
  readonly size?: number
  readonly name?: string
  readonly linkedIn?: number
  readonly collection?: Collection
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

/** The collection a Draft starts out saving to. */
export function startingCollection(target: EditorTarget, opened: Opened | null): Collection {
  if (opened) return opened.kind
  return target.linkedIn === undefined ? (target.collection ?? 'own') : 'linkedIn'
}

/** The Size a Draft starts at: the opened Puzzle's, else the one asked for if supported, else the default. */
export function startingSize(target: EditorTarget, opened: Opened | null): number {
  if (opened) return opened.puzzle.size
  const { size } = target
  return size !== undefined && size >= MIN_SIZE && size <= MAX_SIZE ? size : DEFAULT_DRAFT_SIZE
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
