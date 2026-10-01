import type { DraftInspection } from '../../core/draft.ts'
import { regionLetter } from '../../core/puzzleFormat.ts'
import type { Coord, RegionId } from '../../core/types.ts'
import { strings } from '../../strings.ts'
import { BoardView, type CellView } from '../BoardView.tsx'
import { QueenIcon } from '../icons.tsx'
import type { DraftEditor } from './useDraftEditor.ts'

/** Overlays that help the author: the Solution when unique, two diverging Solutions when not. */
function solutionOverlay(inspection: DraftInspection, cell: Coord): CellView['content'] {
  if (inspection.valid) {
    return inspection.puzzle.solution[cell.row] === cell.col ? <QueenIcon className="is-faint" /> : null
  }
  const multiple = inspection.problems.find((problem) => problem.kind === 'multipleSolutions')
  if (!multiple) return null
  const tags = multiple.solutions.flatMap((solution, index) => (solution[cell.row] === cell.col ? [index + 1] : []))
  return tags.length > 0 ? <span className="solution-tag">{tags.join('·')}</span> : null
}

function disconnectedRegions(inspection: DraftInspection): ReadonlySet<RegionId> {
  if (inspection.valid) return new Set()
  return new Set(inspection.problems.flatMap((problem) => (problem.kind === 'disconnectedRegions' ? problem.regions : [])))
}

export function DraftBoard({ editor }: { readonly editor: DraftEditor }) {
  const disconnected = disconnectedRegions(editor.inspection)

  function renderCell(cell: Coord): CellView {
    const region = editor.shownDraft[cell.row]?.[cell.col] ?? null
    return {
      label: strings.cellLabel(cell.row, cell.col, region === null ? strings.cellStates.empty : regionLetter(region)),
      content: solutionOverlay(editor.inspection, cell),
      className: region !== null && disconnected.has(region) ? 'is-striped' : '',
    }
  }

  return (
    <BoardView
      regions={editor.shownDraft}
      label={strings.boardLabel}
      renderCell={renderCell}
      onTap={(cell) => editor.commitPaint([cell])}
      onPreview={editor.previewPaint}
      onCommit={editor.commitPaint}
    />
  )
}
