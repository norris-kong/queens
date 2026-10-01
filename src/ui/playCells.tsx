import type { Board, CellState } from '../core/board.ts'
import { findConflicts } from '../core/conflicts.ts'
import { coordKey as key } from '../core/grid.ts'
import type { Hint } from '../core/hint.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import type { CellView } from './BoardView.tsx'
import { MarkIcon, QueenIcon } from './icons.tsx'

export interface Highlights {
  readonly striped: ReadonlySet<string>
  readonly conflictingQueens: ReadonlySet<string>
}

export function highlightsFor(puzzle: Puzzle, board: Board): Highlights {
  const conflicts = findConflicts(puzzle, board)
  return {
    striped: new Set(conflicts.flatMap((conflict) => conflict.cells.map(key))),
    conflictingQueens: new Set(conflicts.flatMap((conflict) => conflict.queens.map(key))),
  }
}

function cellContent(state: CellState | undefined, queenClass: string) {
  if (state === 'queen') return <QueenIcon className={queenClass} />
  if (state === 'mark') return <MarkIcon />
  return null
}

export function cellView(board: Board, highlights: Highlights, hint: Hint | null, solved: boolean, cell: Coord): CellView {
  const state = board[cell.row]?.[cell.col]
  const id = key(cell)
  const queenClass = solved ? 'is-solved' : highlights.conflictingQueens.has(id) ? 'is-conflict' : ''
  const hinted = hint !== null && key(hint.cell) === id
  return {
    label: strings.cellLabel(cell.row, cell.col, strings.cellStates[state ?? 'empty']),
    content: cellContent(state, queenClass),
    className: [highlights.striped.has(id) ? 'is-striped' : '', hinted ? 'is-hinted' : ''].join(' '),
  }
}
