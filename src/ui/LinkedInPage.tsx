import { linkedInLibrary } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { PuzzleLink } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'

export function LinkedInPage() {
  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.linkedInTitle}</h1>
      </header>
      <p className="muted">{strings.linkedInNote}</p>
      <ul className="puzzle-list">
        {linkedInLibrary.puzzles.map((entry) => (
          <li key={entry.number}>
            <PuzzleLink
              href={routeHash({ page: 'linkedInPlay', number: entry.number })}
              number={entry.number}
              puzzle={entry.puzzle}
            />
          </li>
        ))}
      </ul>
    </main>
  )
}
