import type { LevelInk } from './levelArt.ts'
import { AVERAGE_ADVANCE, CAP_HEIGHT, DESCENDER, OUTLINE } from './letteringMetrics.ts'

interface LetteringProps {
  readonly text: string
  /** Where the middle of the lettering goes, in the enclosing SVG's units. */
  readonly x: number
  readonly y: number
  readonly fontSize: number
  readonly ink: LevelInk
}

/** Level lettering inside an SVG: Cherry Bomb One in the Level's colours with a thick outline, centred on (x, y). */
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
      paintOrder="stroke"
    >
      {text}
    </text>
  )
}

/** Level lettering on its own, e.g. as a page title, sized to fit the text. */
export function LetteringTitle({ text, ink }: { readonly text: string; readonly ink: LevelInk }) {
  const fontSize = 100
  const margin = (OUTLINE / 2) * fontSize
  const width = text.length * AVERAGE_ADVANCE * fontSize + 2 * margin
  const height = (CAP_HEIGHT + DESCENDER) * fontSize + 2 * margin
  // Centre the capitals, leaving room below them for descenders.
  const capsMiddle = margin + (CAP_HEIGHT / 2) * fontSize
  return (
    <svg className="lettering-title" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={text}>
      <Lettering text={text} x={width / 2} y={capsMiddle} fontSize={fontSize} ink={ink} />
    </svg>
  )
}
