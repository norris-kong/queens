import { library, linkedInLibrary } from '../../puzzleLibrary.ts'
import { strings } from '../../strings.ts'
import { routeHash } from '../routes.ts'
import type { Opened } from './editorTarget.ts'
import { editorStrings as text } from './editorStrings.ts'

function LinkedInSection({ current }: { readonly current: Opened | null }) {
  const { puzzles } = linkedInLibrary
  if (puzzles.length === 0) return null
  return (
    <details open={current?.kind === 'linkedIn'}>
      <summary>{text.linkedInHeading(puzzles.length)}</summary>
      <ul>
        {puzzles.map((entry) => (
          <li key={entry.puzzle.id}>
            <a
              href={routeHash({ page: 'editor', linkedIn: entry.number })}
              aria-current={current?.kind === 'linkedIn' && current.number === entry.number ? 'page' : undefined}
            >
              {text.linkedInLabel(entry.number)}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

function Problems() {
  const own = library.problems.map((problem) => ({ key: `${problem.file.size}/${problem.file.name}`, message: text.libraryProblem(problem) }))
  const linkedIn = linkedInLibrary.problems.map((problem) => ({ key: `LinkedIn/${problem.name}`, message: text.linkedInProblem(problem) }))
  const all = [...own, ...linkedIn]
  if (all.length === 0) return null
  return (
    <section>
      <h2>{text.libraryProblems}</h2>
      <ul>
        {all.map((problem) => (
          <li key={problem.key} className="form-error">
            {problem.message}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function EditorSidebar({ current }: { readonly current: Opened | null }) {
  return (
    <nav className="editor-sidebar card" aria-label={text.libraryHeading}>
      <a href={routeHash({ page: 'editor' })}>{text.newPuzzle}</a>
      {library.sizes.map((group) => (
        <section key={group.size}>
          <h2>{strings.sizeHeading(group.size)}</h2>
          <ul>
            {group.puzzles.map((entry) => {
              const isCurrent = current?.kind === 'own' && group.size === current.size && entry.name === current.name
              return (
                <li key={entry.puzzle.id}>
                  <a
                    href={routeHash({ page: 'editor', size: group.size, name: entry.name })}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {strings.puzzleLabel(entry.number, entry.name)}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <LinkedInSection current={current} />
      <Problems />
    </nav>
  )
}
