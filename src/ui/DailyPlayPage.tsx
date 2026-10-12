import { DAILY_FIRST_DATE } from '../config.ts'
import { dailySeed, dailySize, isPlayableDay } from '../core/daily.ts'
import { saveSlot } from '../core/progress.ts'
import { strings } from '../strings.ts'
import { GeneratedPlay } from './GeneratedPlay.tsx'
import { dailyStore } from './progressStorage.ts'
import { routeHash } from './routes.ts'
import { navigate } from './useHashRoute.ts'
import { useToday } from './useToday.ts'

export function DailyPlayPage({ date }: { readonly date: string }) {
  const playable = isPlayableDay(date, DAILY_FIRST_DATE, useToday())

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'daily' })}>
          {strings.backToCalendar}
        </a>
        {playable && <h1>{strings.dailyTitle(date)}</h1>}
      </header>
      {playable ? (
        <>
          <p className="muted">{strings.dailyLevel(date)}</p>
          <GeneratedPlay
            key={date}
            size={dailySize(date)}
            seed={dailySeed(date)}
            slotFor={(puzzle) => saveSlot(dailyStore, date, puzzle)}
            next={{ label: strings.backToCalendarButton, go: () => navigate({ page: 'daily' }) }}
          />
        </>
      ) : (
        <p>{strings.dailyUnavailable}</p>
      )}
    </main>
  )
}
