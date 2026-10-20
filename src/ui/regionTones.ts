/** A Region's colour, and the deeper shades of the same hue that its tiles are drawn with. */
export interface RegionTones {
  readonly base: string
  /** The tray the tiles sit in, showing between them: a little deeper. */
  readonly tray: string
  /**
   * The rim around the Region: deepest, so that colour-blind players see where one Region ends and
   * the next begins by lightness alone.
   */
  readonly rim: string
}

/** How much darker, and how much more colourful, each shade is than the Region colour, in OKLCH. */
const TRAY = { lightness: -0.08, chroma: 0.025 }
const RIM = { lightness: -0.32, chroma: 0.06 }

/** Below this chroma a colour counts as grey, and its shades stay grey rather than take on a tint. */
const GREY_CHROMA = 0.02

const HEX = /^#[0-9a-f]{6}$/i

const linear = (channel: number) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/** A #rrggbb colour as OKLCH: [lightness 0–1, chroma, hue in degrees]. */
function toOklch(hex: string): readonly [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  const [r, g, b] = [linear((value >> 16) & 255), linear((value >> 8) & 255), linear(value & 255)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [lightness, Math.hypot(a, bAxis), ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360]
}

const num = (value: number) => Number(value.toFixed(4))

function shade([lightness, chroma, hue]: readonly [number, number, number], step: typeof TRAY): string {
  const deeper = Math.min(1, Math.max(0, lightness + step.lightness))
  const richer = chroma < GREY_CHROMA ? chroma : chroma + step.chroma
  return `oklch(${num(deeper)} ${num(richer)} ${num(hue)})`
}

/** Works out a Region colour's shades; OKLCH keeps them the same hue, where mixing in black turns pastels grey. */
export function regionTones(hex: string): RegionTones {
  if (!HEX.test(hex)) throw new Error(`Region colours must be #rrggbb, not "${hex}"`)
  const color = toOklch(hex)
  return { base: hex, tray: shade(color, TRAY), rim: shade(color, RIM) }
}
