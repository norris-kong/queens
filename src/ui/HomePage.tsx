import { progressStatus } from '../core/progress.ts'
import { library } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { shownName } from './libraryLookup.ts'
import { progressStore } from './progressStorage.ts'
import { routeHash } from './routes.ts'

const STATUS_TEXT = { completed: strings.statusCompleted, inProgress: strings.statusInProgress, new: '' } as const

export function HomePage() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>{strings.appTitle}</h1>
        <nav style={{ display: 'flex', gap: 16 }}>
          <a href={routeHash({ page: 'rules' })}>{strings.rulesLink}</a>
          {import.meta.env.DEV && <a href={routeHash({ page: 'editor' })}>{strings.editorLink}</a>}
        </nav>
      </header>
      <p className="muted">{strings.tagline}</p>

      {library.sizes.length === 0 && <p>{strings.emptyLibrary}</p>}
      {library.sizes.map((group) => (
        <section key={group.size} className="size-group" aria-labelledby={`size-${group.size}`}>
          <h2 id={`size-${group.size}`}>{strings.sizeHeading(group.size)}</h2>
          <ul className="puzzle-list">
            {group.puzzles.map((entry) => {
              const status = progressStatus(progressStore.load(entry.puzzle))
              return (
                <li key={entry.puzzle.id}>
                  <a className="puzzle-link" href={routeHash({ page: 'play', size: group.size, name: entry.name })}>
                    <span>{strings.puzzleLabel(entry.number, shownName(entry))}</span>
                    {status !== 'new' && (
                      <span className={`status status-${status}`}>
                        {status === 'completed' ? '✓ ' : '● '}
                        {STATUS_TEXT[status]}
                      </span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}
