import { buildCatalog, type PuzzleFile } from './core/catalog.ts'
import { PUZZLE_EXTENSION, SIZE_FOLDER } from './core/puzzleFile.ts'

// Every puzzles/<folder>/<name>.txt file, bundled as raw text at build time.
const rawFiles = import.meta.glob<string>('/puzzles/*/*.txt', { query: '?raw', import: 'default', eager: true })

function toPuzzleFile(path: string, text: string): PuzzleFile | null {
  const [, root, folder, file] = path.split('/')
  if (root !== 'puzzles' || !folder || !SIZE_FOLDER.test(folder) || !file?.endsWith(PUZZLE_EXTENSION)) return null
  return { size: Number(folder), name: file.slice(0, -PUZZLE_EXTENSION.length), text }
}

const entries = Object.entries(rawFiles).map(([path, text]) => ({ path, file: toPuzzleFile(path, text) }))

/** Puzzle files the game cannot place, such as `puzzles/8/x.txt` instead of `puzzles/08/x.txt`. */
export const misplacedFiles = entries.flatMap(({ path, file }) => (file ? [] : [path]))

export const library = buildCatalog(entries.flatMap(({ file }) => (file ? [file] : [])))

if (library.problems.length > 0 || misplacedFiles.length > 0) {
  console.error('Some Puzzle files were left out of the library:', { problems: library.problems, misplacedFiles })
}
