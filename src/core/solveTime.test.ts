import { describe, expect, it } from 'vitest'
import { elapsedMs, formatSolveTime, pause, resume, stoppedAt } from './solveTime'

describe('Solve Time', () => {
  it('only accumulates while the game is visible', () => {
    const shown = resume(stoppedAt(0), 1_000)
    const hidden = pause(shown, 4_000)
    const shownAgain = resume(hidden, 10_000)

    expect(elapsedMs(hidden, 9_000)).toBe(3_000)
    expect(elapsedMs(shownAgain, 12_000)).toBe(5_000)
  })

  it('carries on from a saved time', () => {
    expect(elapsedMs(resume(stoppedAt(60_000), 0), 2_500)).toBe(62_500)
  })

  it('ignores a resume while already running and a pause while already paused', () => {
    const running = resume(stoppedAt(0), 1_000)

    expect(resume(running, 5_000)).toBe(running)
    const paused = pause(running, 2_000)
    expect(pause(paused, 9_000)).toBe(paused)
  })
})

describe('formatSolveTime', () => {
  it.each([
    [0, '0:00'],
    [7_900, '0:07'],
    [187_000, '3:07'],
    [3_723_000, '1:02:03'],
  ])('shows %i ms as %s', (ms, text) => {
    expect(formatSolveTime(ms)).toBe(text)
  })
})
