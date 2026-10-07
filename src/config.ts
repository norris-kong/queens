/** Region colours by Region letter, A first. Regions are also split by thick borders, never by colour alone. */
export const REGION_COLORS: readonly string[] = [
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

/** How often Solve Time is saved while a Puzzle is open, on top of saving after every Move. */
export const SAVE_INTERVAL_MS = 5_000

/** Size a new Draft starts at in the editor. */
export const DEFAULT_DRAFT_SIZE = 8
