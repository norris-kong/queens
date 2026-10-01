import { type CSSProperties, useMemo, useState } from 'react'
import { DEFAULT_DRAFT_SIZE, REGION_COLORS } from '../../config.ts'
import { type DraftInspection, inspectDraft } from '../../core/draft.ts'
import { formatPuzzle, regionLetter } from '../../core/puzzleFormat.ts'
import { isValidPuzzleName } from '../../core/puzzleName.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'
import type { Coord, DraftGrid, RegionId } from '../../core/types.ts'
import { library } from '../../puzzleLibrary.ts'
import { strings } from '../../strings.ts'
import { BoardGrid, type CellView } from '../BoardGrid.tsx'
import { QueenIcon } from '../icons.tsx'
import { findEntry } from '../libraryLookup.ts'
import { PlayScreen } from '../PlayScreen.tsx'
import { type Route, routeHash } from '../routes.ts'
import { DraftReport } from './DraftReport.tsx'
import { EditorSidebar } from './EditorSidebar.tsx'
import { editorApi, type EditorResult } from './editorApi.ts'
import { emptyDraft, hasAssignedCells, paint } from './draftPainting.ts'

interface EditorPageProps {
  readonly size?: number
  readonly name?: string
}

const SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, index) => MIN_SIZE + index)

/** Reload so the dev server re-reads the Puzzle files into the library. */
function reloadAt(route: Route): void {
  window.location.hash = routeHash(route)
  window.location.reload()
}

function errorText(result: EditorResult): string | null {
  if (result.ok) return null
  const { kind, sameAs } = result.error
  const base = strings.editor.errors[kind] ?? strings.editor.errors.serverError
  return sameAs ? base + strings.editor.duplicateOf(sameAs.size, sameAs.name) : base
}

/** Overlays that help the author: the Solution when unique, two diverging Solutions when not. */
function cellOverlay(inspection: DraftInspection, cell: Coord): CellView['content'] {
  if (inspection.valid) {
    return inspection.puzzle.solution[cell.row] === cell.col ? <QueenIcon className="is-faint" /> : null
  }
  const multiple = inspection.problems.find((problem) => problem.kind === 'multipleSolutions')
  if (!multiple) return null
  const tags = multiple.solutions.flatMap((solution, index) => (solution[cell.row] === cell.col ? [index + 1] : []))
  return tags.length > 0 ? <span className="solution-tag">{tags.join('·')}</span> : null
}

function disconnectedRegions(inspection: DraftInspection): ReadonlySet<RegionId> {
  if (inspection.valid) return new Set()
  return new Set(inspection.problems.flatMap((problem) => (problem.kind === 'disconnectedRegions' ? problem.regions : [])))
}

export default function EditorPage({ size: routeSize, name: routeName }: EditorPageProps) {
  const located = routeSize !== undefined && routeName !== undefined ? findEntry(library, routeSize, routeName) : null
  const editing = located !== null
  const [size, setSize] = useState(located?.size ?? DEFAULT_DRAFT_SIZE)
  const [draft, setDraft] = useState<DraftGrid>(located?.entry.puzzle.regions ?? emptyDraft(size))
  const [name, setName] = useState(located?.entry.name ?? '')
  const [brush, setBrush] = useState<RegionId | null>(0)
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [playtesting, setPlaytesting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inspection = useMemo(() => inspectDraft(draft), [draft])
  const shownDraft = stroke ? paint(draft, stroke, brush) : draft
  const broken = disconnectedRegions(inspection)
  const nameValid = isValidPuzzleName(name)

  function commitPaint(cells: readonly Coord[]) {
    setStroke(null)
    setDraft((current) => paint(current, cells, brush))
  }

  function changeSize(next: number) {
    if (hasAssignedCells(draft) && !window.confirm(strings.editor.confirmResize)) return
    setSize(next)
    setDraft(emptyDraft(next))
    setBrush(0)
  }

  async function save() {
    if (!inspection.valid || !nameValid) return
    setBusy(true)
    setError(null)
    const result = await editorApi.save({ size, name, text: formatPuzzle(draft), previousName: located?.entry.name })
    setBusy(false)
    if (result.ok) reloadAt({ page: 'editor', size, name })
    else setError(errorText(result))
  }

  async function remove() {
    if (!located || !window.confirm(strings.editor.confirmDelete(located.entry.name))) return
    setBusy(true)
    const result = await editorApi.remove(located.size, located.entry.name)
    setBusy(false)
    if (result.ok) reloadAt({ page: 'editor' })
    else setError(errorText(result))
  }

  function renderCell(cell: Coord): CellView {
    const region = shownDraft[cell.row]?.[cell.col] ?? null
    return {
      label: strings.cellLabel(cell.row, cell.col, region === null ? strings.cellStates.empty : regionLetter(region)),
      content: cellOverlay(inspection, cell),
      className: region !== null && broken.has(region) ? 'is-striped' : '',
    }
  }

  if (playtesting && inspection.valid) {
    return (
      <main className="page">
        <header className="page-header">
          <button type="button" className="button" onClick={() => setPlaytesting(false)}>
            {strings.editor.backToEditing}
          </button>
          <h1>{strings.editor.playtest}</h1>
        </header>
        <PlayScreen key={inspection.puzzle.id} puzzle={inspection.puzzle} persist={false} />
      </main>
    )
  }

  return (
    <main className="page page-wide">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.editor.title}</h1>
      </header>
      {routeName !== undefined && !editing && <p className="form-error">{strings.editor.notFound}</p>}

      <div className="editor-layout">
        <EditorSidebar currentSize={located?.size} currentName={located?.entry.name} />

        <section>
          <div className="field-row">
            <label className="field">
              {strings.editor.size}
              <select value={size} disabled={editing} onChange={(event) => changeSize(Number(event.target.value))}>
                {SIZES.map((option) => (
                  <option key={option} value={option}>
                    {strings.sizeHeading(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {strings.editor.name}
              <input
                value={name}
                placeholder={strings.editor.namePlaceholder}
                autoCapitalize="off"
                spellCheck={false}
                aria-invalid={name !== '' && !nameValid}
                onChange={(event) => setName(event.target.value.trim())}
              />
            </label>
          </div>
          {name !== '' && !nameValid && <p className="form-error">{strings.editor.nameRule}</p>}

          <div className="palette" role="toolbar">
            {Array.from({ length: size }, (_, region) => (
              <button
                key={region}
                type="button"
                className="swatch"
                aria-pressed={brush === region}
                aria-label={strings.editor.regionSwatch(regionLetter(region))}
                style={{ '--swatch': REGION_COLORS[region] } as CSSProperties}
                onClick={() => setBrush(region)}
              >
                {regionLetter(region)}
              </button>
            ))}
            <button
              type="button"
              className="swatch"
              aria-pressed={brush === null}
              aria-label={strings.editor.eraserLabel}
              onClick={() => setBrush(null)}
            >
              ⌫
            </button>
          </div>

          <BoardGrid
            regions={shownDraft}
            label={strings.boardLabel}
            renderCell={renderCell}
            onTap={(cell) => commitPaint([cell])}
            onPreview={setStroke}
            onCommit={commitPaint}
          />

          <DraftReport inspection={inspection} />
          {error && <p className="form-error">{error}</p>}

          <div className="button-row">
            <button
              type="button"
              className="button button-primary"
              disabled={busy || !inspection.valid || !nameValid}
              onClick={save}
            >
              {busy ? strings.editor.saving : strings.editor.save}
            </button>
            <button type="button" className="button" disabled={!inspection.valid} onClick={() => setPlaytesting(true)}>
              {strings.editor.playtest}
            </button>
            {editing && (
              <button type="button" className="button" disabled={busy} onClick={remove}>
                {strings.editor.remove}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
