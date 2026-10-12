import { z } from 'zod'
import type { StorageLike } from './progress.ts'
import { seedFromText } from './random.ts'
import { MAX_SIZE } from './rules.ts'

/** Stage 1's Size; every few Stages add one, up to the largest Size. */
const FIRST_STAGE_SIZE = 6
const STAGES_PER_SIZE = 5

/** Stages 1–5 are Size 6, 6–10 Size 7, and so on; from Stage 31 on, always Size 12. */
export function stageSize(stage: number): number {
  return Math.min(FIRST_STAGE_SIZE + Math.floor((stage - 1) / STAGES_PER_SIZE), MAX_SIZE)
}

/** Every player's Stage N is the same Puzzle (ADR 0002). */
export function stageSeed(stage: number): number {
  return seedFromText(`nightmare:${stage}`)
}

/** How far the player has got in Nightmare. Players only move forward, so it is just one number. */
export interface NightmareStore {
  /** The Stage to play now: 1 at first, one past the last Stage Solved after that. */
  currentStage(): number
  /** Moves on to `stage`; never back. */
  reach(stage: number): void
}

const STAGE_KEY = 'queens.nightmareStage'
const stageSchema = z.coerce.number().int().positive()

/** Keeps the current Stage in browser storage; when storage fails, Nightmare starts over at Stage 1. */
export function createNightmareStore(storage: StorageLike): NightmareStore {
  function currentStage(): number {
    try {
      const raw = storage.getItem(STAGE_KEY)
      if (raw === null) return 1
      const parsed = stageSchema.safeParse(raw)
      if (!parsed.success) console.warn(`Ignoring malformed Nightmare Stage ${JSON.stringify(raw)}`)
      return parsed.success ? parsed.data : 1
    } catch (error) {
      console.warn('The Nightmare Stage could not be read from storage', error)
      return 1
    }
  }

  return {
    currentStage,
    reach(stage) {
      if (stage <= currentStage()) return
      try {
        storage.setItem(STAGE_KEY, String(stage))
      } catch (error) {
        console.warn('The Nightmare Stage could not be saved to storage', error)
      }
    },
  }
}
