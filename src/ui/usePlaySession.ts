import { useEffect, useRef, useState } from 'react'
import { SAVE_INTERVAL_MS } from '../config.ts'
import { getHint, type Hint } from '../core/hint.ts'
import { canUndo, drag, isPlaySolved, type Play, reset, startPlay, tap, undo } from '../core/play.ts'
import { elapsedMs, pause, resume, type Stopwatch, stoppedAt } from '../core/solveTime.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { progressStore } from './progressStorage.ts'

export interface PlaySessionOptions {
  /** Keep progress between visits. Off for an editor play-test, which must leave no trace. */
  readonly persist: boolean
}

/**
 * One sitting at a Puzzle: the Play, its Solve Time (running only while the page is visible and the
 * Puzzle unsolved), Hints, and saving it all after every Move and every few seconds.
 */
export function usePlaySession(puzzle: Puzzle, { persist }: PlaySessionOptions) {
  const [saved] = useState(() => (persist ? progressStore.load(puzzle) : null))
  const [play, setPlay] = useState<Play>(() => startPlay(puzzle, saved?.board))
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? 0)
  const [completed, setCompleted] = useState(saved?.completed ?? false)
  const [solvedTimeMs, setSolvedTimeMs] = useState<number | null>(() =>
    isPlaySolved(play) ? (saved?.solveTimeMs ?? 0) : null,
  )
  const stopwatch = useRef<Stopwatch>(stoppedAt(saved?.solveTimeMs ?? 0))
  const solved = isPlaySolved(play)

  // Save after every change, and keep Solve Time running only while the page is visible.
  const latest = useRef({ play, hintsUsed, completed })
  useEffect(() => {
    latest.current = { play, hintsUsed, completed }
    if (persist) {
      progressStore.save(puzzle.id, {
        board: play.board,
        solveTimeMs: elapsedMs(stopwatch.current, Date.now()),
        hintsUsed,
        completed,
      })
    }
  }, [persist, puzzle.id, play, hintsUsed, completed])

  useEffect(() => {
    if (solved) return
    const save = () => {
      if (!persist) return
      const { play: current, hintsUsed: hints, completed: done } = latest.current
      progressStore.save(puzzle.id, {
        board: current.board,
        solveTimeMs: elapsedMs(stopwatch.current, Date.now()),
        hintsUsed: hints,
        completed: done,
      })
    }
    const syncVisibility = () => {
      const now = Date.now()
      stopwatch.current = document.hidden ? pause(stopwatch.current, now) : resume(stopwatch.current, now)
      if (document.hidden) save()
    }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    window.addEventListener('pagehide', save)
    const timer = window.setInterval(save, SAVE_INTERVAL_MS)
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility)
      window.removeEventListener('pagehide', save)
      window.clearInterval(timer)
      stopwatch.current = pause(stopwatch.current, Date.now())
      save()
    }
  }, [solved, persist, puzzle.id])

  function applyMove(next: Play) {
    setStroke(null)
    if (next === play) return
    setHint(null)
    if (isPlaySolved(next)) {
      stopwatch.current = pause(stopwatch.current, Date.now())
      setSolvedTimeMs(stopwatch.current.accumulatedMs)
      setCompleted(true)
    }
    setPlay(next)
  }

  function showHint() {
    const next = getHint(puzzle, play.board)
    setHint(next)
    if (next) setHintsUsed((count) => count + 1)
  }

  function replay() {
    stopwatch.current = resume(stoppedAt(0), Date.now())
    setPlay(startPlay(puzzle))
    setHint(null)
    setHintsUsed(0)
    setSolvedTimeMs(null)
  }

  const shownBoard = stroke ? drag(play, stroke).board : play.board

  return {
    board: shownBoard,
    solved,
    hint,
    hintsUsed,
    solvedTimeMs,
    canUndo: canUndo(play),
    canReset: !solved && play.board.some((row) => row.some((state) => state !== 'empty')),
    tap: (cell: Coord) => applyMove(tap(play, cell)),
    previewDrag: (cells: readonly Coord[] | null) => setStroke(cells),
    commitDrag: (cells: readonly Coord[]) => applyMove(drag(play, cells)),
    undo: () => applyMove(undo(play)),
    reset: () => applyMove(reset(play)),
    showHint,
    replay,
  }
}
