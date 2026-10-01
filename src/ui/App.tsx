import { lazy, Suspense } from 'react'
import { strings } from '../strings.ts'
import { HomePage } from './HomePage.tsx'
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
    case 'play':
      return <PlayPage size={route.size} name={route.name} />
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
