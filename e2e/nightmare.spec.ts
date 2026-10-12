import { expect, type Page, test } from '@playwright/test'
import { generateSeededPuzzle } from '../src/core/generator.ts'
import { stageSeed, stageSize } from '../src/core/nightmare.ts'
import type { Puzzle } from '../src/core/types.ts'
import { lastPuzzle } from './firstPuzzle.ts'

async function solve(page: Page, puzzle: Puzzle) {
  for (const [row, col] of puzzle.solution.entries()) {
    const cell = page.locator(`[data-row="${row}"][data-col="${col}"]`)
    await cell.click()
    await cell.click()
  }
  await expect(page.getByRole('heading', { name: '通關！' })).toBeVisible()
}

function stage(number: number): Puzzle {
  const puzzle = generateSeededPuzzle(stageSize(number), stageSeed(number))
  if (!puzzle) throw new Error(`Nightmare Stage ${number} could not be generated`)
  return puzzle
}

test('a player clears a Nightmare Stage, moves on, and cannot go back', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('link', { name: '第 1 關 · 6 × 6' }).click()
  await expect(page.getByRole('heading', { name: 'Nightmare 第 1 關' })).toBeVisible()

  await solve(page, stage(1))
  await expect(page.getByRole('button', { name: '重玩' })).toHaveCount(0)
  await page.getByRole('button', { name: '下一關' }).click()
  await expect(page.getByRole('heading', { name: 'Nightmare 第 2 關' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Nightmare 第 2 關' })).toBeVisible()
  await page.getByRole('link', { name: '‹ 題目列表' }).click()
  await expect(page.getByRole('link', { name: '第 2 關 · 6 × 6' })).toBeVisible()
})

test('solving the last Master Puzzle leads on to Nightmare', async ({ page }) => {
  const last = await lastPuzzle()
  await page.goto(last.path)

  await solve(page, last.puzzle)
  await page.getByRole('button', { name: '挑戰 Nightmare' }).click()

  await expect(page.getByRole('heading', { name: 'Nightmare 第 1 關' })).toBeVisible()
})
