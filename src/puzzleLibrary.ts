import { buildCatalog, type PuzzleFile } from './core/catalog.ts'

/** Every `puzzles/<size>/<name>.txt` file, bundled as raw text at build time. */
const rawFiles = import.meta.glob<string>('/puzzles/*/*.txt', { query: '?raw', import: 'default', eager: true })

const PUZZLE_PATH = /^\/puzzles\/(\d+)\/([^/]+)\.txt$/

function toPuzzleFile([path, text]: [string, string]): PuzzleFile[] {
  const match = PUZZLE_PATH.exec(path)
  if (!match) return []
  return [{ size: Number(match[1]), name: match[2] ?? '', text }]
}

export const library = buildCatalog(Object.entries(rawFiles).flatMap(toPuzzleFile))

if (library.problems.length > 0) {
  console.error('Some Puzzle files were left out of the library:', library.problems)
}
