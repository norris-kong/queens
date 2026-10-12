import type { ProgressStatus } from '../core/progress.ts'
import type { Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { progressStore } from './progressStorage.ts'

/** ✓ or ● next to a Puzzle, with the full status for screen readers and on hover. */
export function StatusMark({ status }: { readonly status: Exclude<ProgressStatus, 'new'> }) {
  const { icon, label } = strings.status[status]
  return (
    <span className={`status status-${status}`} title={label}>
      <span aria-hidden="true">{icon}</span>
      <span className="visually-hidden">{label}</span>
    </span>
  )
}

/** A button-sized link to one Puzzle, showing only its number and how far the player got. */
export function PuzzleLink({ href, number, puzzle }: { readonly href: string; readonly number: number; readonly puzzle: Puzzle }) {
  const status = progressStore.status(puzzle.id)
  return (
    <a className="puzzle-link" href={href}>
      <span>{number}</span>
      {status !== 'new' && <StatusMark status={status} />}
    </a>
  )
}
