import type { CSSProperties } from 'react'
import solvedCrown from '../assets/linkedin/crown-solved.svg'
import { levelArt } from './levelArt.ts'
import type { Look } from './look.ts'

/** LinkedIn's crown, as drawn on its Boards during play. */
const CROWN_PATH =
  'M23.25 7C23.25 7.69 22.69 8.25 22 8.25C21.89 8.25 21.78 8.21 21.68 8.18L19 17.99H5L2.32 8.18C2.21 8.21 2.11 8.25 2 8.25C1.31 8.25 0.75 7.69 0.75 7C0.75 6.31 1.31 5.75 2 5.75C2.69 5.75 3.25 6.31 3.25 7C3.25 7.31 3.13 7.59 2.94 7.8L9 13L11.65 4.18C11.14 4.03 10.75 3.57 10.75 3C10.75 2.31 11.31 1.75 12 1.75C12.69 1.75 13.25 2.31 13.25 3C13.25 3.56 12.87 4.02 12.35 4.18L15 13L21.06 7.8C20.87 7.58 20.75 7.31 20.75 7C20.75 6.31 21.31 5.75 22 5.75C22.69 5.75 23.25 6.31 23.25 7ZM19 19H5C4.45 19 4 19.45 4 20C4 20.55 4.45 21 5 21H19C19.55 21 20 20.55 20 20C20 19.45 19.55 19 19 19Z'

interface QueenMarkProps {
  /** The Board's Size, whose Level's logo the Queen wears in the `level` look. */
  readonly size: number
  /** As the Board's Level logo, or, on LinkedIn Puzzles, as LinkedIn's crown. */
  readonly look?: Look
  /** Is the Puzzle Solved? LinkedIn's crown then turns to its golden, animated one. */
  readonly solved?: boolean
  readonly className?: string
  readonly style?: CSSProperties
}

/**
 * A Queen: the logo of the Board's Level (an acorn on Beginner Boards, a bird on Easy ones, and so
 * on), or on LinkedIn Puzzles LinkedIn's crown, golden once Solved.
 */
export function QueenMark({ size, look = 'level', solved = false, className = '', style }: QueenMarkProps) {
  if (look === 'linkedIn' && !solved) {
    return (
      <svg className={`cell-icon queen crown ${className}`} viewBox="0 0 24 24" aria-hidden="true" style={style}>
        <path fill="currentColor" d={CROWN_PATH} />
      </svg>
    )
  }
  const src = look === 'linkedIn' ? solvedCrown : levelArt(size).logo
  return <img className={`cell-icon queen ${className}`} src={src} alt="" draggable={false} style={style} />
}

export function MarkIcon() {
  return (
    <svg className="cell-icon mark" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
