import { useEffect, useState } from 'react'
import { parseRoute, type Route, routeHash } from './routes.ts'

export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return parseRoute(hash)
}

export function navigate(route: Route): void {
  window.location.hash = routeHash(route)
}
