import type { ProgressStatus } from './progress.ts'

/** Which LinkedIn Puzzles the list shows: all of them, or only those not yet Solved. */
export type LinkedInFilter = 'unsolved' | 'all'

/**
 * The entries the list should show, in their given order. `unsolved` keeps new and in-progress
 * Puzzles, so a half-finished one stays in sight until it is ticked.
 */
export function filterLinkedIn<T>(
  entries: readonly T[],
  statusOf: (entry: T) => ProgressStatus,
  filter: LinkedInFilter,
): readonly T[] {
  return filter === 'all' ? entries : entries.filter((entry) => statusOf(entry) !== 'solved')
}
