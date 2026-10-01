import { describe, expect, it } from 'vitest'
import { emptyBoard, withCells } from './board'
import { createProgressStore, type PuzzleProgress, progressStatus, type StorageLike } from './progress'
import { FOUR_BY_FOUR } from './testing'

/** An in-memory stand-in for the browser's localStorage. */
function memoryStorage(initial: Record<string, string> = {}): StorageLike & { readonly data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    get length() {
      return data.size
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const progress: PuzzleProgress = {
  board: withCells(emptyBoard(4), [
    { coord: { row: 0, col: 1 }, state: 'queen' },
    { coord: { row: 2, col: 2 }, state: 'mark' },
  ]),
  solveTimeMs: 42_000,
  hintsUsed: 2,
  completed: false,
}

describe('progress store', () => {
  it('loads back what was saved for a Puzzle', () => {
    const store = createProgressStore(memoryStorage())

    store.save(FOUR_BY_FOUR.id, progress)

    expect(store.load(FOUR_BY_FOUR)).toEqual(progress)
  })

  it('has nothing for a Puzzle never played', () => {
    expect(createProgressStore(memoryStorage()).load(FOUR_BY_FOUR)).toBeNull()
  })

  it.each([
    ['not JSON', '{oops'],
    ['the wrong shape', JSON.stringify({ board: 'nope', solveTimeMs: -1 })],
    ['a Board of another Size', JSON.stringify({ ...progress, board: emptyBoard(5) })],
  ])('treats a save holding %s as never played', (_, raw) => {
    const store = createProgressStore(memoryStorage({ [`queens.progress.${FOUR_BY_FOUR.id}`]: raw }))

    expect(store.load(FOUR_BY_FOUR)).toBeNull()
  })

  it('keeps the game going when the browser refuses storage access', () => {
    const refusing: StorageLike = {
      length: 0,
      key: () => null,
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    const store = createProgressStore(refusing)

    expect(() => store.save(FOUR_BY_FOUR.id, progress)).not.toThrow()
    expect(store.load(FOUR_BY_FOUR)).toBeNull()
  })

  it('forgets saves of Puzzles no longer in the library, keeping everything else', () => {
    const storage = memoryStorage({ 'other.app.setting': 'dark' })
    const store = createProgressStore(storage)
    store.save('still-here', progress)
    store.save('edited-away', progress)

    store.forgetAllExcept(new Set(['still-here']))

    expect([...storage.data.keys()].sort()).toEqual(['other.app.setting', 'queens.progress.still-here'])
  })
})

describe('progressStatus', () => {
  it.each<[string, string, PuzzleProgress | null]>([
    ['never played', 'new', null],
    ['opened but untouched', 'new', { ...progress, board: emptyBoard(4), solveTimeMs: 0, hintsUsed: 0 }],
    ['partly played', 'inProgress', progress],
    ['Solved before, now replaying', 'completed', { ...progress, completed: true }],
  ])('%s → %s', (_, status, saved) => {
    expect(progressStatus(saved)).toBe(status)
  })
})
