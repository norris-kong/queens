import { type Board, type CellState, cellAt, emptyBoard, withCells } from './board.ts'
import { isSolved } from './conflicts.ts'
import type { Coord, Puzzle } from './types.ts'

/** A player's attempt at a Puzzle: the Board plus the earlier Boards that Undo can return to. */
export interface Play {
  readonly puzzle: Puzzle
  readonly board: Board
  readonly history: readonly Board[]
}

const NEXT_ON_TAP: Readonly<Record<CellState, CellState>> = { empty: 'mark', mark: 'queen', queen: 'empty' }

export function startPlay(puzzle: Puzzle, board: Board = emptyBoard(puzzle.size)): Play {
  return { puzzle, board, history: [] }
}

function sameBoard(a: Board, b: Board): boolean {
  return a.every((cells, row) => cells.every((state, col) => b[row]?.[col] === state))
}

/** Once Solved, the Board is locked: no further Move and no Undo. */
export function isPlaySolved(play: Play): boolean {
  return isSolved(play.puzzle, play.board)
}

/** Records a new Board as one Move, unless it is unchanged or the Play is already Solved. */
function commit(play: Play, board: Board): Play {
  if (isPlaySolved(play) || sameBoard(play.board, board)) return play
  return { ...play, board, history: [...play.history, play.board] }
}

/** Cycles a Cell: empty → Mark → Queen → empty. */
export function tap(play: Play, coord: Coord): Play {
  const current = cellAt(play.board, coord)
  if (current === undefined) return play
  return commit(play, withCells(play.board, [{ coord, state: NEXT_ON_TAP[current] }]))
}

/** What a drag does to each Cell it passes, decided by the Cell where it starts. */
const DRAG_EFFECT: Readonly<Record<CellState, { readonly from: CellState; readonly to: CellState } | null>> = {
  empty: { from: 'empty', to: 'mark' },
  mark: { from: 'mark', to: 'empty' },
  queen: null,
}

/**
 * Applies one whole drag stroke, `cells[0]` being where it started: from an empty Cell it Marks
 * every empty Cell passed, from a Mark it erases every Mark passed. Queens are never touched.
 */
export function drag(play: Play, cells: readonly Coord[]): Play {
  const [start] = cells
  const startState = start && cellAt(play.board, start)
  const effect = startState && DRAG_EFFECT[startState]
  if (!effect) return play
  const changes = cells
    .filter((coord) => cellAt(play.board, coord) === effect.from)
    .map((coord) => ({ coord, state: effect.to }))
  return commit(play, withCells(play.board, changes))
}

/** Clears every Queen and Mark, as one Move that Undo can take back. */
export function reset(play: Play): Play {
  return commit(play, emptyBoard(play.puzzle.size))
}

export function canUndo(play: Play): boolean {
  return play.history.length > 0 && !isPlaySolved(play)
}

/** Returns to the Board before the latest Move. */
export function undo(play: Play): Play {
  const previous = play.history.at(-1)
  if (previous === undefined || isPlaySolved(play)) return play
  return { ...play, board: previous, history: play.history.slice(0, -1) }
}
