import { type PointerEvent, useRef } from 'react'
import type { Coord } from '../core/types.ts'

export interface StrokeHandlers {
  /** The pointer went down and up on the same Cell. */
  readonly onTap: (cell: Coord) => void
  /** The Cells passed so far in a drag, starting Cell first; null when the drag is abandoned. */
  readonly onPreview: (cells: readonly Coord[] | null) => void
  /** The drag ended; these are all the Cells it passed. */
  readonly onCommit: (cells: readonly Coord[]) => void
}

const sameCell = (a: Coord, b: Coord) => a.row === b.row && a.col === b.col

/** Cells on the straight line from `from` (excluded) to `to` (included), so fast drags skip nothing. */
function cellsBetween(from: Coord, to: Coord): Coord[] {
  const steps = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))
  return Array.from({ length: steps }, (_, index) => ({
    row: Math.round(from.row + ((to.row - from.row) * (index + 1)) / steps),
    col: Math.round(from.col + ((to.col - from.col) * (index + 1)) / steps),
  }))
}

/** Turns pointer input on a board into taps and drag strokes, the same way for mouse and touch. */
export function useStroke(size: number, handlers: StrokeHandlers, disabled: boolean) {
  const boardRef = useRef<HTMLDivElement>(null)
  const strokeRef = useRef<Coord[] | null>(null)

  function cellAtPoint(x: number, y: number): Coord | null {
    const board = boardRef.current
    if (!board || board.clientWidth === 0) return null
    // Measure inside the board's border, where the Cells are.
    const rect = board.getBoundingClientRect()
    const col = Math.floor(((x - rect.left - board.clientLeft) / board.clientWidth) * size)
    const row = Math.floor(((y - rect.top - board.clientTop) / board.clientHeight) * size)
    return row >= 0 && row < size && col >= 0 && col < size ? { row, col } : null
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
    const cell = cellAtPoint(event.clientX, event.clientY)
    if (!cell) return
    event.currentTarget.setPointerCapture(event.pointerId)
    strokeRef.current = [cell]
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const stroke = strokeRef.current
    const last = stroke?.at(-1)
    const cell = cellAtPoint(event.clientX, event.clientY)
    if (!stroke || !last || !cell || sameCell(cell, last)) return
    const extended = [...stroke, ...cellsBetween(last, cell)]
    strokeRef.current = extended
    handlers.onPreview(extended)
  }

  function onPointerUp() {
    const stroke = strokeRef.current
    strokeRef.current = null
    const [start] = stroke ?? []
    if (!stroke || !start) return
    if (stroke.length === 1) handlers.onTap(start)
    else handlers.onCommit(stroke)
  }

  function onPointerCancel() {
    if (strokeRef.current === null) return
    strokeRef.current = null
    handlers.onPreview(null)
  }

  return { boardRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
