import { useMemo, useState } from 'react'
import { DEFAULT_DRAFT_SIZE } from '../../config.ts'
import type { FileRef } from '../../core/catalog.ts'
import { inspectDraft } from '../../core/draft.ts'
import { formatPuzzle } from '../../core/puzzleFormat.ts'
import { isValidPuzzleName } from '../../core/puzzleName.ts'
import type { Coord, DraftGrid, RegionId } from '../../core/types.ts'
import { library } from '../../puzzleLibrary.ts'
import { findEntry } from '../libraryLookup.ts'
import { type Route, routeHash } from '../routes.ts'
import { editorApi } from './editorApi.ts'
import type { EditorResult } from './editorProtocol.ts'
import { editorStrings as text } from './editorStrings.ts'
import { emptyDraft, hasAssignedCells, paint } from './draftPainting.ts'
import { useAutoGenerate } from './useAutoGenerate.ts'

/** Reload so the dev server re-reads the Puzzle files into the library. */
function reloadAt(route: Route): void {
  window.location.hash = routeHash(route)
  window.location.reload()
}

function errorText(result: EditorResult): string | null {
  if (result.ok) return null
  const { kind, sameAs } = result.error
  return sameAs ? text.errors[kind] + text.duplicateOf(sameAs.size, sameAs.name) : text.errors[kind]
}

/** The Draft being edited, opened from `stored` when given, plus the editor's actions on it. */
export function useDraftEditor(stored: Partial<FileRef>) {
  const located = stored.size !== undefined && stored.name !== undefined ? findEntry(library, stored.size, stored.name) : null
  const [size, setSize] = useState(located?.size ?? DEFAULT_DRAFT_SIZE)
  const [draft, setDraft] = useState<DraftGrid>(located?.entry.puzzle.regions ?? emptyDraft(size))
  const [name, setName] = useState(located?.entry.name ?? '')
  const [brush, setBrush] = useState<RegionId | null>(0)
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inspection = useMemo(() => inspectDraft(draft), [draft])
  const auto = useAutoGenerate(size, draft, (regions) => setDraft(regions))

  async function run(request: () => Promise<EditorResult>, after: Route) {
    setBusy(true)
    setError(null)
    const result = await request()
    setBusy(false)
    if (result.ok) reloadAt(after)
    else setError(errorText(result))
  }

  return {
    located, size, name, brush, inspection,
    busy: busy || auto.generating,
    generating: auto.generating,
    generate: auto.generate,
    error: error ?? auto.generateError,
    shownDraft: stroke ? paint(draft, stroke, brush) : draft,
    nameValid: isValidPuzzleName(name),
    setName, setBrush, previewPaint: setStroke,
    commitPaint(cells: readonly Coord[]) {
      setStroke(null)
      setDraft((current) => paint(current, cells, brush))
    },
    changeSize(next: number) {
      if (hasAssignedCells(draft) && !window.confirm(text.confirmResize)) return
      setSize(next)
      setDraft(emptyDraft(next))
      setBrush(0)
    },
    save() {
      if (!inspection.valid || !isValidPuzzleName(name)) return
      const request = { size, name, text: formatPuzzle(draft), previousName: located?.entry.name }
      void run(() => editorApi.save(request), { page: 'editor', size, name })
    },
    remove() {
      if (!located || !window.confirm(text.confirmDelete(located.entry.name))) return
      void run(() => editorApi.remove(located.size, located.entry.name), { page: 'editor' })
    },
  }
}

export type DraftEditor = ReturnType<typeof useDraftEditor>
