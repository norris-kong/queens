import type { Board, CellState } from '../core/board.ts'
import { findConflicts } from '../core/conflicts.ts'
import { coordKey as key } from '../core/grid.ts'
import type { Hint } from '../core/hint.ts'
import type { CSSProperties } from 'react'
import type { Coord, Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import type { CellView } from './BoardView.tsx'
import { MarkIcon, QueenMark } from './icons.tsx'
import type { Look } from './look.ts'

/** On a Solve, the Queens grow and settle back one row after another, this far apart. */
const CELEBRATION_STAGGER_MS = 70

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

interface QueenDrawing {
  readonly className: string
  readonly size: number
  readonly row: number
  readonly look: Look
  readonly solved: boolean
}

function cellContent(state: CellState | undefined, queen: QueenDrawing) {
  if (state === 'queen') {
    const delay = { '--celebration-delay': `${queen.row * CELEBRATION_STAGGER_MS}ms` } as CSSProperties
    return <QueenMark size={queen.size} look={queen.look} solved={queen.solved} className={queen.className} style={delay} />
  }
  if (state === 'mark') return <MarkIcon />
  return null
}

export function cellView(
  board: Board,
  highlights: Highlights,
  hint: Hint | null,
  solved: boolean,
  cell: Coord,
  look: Look = 'level',
): CellView {
  const state = board[cell.row]?.[cell.col]
  const id = key(cell)
  const queenClass = solved ? 'is-solved' : highlights.conflictingQueens.has(id) ? 'is-conflict' : ''
  const hinted = hint !== null && key(hint.cell) === id
  return {
    label: strings.cellLabel(cell.row, cell.col, strings.cellStates[state ?? 'empty']),
    content: cellContent(state, { className: queenClass, size: board.length, row: cell.row, look, solved }),
    className: [highlights.striped.has(id) ? 'is-striped' : '', hinted ? 'is-hinted' : ''].join(' '),
  }
}
