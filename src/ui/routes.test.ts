import { describe, expect, it } from 'vitest'
import { parseRoute, type Route, routeHash } from './routes.ts'

describe('hash routes', () => {
  it.each<Route>([
    { page: 'home' },
    { page: 'rules' },
    { page: 'editor' },
    { page: 'play', size: 4, name: 'Beginner 1' },
    { page: 'editor', size: 12, name: 'difficulty-hard' },
  ])('reads back the hash it writes for %j', (route) => {
    expect(parseRoute(routeHash(route))).toEqual(route)
  })

  it('escapes the spaces in a Puzzle Name', () => {
    expect(routeHash({ page: 'play', size: 4, name: 'Beginner 1' })).toBe('#/play/4/Beginner%201')
  })

  it.each(['#/play/4/%E0%A4%A', '#/play/4/', '#/play/x/Beginner%201', '#/somewhere'])(
    'treats %j as a page that does not exist',
    (hash) => {
      expect(parseRoute(hash)).toEqual({ page: 'notFound' })
    },
  )
})
