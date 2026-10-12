import type { Puzzle } from '../core/types.ts'
import { library } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { levelArt } from './levelArt.ts'
import { Lettering, LetteringTitle } from './Lettering.tsx'
import { fittingFontSize } from './letteringMetrics.ts'
import { progressStore } from './progressStorage.ts'
import { StatusMark } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'

/** The numbering badge's own size, and the room its number may take. */
const BADGE_SIDE = 485
const NUMBER_WIDTH = 330
const NUMBER_MAX_FONT_SIZE = 200

function StageLink({ size, name, number, puzzle }: { readonly size: number; readonly name: string; readonly number: number; readonly puzzle: Puzzle }) {
  const art = levelArt(size)
  const status = progressStore.status(puzzle.id)
  const label = String(number)
  return (
    <a className="stage-link" href={routeHash({ page: 'play', size, name })}>
      <svg viewBox={`0 0 ${BADGE_SIDE} ${BADGE_SIDE}`}>
        <image href={art.stage} width={BADGE_SIDE} height={BADGE_SIDE} />
        <Lettering
          text={label}
          x={BADGE_SIDE / 2}
          y={BADGE_SIDE / 2}
          fontSize={fittingFontSize(label, NUMBER_WIDTH, NUMBER_MAX_FONT_SIZE)}
          ink={art.ink}
        />
      </svg>
      {status !== 'new' && <StatusMark status={status} />}
    </a>
  )
}

/** One Level's Puzzles, each on the Level's numbering badge. */
export function LevelPage({ size }: { readonly size: number }) {
  const group = library.sizes.find((candidate) => candidate.size === size)
  const art = levelArt(size)

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        {group && (
          <h1>
            <LetteringTitle text={art.name} ink={art.ink} />
          </h1>
        )}
      </header>
      {group ? (
        <ul className="stage-grid">
          {group.puzzles.map((entry) => (
            <li key={entry.puzzle.id}>
              <StageLink size={size} name={entry.name} number={entry.number} puzzle={entry.puzzle} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{strings.pageNotFound}</p>
      )}
    </main>
  )
}
