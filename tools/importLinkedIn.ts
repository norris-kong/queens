// Downloads the archive of every LinkedIn Queens puzzle and adds the ones missing from
// puzzles/LinkedIn/. Run with `pnpm import:linkedin`. It never overwrites a stored puzzle: one the
// archive draws differently is only reported, for a person to check.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { linkedInRules, parseLinkedInNumber } from '../src/core/linkedInCatalog.ts'
import { LINKEDIN_FOLDER, PUZZLE_EXTENSION, readPuzzle } from '../src/core/puzzleFile.ts'
import {
  ARCHIVE_ORIGIN,
  ARCHIVE_PAGE,
  boardFilesIn,
  FIRST_YEAR,
  type LinkedInPuzzleFile,
  planImport,
  readBoards,
  type SkippedPuzzle,
  toPuzzleFile,
} from './linkedInArchive.ts'

const folder = join(fileURLToPath(new URL('../puzzles', import.meta.url)), LINKEDIN_FOLDER)

async function fetchText(url: string): Promise<string | null> {
  const response = await fetch(url)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${url} answered HTTP ${response.status}`)
  return response.text()
}

/** Every board file named on the archive's front page and its yearly pages. */
async function findBoardFiles(): Promise<string[]> {
  const years = Array.from({ length: new Date().getFullYear() - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index)
  const pages = await Promise.all([ARCHIVE_PAGE, ...years.map((year) => `${ARCHIVE_PAGE}${year}/`)].map(fetchText))
  return [...new Set(pages.flatMap((html) => (html ? boardFilesIn(html) : [])))]
}

async function downloadPuzzles(): Promise<{ files: LinkedInPuzzleFile[]; skipped: SkippedPuzzle[] }> {
  const files: LinkedInPuzzleFile[] = []
  const skipped: SkippedPuzzle[] = []
  for (const path of await findBoardFiles()) {
    const text = await fetchText(ARCHIVE_ORIGIN + path)
    if (text === null) throw new Error(`${path} is named by the archive but missing`)
    const boards = readBoards(JSON.parse(text))
    if (!boards.ok) throw new Error(`${path} is not shaped as expected:\n${boards.issues}`)
    for (const puzzle of boards.puzzles) {
      const converted = toPuzzleFile(puzzle)
      if (converted.ok) files.push(converted.file)
      else skipped.push(converted.skipped)
    }
  }
  return { files, skipped }
}

/** The Puzzle id of every numbered file already stored, null for one that is not a valid Puzzle. */
async function storedLayouts(): Promise<Map<number, string | null>> {
  await mkdir(folder, { recursive: true })
  const stored = new Map<number, string | null>()
  for (const name of await readdir(folder)) {
    const number = name.endsWith(PUZZLE_EXTENSION) ? parseLinkedInNumber(name.slice(0, -PUZZLE_EXTENSION.length)) : null
    if (number === null) continue
    const read = readPuzzle(await readFile(join(folder, name), 'utf8'), linkedInRules(number))
    stored.set(number, read.ok ? read.puzzle.id : null)
  }
  return stored
}

async function main(): Promise<void> {
  const { files, skipped } = await downloadPuzzles()
  const plan = planImport(files, await storedLayouts())
  await Promise.all(plan.add.map((file) => writeFile(join(folder, file.number + PUZZLE_EXTENSION), file.text)))
  console.log(`The archive has ${files.length + skipped.length} LinkedIn puzzles; added ${plan.add.length} to ${folder}`)
  for (const number of plan.differing) {
    console.warn(`Kept the stored LinkedIn #${number}, which the archive draws differently`)
  }
  for (const puzzle of skipped) {
    console.warn(`Skipped LinkedIn #${puzzle.number}: ${JSON.stringify(puzzle.problems)}`)
  }
}

main().catch((error: unknown) => {
  console.error('LinkedIn import failed:', error)
  process.exitCode = 1
})
