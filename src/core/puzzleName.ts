/** Puzzle Names are file names, so they stay to lowercase letters, digits, "-" and "_". */
const PUZZLE_NAME = /^[a-z0-9_-]{1,40}$/

export function isValidPuzzleName(name: string): boolean {
  return PUZZLE_NAME.test(name)
}

const naturalOrder = new Intl.Collator('en', { numeric: true })

/** Orders Puzzle Names so that "2-easy" comes before "10-hard". */
export function comparePuzzleNames(a: string, b: string): number {
  return naturalOrder.compare(a, b)
}
