import { describe, expect, it } from 'vitest'
import { filterLinkedIn } from './linkedInFilter.ts'
import type { ProgressStatus } from './progress.ts'

const STATUS: Record<number, ProgressStatus> = { 1: 'solved', 2: 'inProgress', 3: 'new', 4: 'solved', 5: 'new' }
const statusOf = (number: number): ProgressStatus => STATUS[number] ?? 'new'

describe('filterLinkedIn', () => {
  it('keeps only Puzzles not yet Solved, new or in progress, in their order', () => {
    expect(filterLinkedIn([1, 2, 3, 4, 5], statusOf, 'unsolved')).toEqual([2, 3, 5])
  })

  it('keeps every Puzzle when asked for all', () => {
    expect(filterLinkedIn([1, 2, 3, 4, 5], statusOf, 'all')).toEqual([1, 2, 3, 4, 5])
  })

  it('leaves an empty list empty', () => {
    expect(filterLinkedIn([], statusOf, 'unsolved')).toEqual([])
  })

  it('does not change the list it is given', () => {
    const entries = [1, 2, 3]
    filterLinkedIn(entries, statusOf, 'unsolved')
    expect(entries).toEqual([1, 2, 3])
  })
})
