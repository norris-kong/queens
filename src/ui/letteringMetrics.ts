/** Cherry Bomb One's capitals and digits stand this tall above the baseline, as a share of the font size. */
export const CAP_HEIGHT = 0.7
/** Its descenders (g, y) reach this far below the baseline. */
export const DESCENDER = 0.2
/** Its letters advance about half an em each. */
export const AVERAGE_ADVANCE = 0.5
/** Outline thickness as a share of the font size; half of it shows around the letters. */
export const OUTLINE = 0.2

/** The largest font size, up to `max`, at which `text` fits in `width`. */
export function fittingFontSize(text: string, width: number, max: number): number {
  return Math.min(max, width / (text.length * AVERAGE_ADVANCE + OUTLINE))
}
