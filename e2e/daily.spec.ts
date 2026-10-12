import { expect, test } from '@playwright/test'
import { dailySeed } from '../src/core/daily.ts'
import { generateSeededPuzzle } from '../src/core/generator.ts'

// 12:00 on Monday 12 October 2026 in Hong Kong: the first Daily Puzzle, a Size 6 one.
const MONDAY_NOON = new Date('2026-10-12T04:00:00Z')

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MONDAY_NOON)
})

test("a player plays today's Daily Puzzle from the home page and sees it ticked on the calendar", async ({ page }) => {
  const puzzle = generateSeededPuzzle(6, dailySeed('2026-10-12'))
  if (!puzzle) throw new Error('the Daily Puzzle could not be generated')
  await page.goto('./')

  await page.getByRole('link', { name: '10月12日（一） · Relaxed' }).click()
  await expect(page.getByRole('heading', { name: '每日題目 · 10月12日（一）' })).toBeVisible()
  for (const [row, col] of puzzle.solution.entries()) {
    const cell = page.locator(`[data-row="${row}"][data-col="${col}"]`)
    await cell.click()
    await cell.click()
  }
  await expect(page.getByRole('heading', { name: '通關！' })).toBeVisible()
  await page.getByRole('button', { name: '回月曆' }).click()

  await expect(page.getByRole('heading', { name: '2026 年 10 月' })).toBeVisible()
  await expect(page.getByRole('link', { name: '10月12日（一）' })).toContainText('已通關')
  await expect(page.getByRole('button', { name: '上個月' })).toBeDisabled()
})

test('a day still to come has no Daily Puzzle', async ({ page }) => {
  await page.goto('#/daily/2026-10-13')

  await expect(page.getByText('這一天沒有每日題目。')).toBeVisible()
})
