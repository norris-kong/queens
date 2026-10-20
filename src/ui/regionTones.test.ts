import { describe, expect, it } from 'vitest'
import { regionTones } from './regionTones.ts'

/** [lightness, chroma, hue] of an `oklch(...)` colour. */
function parse(color: string): [number, number, number] {
  const match = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(color)
  if (!match) throw new Error(`not an oklch() colour: ${color}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

describe('regionTones', () => {
  it('keeps the Region colour itself as given', () => {
    expect(regionTones('#c7afe7').base).toBe('#c7afe7')
  })

  it('deepens the tray between tiles, the side of a tile further, and the rim most, without changing the hue', () => {
    const tones = regionTones('#ff0000')
    const [trayL, , trayH] = parse(tones.tray)
    const [sideL, , sideH] = parse(tones.side)
    const [rimL, , rimH] = parse(tones.rim)

    expect(trayL).toBeCloseTo(0.628 - 0.08, 2)
    expect(sideL).toBeLessThan(trayL)
    expect(rimL).toBeLessThan(sideL)
    expect([trayH, sideH, rimH].every((hue) => Math.abs(hue - 29.23) < 0.05)).toBe(true)
  })

  it('keeps greys grey instead of tinting them', () => {
    const tones = regionTones('#f3f3f3')

    expect([tones.tray, tones.side, tones.rim].every((tone) => parse(tone)[1] < 0.001)).toBe(true)
  })

  it('makes the rim dark enough to stand out from the tray even on the palest Region, without colour', () => {
    const tones = regionTones('#ffffa9')

    expect(parse(tones.tray)[0] - parse(tones.rim)[0]).toBeGreaterThan(0.2)
  })

  it('works from white down', () => {
    expect(parse(regionTones('#ffffff').tray)[0]).toBeCloseTo(0.92, 2)
  })

  it('refuses anything but a #rrggbb colour', () => {
    expect(() => regionTones('purple')).toThrow(/#rrggbb/)
    expect(() => regionTones('#fff')).toThrow(/#rrggbb/)
  })
})
