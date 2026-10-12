import { z } from 'zod'
import type { RegionGrid } from '../core/types.ts'

const replySchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), regions: z.array(z.array(z.number().int())) }),
  z.object({ ok: z.literal(false) }),
])

/** Generates the Puzzle layout a seed stands for (see generateSeededPuzzle) in a Web Worker; null if it failed. */
export function generateInWorker(size: number, seed: number): Promise<RegionGrid | null> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./generatorWorker.ts', import.meta.url), { type: 'module' })
    const finish = (regions: RegionGrid | null) => {
      worker.terminate()
      resolve(regions)
    }
    worker.addEventListener('message', (event: MessageEvent<unknown>) => {
      const reply = replySchema.safeParse(event.data)
      if (!reply.success) console.error('Puzzle generator sent an unexpected reply', reply.error.issues)
      finish(reply.success && reply.data.ok ? reply.data.regions : null)
    })
    worker.addEventListener('error', (event) => {
      console.error('Puzzle generator failed', event.message)
      finish(null)
    })
    worker.postMessage({ size, seed })
  })
}
