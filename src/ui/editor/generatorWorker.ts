import { generatePuzzle } from '../../core/generator.ts'
import { seededRandom } from '../../core/random.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'

/** Runs the Puzzle generator off the main thread, so the editor stays responsive meanwhile. */
const worker = self as unknown as { postMessage(message: unknown): void }

self.addEventListener('message', (event: MessageEvent<{ size?: unknown; seed?: unknown }>) => {
  const { size, seed } = event.data
  if (typeof size !== 'number' || !Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE || typeof seed !== 'number') {
    worker.postMessage({ ok: false })
    return
  }
  const puzzle = generatePuzzle(size, seededRandom(seed))
  worker.postMessage(puzzle ? { ok: true, regions: puzzle.regions } : { ok: false })
})
