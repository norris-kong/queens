import { expect, test } from '@playwright/test'

// These flows never press 儲存, so they leave the puzzles/ folder untouched.

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
