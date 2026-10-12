import { describe, expect, it } from 'vitest'
import { createNightmareStore, stageSeed, stageSize } from './nightmare.ts'
import type { StorageLike } from './progress.ts'

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const data = new Map(Object.entries(initial))
  return {
    get length() {
      return data.size
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

describe('stageSize', () => {
  it.each([
    [1, 6],
    [5, 6],
    [6, 7],
    [11, 8],
    [26, 11],
    [30, 11],
    [31, 12],
    [1000, 12],
  ])('Stage %i is Size %i', (stage, size) => {
    expect(stageSize(stage)).toBe(size)
  })
})

describe('stageSeed', () => {
  it('gives each Stage its own seed, the same for every player', () => {
    expect(stageSeed(37)).toBe(stageSeed(37))
    expect(stageSeed(37)).not.toBe(stageSeed(38))
  })
})

describe('Nightmare store', () => {
  it('starts at Stage 1', () => {
    expect(createNightmareStore(memoryStorage()).currentStage()).toBe(1)
  })

  it('moves forward and never back', () => {
    const store = createNightmareStore(memoryStorage())

    store.reach(4)
    store.reach(2)

    expect(store.currentStage()).toBe(4)
  })

  it('remembers the Stage across visits', () => {
    const storage = memoryStorage()
    createNightmareStore(storage).reach(9)

    expect(createNightmareStore(storage).currentStage()).toBe(9)
  })

  it.each(['zero', '0', '-3', '2.5'])('starts over at Stage 1 when the saved Stage is %j', (raw) => {
    expect(createNightmareStore(memoryStorage({ 'queens.nightmareStage': raw })).currentStage()).toBe(1)
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
    const store = createNightmareStore(refusing)

    expect(() => store.reach(3)).not.toThrow()
    expect(store.currentStage()).toBe(1)
  })
})
