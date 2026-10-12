import { levelName } from '../core/level.ts'
import { MAX_SIZE, MIN_SIZE } from '../core/rules.ts'

/** Level art, made from the drawings in buttons/ by `pnpm art:levels`, keyed by file path. */
const FILES = import.meta.glob<string>('../assets/levels/*.webp', { eager: true, import: 'default' })

/** Lettering colours: the fill, and the outline drawn around it. */
export interface LevelInk {
  readonly fill: string
  readonly outline: string
}

/** Each Level's lettering colours, matched to its art. */
const INKS: Readonly<Record<string, LevelInk>> = {
  Beginner: { outline: '#8a956f', fill: '#bac291' },
  Easy: { outline: '#5e80c5', fill: '#8db0eb' },
  Relaxed: { outline: '#8b6bab', fill: '#ba9cd8' },
  Normal: { outline: '#dd9f67', fill: '#f6c884' },
  Intermediate: { outline: '#c86869', fill: '#f29d9f' },
  Challenging: { outline: '#5287c6', fill: '#a5d1ef' },
  Hard: { outline: '#637ab4', fill: '#c7dcff' },
  Expert: { outline: '#8e66a7', fill: '#d5ade7' },
  Master: { outline: '#d28f62', fill: '#f5c889' },
}

const PLAIN_INK: LevelInk = { outline: '#5f5f5f', fill: '#ffffff' }

export interface LevelArt {
  readonly name: string
  /** The wide button that opens the Level from the home page. */
  readonly button: string
  /** The badge each of the Level's Puzzles is numbered on. */
  readonly stage: string
  /** What a Queen looks like on a Board of this Size. */
  readonly logo: string
  readonly ink: LevelInk
}

function file(level: string, kind: 'button' | 'stage' | 'logo'): string {
  return FILES[`../assets/levels/${level.toLowerCase()}-${kind}.webp`] ?? ''
}

/** The art of a Size's Level; a Size outside 4–12 borrows the nearest Level's. */
export function levelArt(size: number): LevelArt {
  const name = levelName(Math.min(Math.max(size, MIN_SIZE), MAX_SIZE))
  return {
    name,
    button: file(name, 'button'),
    stage: file(name, 'stage'),
    logo: file(name, 'logo'),
    ink: INKS[name] ?? PLAIN_INK,
  }
}
