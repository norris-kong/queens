import { useEffect, useRef, useState } from 'react'
import { isBoardEmpty } from '../core/board.ts'
import { getHint, type Hint } from '../core/hint.ts'
import { canUndo, drag, isPlaySolved, type Play, reset, startPlay, tap, undo } from '../core/play.ts'
import type { PuzzleProgress, SaveSlot } from '../core/progress.ts'
import type { Coord, Puzzle } from '../core/types.ts'
import { useSolveTimer } from './useSolveTimer.ts'

type Snapshot = Omit<PuzzleProgress, 'solveTimeMs'>

/** Runs Solve Time while `running` and saves the snapshot with it after every change and every few seconds. */
function useAutosave(slot: SaveSlot | null, saved: PuzzleProgress | null, running: boolean, snapshot: Snapshot) {
  const latest = useRef<Snapshot>(snapshot)
  const timer = useSolveTimer(saved?.solveTimeMs ?? 0, running, (solveTimeMs) => {
    slot?.save({ ...latest.current, solveTimeMs })
  })
  const { board, hintsUsed, everSolved } = snapshot
  useEffect(() => {
    latest.current = { board, hintsUsed, everSolved }
    slot?.save({ board, hintsUsed, everSolved, solveTimeMs: timer.read() })
  }, [slot, board, hintsUsed, everSolved, timer])
  return timer
}

/**
 * One sitting at a Puzzle: the Play, its Solve Time (running only while the page is visible and the
 * Puzzle unsolved), Hints, and saving it all to `slot` after every change and every few seconds.
 * The slot is fixed for the sitting; null (an editor play-test) leaves no trace. `onSolve` runs
 * on the Move that Solves the Puzzle.
 */
export function usePlaySession(puzzle: Puzzle, slot: SaveSlot | null, onSolve?: () => void) {
  const [store] = useState(slot)
  const [saved] = useState(() => store?.load() ?? null)
  const [play, setPlay] = useState<Play>(() => startPlay(puzzle, saved?.board))
  const [stroke, setStroke] = useState<readonly Coord[] | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? 0)
  const [everSolved, setEverSolved] = useState(saved?.everSolved ?? false)
  const [solvedTimeMs, setSolvedTimeMs] = useState(() => (isPlaySolved(play) ? (saved?.solveTimeMs ?? 0) : null))
  const solved = isPlaySolved(play)

  const timer = useAutosave(store, saved, !solved, { board: play.board, hintsUsed, everSolved })

  function applyMove(next: Play) {
    setStroke(null)
    if (next === play) return
    setHint(null)
    if (isPlaySolved(next)) {
      setSolvedTimeMs(timer.stop())
      setEverSolved(true)
      onSolve?.()
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
