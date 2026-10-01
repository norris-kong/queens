import { createProgressStore, type StorageLike } from '../core/progress.ts'

/** Used when the browser blocks localStorage: progress then lasts until the tab closes. */
function memoryStorage(): StorageLike {
  const data = new Map<string, string>()
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

function browserStorage(): StorageLike {
  try {
    return window.localStorage
  } catch (error) {
    console.warn('localStorage is unavailable; progress will not be kept after closing the tab', error)
    return memoryStorage()
  }
}

export const progressStore = createProgressStore(browserStorage())
