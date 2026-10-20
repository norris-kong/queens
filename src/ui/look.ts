import { LINKEDIN_REGION_COLORS, REGION_COLORS, REGION_CORNER_RADIUS } from '../config.ts'
import type { ShapeStyle } from './boardShapes.ts'
import type { Collection } from './routes.ts'

/** How a Puzzle is drawn: in the game's own look, or, for LinkedIn Puzzles, as LinkedIn draws it. */
export type Look = 'level' | 'linkedIn'

export interface BoardStyle extends ShapeStyle {
  /** Region colours by Region letter, A first. */
  readonly regionColors: readonly string[]
}

const BOARD_STYLES: Readonly<Record<Look, BoardStyle>> = {
  level: { regionColors: REGION_COLORS, cornerRadius: REGION_CORNER_RADIUS, cellLines: 'withinRegions' },
  linkedIn: { regionColors: LINKEDIN_REGION_COLORS, cornerRadius: 0, cellLines: 'all' },
}

export function boardStyle(look: Look): BoardStyle {
  return BOARD_STYLES[look]
}

/** The look of the Puzzles the editor saves to a collection. */
export function collectionLook(collection: Collection): Look {
  return collection === 'linkedIn' ? 'linkedIn' : 'level'
}
