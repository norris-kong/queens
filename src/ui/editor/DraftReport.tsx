import type { DraftInspection, DraftProblem } from '../../core/draft.ts'
import { regionLetter } from '../../core/puzzleFormat.ts'
import { editorStrings as text } from './editorStrings.ts'

const letters = (regions: readonly number[]) => regions.map(regionLetter).join('、')

function problemText(problem: DraftProblem): string {
  switch (problem.kind) {
    case 'sizeOutOfRange':
      return text.errors.invalidSize
    case 'unassignedCells':
      return text.unassigned(problem.cells.length)
    case 'missingRegions':
      return text.missingRegions(letters(problem.regions))
    case 'disconnectedRegions':
      return text.disconnected(letters(problem.regions))
    case 'noSolution':
      return text.noSolution
    case 'multipleSolutions':
      return text.multipleSolutions
  }
}

function regionsUsed(inspection: DraftInspection, size: number): number {
  if (inspection.valid) return size
  const missing = inspection.problems.find((problem) => problem.kind === 'missingRegions')
  return size - (missing?.regions.length ?? 0)
}

export function DraftReport({ inspection, size }: { readonly inspection: DraftInspection; readonly size: number }) {
  return (
    <section className="report card" aria-live="polite">
      <strong>{text.reportHeading}</strong>
      <p>{text.regionCount(regionsUsed(inspection, size), size)}</p>
      {inspection.valid ? (
        <p className="ok">{text.valid}</p>
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
