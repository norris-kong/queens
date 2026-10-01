import { library } from '../../puzzleLibrary.ts'
import { strings } from '../../strings.ts'
import { routeHash } from '../routes.ts'

interface EditorSidebarProps {
  readonly currentSize?: number
  readonly currentName?: string
}

export function EditorSidebar({ currentSize, currentName }: EditorSidebarProps) {
  return (
    <nav className="editor-sidebar card" aria-label={strings.editor.libraryHeading}>
      <a href={routeHash({ page: 'editor' })}>{strings.editor.newPuzzle}</a>
      {library.sizes.map((group) => (
        <section key={group.size}>
          <h2>{strings.sizeHeading(group.size)}</h2>
          <ul>
            {group.puzzles.map((entry) => {
              const current = group.size === currentSize && entry.name === currentName
              return (
                <li key={entry.puzzle.id}>
                  <a
                    href={routeHash({ page: 'editor', size: group.size, name: entry.name })}
                    aria-current={current ? 'page' : undefined}
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
          <h2>{strings.editor.libraryProblems}</h2>
          <ul>
            {library.problems.map((problem) => (
              <li key={`${problem.file.size}/${problem.file.name}`} className="form-error">
                {strings.editor.libraryProblem(problem)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </nav>
  )
}
