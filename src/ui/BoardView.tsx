import { type CSSProperties, type KeyboardEvent, type ReactNode, useMemo } from 'react'
import type { Coord, DraftGrid, RegionId } from '../core/types.ts'
import { type Area, boardShapes, type CellCorners } from './boardShapes.ts'
import { levelArt } from './levelArt.ts'
import { boardStyle, type Look } from './look.ts'
import { type StrokeHandlers, useStroke } from './useStroke.ts'

export interface CellView {
  readonly label: string
  readonly content?: ReactNode
  readonly className?: string
}

interface BoardViewProps extends Partial<StrokeHandlers> {
  readonly regions: DraftGrid
  readonly label: string
  readonly renderCell: (cell: Coord) => CellView
  /** Read-only boards (examples, a Solved Board) ignore input. */
  readonly disabled?: boolean
  /** How the Board is drawn; LinkedIn Puzzles look as they do on LinkedIn. */
  readonly look?: Look
}

const ARROW_STEPS: Readonly<Record<string, Coord>> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
}

const noop = () => undefined

const SQUARE_CORNERS: CellCorners = [false, false, false, false]

/** Each Region's colour, filled in under the Cells; a Draft's unassigned Cells take the unassigned colour. */
function RegionAreas({ areas, colors, size }: { readonly areas: readonly Area[]; readonly colors: readonly string[]; readonly size: number }) {
  return (
    <svg className="region-areas" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none" aria-hidden="true">
      {areas.map(({ region, path }) => (
        <path
          key={region ?? 'unassigned'}
          d={path}
          fillRule="evenodd"
          style={{ fill: (region === null ? undefined : colors[region]) ?? 'var(--unassigned)' }}
        />
      ))}
    </svg>
  )
}

/** Lets keyboard players move between Cells with the arrow keys and tap with Enter or Space. */
function handleKey(event: KeyboardEvent<HTMLDivElement>, cell: Coord, size: number, onTap: (cell: Coord) => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onTap(cell)
    return
  }
  const step = ARROW_STEPS[event.key]
  if (!step) return
  event.preventDefault()
  const row = Math.min(size - 1, Math.max(0, cell.row + step.row))
  const col = Math.min(size - 1, Math.max(0, cell.col + step.col))
  const board = event.currentTarget.parentElement
  board?.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)?.focus()
}

/** Rounds a Cell's corners where its Region line curves, so stripes, highlights and focus stay inside the curve. */
function cornerStyle(corners: CellCorners, radius: number): CSSProperties | undefined {
  if (!corners.some(Boolean)) return undefined
  return { borderRadius: corners.map((round) => (round ? `${radius * 100}%` : '0')).join(' ') }
}

interface BoardCellProps {
  readonly cell: Coord
  readonly region: RegionId | null
  readonly view: CellView
  readonly corners: CellCorners
  readonly cornerRadius: number
  readonly focusable: boolean
  readonly onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
}

function BoardCell({ cell, region, view, corners, cornerRadius, focusable, onKeyDown }: BoardCellProps) {
  const rounded = cornerStyle(corners, cornerRadius)
  return (
    <div
      role="gridcell"
      aria-label={view.label}
      data-row={cell.row}
      data-col={cell.col}
      tabIndex={focusable ? 0 : -1}
      className={`cell ${region === null ? 'is-unassigned' : ''} ${rounded ? 'is-rounded' : ''} ${view.className ?? ''}`}
      style={rounded}
      onKeyDown={onKeyDown}
    >
      {view.content}
    </div>
  )
}

export function BoardView({
  regions,
  label,
  renderCell,
  disabled = false,
  look = 'level',
  onTap = noop,
  onPreview = noop,
  onCommit = noop,
}: BoardViewProps) {
  const size = regions.length
  const style = boardStyle(look)
  const shapes = useMemo(() => boardShapes(regions, style), [regions, style])
  const ring = levelArt(size).ink
  const { boardRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useStroke(
    size,
    { onTap, onPreview, onCommit },
    disabled,
  )

  return (
    <div
      ref={boardRef}
      className={`board look-${look}`}
      role="grid"
      aria-label={label}
      aria-disabled={disabled}
      style={{ '--size': size, '--ring-fill': ring.fill, '--ring-outline': ring.outline } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <RegionAreas areas={shapes.areas} colors={style.regionColors} size={size} />
      {regions.flatMap((cells, row) =>
        cells.map((region, col) => (
          <BoardCell
            key={`${row}-${col}`}
            cell={{ row, col }}
            region={region}
            view={renderCell({ row, col })}
            corners={shapes.cellCorners[row]?.[col] ?? SQUARE_CORNERS}
            cornerRadius={style.cornerRadius}
            onKeyDown={disabled ? undefined : (event) => handleKey(event, { row, col }, size, onTap)}
            focusable={!disabled && row === 0 && col === 0}
          />
        )),
      )}
      {/* Drawn over the Cells; the Board's own border draws its outer edge. */}
      <svg className="board-lines" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="cell-lines" d={shapes.cellLines} />
        <path className="region-lines" d={shapes.regionLines} />
      </svg>
    </div>
  )
}
