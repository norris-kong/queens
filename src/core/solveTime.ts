/** Solve Time so far, plus when it last started running (null while the game is hidden or Solved). */
export interface Stopwatch {
  readonly accumulatedMs: number
  readonly runningSince: number | null
}

export function pausedAt(accumulatedMs: number): Stopwatch {
  return { accumulatedMs, runningSince: null }
}

export function resume(stopwatch: Stopwatch, now: number): Stopwatch {
  return stopwatch.runningSince === null ? { ...stopwatch, runningSince: now } : stopwatch
}

export function pause(stopwatch: Stopwatch, now: number): Stopwatch {
  return stopwatch.runningSince === null ? stopwatch : pausedAt(readSolveTime(stopwatch, now))
}

export function readSolveTime(stopwatch: Stopwatch, now: number): number {
  const running = stopwatch.runningSince === null ? 0 : Math.max(0, now - stopwatch.runningSince)
  return stopwatch.accumulatedMs + running
}

const pad = (value: number) => String(value).padStart(2, '0')

/** "m:ss", or "h:mm:ss" from an hour on. */
export function formatSolveTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}
