import { formatPuzzle } from './puzzleFormat'
import type { RegionGrid, RegionId } from './types'

/** 53-bit string hash (cyrb53); collisions are negligible at the scale of a puzzle library. */
function hash53(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** Re-letters Regions in reading order (first Region met becomes A) so that only the layout counts. */
function canonicalLayout(regions: RegionGrid): RegionGrid {
  const order = [...new Set(regions.flat())]
  const renamed = new Map<RegionId, RegionId>(order.map((region, index) => [region, index]))
  return regions.map((row) => row.map((region) => renamed.get(region) ?? region))
}

/** A Puzzle's identity, derived from its Region layout alone (ADR 0001). */
export function puzzleId(regions: RegionGrid): string {
  return hash53(formatPuzzle(canonicalLayout(regions)))
}
