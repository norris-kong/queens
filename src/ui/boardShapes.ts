import type { DraftGrid, RegionId } from '../core/types.ts'

/** Which thin lines a Board draws between Cells: between every pair, or only inside Regions. */
export type CellLines = 'all' | 'withinRegions'

export interface ShapeStyle {
  /** How far a rounded corner reaches along each side, in Cells; 0 keeps every corner square. */
  readonly cornerRadius: number
  readonly cellLines: CellLines
}

/** The area of one Region, or of a Draft's unassigned Cells (`null`), as SVG path data in Cell units. */
export interface Area {
  readonly region: RegionId | null
  readonly path: string
}

/** Which corners of a Cell a rounded Region line curves around, in CSS order: top-left, top-right, bottom-right, bottom-left. */
export type CellCorners = readonly [boolean, boolean, boolean, boolean]

export interface BoardShapes {
  /** Each Region's area, in reading order of the Regions' first Cells. */
  readonly areas: readonly Area[]
  /** The thick lines between Regions. */
  readonly regionLines: string
  /** The thin lines between Cells. */
  readonly cellLines: string
  /** Each Cell's rounded corners, row by row, so whatever is drawn on a Cell can follow the curve. */
  readonly cellCorners: readonly (readonly CellCorners[])[]
}

type Vector = readonly [number, number]

interface Edge {
  readonly from: Vector
  readonly to: Vector
  readonly dir: Vector
}

const num = (value: number) => Number(value.toFixed(3))
const point = ([x, y]: Vector) => `${num(x)} ${num(y)}`
const vertexKey = ([x, y]: Vector) => `${x},${y}`
const plus = ([x, y]: Vector, [dx, dy]: Vector, by: number): Vector => [x + dx * by, y + dy * by]
const sameDir = (a: Vector, b: Vector) => a[0] === b[0] && a[1] === b[1]
const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from) }, (_, index) => from + index)

/** SVG's sweep flag for a quarter turn from heading `into` to heading `out`, with y pointing down. */
const sweep = (into: Vector, out: Vector) => (into[0] * out[1] - into[1] * out[0] > 0 ? 1 : 0)

/** The Region of a Cell; off the Board is `undefined`, unlike an unassigned Cell's `null`. */
const regionAt = (regions: DraftGrid, row: number, col: number) => regions[row]?.[col]

/**
 * Inner corners where exactly two Region lines meet at a right angle, as "x,y". Only these are
 * rounded: where three or four Regions meet, a rounded line would leave a gap.
 */
function roundedCorners(regions: DraftGrid): ReadonlySet<string> {
  const inner = range(1, regions.length)
  return new Set(
    inner.flatMap((y) =>
      inner.flatMap((x) => {
        const [tl, tr, bl, br] = [regionAt(regions, y - 1, x - 1), regionAt(regions, y - 1, x), regionAt(regions, y, x - 1), regionAt(regions, y, x)]
        const [up, down, left, right] = [tl !== tr, bl !== br, tl !== bl, tr !== br]
        const turns = up !== down && left !== right
        return turns ? [vertexKey([x, y])] : []
      }),
    ),
  )
}

/** At a rounded corner, the one Cell unlike the other three is the one whose corner the line curves around. */
function cellCorners(regions: DraftGrid, rounded: ReadonlySet<string>): readonly (readonly CellCorners[])[] {
  return regions.map((cells, row) =>
    cells.map((cell, col): CellCorners => {
      const curvesAround = (x: number, y: number, rowStep: number, colStep: number) =>
        rounded.has(vertexKey([x, y])) && regionAt(regions, row + rowStep, col) !== cell && regionAt(regions, row, col + colStep) !== cell
      return [
        curvesAround(col, row, -1, -1),
        curvesAround(col + 1, row, -1, 1),
        curvesAround(col + 1, row + 1, 1, 1),
        curvesAround(col, row + 1, 1, -1),
      ]
    }),
  )
}

/** The edges around a Region's Cells, each running clockwise, i.e. with the Region on its right. */
function outlineEdges(regions: DraftGrid, region: RegionId | null): readonly Edge[] {
  const edge = (from: Vector, to: Vector): Edge => ({ from, to, dir: [to[0] - from[0], to[1] - from[1]] })
  const outside = (row: number, col: number) => regionAt(regions, row, col) !== region
  return regions.flatMap((cells, row) =>
    cells.flatMap((cell, col) =>
      cell !== region
        ? []
        : [
            ...(outside(row - 1, col) ? [edge([col, row], [col + 1, row])] : []),
            ...(outside(row, col + 1) ? [edge([col + 1, row], [col + 1, row + 1])] : []),
            ...(outside(row + 1, col) ? [edge([col + 1, row + 1], [col, row + 1])] : []),
            ...(outside(row, col - 1) ? [edge([col, row + 1], [col, row])] : []),
          ],
    ),
  )
}

/**
 * Chains a Region's edges into closed loops: one per piece, plus one per hole. Where two of its Cells
 * touch only diagonally, turning right first keeps them as separate pieces.
 */
function traceLoops(edges: readonly Edge[]): readonly (readonly Edge[])[] {
  const leaving = edges.reduce((index, edge) => {
    const from = vertexKey(edge.from)
    return index.set(from, [...(index.get(from) ?? []), edge])
  }, new Map<string, readonly Edge[]>())
  const next = (edge: Edge) => {
    const [dx, dy] = edge.dir
    const turns: readonly Vector[] = [[-dy, dx], [dx, dy], [dy, -dx]]
    const options = leaving.get(vertexKey(edge.to)) ?? []
    return turns.map((turn) => options.find((option) => sameDir(option.dir, turn))).find((option) => option !== undefined)
  }
  const used = new Set<Edge>()
  return edges.flatMap((start) => {
    if (used.has(start)) return []
    const loop: Edge[] = []
    for (let edge: Edge | undefined = start; edge && !used.has(edge); edge = next(edge)) {
      used.add(edge)
      loop.push(edge)
    }
    return [loop]
  })
}

/** A closed loop as path data, with its rounded corners drawn as quarter circles. */
function loopPath(loop: readonly Edge[], rounded: ReadonlySet<string>, radius: number): string {
  const turns = loop.flatMap((edge, index) => {
    const out = loop[(index + 1) % loop.length]?.dir ?? edge.dir
    if (sameDir(edge.dir, out)) return []
    if (radius === 0 || !rounded.has(vertexKey(edge.to))) return [{ enter: edge.to, leave: edge.to, arc: '' }]
    const leave = plus(edge.to, out, radius)
    return [{ enter: plus(edge.to, edge.dir, -radius), leave, arc: `A${num(radius)} ${num(radius)} 0 0 ${sweep(edge.dir, out)} ${point(leave)}` }]
  })
  const [first, ...rest] = turns
  if (!first) return ''
  return `M${point(first.leave)}${[...rest, first].map((turn) => `L${point(turn.enter)}${turn.arc}`).join('')}Z`
}

/** Every line between two Regions as a unit segment, shortened where a rounded corner takes over. */
function regionLinePath(regions: DraftGrid, rounded: ReadonlySet<string>, radius: number): string {
  const size = regions.length
  const trim = (vertex: Vector) => (rounded.has(vertexKey(vertex)) ? radius : 0)
  const vertical = range(0, size).flatMap((y) =>
    range(1, size)
      .filter((x) => regionAt(regions, y, x - 1) !== regionAt(regions, y, x))
      .map((x) => `M${point([x, y + trim([x, y])])}V${num(y + 1 - trim([x, y + 1]))}`),
  )
  const horizontal = range(1, size).flatMap((y) =>
    range(0, size)
      .filter((x) => regionAt(regions, y - 1, x) !== regionAt(regions, y, x))
      .map((x) => `M${point([x + trim([x, y]), y])}H${num(x + 1 - trim([x + 1, y]))}`),
  )
  const arcs = [...rounded].map((corner) => {
    const [x, y] = corner.split(',').map(Number) as [number, number]
    const tl = regionAt(regions, y - 1, x - 1)
    const vertical: Vector = tl !== regionAt(regions, y - 1, x) ? [0, -1] : [0, 1]
    const horizontal: Vector = tl !== regionAt(regions, y, x - 1) ? [-1, 0] : [1, 0]
    const start = plus([x, y], vertical, radius)
    const end = plus([x, y], horizontal, radius)
    return `M${point(start)}A${num(radius)} ${num(radius)} 0 0 ${sweep([-vertical[0], -vertical[1]], horizontal)} ${point(end)}`
  })
  return [...vertical, ...horizontal, ...arcs].join('')
}

/** Runs of consecutive indices where `drawn` holds, as [first, last + 1]. */
function runs(length: number, drawn: (index: number) => boolean): readonly Vector[] {
  return range(0, length).reduce<readonly Vector[]>((found, index) => {
    if (!drawn(index)) return found
    const last = found.at(-1)
    return last && last[1] === index ? [...found.slice(0, -1), [last[0], index + 1]] : [...found, [index, index + 1]]
  }, [])
}

function cellLinePath(regions: DraftGrid, which: CellLines): string {
  const size = regions.length
  const drawn = (a: RegionId | null | undefined, b: RegionId | null | undefined) => which === 'all' || a === b
  const vertical = range(1, size).flatMap((x) =>
    runs(size, (y) => drawn(regionAt(regions, y, x - 1), regionAt(regions, y, x))).map(([from, to]) => `M${x} ${from}V${to}`),
  )
  const horizontal = range(1, size).flatMap((y) =>
    runs(size, (x) => drawn(regionAt(regions, y - 1, x), regionAt(regions, y, x))).map(([from, to]) => `M${from} ${y}H${to}`),
  )
  return [...vertical, ...horizontal].join('')
}

/** Everything a Board draws besides its Cells: each Region's area, the Region lines and the Cell lines. */
export function boardShapes(regions: DraftGrid, style: ShapeStyle): BoardShapes {
  const radius = style.cornerRadius
  const rounded = radius > 0 ? roundedCorners(regions) : new Set<string>()
  const areas = [...new Set(regions.flat())].map((region) => ({
    region,
    path: traceLoops(outlineEdges(regions, region))
      .map((loop) => loopPath(loop, rounded, radius))
      .join(''),
  }))
  return {
    areas,
    regionLines: regionLinePath(regions, rounded, radius),
    cellLines: cellLinePath(regions, style.cellLines),
    cellCorners: cellCorners(regions, rounded),
  }
}
