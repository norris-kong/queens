import { useState } from 'react'
import { type DailyDate, hongKongDate } from '../core/daily.ts'

/** Today's Daily Puzzle day, read once when the page opens. */
export function useToday(): DailyDate {
  const [today] = useState(() => hongKongDate(Date.now()))
  return today
}
