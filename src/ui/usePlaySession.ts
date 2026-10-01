import { useEffect, useRef, useState } from 'react'
import { isBoardEmpty } from '../core/board.ts'
import { getHint, type Hint } from '../core/hint.ts'
import { canUndo, drag, isPlaySolved, type Play, reset, startPlay, tap, undo } from '../core/play.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { progressStore } from './progressStorage.ts'
import { useSolveTimer } from './useSolveTimer.ts'

export interface PlaySessionOptions {
  /** Keep progress between visits. Off for an editor play-test, which must leave no trace. */
  readonly persist: boolean
}

/**
 * One sitting at a Puzzle: the Play, its Solve Time (running only while the page is visible and the
 * Puzzle unsolved), Hints, and saving it all after every change and every few seconds.
 */
export function usePlaySession(puzzle: Puzzle, { persist }: PlaySessionOptions) {
  const [saved] = useState(() => (persist ? progressStore.load(puzzle) : null))
  const [play, setPlay] = useState<Play>(() => startPlay(puzzle, saved?.board))
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? 0)
  const [everSolved, setEverSolved] = useState(saved?.everSolved ?? false)
  const [solvedTimeMs, setSolvedTimeMs] = useState(() => (isPlaySolved(play) ? (saved?.solveTimeMs ?? 0) : null))
  const solved = isPlaySolved(play)

  const latest = useRef({ board: play.board, hintsUsed, everSolved })
  const timer = useSolveTimer(saved?.solveTimeMs ?? 0, !solved, (solveTimeMs) => {
    if (persist) progressStore.save(puzzle.id, { ...latest.current, solveTimeMs })
  })
  useEffect(() => {
    latest.current = { board: play.board, hintsUsed, everSolved }
    if (persist) progressStore.save(puzzle.id, { ...latest.current, solveTimeMs: timer.read() })
  }, [persist, puzzle.id, play, hintsUsed, everSolved, timer])

  function applyMove(next: Play) {
    setStroke(null)
    if (next === play) return
    setHint(null)
    if (isPlaySolved(next)) {
      setSolvedTimeMs(timer.stop())
      setEverSolved(true)
    }
    setPlay(next)
  }

  return {
    board: stroke ? drag(play, stroke).board : play.board,
    solved, hint, hintsUsed, solvedTimeMs,
    canUndo: canUndo(play),
    canReset: !solved && !isBoardEmpty(play.board),
    tap: (cell: Coord) => applyMove(tap(play, cell)),
    previewDrag: setStroke,
    commitDrag: (cells: readonly Coord[]) => applyMove(drag(play, cells)),
    undo: () => applyMove(undo(play)),
    reset: () => applyMove(reset(play)),
    /** Shows a Hint for the current Board; asking again before the next Move does not count twice. */
    showHint() {
      if (hint !== null) return
      const next = getHint(puzzle, play.board)
      setHint(next)
      if (next) setHintsUsed((count) => count + 1)
    },
    replay() {
      timer.restart()
      setPlay(startPlay(puzzle))
      setHint(null)
      setHintsUsed(0)
      setSolvedTimeMs(null)
    },
  }
}
