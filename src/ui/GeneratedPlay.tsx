import type { SaveSlot } from '../core/progress.ts'
import type { Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { type NextStep, PlayScreen } from './PlayScreen.tsx'
import { useGeneratedPuzzle } from './useGeneratedPuzzle.ts'

interface GeneratedPlayProps {
  readonly size: number
  readonly seed: number
  /** Where the generated Puzzle's progress is kept. */
  readonly slotFor: (puzzle: Puzzle) => SaveSlot
  readonly next?: NextStep
  readonly onSolve?: () => void
  readonly canReplay?: boolean
}

/** Plays the Puzzle a seed stands for, showing a placeholder Board while it is being generated. */
export function GeneratedPlay({ size, seed, slotFor, next, onSolve, canReplay }: GeneratedPlayProps) {
  const generated = useGeneratedPuzzle(size, seed)

  if (generated.state === 'generating') {
    return (
      <div className="board-placeholder" role="status">
        {strings.generating}
      </div>
    )
  }
  if (generated.state === 'failed') return <p className="form-error">{strings.generateFailed}</p>
  return (
    <PlayScreen
      key={generated.puzzle.id}
      puzzle={generated.puzzle}
      slot={slotFor(generated.puzzle)}
      next={next}
      onSolve={onSolve}
      canReplay={canReplay}
    />
  )
}
