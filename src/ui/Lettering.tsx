import type { CSSProperties } from 'react'
import type { LevelInk } from './levelArt.ts'
import { CAP_HEIGHT, OUTLINE } from './letteringMetrics.ts'

interface LetteringProps {
  readonly text: string
  /** Where the middle of the lettering goes, in the enclosing SVG's units. */
  readonly x: number
  readonly y: number
  readonly fontSize: number
  readonly ink: LevelInk
}

/**
 * Level lettering inside an SVG: Cherry Bomb One in the Level's colours, centred on (x, y). The
 * outline straddles each letter's edge, so the small holes in letters like e and 8 stay open with
 * an outline as thick as the one outside; the font's merged glyphs keep it from tracing seams.
 */
export function Lettering({ text, x, y, fontSize, ink }: LetteringProps) {
  return (
    <text
      className="lettering"
      x={x}
      y={y + (fontSize * CAP_HEIGHT) / 2}
      fontSize={fontSize}
      textAnchor="middle"
      fill={ink.fill}
      stroke={ink.outline}
      strokeWidth={fontSize * OUTLINE}
      strokeLinejoin="round"
    >
      {text}
    </text>
  )
}

/**
 * Level lettering as ordinary text, e.g. a page title. Unlike lettering in an SVG, it takes exactly
 * the width its letters need, so nothing is cut off whatever the word.
 */
export function LetteringTitle({ text, ink }: { readonly text: string; readonly ink: LevelInk }) {
  const colours = { '--ink-fill': ink.fill, '--ink-outline': ink.outline, '--ink-outline-width': `${OUTLINE}em` }
  return (
    <span className="lettering lettering-title" style={colours as CSSProperties}>
      {text}
    </span>
  )
}
