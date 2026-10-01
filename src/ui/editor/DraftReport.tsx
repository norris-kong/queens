import type { DraftInspection, DraftProblem } from '../../core/draft.ts'
import { regionLetter } from '../../core/puzzleFormat.ts'
import { strings } from '../../strings.ts'

const letters = (regions: readonly number[]) => regions.map(regionLetter).join('、')

function problemText(problem: DraftProblem): string {
  switch (problem.kind) {
    case 'sizeOutOfRange':
      return strings.editor.errors.invalidSize
    case 'unassignedCells':
      return strings.editor.unassigned(problem.cells.length)
    case 'missingRegions':
      return strings.editor.missingRegions(letters(problem.regions))
    case 'disconnectedRegions':
      return strings.editor.disconnected(letters(problem.regions))
    case 'noSolution':
      return strings.editor.noSolution
    case 'multipleSolutions':
      return strings.editor.multipleSolutions
  }
}

export function DraftReport({ inspection }: { readonly inspection: DraftInspection }) {
  return (
    <section className="report card" aria-live="polite">
      <strong>{strings.editor.reportHeading}</strong>
      {inspection.valid ? (
        <p className="ok">{strings.editor.valid}</p>
      ) : (
        <ul>
          {inspection.problems.map((problem) => (
            <li key={problem.kind} className="problem">
              {problemText(problem)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
