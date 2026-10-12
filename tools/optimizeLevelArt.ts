/// <reference lib="dom" />
// Turns the Level art drawn in buttons/ into the small WebP files the game ships in src/assets/levels/.
// Run with `pnpm art:levels` after changing any of it. Chromium (already here for E2E) does the
// resizing and WebP encoding, so no image tooling needs installing; the DOM types above are for the
// code that runs inside it.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from '@playwright/test'

const SOURCE = fileURLToPath(new URL('../buttons', import.meta.url))
const TARGET = fileURLToPath(new URL('../src/assets/levels', import.meta.url))
const LEVELS = ['Beginner', 'Easy', 'Relaxed', 'Normal', 'Intermediate', 'Challenging', 'Hard', 'Expert', 'Master']
const WEBP_QUALITY = 0.85

/** Each kind of art: its folder in buttons/, its file name prefix there, and its longest side once shipped (2× its largest display). */
const KINDS = [
  { kind: 'button', folder: 'Level-button', prefix: (level: string) => `${level}-button`, longestSide: 720 },
  { kind: 'stage', folder: 'stage-number', prefix: (level: string) => `${level}-stage-`, longestSide: 200 },
  { kind: 'logo', folder: 'mark', prefix: (level: string) => `${level}-logo`, longestSide: 200 },
] as const

async function findSource(folder: string, prefix: string): Promise<string> {
  const file = (await readdir(join(SOURCE, folder))).find((name) => name.startsWith(prefix) && name.endsWith('.png'))
  if (!file) throw new Error(`No ${prefix}*.png in buttons/${folder}`)
  return join(SOURCE, folder, file)
}

async function toWebp(page: Page, png: Buffer, longestSide: number): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    async ({ source, side, quality }) => {
      const image = new Image()
      image.src = source
      await image.decode()
      const scale = Math.min(1, side / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No 2D canvas')
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/webp', quality)
    },
    { source: `data:image/png;base64,${png.toString('base64')}`, side: longestSide, quality: WEBP_QUALITY },
  )
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')
}

async function main(): Promise<void> {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    for (const level of LEVELS) {
      for (const { kind, folder, prefix, longestSide } of KINDS) {
        const webp = await toWebp(page, await readFile(await findSource(folder, prefix(level))), longestSide)
        const name = `${level.toLowerCase()}-${kind}`
        await writeFile(join(TARGET, `${name}.webp`), webp)
        await rm(join(TARGET, `${name}.png`), { force: true })
      }
    }
    console.log(`Wrote ${LEVELS.length * KINDS.length} WebP files to ${TARGET}`)
  } finally {
    await browser.close()
  }
}

main().catch((error: unknown) => {
  console.error('Level art could not be converted:', error)
  process.exitCode = 1
})
