import { useMemo, useState } from 'react'
import { inspectDraft } from '../../core/draft.ts'
import { parseLinkedInNumber } from '../../core/linkedInCatalog.ts'
import { formatPuzzle } from '../../core/puzzleFormat.ts'
import { isValidPuzzleName } from '../../core/puzzleName.ts'
import type { Coord, DraftGrid, RegionId } from '../../core/types.ts'
import { type Route, routeHash } from '../routes.ts'
import { navigate } from '../useHashRoute.ts'
import { editorApi } from './editorApi.ts'
import type { EditorResult } from './editorProtocol.ts'
import { editorStrings as text } from './editorStrings.ts'
import {
  type Collection,
  type EditorTarget,
  type Opened,
  openTarget,
  startingCollection,
  startingSize,
  suggestedLinkedInNumber,
  suggestedName,
} from './editorTarget.ts'
import { emptyDraft, hasAssignedCells, paint } from './draftPainting.ts'
import { useAutoGenerate } from './useAutoGenerate.ts'

/** Reload so the dev server re-reads the Puzzle files into the library. */
function reloadAt(route: Route): void {
  window.location.hash = routeHash(route)
  window.location.reload()
}

function errorText(result: EditorResult): string | null {
  if (result.ok) return null
  const { kind, sameAs, number } = result.error
  if (sameAs) return text.errors[kind] + text.duplicateOf(sameAs.size, sameAs.name)
  return number === undefined ? text.errors[kind] : text.errors[kind] + text.linkedInNumber(number)
}

function openedLabel(opened: Opened): string {
  return opened.kind === 'own' ? opened.name : text.linkedInLabel(opened.number)
}

/** The Draft being edited, opened from `stored` when given, plus the editor's actions on it. */
export function useDraftEditor(stored: EditorTarget) {
  const opened = openTarget(stored)
  const [collection, setCollection] = useState<Collection>(() => startingCollection(stored, opened))
  const [size, setSize] = useState(() => startingSize(stored, opened))
  const [draft, setDraft] = useState<DraftGrid>(opened?.puzzle.regions ?? emptyDraft(size))
  const [name, setName] = useState(opened?.kind === 'own' ? opened.name : suggestedName(size))
  const [numberText, setNumberText] = useState(String(opened?.kind === 'linkedIn' ? opened.number : suggestedLinkedInNumber()))
  const [brush, setBrush] = useState<RegionId | null>(0)
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inspection = useMemo(() => inspectDraft(draft), [draft])
  const auto = useAutoGenerate(size, draft, (regions) => setDraft(regions))
  const savedName = name.trim()
  const linkedInNumber = parseLinkedInNumber(numberText)
  const nameValid = isValidPuzzleName(savedName)
  const numberValid = linkedInNumber !== null

  async function run(request: () => Promise<EditorResult>, after: Route) {
    setBusy(true)
    setError(null)
    const result = await request()
    setBusy(false)
    if (result.ok) reloadAt(after)
    else setError(errorText(result))
  }

  function saveLinkedIn(number: number, puzzleText: string) {
    const previousNumber = opened?.kind === 'linkedIn' ? opened.number : undefined
    void run(() => editorApi.saveLinkedIn({ number, text: puzzleText, previousNumber }), { page: 'editor', linkedIn: number })
  }

  function saveOwn(puzzleText: string) {
    const previousName = opened?.kind === 'own' ? opened.name : undefined
    void run(() => editorApi.save({ size, name: savedName, text: puzzleText, previousName }), { page: 'editor', size, name: savedName })
  }

  return {
    opened, collection, size, name, numberText, brush, inspection, nameValid, numberValid,
    busy: busy || auto.generating,
    generating: auto.generating,
    generate: auto.generate,
    error: error ?? auto.generateError,
    shownDraft: stroke ? paint(draft, stroke, brush) : draft,
    /** Whether the name or LinkedIn number the Draft would be saved under is acceptable. */
    targetValid: collection === 'own' ? nameValid : numberValid,
    setCollection, setName, setNumberText, setBrush, previewPaint: setStroke,
    commitPaint(cells: readonly Coord[]) {
      setStroke(null)
      setDraft((current) => paint(current, cells, brush))
    },
    changeSize(next: number) {
      if (hasAssignedCells(draft) && !window.confirm(text.confirmResize)) return
      setSize(next)
      setName(suggestedName(next))
      setDraft(emptyDraft(next))
      setBrush(0)
    },
    save() {
      if (!inspection.valid) return
      const puzzleText = formatPuzzle(draft)
      if (collection === 'linkedIn' && linkedInNumber !== null) saveLinkedIn(linkedInNumber, puzzleText)
      else if (collection === 'own' && nameValid) saveOwn(puzzleText)
    },
    /** Leaves the stored Puzzle for a new Draft of the same Size and collection, to make the next one. */
    createNext() {
      if (opened && draft !== opened.puzzle.regions && !window.confirm(text.confirmDiscard)) return
      navigate({ page: 'editor', size, collection })
    },
    remove() {
      if (!opened || !window.confirm(text.confirmDelete(openedLabel(opened)))) return
      const request = () =>
        opened.kind === 'own' ? editorApi.remove(opened.size, opened.name) : editorApi.removeLinkedIn(opened.number)
      void run(request, { page: 'editor' })
    },
  }
}

export type DraftEditor = ReturnType<typeof useDraftEditor>
