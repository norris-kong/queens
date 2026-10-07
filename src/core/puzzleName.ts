import { levelName } from './level.ts'

/**
 * Puzzle Names are file names, so they stay to letters, digits, "-", "_" and single spaces between
 * words, at most 40 characters.
 */
const PUZZLE_NAME = /^(?=.{1,40}$)[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+)*$/

export function isValidPuzzleName(name: string): boolean {
  return PUZZLE_NAME.test(name)
}

/** Whether two Puzzle Names would land on the same file; macOS and Windows ignore case in file names. */
export function samePuzzleName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

const naturalOrder = new Intl.Collator('en', { numeric: true })

/** Orders Puzzle Names so that "Beginner 2" comes before "Beginner 10". */
export function comparePuzzleNames(a: string, b: string): number {
  return naturalOrder.compare(a, b)
}

/** The number in a "<Level> <number>" name of this Level, or null for any other name. */
function levelNumber(level: string, name: string): number | null {
  const [word, digits, ...rest] = name.split(' ')
  if (rest.length > 0 || word === undefined || !samePuzzleName(word, level) || !/^\d+$/.test(digits ?? '')) return null
  return Number(digits)
}

/** The name a new Puzzle of this Size starts with: its Level and one past the highest number in use. */
export function nextPuzzleName(size: number, takenNames: readonly string[]): string {
  const level = levelName(size)
  const numbers = takenNames.map((name) => levelNumber(level, name) ?? 0)
  return `${level} ${Math.max(0, ...numbers) + 1}`
}
