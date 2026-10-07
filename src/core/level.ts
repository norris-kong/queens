/** Each Size's Level, the name players see it under, by Size from 4 up. */
const LEVEL_NAMES: readonly string[] = [
  'Beginner',
  'Easy',
  'Relaxed',
  'Normal',
  'Intermediate',
  'Challenging',
  'Hard',
  'Expert',
  'Master',
]

const FIRST_LEVEL_SIZE = 4

/** The Level of a Size, e.g. 4 → "Beginner"; a Size without one is shown as "N×N". */
export function levelName(size: number): string {
  return LEVEL_NAMES[size - FIRST_LEVEL_SIZE] ?? `${size}×${size}`
}
