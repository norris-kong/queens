import { type Board, type CellState, emptyBoard, withCells } from '../core/board.ts'
import { inspectDraft } from '../core/draft.ts'
import { parsePuzzle } from '../core/puzzleFormat.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { BoardGrid } from './BoardGrid.tsx'
import { cellView, highlightsFor } from './playCells.tsx'
import { routeHash } from './routes.ts'

/** A small layout used only to illustrate the rules; it is not in the Puzzle library. */
const EXAMPLE_LAYOUT = 'AABBC\nDDBCC\nDDDCC\nDDDCC\nDDDEC'

function examplePuzzle(): Puzzle | null {
  const parsed = parsePuzzle(EXAMPLE_LAYOUT)
  const inspection = parsed.ok ? inspectDraft(parsed.grid) : null
  return inspection?.valid ? inspection.puzzle : null
}

const at = (row: number, col: number): Coord => ({ row, col })
const place = (state: CellState, ...cells: Coord[]) => cells.map((coord) => ({ coord, state }))

const EXAMPLES: readonly { readonly caption: string; readonly board: Board }[] = [
  {
    caption: strings.examples.row,
    board: withCells(emptyBoard(5), [...place('queen', at(2, 1)), ...place('mark', at(2, 0), at(2, 2), at(2, 3), at(2, 4))]),
  },
  {
    caption: strings.examples.column,
    board: withCells(emptyBoard(5), [...place('queen', at(2, 1)), ...place('mark', at(0, 1), at(1, 1), at(3, 1), at(4, 1))]),
  },
  { caption: strings.examples.region, board: withCells(emptyBoard(5), place('queen', at(0, 4), at(3, 3))) },
  { caption: strings.examples.adjacent, board: withCells(emptyBoard(5), place('queen', at(1, 2), at(2, 1))) },
]

export function RulesPage() {
  const puzzle = examplePuzzle()

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.rulesTitle}</h1>
      </header>
      <ol className="rules-list">
        {strings.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <p className="muted">{strings.rulesTips}</p>

      {puzzle && (
        <>
          <h2>{strings.examplesTitle}</h2>
          <div className="examples">
            {EXAMPLES.map((example) => {
              const highlights = highlightsFor(puzzle, example.board)
              return (
                <figure key={example.caption} className="example">
                  <BoardGrid
                    regions={puzzle.regions}
                    label={example.caption}
                    disabled
                    renderCell={(cell) => cellView(example.board, highlights, null, false, cell)}
                  />
                  <figcaption>{example.caption}</figcaption>
                </figure>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
