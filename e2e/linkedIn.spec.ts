import { expect, test } from '@playwright/test'
import type { LinkedInCatalog } from '../src/core/linkedInCatalog.ts'
import { linkedInPuzzles } from './firstPuzzle.ts'

let catalog: LinkedInCatalog

test.beforeAll(async () => {
  catalog = await linkedInPuzzles()
})

test("a player finds LinkedIn's Puzzles apart from the others, credited, and plays them in order", async ({ page }) => {
  const [first, second] = catalog.puzzles
  if (!first || !second) throw new Error('E2E needs at least two LinkedIn Puzzles')
  await page.goto('./')

  await page.getByRole('link', { name: new RegExp(`${catalog.puzzles.length} 題`) }).click()
  await expect(page.getByRole('heading', { name: 'LinkedIn Queens' })).toBeVisible()
  await expect(page.getByText('與 LinkedIn、Microsoft 無關')).toBeVisible()

  await page.locator(`a[href="#/linkedin/${first.number}"]`).click()
  await expect(page.getByRole('heading', { name: `LinkedIn #${first.number}` })).toBeVisible()
  // LinkedIn's Puzzles keep LinkedIn's look: flat Cells and black lines between Regions.
  await expect(page.locator('.board')).toHaveClass(/\blook-linkedIn\b/)
  await expect(page.locator('.board .tile')).toHaveCount(0)
  await expect(page.locator('.board .region-lines')).toHaveCount(1)
  for (const [row, col] of first.puzzle.solution.entries()) {
    const cell = page.locator(`[data-row="${row}"][data-col="${col}"]`)
    await cell.click()
    await cell.click()
    // LinkedIn's Queens wear LinkedIn's crown, not a Level logo.
    if (row === 0) await expect(cell.locator('svg.crown')).toBeVisible()
  }
  await expect(page.locator('img.queen.is-solved[src*="crown-solved"]')).toHaveCount(first.puzzle.size)
  await page.getByRole('button', { name: '下一題' }).click()

  await expect(page.getByRole('heading', { name: `LinkedIn #${second.number}` })).toBeVisible()
  await page.getByRole('link', { name: '‹ LinkedIn 題目' }).click()
  await expect(page.locator(`a[href="#/linkedin/${first.number}"]`)).toContainText('已通關')
})
