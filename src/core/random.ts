/** A source of numbers in [0, 1), like Math.random; injected so tests can use a fixed seed. */
export type Random = () => number

/** A small seeded generator (mulberry32): the same seed always gives the same sequence. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(items: readonly T[], random: Random): T | undefined {
  return items[Math.floor(random() * items.length)]
}

/** A shuffled copy (Fisher–Yates); the input is left untouched. */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}
