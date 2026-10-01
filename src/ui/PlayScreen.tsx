import { formatSolveTime } from '../core/solveTime.ts'
import type { Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { BoardGrid } from './BoardGrid.tsx'
import { cellView, highlightsFor } from './playCells.tsx'
import { usePlaySession } from './usePlaySession.ts'

interface PlayScreenProps {
  readonly puzzle: Puzzle
  readonly persist: boolean
  /** Where "下一題" leads; omitted when there is no next Puzzle. */
  readonly onNext?: () => void
}

export function PlayScreen({ puzzle, persist, onNext }: PlayScreenProps) {
  const session = usePlaySession(puzzle, { persist })
  const highlights = highlightsFor(puzzle, session.board)

  return (
    <>
      <BoardGrid
        regions={puzzle.regions}
        label={strings.boardLabel}
        disabled={session.solved}
        renderCell={(cell) => cellView(session.board, highlights, session.hint, session.solved, cell)}
        onTap={session.tap}
        onPreview={session.previewDrag}
        onCommit={session.commitDrag}
      />

      {session.solved ? (
        <section className="solved-panel card" aria-live="polite">
          <h2>{strings.solvedTitle}</h2>
          <p className="muted">
            {strings.solvedStats(formatSolveTime(session.solvedTimeMs ?? 0), session.hintsUsed)}
          </p>
          {!onNext && <p>{strings.lastPuzzle}</p>}
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
      ) : (
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
      )}
    </>
  )
}
