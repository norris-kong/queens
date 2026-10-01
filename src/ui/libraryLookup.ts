import { SHOW_PUZZLE_NAMES } from '../config.ts'
import type { Catalog, CatalogEntry } from '../core/catalog.ts'

export interface LocatedEntry {
  readonly size: number
  readonly entry: CatalogEntry
}

/** Every Puzzle in play order: by Size, then by number. */
export function allEntries(catalog: Catalog): LocatedEntry[] {
  return catalog.sizes.flatMap((group) => group.puzzles.map((entry) => ({ size: group.size, entry })))
}

export function findEntry(catalog: Catalog, size: number, name: string): LocatedEntry | null {
  return allEntries(catalog).find((located) => located.size === size && located.entry.name === name) ?? null
}

/** The Puzzle after this one, moving on to the next Size after the last of this Size. */
export function nextEntry(catalog: Catalog, size: number, name: string): LocatedEntry | null {
  const entries = allEntries(catalog)
  const index = entries.findIndex((located) => located.size === size && located.entry.name === name)
  return index === -1 ? null : (entries[index + 1] ?? null)
}

/** The Puzzle Name to show players, or null when names are hidden. */
export function shownName(entry: CatalogEntry): string | null {
  return SHOW_PUZZLE_NAMES ? entry.name : null
}
