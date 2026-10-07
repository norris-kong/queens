import { expect, type Locator, type Page, test } from '@playwright/test'
import type { Coord } from '../src/core/types.ts'
import { type FirstPuzzle, firstPuzzle } from './firstPuzzle.ts'

let target: FirstPuzzle

test.beforeAll(async () => {
  target = await firstPuzzle()
})

const cell = (page: Page, { row, col }: Coord): Locator => page.locator(`[data-row="${row}"][data-col="${col}"]`)

async function dragAcross(page: Page, from: Coord, to: Coord) {
  const start = await cell(page, from).boundingBox()
  const end = await cell(page, to).boundingBox()
  if (!start || !end) throw new Error('cells are not on screen')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 })
  await page.mouse.up()
}

test('the list groups Puzzles under their Level and shows only their number', async ({ page }) => {
  await page.goto('./')
  const first = page.locator(`a[href="${target.path}"]`)

  await expect(page.getByRole('heading', { name: 'Beginner', exact: true })).toBeVisible()
  await expect(first).toHaveText('1')

  await first.click()
  await expect(page.getByRole('heading', { name: 'Beginner 1', exact: true })).toBeVisible()
})

test('a player solves a Puzzle and sees it ticked in the list', async ({ page }) => {
  await page.goto('./')
  await page.locator(`a[href="${target.path}"]`).click()

  // Asking twice before the next Move counts as one Hint.
  await page.getByRole('button', { name: '提示' }).click()
  await page.getByRole('button', { name: '提示' }).click()
  for (const coord of target.solution) {
    await cell(page, coord).click()
    await cell(page, coord).click()
  }

  await expect(page.getByRole('heading', { name: '通關！' })).toBeVisible()
  await expect(page.getByText(/解題時間 \d+:\d\d · 使用提示 1 次/)).toBeVisible()

  await page.getByRole('link', { name: '‹ 題目列表' }).click()
  await expect(page.locator(`a[href="${target.path}"]`)).toContainText('已通關')
})

test('opening a Puzzle without playing it does not mark it in progress', async ({ page }) => {
  await page.goto(target.path)
  await expect(cell(page, { row: 0, col: 0 })).toBeVisible()

  await page.getByRole('link', { name: '‹ 題目列表' }).click()

  await expect(page.locator(`a[href="${target.path}"]`)).not.toContainText('進行中')
})

test('a player marks with a drag, then undoes and resets', async ({ page }) => {
  await page.goto(target.path)
  const lastCol = target.puzzle.size - 1

  await dragAcross(page, { row: 0, col: 0 }, { row: 0, col: lastCol })
  await expect(cell(page, { row: 0, col: lastCol })).toHaveAttribute('aria-label', /X$/)

  await page.getByRole('button', { name: '復原' }).click()
  await expect(cell(page, { row: 0, col: lastCol })).toHaveAttribute('aria-label', /空白$/)
  await expect(cell(page, { row: 0, col: 0 })).toHaveAttribute('aria-label', /空白$/)

  await cell(page, { row: 1, col: 1 }).click()
  await page.getByRole('button', { name: '重來' }).click()
  await expect(cell(page, { row: 1, col: 1 })).toHaveAttribute('aria-label', /空白$/)

  await page.getByRole('button', { name: '復原' }).click()
  await expect(cell(page, { row: 1, col: 1 })).toHaveAttribute('aria-label', /X$/)
})

test('a player who misplaces a Queen gets it pointed out, and sees Conflicts striped', async ({ page }) => {
  await page.goto(target.path)
  const wrong = target.wrongCell

  await cell(page, wrong).click()
  await cell(page, wrong).click()
  await page.getByRole('button', { name: '提示' }).click()

  await expect(page.getByText('這個皇后放錯了位置。')).toBeVisible()
  await expect(cell(page, wrong)).toHaveClass(/is-hinted/)

  // A second Queen in the same row is a Conflict: the whole row is striped and the hint goes away.
  const sameRow = { row: wrong.row, col: wrong.col + 2 < target.puzzle.size ? wrong.col + 2 : wrong.col - 2 }
  await cell(page, sameRow).click()
  await cell(page, sameRow).click()
  await expect(cell(page, wrong)).not.toHaveClass(/is-hinted/)
  await expect(cell(page, { row: wrong.row, col: (wrong.col + 1) % target.puzzle.size })).toHaveClass(/is-striped/)
})

test('progress survives a reload', async ({ page }) => {
  await page.goto(target.path)
  const coord = target.solution[0] as Coord

  await cell(page, coord).click()
  await cell(page, coord).click()
  await page.reload()

  await expect(cell(page, coord)).toHaveAttribute('aria-label', /皇后$/)
})
