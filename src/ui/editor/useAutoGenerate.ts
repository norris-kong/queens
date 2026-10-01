import { useState } from 'react'
import type { DraftGrid, RegionGrid } from '../../core/types.ts'
import { editorStrings as text } from './editorStrings.ts'
import { generateInWorker } from './generateInWorker.ts'
import { hasAssignedCells } from './draftPainting.ts'

/** The editor's 自動出題 action: replaces the Draft with a freshly generated Puzzle layout. */
export function useAutoGenerate(size: number, draft: DraftGrid, onGenerated: (regions: RegionGrid) => void) {
  const [generating, setGenerating] = useState(false)
  const [failed, setFailed] = useState(false)

  async function generate() {
    if (hasAssignedCells(draft) && !window.confirm(text.confirmGenerate)) return
    setGenerating(true)
    setFailed(false)
    const regions = await generateInWorker(size)
    setGenerating(false)
    if (regions) onGenerated(regions)
    else setFailed(true)
  }

  return { generating, generateError: failed ? text.generateFailed : null, generate }
}
