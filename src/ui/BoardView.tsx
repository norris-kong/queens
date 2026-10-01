import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { REGION_COLORS } from '../config.ts'
import type { Coord, DraftGrid, RegionId } from '../core/types.ts'
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
}

const ARROW_STEPS: Readonly<Record<string, Coord>> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
}

const noop = () => undefined

/** Thin Cell lines on every inner edge; the board's own border draws the outer edge. */
function cellClasses(region: RegionId | null, { row, col }: Coord): string {
  return [row === 0 ? 'edge-top' : '', col === 0 ? 'edge-left' : '', region === null ? 'is-unassigned' : ''].join(' ')
}

/**
 * Thick lines wherever neighbouring Cells belong to different Regions, as one SVG path in Cell units.
 * Drawn over the Cells with square line caps, so lines meeting at a corner always join without a gap.
 */
function regionBorderPath(regions: DraftGrid): string {
  return regions
    .flatMap((cells, row) =>
      cells.flatMap((region, col) => [
        ...(col > 0 && cells[col - 1] !== region ? [`M${col} ${row}V${row + 1}`] : []),
        ...(row > 0 && regions[row - 1]?.[col] !== region ? [`M${col} ${row}H${col + 1}`] : []),
      ]),
    )
    .join('')
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

interface BoardCellProps {
  readonly cell: Coord
  readonly region: RegionId | null
  readonly view: CellView
  readonly focusable: boolean
  readonly onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
}

function BoardCell({ cell, region, view, focusable, onKeyDown }: BoardCellProps) {
  const color = region === null ? undefined : REGION_COLORS[region]
  return (
    <div
      role="gridcell"
      aria-label={view.label}
      data-row={cell.row}
      data-col={cell.col}
      tabIndex={focusable ? 0 : -1}
      className={`cell ${cellClasses(region, cell)} ${view.className ?? ''}`}
      style={color ? ({ '--region': color } as CSSProperties) : undefined}
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
  onTap = noop,
  onPreview = noop,
  onCommit = noop,
}: BoardViewProps) {
  const size = regions.length
  const { boardRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useStroke(
    size,
    { onTap, onPreview, onCommit },
    disabled,
  )

  return (
    <div
      ref={boardRef}
      className="board"
      role="grid"
      aria-label={label}
      aria-disabled={disabled}
      style={{ '--size': size } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      {regions.flatMap((cells, row) =>
        cells.map((region, col) => (
          <BoardCell
            key={`${row}-${col}`}
            cell={{ row, col }}
            region={region}
            view={renderCell({ row, col })}
            onKeyDown={disabled ? undefined : (event) => handleKey(event, { row, col }, size, onTap)}
            focusable={!disabled && row === 0 && col === 0}
          />
        )),
      )}
      <svg className="region-lines" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={regionBorderPath(regions)} />
      </svg>
    </div>
  )
}
