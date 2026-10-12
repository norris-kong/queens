import { stageSize } from '../core/nightmare.ts'
import { library, linkedInLibrary } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { DailyCard } from './DailyCard.tsx'
import { nightmareStage, progressStore } from './progressStorage.ts'
import { PuzzleLink } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'

function NightmareEntry() {
  const stage = nightmareStage.currentStage()
  return (
    <section className="size-group" aria-labelledby="nightmare">
      <h2 id="nightmare">{strings.nightmareHeading}</h2>
      <a className="entry-link" href={routeHash({ page: 'nightmare' })}>
        <span>{strings.nightmareEntry(stage, stageSize(stage))}</span>
        <span aria-hidden="true">›</span>
      </a>
    </section>
  )
}

function LinkedInEntry() {
  const { puzzles } = linkedInLibrary
  if (puzzles.length === 0) return null
  const solved = puzzles.filter((entry) => progressStore.status(entry.puzzle.id) === 'solved').length
  return (
    <section className="size-group" aria-labelledby="linkedin">
      <h2 id="linkedin">{strings.linkedInTitle}</h2>
      <a className="entry-link" href={routeHash({ page: 'linkedIn' })}>
        <span>{strings.linkedInEntry(puzzles.length, solved)}</span>
        <span aria-hidden="true">›</span>
      </a>
    </section>
  )
}

export function HomePage() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>{strings.appTitle}</h1>
        <nav className="header-links">
          <a href={routeHash({ page: 'rules' })}>{strings.rulesLink}</a>
          {import.meta.env.DEV && <a href={routeHash({ page: 'editor' })}>{strings.editorLink}</a>}
        </nav>
      </header>
      <p className="muted">{strings.tagline}</p>
      <DailyCard />

      {library.sizes.length === 0 && <p>{strings.emptyLibrary}</p>}
      {library.sizes.map((group) => (
        <section key={group.size} className="size-group" aria-labelledby={`size-${group.size}`}>
          <h2 id={`size-${group.size}`}>{strings.levelHeading(group.size)}</h2>
          <ul className="puzzle-list">
            {group.puzzles.map((entry) => (
              <li key={entry.puzzle.id}>
                <PuzzleLink
                  href={routeHash({ page: 'play', size: group.size, name: entry.name })}
                  number={entry.number}
                  puzzle={entry.puzzle}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <NightmareEntry />
      <LinkedInEntry />
    </main>
  )
}
