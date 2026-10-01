import { formatSolveTime } from '../core/solveTime.ts'
import type { Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { BoardView } from './BoardView.tsx'
import { cellView, highlightsFor } from './playCells.tsx'
import { usePlaySession } from './usePlaySession.ts'

type Session = ReturnType<typeof usePlaySession>

interface PlayScreenProps {
  readonly puzzle: Puzzle
  readonly persist: boolean
  /** Where "下一題" leads; omitted when there is no next Puzzle. */
  readonly onNext?: () => void
  /** Extra line shown once Solved, e.g. that this was the last Puzzle. */
  readonly solvedNote?: string
}

function SolvedPanel({ session, onNext, solvedNote }: { readonly session: Session } & Omit<PlayScreenProps, 'puzzle' | 'persist'>) {
  return (
    <section className="solved-panel card" aria-live="polite">
      <h2>{strings.solvedTitle}</h2>
      <p className="muted">{strings.solvedStats(formatSolveTime(session.solvedTimeMs ?? 0), session.hintsUsed)}</p>
      {solvedNote && <p>{solvedNote}</p>}
      <div className="button-row">
        <button type="button" className="button" onClick={session.replay}>
          {strings.replay}
        </button>
        {onNext && (
          <button type="button" className="button button-primary" onClick={onNext}>
            {strings.nextPuzzle}
          </button>
        )}
      </div>
    </section>
  )
}

function PlayControls({ session }: { readonly session: Session }) {
  return (
    <>
      <p className="hint-message" aria-live="polite">
        {session.hint ? strings.hints[session.hint.kind] : ''}
      </p>
      <div className="button-row">
        <button type="button" className="button" onClick={session.undo} disabled={!session.canUndo}>
          {strings.undo}
        </button>
        <button type="button" className="button" onClick={session.reset} disabled={!session.canReset}>
          {strings.reset}
        </button>
        <button type="button" className="button" onClick={session.showHint}>
          {strings.hint}
        </button>
      </div>
    </>
  )
}

export function PlayScreen({ puzzle, persist, onNext, solvedNote }: PlayScreenProps) {
  const session = usePlaySession(puzzle, { persist })
  const highlights = highlightsFor(puzzle, session.board)

  return (
    <>
      <BoardView
        regions={puzzle.regions}
        label={strings.boardLabel}
        disabled={session.solved}
        renderCell={(cell) => cellView(session.board, highlights, session.hint, session.solved, cell)}
        onTap={session.tap}
        onPreview={session.previewDrag}
        onCommit={session.commitDrag}
      />
      {session.solved ? (
        <SolvedPanel session={session} onNext={onNext} solvedNote={solvedNote} />
      ) : (
        <PlayControls session={session} />
      )}
    </>
  )
}
