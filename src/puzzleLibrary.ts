import { buildCatalog, type PuzzleFile } from './core/catalog.ts'
import { buildLinkedInCatalog, type LinkedInFile } from './core/linkedInCatalog.ts'
import { LINKEDIN_FOLDER, PUZZLE_EXTENSION, SIZE_FOLDER } from './core/puzzleFile.ts'

// Every puzzles/<folder>/<name>.txt file, bundled as raw text at build time.
const rawFiles = import.meta.glob<string>('/puzzles/*/*.txt', { query: '?raw', import: 'default', eager: true })

type Located = { readonly kind: 'own'; readonly file: PuzzleFile } | { readonly kind: 'linkedIn'; readonly file: LinkedInFile }

function locate(path: string, text: string): Located | null {
  const [, root, folder, file] = path.split('/')
  if (root !== 'puzzles' || !folder || !file?.endsWith(PUZZLE_EXTENSION)) return null
  const name = file.slice(0, -PUZZLE_EXTENSION.length)
  if (folder === LINKEDIN_FOLDER) return { kind: 'linkedIn', file: { name, text } }
  return SIZE_FOLDER.test(folder) ? { kind: 'own', file: { size: Number(folder), name, text } } : null
}

const entries = Object.entries(rawFiles).map(([path, text]) => ({ path, located: locate(path, text) }))

/** Puzzle files the game cannot place, such as `puzzles/8/x.txt` instead of `puzzles/08/x.txt`. */
export const misplacedFiles = entries.flatMap(({ path, located }) => (located ? [] : [path]))

export const library = buildCatalog(entries.flatMap(({ located }) => (located?.kind === 'own' ? [located.file] : [])))

const ownIds = new Set(library.sizes.flatMap((group) => group.puzzles.map((entry) => entry.puzzle.id)))

export const linkedInLibrary = buildLinkedInCatalog(
  entries.flatMap(({ located }) => (located?.kind === 'linkedIn' ? [located.file] : [])),
  ownIds,
)

if (library.problems.length > 0 || linkedInLibrary.problems.length > 0 || misplacedFiles.length > 0) {
  console.error('Some Puzzle files were left out of the library:', {
    problems: library.problems,
    linkedInProblems: linkedInLibrary.problems,
    misplacedFiles,
  })
}
