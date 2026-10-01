import type { FileRef } from '../../core/catalog.ts'
import { library } from '../../puzzleLibrary.ts'
import { strings } from '../../strings.ts'
import { editorStrings as text } from './editorStrings.ts'
import { routeHash } from '../routes.ts'


export function EditorSidebar({ current }: { readonly current: FileRef | null }) {
  return (
    <nav className="editor-sidebar card" aria-label={text.libraryHeading}>
      <a href={routeHash({ page: 'editor' })}>{text.newPuzzle}</a>
      {library.sizes.map((group) => (
        <section key={group.size}>
          <h2>{strings.sizeHeading(group.size)}</h2>
          <ul>
            {group.puzzles.map((entry) => {
              const isCurrent = group.size === current?.size && entry.name === current.name
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
      {library.problems.length > 0 && (
        <section>
          <h2>{text.libraryProblems}</h2>
          <ul>
            {library.problems.map((problem) => (
              <li key={`${problem.file.size}/${problem.file.name}`} className="form-error">
                {text.libraryProblem(problem)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </nav>
  )
}
