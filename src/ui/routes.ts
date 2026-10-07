export type Route =
  | { readonly page: 'home' }
  | { readonly page: 'rules' }
  | { readonly page: 'play'; readonly size: number; readonly name: string }
  | { readonly page: 'editor'; readonly size?: number; readonly name?: string }
  | { readonly page: 'notFound' }

const PUZZLE_PATH = /^\/(play|editor)\/(\d+)\/([^/]+)$/

function decodeName(escaped: string): string | null {
  try {
    return decodeURIComponent(escaped)
  } catch {
    return null
  }
}

/** Reads the page from the URL hash, e.g. "#/play/4/Beginner%201". Hash routes work on any static host. */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/') return { page: 'home' }
  if (path === '/rules') return { page: 'rules' }
  if (path === '/editor') return { page: 'editor' }
  const match = PUZZLE_PATH.exec(path)
  const name = decodeName(match?.[3] ?? '')
  if (!match || !name) return { page: 'notFound' }
  return { page: match[1] as 'play' | 'editor', size: Number(match[2]), name }
}

export function routeHash(route: Route): string {
  switch (route.page) {
    case 'home':
    case 'notFound':
      return '#/'
    case 'rules':
      return '#/rules'
    case 'play':
      return `#/play/${route.size}/${encodeURIComponent(route.name)}`
    case 'editor':
      return route.size === undefined || route.name === undefined
        ? '#/editor'
        : `#/editor/${route.size}/${encodeURIComponent(route.name)}`
  }
}
