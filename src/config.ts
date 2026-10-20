/**
 * Region colours by Region letter, A first, on the game's own Puzzles. Regions are also split by
 * thick black lines, never by colour alone, so that colour-blind players can tell them apart.
 */
export const REGION_COLORS: readonly string[] = [
  '#c7afe7', // A purple
  '#ffd8b0', // B peach
  '#b5d9ff', // C blue
  '#d2ffb5', // D green
  '#f3f3f3', // E light grey
  '#ffb1a0', // F coral
  '#ffffa9', // G yellow
  '#dfd5be', // H beige
  '#ffbce1', // I pink
  '#bbfff6', // J aqua
  '#b8b4ff', // K periwinkle
  '#daba82', // L tan
]

/** Region colours on LinkedIn Puzzles, as LinkedIn draws them. */
export const LINKEDIN_REGION_COLORS: readonly string[] = [
  '#c7a6ec', // A purple
  '#ffc58f', // B orange
  '#95c2ff', // C blue
  '#addf96', // D green
  '#dedede', // E light grey
  '#ff8c78', // F coral
  '#e7ef87', // G yellow
  '#bdb29b', // H taupe
  '#f5a9d0', // I pink
  '#86d9cf', // J teal
  '#b8b3ff', // K periwinkle
  '#e0b97a', // L ochre
]

/** On the game's own Puzzles, how far a rounded corner of a Region reaches along each side, in Cells. */
export const REGION_CORNER_RADIUS = 0.3

/** How often Solve Time is saved while a Puzzle is open, on top of saving after every Move. */
export const SAVE_INTERVAL_MS = 5_000

/** The first day with a Daily Puzzle (Hong Kong time); the calendar starts here. */
export const DAILY_FIRST_DATE = '2026-10-12'

/** Size a new Draft starts at in the editor. */
export const DEFAULT_DRAFT_SIZE = 8
