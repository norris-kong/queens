import { useEffect, useState } from 'react'
import { inspectDraft } from '../core/draft.ts'
import type { Puzzle } from '../core/types.ts'
import { generateInWorker } from './generateInWorker.ts'

export type Generated =
  | { readonly state: 'generating' }
  | { readonly state: 'ready'; readonly puzzle: Puzzle }
  | { readonly state: 'failed' }

/** Generations already started on this page, so coming back to a Puzzle does not wait again. */
const started = new Map<string, Promise<Puzzle | null>>()

/** The Puzzle a seed stands for, generated in a Web Worker once per page load. */
export function puzzleFromSeed(size: number, seed: number): Promise<Puzzle | null> {
  const key = `${size}:${seed}`
  const existing = started.get(key)
  if (existing) return existing
  const pending = generateInWorker(size, seed).then((regions) => {
    const inspection = regions ? inspectDraft(regions) : null
    if (inspection?.valid) return inspection.puzzle
    // A failure should not stick: forget it so that the next visit tries again.
    started.delete(key)
    return null
  })
  started.set(key, pending)
  return pending
}

export function useGeneratedPuzzle(size: number, seed: number): Generated {
  const key = `${size}:${seed}`
  const [result, setResult] = useState<{ readonly key: string; readonly puzzle: Puzzle | null } | null>(null)

  useEffect(() => {
    let current = true
    void puzzleFromSeed(size, seed).then((puzzle) => {
      if (current) setResult({ key, puzzle })
    })
    return () => {
      current = false
    }
  }, [key, size, seed])

  if (result?.key !== key) return { state: 'generating' }
  return result.puzzle ? { state: 'ready', puzzle: result.puzzle } : { state: 'failed' }
}
