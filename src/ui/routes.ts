export type Route =
  | { readonly page: 'home' }
  | { readonly page: 'rules' }
  | { readonly page: 'play'; readonly size: number; readonly name: string }
  | { readonly page: 'editor'; readonly size?: number; readonly name?: string }
  | { readonly page: 'notFound' }

const PUZZLE_PATH = /^\/(play|editor)\/(\d+)\/([a-z0-9_-]+)$/

/** Reads the page from the URL hash, e.g. "#/play/8/spiral". Hash routes work on any static host. */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/') return { page: 'home' }
  if (path === '/rules') return { page: 'rules' }
  if (path === '/editor') return { page: 'editor' }
  const match = PUZZLE_PATH.exec(path)
  if (!match) return { page: 'notFound' }
  const [, page, size, name] = match
  return { page: page as 'play' | 'editor', size: Number(size), name: name ?? '' }
}

export function routeHash(route: Route): string {
  switch (route.page) {
    case 'home':
    case 'notFound':
      return '#/'
    case 'rules':
      return '#/rules'
    case 'play':
      return `#/play/${route.size}/${route.name}`
    case 'editor':
      return route.size === undefined || route.name === undefined
        ? '#/editor'
        : `#/editor/${route.size}/${route.name}`
  }
}
