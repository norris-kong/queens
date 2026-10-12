import { useState } from 'react'
import { DAILY_FIRST_DATE } from '../config.ts'
import { type DailyDate, daysOfMonth, isPlayableDay, monthOf, shiftMonth, weekdayOf } from '../core/daily.ts'
import { strings } from '../strings.ts'
import { dailyStore } from './progressStorage.ts'
import { StatusMark } from './PuzzleLink.tsx'
import { routeHash } from './routes.ts'
import { useToday } from './useToday.ts'

function CalendarDay({ date, today }: { readonly date: DailyDate; readonly today: DailyDate }) {
  const day = Number(date.slice(8))
  if (!isPlayableDay(date, DAILY_FIRST_DATE, today)) return <span className="calendar-day calendar-day-off">{day}</span>
  const status = dailyStore.status(date)
  return (
    <a
      className="calendar-day"
      href={routeHash({ page: 'dailyPlay', date })}
      aria-label={strings.dayLabel(date)}
      aria-current={date === today ? 'date' : undefined}
    >
      <span>{day}</span>
      {status !== 'new' && <StatusMark status={status} />}
    </a>
  )
}

export function DailyCalendarPage() {
  const today = useToday()
  const firstMonth = monthOf(DAILY_FIRST_DATE)
  const lastMonth = monthOf(today)
  const [month, setMonth] = useState(lastMonth)
  const days = daysOfMonth(month)
  // Weeks start on Monday; Sunday (0) goes last.
  const leadingBlanks = (weekdayOf(days[0] ?? `${month}-01`) + 6) % 7

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.dailyHeading}</h1>
      </header>
      <div className="month-nav">
        <button
          type="button"
          className="button"
          aria-label={strings.previousMonth}
          disabled={month <= firstMonth}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ‹
        </button>
        <h2>{strings.monthTitle(month)}</h2>
        <button
          type="button"
          className="button"
          aria-label={strings.nextMonth}
          disabled={month >= lastMonth}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar" role="presentation">
        {strings.calendarWeekdays.map((weekday) => (
          <span key={weekday} className="calendar-weekday" aria-hidden="true">
            {weekday}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {days.map((date) => (
          <CalendarDay key={date} date={date} today={today} />
        ))}
      </div>
    </main>
  )
}
