import { describe, expect, it } from 'vitest'
import { emptyBoard, withCells } from './board.ts'
import { createProgressStore, type PuzzleProgress, progressStatus, type StorageLike, saveSlot } from './progress.ts'
import { FOUR_BY_FOUR, puzzleFrom } from './testing.ts'

const OTHER_FOUR = puzzleFrom('AAAB\nCCBB\nCCCB\nCCDD')

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
  everSolved: false,
}

describe('progress store', () => {
  it('loads back what was saved for a Puzzle', () => {
    const store = createProgressStore(memoryStorage())

    store.save(FOUR_BY_FOUR.id, FOUR_BY_FOUR, progress)

    expect(store.load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toEqual(progress)
  })

  it('has nothing for a Puzzle never played', () => {
    expect(createProgressStore(memoryStorage()).load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toBeNull()
  })

  it.each([
    ['not JSON', '{oops'],
    ['the wrong shape', JSON.stringify({ board: 'nope', solveTimeMs: -1 })],
    ['a Board of another Size', JSON.stringify({ ...progress, board: emptyBoard(5) })],
  ])('treats a save holding %s as never played', (_, raw) => {
    const store = createProgressStore(memoryStorage({ [`queens.progress.${FOUR_BY_FOUR.id}`]: raw }))

    expect(store.load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toBeNull()
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

    expect(() => store.save(FOUR_BY_FOUR.id, FOUR_BY_FOUR, progress)).not.toThrow()
    expect(store.load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toBeNull()
    expect(store.status(FOUR_BY_FOUR.id)).toBe('new')
  })

  it('forgets saves of Puzzles no longer in the library, keeping everything else', () => {
    const storage = memoryStorage({ 'other.app.setting': 'dark' })
    const store = createProgressStore(storage)
    store.save('still-here', FOUR_BY_FOUR, progress)
    store.save('edited-away', FOUR_BY_FOUR, progress)

    store.forgetAllExcept(new Set(['still-here']))

    expect([...storage.data.keys()].sort()).toEqual(['other.app.setting', 'queens.progress.still-here'])
  })

  it('keeps stores with different prefixes apart, so forgetting library saves spares Daily ones', () => {
    const storage = memoryStorage()
    const library = createProgressStore(storage)
    const daily = createProgressStore(storage, 'queens.daily.')
    library.save(FOUR_BY_FOUR.id, FOUR_BY_FOUR, progress)
    daily.save('2026-10-12', FOUR_BY_FOUR, progress)

    library.forgetAllExcept(new Set())

    expect(library.load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toBeNull()
    expect(daily.load('2026-10-12', FOUR_BY_FOUR)).toEqual(progress)
  })

  it('never hands a save to another Puzzle kept under the same key, though its status still shows', () => {
    const store = createProgressStore(memoryStorage(), 'queens.daily.')
    store.save('2026-10-12', FOUR_BY_FOUR, progress)

    expect(store.load('2026-10-12', OTHER_FOUR)).toBeNull()
    expect(store.status('2026-10-12')).toBe('inProgress')
  })

  it('reads saves made before the Puzzle was recorded in them', () => {
    const store = createProgressStore(memoryStorage({ [`queens.progress.${FOUR_BY_FOUR.id}`]: JSON.stringify(progress) }))

    expect(store.load(FOUR_BY_FOUR.id, FOUR_BY_FOUR)).toEqual(progress)
  })

  it('offers a save slot bound to one key and Puzzle', () => {
    const store = createProgressStore(memoryStorage())
    const slot = saveSlot(store, 'stage-3', FOUR_BY_FOUR)

    slot.save(progress)

    expect(slot.load()).toEqual(progress)
    expect(store.status('stage-3')).toBe('inProgress')
  })
})

describe('progressStatus', () => {
  it.each<[string, string, PuzzleProgress | null]>([
    ['never played', 'new', null],
    ['opened and looked at, without a Move or Hint', 'new', { ...progress, board: emptyBoard(4), hintsUsed: 0 }],
    ['partly played', 'inProgress', progress],
    ['Solved before, now replaying', 'solved', { ...progress, everSolved: true }],
  ])('%s → %s', (_, status, saved) => {
    expect(progressStatus(saved)).toBe(status)
  })
})
