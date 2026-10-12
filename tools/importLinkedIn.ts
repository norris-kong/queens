// Downloads the LinkedIn Queens archive and writes every valid Puzzle to puzzles/LinkedIn/.
// Run with `pnpm import:linkedin`; safe to re-run, it only adds or rewrites numbered files.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LINKEDIN_FOLDER, PUZZLE_EXTENSION } from '../src/core/puzzleFile.ts'
import { LINKEDIN_ARCHIVE_URL, readLinkedInArchive } from './linkedInArchive.ts'

const folder = join(fileURLToPath(new URL('../puzzles', import.meta.url)), LINKEDIN_FOLDER)

async function main(): Promise<void> {
  const response = await fetch(LINKEDIN_ARCHIVE_URL)
  if (!response.ok) throw new Error(`The archive answered HTTP ${response.status}`)
  const reading = readLinkedInArchive(await response.json())
  if (!reading.ok) throw new Error(`The archive is not shaped as expected:\n${reading.issues}`)

  await mkdir(folder, { recursive: true })
  await Promise.all(reading.files.map((file) => writeFile(join(folder, file.number + PUZZLE_EXTENSION), file.text)))
  console.log(`Wrote ${reading.files.length} LinkedIn Puzzles to ${folder}`)
  for (const skipped of reading.skipped) {
    console.warn(`Skipped LinkedIn #${skipped.number}: ${JSON.stringify(skipped.problems)}`)
  }
}

main().catch((error: unknown) => {
  console.error('LinkedIn import failed:', error)
  process.exitCode = 1
})
