import { expect, test } from '@playwright/test'
import { nextLinkedInNumber } from '../src/core/linkedInCatalog.ts'
import { linkedInPuzzles } from './firstPuzzle.ts'

// These flows never press 儲存, so they leave the puzzles/ folder untouched.

test('a new Puzzle is named after its Level and the next free number', async ({ page }) => {
  await page.goto('#/editor')
  const name = page.getByLabel('題目名稱')

  await page.getByLabel('尺寸').selectOption('4')
  await expect(name).toHaveValue(/^Beginner \d+$/)

  await page.getByLabel('尺寸').selectOption('5')
  await expect(name).toHaveValue(/^Easy \d+$/)

  await name.fill('My Puzzle 2')
  await expect(page.getByText('題目名稱只能用', { exact: false })).toBeHidden()
})

test('the author generates a valid Puzzle with one click', async ({ page }) => {
  await page.goto('#/editor')
  await page.getByLabel('尺寸').selectOption('7')

  await page.getByRole('button', { name: '自動出題' }).click()

  await expect(page.getByText('✓ 唯一解，可以儲存。')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('已使用 7 / 7 個區域。')).toBeVisible()
})

test('generating over a painted Draft asks first, and keeps the Draft when declined', async ({ page }) => {
  await page.goto('#/editor')
  await page.getByLabel('尺寸').selectOption('6')
  await page.locator('[data-row="0"][data-col="0"]').click()
  page.once('dialog', (dialog) => void dialog.dismiss())

  await page.getByRole('button', { name: '自動出題' }).click()

  await expect(page.getByText('已使用 1 / 6 個區域。')).toBeVisible()
  await expect(page.getByText('還有 35 格沒有指定區域。')).toBeVisible()
})

test("switching to LinkedIn asks for LinkedIn's number instead of a name, offering the next one", async ({ page }) => {
  const next = nextLinkedInNumber(await linkedInPuzzles())
  await page.goto('#/editor')

  await page.getByLabel('存到').selectOption('linkedIn')

  await expect(page.getByLabel('LinkedIn 題號')).toHaveValue(String(next))
  await expect(page.getByLabel('題目名稱')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '自動出題' })).toHaveCount(0)
  await page.getByLabel('LinkedIn 題號').fill('abc')
  await expect(page.getByText('LinkedIn 題號必須是 1 以上的整數')).toBeVisible()
})

test('a stored LinkedIn Puzzle opens from the sidebar, ready to correct or delete', async ({ page }) => {
  const last = (await linkedInPuzzles()).puzzles.at(-1)
  if (!last) throw new Error('E2E needs at least one LinkedIn Puzzle')
  await page.goto('#/editor')

  await page.getByText(/^LinkedIn（\d+）$/).click()
  await page.getByRole('link', { name: `LinkedIn #${last.number}`, exact: true }).click()

  await expect(page.getByLabel('LinkedIn 題號')).toHaveValue(String(last.number))
  await expect(page.getByLabel('存到')).toBeDisabled()
  await expect(page.getByText('✓ 唯一解，可以儲存。')).toBeVisible()
  await expect(page.getByRole('button', { name: '刪除' })).toBeVisible()
})
