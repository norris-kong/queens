import { describe, expect, it } from 'vitest'
import {
  dailySeed,
  dailySize,
  daysOfMonth,
  hongKongDate,
  isDailyDate,
  isPlayableDay,
  monthOf,
  shiftMonth,
  weekdayOf,
} from './daily.ts'

describe('hongKongDate', () => {
  it('changes the day at midnight in Hong Kong, 16:00 UTC', () => {
    expect(hongKongDate(Date.parse('2026-10-11T15:59:59Z'))).toBe('2026-10-11')
    expect(hongKongDate(Date.parse('2026-10-11T16:00:00Z'))).toBe('2026-10-12')
  })
})

describe('isDailyDate', () => {
  it.each(['2026-10-12', '2028-02-29'])('accepts %s', (text) => {
    expect(isDailyDate(text)).toBe(true)
  })

  it.each(['2026-02-30', '2026-13-01', '2026-1-01', 'today', ''])('refuses %j', (text) => {
    expect(isDailyDate(text)).toBe(false)
  })
})

describe('dailySize', () => {
  it('grows from 6 on Monday to 12 on Sunday', () => {
    const week = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']

    expect(week.map(weekdayOf)).toEqual([1, 2, 3, 4, 5, 6, 0])
    expect(week.map(dailySize)).toEqual([6, 7, 8, 9, 10, 11, 12])
  })
})

describe('dailySeed', () => {
  it('gives each day its own seed, the same every time', () => {
    expect(dailySeed('2026-10-12')).toBe(dailySeed('2026-10-12'))
    expect(dailySeed('2026-10-12')).not.toBe(dailySeed('2026-10-13'))
  })
})

describe('isPlayableDay', () => {
  it.each([
    ['the first day', '2026-10-12', true],
    ['today', '2026-11-03', true],
    ['a day in between', '2026-10-31', true],
    ['a day before the first', '2026-10-11', false],
    ['a day still to come', '2026-11-04', false],
    ['something that is not a day', '2026-10-32', false],
  ])('%s → %s', (_, date, playable) => {
    expect(isPlayableDay(date, '2026-10-12', '2026-11-03')).toBe(playable)
  })
})

describe('months', () => {
  it('finds the month of a day and steps across years', () => {
    expect(monthOf('2026-10-12')).toBe('2026-10')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })

  it('lists every day of a month, leap years included', () => {
    expect(daysOfMonth('2026-10')).toHaveLength(31)
    expect(daysOfMonth('2026-10')[0]).toBe('2026-10-01')
    expect(daysOfMonth('2026-02')).toHaveLength(28)
    expect(daysOfMonth('2028-02')).toHaveLength(29)
  })
})
