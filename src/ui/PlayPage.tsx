import { library } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { findEntry, nextEntry, shownName } from './libraryLookup.ts'
import { PlayScreen } from './PlayScreen.tsx'
import { routeHash } from './routes.ts'
import { navigate } from './useHashRoute.ts'

interface PlayPageProps {
  readonly size: number
  readonly name: string
}

export function PlayPage({ size, name }: PlayPageProps) {
  const located = findEntry(library, size, name)
  const next = nextEntry(library, size, name)

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        {located && <h1>{strings.puzzleTitle(size, located.entry.number, shownName(located.entry))}</h1>}
      </header>
      {located ? (
        <PlayScreen
          // A fresh session per Puzzle, so moving to the next Puzzle starts clean.
          key={located.entry.puzzle.id}
          puzzle={located.entry.puzzle}
          persist
          onNext={next ? () => navigate({ page: 'play', size: next.size, name: next.entry.name }) : undefined}
        />
      ) : (
        <p>{strings.puzzleNotFound}</p>
      )}
    </main>
  )
}
