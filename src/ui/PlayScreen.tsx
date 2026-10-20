import type { SaveSlot } from '../core/progress.ts'
import { formatSolveTime } from '../core/solveTime.ts'
import type { Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { BoardView } from './BoardView.tsx'
import type { Look } from './look.ts'
import { cellView, highlightsFor } from './playCells.tsx'
import { usePlaySession } from './usePlaySession.ts'

type Session = ReturnType<typeof usePlaySession>

export interface NextStep {
  readonly label: string
  readonly go: () => void
}

interface PlayScreenProps {
  readonly puzzle: Puzzle
  /** Where progress is kept between visits; null leaves no trace, as in an editor play-test. */
  readonly slot: SaveSlot | null
  /** The button offered once Solved, e.g. "下一題"; omitted when there is nowhere to go. */
  readonly next?: NextStep
  /** Extra line shown once Solved, e.g. that this was the last Puzzle. */
  readonly solvedNote?: string
  /** Runs on the Move that Solves the Puzzle. */
  readonly onSolve?: () => void
  /** Offer "重玩" once Solved; off where players only move forward, as in Nightmare. */
  readonly canReplay?: boolean
  /** How the Board and its Queens are drawn; LinkedIn Puzzles look as they do on LinkedIn. */
  readonly look?: Look
}

function SolvedPanel({ session, next, solvedNote, canReplay = true }: { readonly session: Session } & Pick<PlayScreenProps, 'next' | 'solvedNote' | 'canReplay'>) {
  return (
    <section className="solved-panel card" aria-live="polite">
      <h2>{strings.solvedTitle}</h2>
      <p className="muted">{strings.solvedStats(formatSolveTime(session.solvedTimeMs ?? 0), session.hintsUsed)}</p>
      {solvedNote && <p>{solvedNote}</p>}
      <div className="button-row">
        {canReplay && (
          <button type="button" className="button" onClick={session.replay}>
            {strings.replay}
          </button>
        )}
        {next && (
          <button type="button" className="button button-primary" onClick={next.go}>
            {next.label}
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

export function PlayScreen({ puzzle, slot, next, solvedNote, onSolve, canReplay, look }: PlayScreenProps) {
  const session = usePlaySession(puzzle, slot, onSolve)
  const highlights = highlightsFor(puzzle, session.board)

  return (
    <>
      <BoardView
        regions={puzzle.regions}
        label={strings.boardLabel}
        disabled={session.solved}
        look={look}
        renderCell={(cell) => cellView(session.board, highlights, session.hint, session.solved, cell, look)}
        onTap={session.tap}
        onPreview={session.previewDrag}
        onCommit={session.commitDrag}
      />
      {session.solved ? (
        <SolvedPanel session={session} next={next} solvedNote={solvedNote} canReplay={canReplay} />
      ) : (
        <PlayControls session={session} />
      )}
    </>
  )
}
