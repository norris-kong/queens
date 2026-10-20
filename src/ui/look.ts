import { LINKEDIN_REGION_COLORS, REGION_COLORS } from '../config.ts'
import { type RegionTones, regionTones } from './regionTones.ts'
import type { Collection } from './routes.ts'

/** How a Puzzle is drawn: in the game's own look, or, for LinkedIn Puzzles, as LinkedIn draws it. */
export type Look = 'level' | 'linkedIn'

export interface BoardStyle {
  /** Each Region's colours, by Region letter, A first. */
  readonly regionTones: readonly RegionTones[]
  /**
   * Is each Cell a rounded tile, with each Region rimmed in its own deep shade? Or does each Cell
   * fill its square, with black lines between Regions, as on LinkedIn?
   */
  readonly tiles: boolean
}

const BOARD_STYLES: Readonly<Record<Look, BoardStyle>> = {
  level: { regionTones: REGION_COLORS.map(regionTones), tiles: true },
  linkedIn: { regionTones: LINKEDIN_REGION_COLORS.map(regionTones), tiles: false },
}

export function boardStyle(look: Look): BoardStyle {
  return BOARD_STYLES[look]
}

/** The look of the Puzzles the editor saves to a collection. */
export function collectionLook(collection: Collection): Look {
  return collection === 'linkedIn' ? 'linkedIn' : 'level'
}
