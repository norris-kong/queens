/** Where the editor saves a Puzzle: among the author's own, or among the LinkedIn Puzzles. */
export type Collection = 'own' | 'linkedIn'

export type Route =
  | { readonly page: 'home' }
  | { readonly page: 'rules' }
  | { readonly page: 'level'; readonly size: number }
  | { readonly page: 'play'; readonly size: number; readonly name: string }
  | {
      readonly page: 'editor'
      readonly size?: number
      readonly name?: string
      readonly linkedIn?: number
      /** For a new Draft (a Size but no name): where it will be saved. */
      readonly collection?: Collection
    }
  | { readonly page: 'linkedIn' }
  | { readonly page: 'linkedInPlay'; readonly number: number }
  | { readonly page: 'daily' }
  | { readonly page: 'dailyPlay'; readonly date: string }
  | { readonly page: 'nightmare' }
  | { readonly page: 'notFound' }

const PUZZLE_PATH = /^\/(play|editor)\/(\d+)\/([^/]+)$/
const LEVEL_PATH = /^\/level\/(\d+)$/
const LINKEDIN_PATH = /^\/linkedin\/([1-9]\d*)$/
const EDITOR_LINKEDIN_PATH = /^\/editor\/linkedin\/([1-9]\d*)$/
const EDITOR_NEW_PATH = /^\/editor\/new\/(\d+)(\/linkedin)?$/
const DAILY_PATH = /^\/daily\/(\d{4}-\d{2}-\d{2})$/

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
  const editorLinkedIn = EDITOR_LINKEDIN_PATH.exec(path)
  if (editorLinkedIn) return { page: 'editor', linkedIn: Number(editorLinkedIn[1]) }
  const editorNew = EDITOR_NEW_PATH.exec(path)
  if (editorNew) {
    const size = Number(editorNew[1])
    return editorNew[2] ? { page: 'editor', size, collection: 'linkedIn' } : { page: 'editor', size }
  }
  const level = LEVEL_PATH.exec(path)
  if (level) return { page: 'level', size: Number(level[1]) }
  if (path === '/linkedin') return { page: 'linkedIn' }
  const linkedIn = LINKEDIN_PATH.exec(path)
  if (linkedIn) return { page: 'linkedInPlay', number: Number(linkedIn[1]) }
  if (path === '/daily') return { page: 'daily' }
  if (path === '/nightmare') return { page: 'nightmare' }
  const daily = DAILY_PATH.exec(path)
  if (daily?.[1]) return { page: 'dailyPlay', date: daily[1] }
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
    case 'level':
      return `#/level/${route.size}`
    case 'play':
      return `#/play/${route.size}/${encodeURIComponent(route.name)}`
    case 'editor':
      if (route.linkedIn !== undefined) return `#/editor/linkedin/${route.linkedIn}`
      if (route.size === undefined) return '#/editor'
      if (route.name !== undefined) return `#/editor/${route.size}/${encodeURIComponent(route.name)}`
      return `#/editor/new/${route.size}${route.collection === 'linkedIn' ? '/linkedin' : ''}`
    case 'linkedIn':
      return '#/linkedin'
    case 'linkedInPlay':
      return `#/linkedin/${route.number}`
    case 'daily':
      return '#/daily'
    case 'dailyPlay':
      return `#/daily/${route.date}`
    case 'nightmare':
      return '#/nightmare'
  }
}
