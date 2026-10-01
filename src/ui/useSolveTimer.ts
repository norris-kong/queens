import { useEffect, useMemo, useRef } from 'react'
import { SAVE_INTERVAL_MS } from '../config.ts'
import { pause, pausedAt, readSolveTime, resume, type Stopwatch } from '../core/solveTime.ts'

/**
 * Solve Time that runs only while `running` and the page is visible. `checkpoint` receives the
 * current Solve Time whenever it is worth saving: every few seconds, when the page is hidden or
 * left, and when the timer stops.
 */
export function useSolveTimer(savedMs: number, running: boolean, checkpoint: (solveTimeMs: number) => void) {
  const stopwatch = useRef<Stopwatch>(pausedAt(savedMs))
  const latestCheckpoint = useRef(checkpoint)
  useEffect(() => {
    latestCheckpoint.current = checkpoint
  })

  useEffect(() => {
    if (!running) return
    const save = () => latestCheckpoint.current(readSolveTime(stopwatch.current, Date.now()))
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
  }, [running])

  // Stable across renders, so callers can list it as an effect dependency without re-running.
  return useMemo(
    () => ({
      read: () => readSolveTime(stopwatch.current, Date.now()),
      /** Stops the clock now and returns the final Solve Time. */
      stop: () => {
        stopwatch.current = pause(stopwatch.current, Date.now())
        return stopwatch.current.accumulatedMs
      },
      restart: () => {
        stopwatch.current = resume(pausedAt(0), Date.now())
      },
    }),
    [],
  )
}
