import { lazy, Suspense } from 'react'
import { strings } from '../strings.ts'
import { DailyCalendarPage } from './DailyCalendarPage.tsx'
import { DailyPlayPage } from './DailyPlayPage.tsx'
import { HomePage } from './HomePage.tsx'
import { LevelPage } from './LevelPage.tsx'
import { LinkedInPage } from './LinkedInPage.tsx'
import { LinkedInPlayPage } from './LinkedInPlayPage.tsx'
import { NightmarePage } from './NightmarePage.tsx'
import { PlayPage } from './PlayPage.tsx'
import { routeHash } from './routes.ts'
import { RulesPage } from './RulesPage.tsx'
import { useHashRoute } from './useHashRoute.ts'

// The editor exists only on the dev server; production builds drop it entirely.
const EditorPage = import.meta.env.DEV ? lazy(() => import('./editor/EditorPage.tsx')) : null

function NotFound() {
  return (
    <main className="page">
      <p>{strings.pageNotFound}</p>
      <a href={routeHash({ page: 'home' })}>{strings.backToList}</a>
    </main>
  )
}

export function App() {
  const route = useHashRoute()

  switch (route.page) {
    case 'home':
      return <HomePage />
    case 'rules':
      return <RulesPage />
    case 'level':
      return <LevelPage size={route.size} />
    case 'play':
      return <PlayPage size={route.size} name={route.name} />
    case 'linkedIn':
      return <LinkedInPage />
    case 'linkedInPlay':
      return <LinkedInPlayPage number={route.number} />
    case 'daily':
      return <DailyCalendarPage />
    case 'dailyPlay':
      return <DailyPlayPage date={route.date} />
    case 'nightmare':
      return <NightmarePage />
    case 'editor':
      return EditorPage ? (
        <Suspense fallback={null}>
          <EditorPage key={routeHash(route)} size={route.size} name={route.name} />
        </Suspense>
      ) : (
        <NotFound />
      )
    case 'notFound':
      return <NotFound />
  }
}
