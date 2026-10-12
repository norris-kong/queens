import { DAILY_FIRST_DATE } from '../config.ts'
import { isPlayableDay } from '../core/daily.ts'
import { strings } from '../strings.ts'
import { dailyStore } from './progressStorage.ts'
import { StatusMark } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'
import { useToday } from './useToday.ts'

/** Today's Daily Puzzle at the top of the home page, with the way to the calendar. */
export function DailyCard() {
  const today = useToday()
  if (!isPlayableDay(today, DAILY_FIRST_DATE, today)) return null
  const status = dailyStore.status(today)

  return (
    <section className="size-group" aria-labelledby="daily">
      <h2 id="daily">{strings.dailyHeading}</h2>
      <div className="daily-row">
        <a className="entry-link" href={routeHash({ page: 'dailyPlay', date: today })}>
          <span>{strings.dailyCardLine(today)}</span>
          {status === 'new' ? <span aria-hidden="true">›</span> : <StatusMark status={status} />}
        </a>
        <a className="calendar-link" href={routeHash({ page: 'daily' })}>
          {strings.calendarLink}
        </a>
      </div>
    </section>
  )
}
