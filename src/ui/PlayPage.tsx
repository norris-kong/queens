import { saveSlot } from '../core/progress.ts'
import { library } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { findEntry, nextEntry } from './libraryLookup.ts'
import { PlayScreen } from './PlayScreen.tsx'
import { progressStore } from './progressStorage.ts'
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
        <a className="back-link" href={routeHash({ page: 'level', size })}>
          {strings.backToLevel(size)}
        </a>
        {located && <h1>{strings.puzzleTitle(size, located.entry.number)}</h1>}
      </header>
      {located ? (
        <PlayScreen
          // A fresh session per Puzzle, so moving to the next Puzzle starts clean.
          key={located.entry.puzzle.id}
          puzzle={located.entry.puzzle}
          slot={saveSlot(progressStore, located.entry.puzzle.id, located.entry.puzzle)}
          next={
            next
              ? { label: strings.nextPuzzle, go: () => navigate({ page: 'play', size: next.size, name: next.entry.name }) }
              : { label: strings.toNightmare, go: () => navigate({ page: 'nightmare' }) }
          }
        />
      ) : (
        <p>{strings.puzzleNotFound}</p>
      )}
    </main>
  )
}
