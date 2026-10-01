import { type Board, type CellState, emptyBoard, withCells } from '../core/board.ts'
import { readPuzzle } from '../core/puzzleFile.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { strings } from '../strings.ts'
import { BoardView } from './BoardView.tsx'
import { cellView, highlightsFor } from './playCells.tsx'
import { routeHash } from './routes.ts'

/** A small layout used only to illustrate the rules; it is not in the Puzzle library. */
const EXAMPLE_LAYOUT = 'AABBC\nDDBCC\nDDDCC\nDDDCC\nDDDEC'

function examplePuzzle(): Puzzle | null {
  const read = readPuzzle(EXAMPLE_LAYOUT)
  if (read.ok) return read.puzzle
  console.error('The rules-page example layout is not a valid Puzzle; examples are hidden', read)
  return null
}

const at = (row: number, col: number): Coord => ({ row, col })
const place = (state: CellState, ...cells: Coord[]) => cells.map((coord) => ({ coord, state }))

/** Each example's Queens and Marks on the 5×5 example layout. */
const EXAMPLES: readonly { readonly caption: string; readonly cells: ReturnType<typeof place> }[] = [
  {
    caption: strings.examples.row,
    cells: [...place('queen', at(2, 1)), ...place('mark', at(2, 0), at(2, 2), at(2, 3), at(2, 4))],
  },
  {
    caption: strings.examples.column,
    cells: [...place('queen', at(2, 1)), ...place('mark', at(0, 1), at(1, 1), at(3, 1), at(4, 1))],
  },
  { caption: strings.examples.region, cells: place('queen', at(0, 4), at(3, 3)) },
  { caption: strings.examples.adjacent, cells: place('queen', at(1, 2), at(2, 1)) },
]

function exampleBoard(puzzle: Puzzle, cells: ReturnType<typeof place>): Board {
  return withCells(emptyBoard(puzzle.size), cells)
}

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
              const board = exampleBoard(puzzle, example.cells)
              const highlights = highlightsFor(puzzle, board)
              return (
                <figure key={example.caption} className="example">
                  <BoardView
                    regions={puzzle.regions}
                    label={example.caption}
                    disabled
                    renderCell={(cell) => cellView(board, highlights, null, false, cell)}
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
