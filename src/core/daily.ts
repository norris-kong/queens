import { seedFromText } from './random.ts'

/** A day as "YYYY-MM-DD", counted in Hong Kong time, when Daily Puzzles change over. */
export type DailyDate = string
/** A month as "YYYY-MM". */
export type DailyMonth = string

const HONG_KONG_OFFSET_MS = 8 * 60 * 60 * 1000
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/
/** Monday's Size; each later weekday is one bigger, up to Sunday's 12. */
const MONDAY_SIZE = 6

const isoDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

function partsOf(text: string): readonly [number, number] {
  const [year = 0, month = 1] = text.split('-').map(Number)
  return [year, month]
}

function utcMs(date: DailyDate): number {
  const [year, month] = partsOf(date)
  return Date.UTC(year, month - 1, Number(date.slice(8, 10)))
}

/** The Daily Puzzle day it is at `nowMs`: Hong Kong has no daylight saving, so it is always UTC+8. */
export function hongKongDate(nowMs: number): DailyDate {
  return isoDate(nowMs + HONG_KONG_OFFSET_MS)
}

/** Whether text is a real calendar day written as "YYYY-MM-DD". */
export function isDailyDate(text: string): boolean {
  return DATE.test(text) && isoDate(utcMs(text)) === text
}

/** 0 for Sunday through 6 for Saturday. */
export function weekdayOf(date: DailyDate): number {
  return new Date(utcMs(date)).getUTCDay()
}

/** The Size of a day's Daily Puzzle: 6 on Monday, growing by one each day to 12 on Sunday. */
export function dailySize(date: DailyDate): number {
  return MONDAY_SIZE + ((weekdayOf(date) + 6) % 7)
}

export function dailySeed(date: DailyDate): number {
  return seedFromText(`daily:${date}`)
}

/** Daily Puzzles exist from the first day on, up to today; never for days still to come. */
export function isPlayableDay(date: string, first: DailyDate, today: DailyDate): boolean {
  return isDailyDate(date) && date >= first && date <= today
}

export function monthOf(date: DailyDate): DailyMonth {
  return date.slice(0, 7)
}

export function shiftMonth(month: DailyMonth, delta: number): DailyMonth {
  const [year, monthNumber] = partsOf(month)
  return isoDate(Date.UTC(year, monthNumber - 1 + delta, 1)).slice(0, 7)
}

/** Every day of a month, in order. */
export function daysOfMonth(month: DailyMonth): DailyDate[] {
  const [year, monthNumber] = partsOf(month)
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  return Array.from({ length: count }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`)
}
