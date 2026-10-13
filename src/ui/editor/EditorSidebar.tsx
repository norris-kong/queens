import { levelName } from '../../core/level.ts'
import { library, linkedInLibrary } from '../../puzzleLibrary.ts'
import { strings } from '../../strings.ts'
import { type Collection, type Route, routeHash } from '../routes.ts'
import type { Opened } from './editorTarget.ts'
import { editorStrings as text } from './editorStrings.ts'

interface Chip {
  readonly key: string
  readonly number: number
  /** The full name, shown on hover and read out instead of the bare number. */
  readonly label: string
  readonly route: Route
  readonly current: boolean
}

/** One collapsible group of Puzzles, each a small square showing only its number. */
function ChipGroup({ title, chips, open }: { readonly title: string; readonly chips: readonly Chip[]; readonly open: boolean }) {
  return (
    <details open={open}>
      <summary>{title}</summary>
      <ul className="editor-chips">
        {chips.map((chip) => (
          <li key={chip.key}>
            <a
              href={routeHash(chip.route)}
              title={chip.label}
              aria-label={chip.label}
              aria-current={chip.current ? 'page' : undefined}
            >
              {chip.number}
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

interface EditorSidebarProps {
  /** The stored Puzzle open in the editor, if any. */
  readonly current: Opened | null
  /** The Draft's Size and collection: their group starts open, so its Puzzles are in view. */
  readonly size: number
  readonly collection: Collection
}

/** The library by Level, then the LinkedIn Puzzles, each group folded away unless it holds what is being edited. */
export function EditorSidebar({ current, size, collection }: EditorSidebarProps) {
  const openGroup = current?.kind === 'linkedIn' || collection === 'linkedIn' ? 'linkedIn' : (current?.puzzle.size ?? size)
  return (
    <nav className="editor-sidebar card" aria-label={text.libraryHeading}>
      <a href={routeHash({ page: 'editor' })}>{text.newPuzzle}</a>
      {library.sizes.map((group) => (
        <ChipGroup
          key={group.size}
          title={text.levelGroup(levelName(group.size), strings.sizeHeading(group.size), group.puzzles.length)}
          open={openGroup === group.size}
          chips={group.puzzles.map((entry) => ({
            key: entry.puzzle.id,
            number: entry.number,
            label: entry.name,
            route: { page: 'editor', size: group.size, name: entry.name },
            current: current?.kind === 'own' && current.size === group.size && current.name === entry.name,
          }))}
        />
      ))}
      {linkedInLibrary.puzzles.length > 0 && (
        <ChipGroup
          title={text.linkedInHeading(linkedInLibrary.puzzles.length)}
          open={openGroup === 'linkedIn'}
          chips={linkedInLibrary.puzzles.map((entry) => ({
            key: entry.puzzle.id,
            number: entry.number,
            label: text.linkedInLabel(entry.number),
            route: { page: 'editor', linkedIn: entry.number },
            current: current?.kind === 'linkedIn' && current.number === entry.number,
          }))}
        />
      )}
      <Problems />
    </nav>
  )
}
