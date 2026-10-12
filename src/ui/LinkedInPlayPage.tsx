import { nextLinkedIn } from '../core/linkedInCatalog.ts'
import { saveSlot } from '../core/progress.ts'
import { linkedInLibrary } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { PlayScreen } from './PlayScreen.tsx'
import { progressStore } from './progressStorage.ts'
import { routeHash } from './routes.ts'
import { navigate } from './useHashRoute.ts'

export function LinkedInPlayPage({ number }: { readonly number: number }) {
  const entry = linkedInLibrary.puzzles.find((candidate) => candidate.number === number) ?? null
  const next = nextLinkedIn(linkedInLibrary, number)

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'linkedIn' })}>
          {strings.backToLinkedIn}
        </a>
        {entry && <h1>{strings.linkedInPuzzleTitle(number)}</h1>}
      </header>
      {entry ? (
        <PlayScreen
          key={entry.puzzle.id}
          puzzle={entry.puzzle}
          slot={saveSlot(progressStore, entry.puzzle.id, entry.puzzle)}
          next={next ? { label: strings.nextPuzzle, go: () => navigate({ page: 'linkedInPlay', number: next.number }) } : undefined}
          solvedNote={next ? undefined : strings.lastPuzzle}
        />
      ) : (
        <p>{strings.puzzleNotFound}</p>
      )}
    </main>
  )
}
