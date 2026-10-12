import { levelArt } from './levelArt.ts'
import { Lettering } from './Lettering.tsx'
import { fittingFontSize } from './letteringMetrics.ts'
import { routeHash } from './routes.ts'

/** The button art's own size, and the blank pill right of its badge where the Level's name goes. */
const ART_WIDTH = 1120
const ART_HEIGHT = 492
const NAME_X = 770
const NAME_Y = 258
const NAME_WIDTH = 520
const NAME_MAX_FONT_SIZE = 120

/** A Level's picture button on the home page, opening the list of its Puzzles. */
export function LevelButton({ size }: { readonly size: number }) {
  const art = levelArt(size)
  return (
    <a className="level-button" href={routeHash({ page: 'level', size })} aria-label={art.name}>
      <svg viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`} aria-hidden="true">
        <image href={art.button} width={ART_WIDTH} height={ART_HEIGHT} />
        <Lettering
          text={art.name}
          x={NAME_X}
          y={NAME_Y}
          fontSize={fittingFontSize(art.name, NAME_WIDTH, NAME_MAX_FONT_SIZE)}
          ink={art.ink}
        />
      </svg>
    </a>
  )
}
