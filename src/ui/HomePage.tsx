import { stageSize } from '../core/nightmare.ts'
import { library, linkedInLibrary } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { DailyCard } from './DailyCard.tsx'
import { LevelButton } from './LevelButton.tsx'
import { nightmareStage, progressStore } from './progressStorage.ts'
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
      {library.sizes.length > 0 && (
        <section className="size-group" aria-labelledby="levels">
          <h2 id="levels" className="visually-hidden">
            {strings.levelsHeading}
          </h2>
          <ul className="level-grid">
            {library.sizes.map((group) => (
              <li key={group.size}>
                <LevelButton size={group.size} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <NightmareEntry />
      <LinkedInEntry />
    </main>
  )
}
