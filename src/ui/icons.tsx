import type { CSSProperties } from 'react'
import { levelArt } from './levelArt.ts'

interface QueenMarkProps {
  /** The Board's Size, whose Level's logo the Queen wears. */
  readonly size: number
  readonly className?: string
  readonly style?: CSSProperties
}

/** A Queen, drawn as the logo of the Board's Level: an acorn on Beginner Boards, a bird on Easy ones, and so on. */
export function QueenMark({ size, className = '', style }: QueenMarkProps) {
  return (
    <img
      className={`cell-icon queen ${className}`}
      src={levelArt(size).logo}
      alt=""
      draggable={false}
      style={style}
    />
  )
}

export function MarkIcon() {
  return (
    <svg className="cell-icon mark" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
