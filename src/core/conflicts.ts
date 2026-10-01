import type { Board } from './board.ts'
import type { Coord, Puzzle } from './types.ts'

export type ConflictKind = 'row' | 'column' | 'region' | 'adjacent'

/** A Conflict, with the Queens involved and the Cells to stripe red. */
export interface Conflict {
  readonly kind: ConflictKind
  readonly queens: readonly Coord[]
  readonly area: readonly Coord[]
}

/** A set of Cells that may hold at most one Queen: a row, a column or a Region. */
interface Unit {
  readonly kind: Exclude<ConflictKind, 'adjacent'>
  readonly contains: (coord: Coord) => boolean
}

function queensOn(board: Board): Coord[] {
  return board.flatMap((cells, row) => cells.flatMap((state, col) => (state === 'queen' ? [{ row, col }] : [])))
}

function allCells(puzzle: Puzzle): Coord[] {
  return puzzle.regions.flatMap((cells, row) => cells.map((_, col) => ({ row, col })))
}

function unitsOf(puzzle: Puzzle): Unit[] {
  const indices = Array.from({ length: puzzle.size }, (_, index) => index)
  const regionOf = (coord: Coord) => puzzle.regions[coord.row]?.[coord.col]
  return [
    ...indices.map((row): Unit => ({ kind: 'row', contains: (coord) => coord.row === row })),
    ...indices.map((col): Unit => ({ kind: 'column', contains: (coord) => coord.col === col })),
    ...indices.map((region): Unit => ({ kind: 'region', contains: (coord) => regionOf(coord) === region })),
  ]
}

function touches(a: Coord, b: Coord): boolean {
  return Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1
}

function unitConflicts(puzzle: Puzzle, queens: readonly Coord[]): Conflict[] {
  const cells = allCells(puzzle)
  return unitsOf(puzzle).flatMap((unit) => {
    const inUnit = queens.filter(unit.contains)
    return inUnit.length < 2 ? [] : [{ kind: unit.kind, queens: inUnit, area: cells.filter(unit.contains) }]
  })
}

function adjacentConflicts(queens: readonly Coord[]): Conflict[] {
  return queens.flatMap((queen, index) =>
    queens
      .slice(index + 1)
      .filter((other) => touches(queen, other))
      .map((other) => ({ kind: 'adjacent' as const, queens: [queen, other], area: [queen, other] })),
  )
}

/** Every Queen-against-Queen rule the Board breaks. Marks never take part. */
export function findConflicts(puzzle: Puzzle, board: Board): Conflict[] {
  const queens = queensOn(board)
  return [...unitConflicts(puzzle, queens), ...adjacentConflicts(queens)]
}

/** Solved: exactly N Queens and no Conflict. With a unique Solution this is the Solution itself. */
export function isSolved(puzzle: Puzzle, board: Board): boolean {
  return queensOn(board).length === puzzle.size && findConflicts(puzzle, board).length === 0
}
