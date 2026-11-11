import { useState } from 'react'
import { filterLinkedIn, type LinkedInFilter } from '../core/linkedInFilter.ts'
import { linkedInLibrary } from '../puzzleLibrary.ts'
import { strings } from '../strings.ts'
import { progressStore } from './progressStorage.ts'
import { PuzzleLink } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'

const FILTERS: readonly LinkedInFilter[] = ['unsolved', 'all']

export function LinkedInPage() {
  // Starts on the Puzzles still to play, so the long list opens at the first one not yet Solved.
  const [filter, setFilter] = useState<LinkedInFilter>('unsolved')
  const shown = filterLinkedIn(linkedInLibrary.puzzles, (entry) => progressStore.status(entry.puzzle.id), filter)

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.linkedInTitle}</h1>
      </header>
      <p className="muted">{strings.linkedInNote}</p>
      <div className="filter-tabs" role="group" aria-label={strings.linkedInFilterLabel}>
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className="filter-tab"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {strings.linkedInFilters[option]}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p>{strings.linkedInAllSolved}</p>}
      <ul className="puzzle-list">
        {shown.map((entry) => (
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
