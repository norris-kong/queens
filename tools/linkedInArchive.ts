import { z } from 'zod'
import type { DraftProblem } from '../src/core/draft.ts'
import { readPuzzle } from '../src/core/puzzleFile.ts'
import { formatPuzzle, type ParseError } from '../src/core/puzzleFormat.ts'

/** The community archive of LinkedIn Queens puzzles behind archivedqueens.com. */
export const LINKEDIN_ARCHIVE_URL = 'https://queensstorage.blob.core.windows.net/puzzles/linkedinPuzzles.json'

const archiveSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    regions: z.array(z.array(z.number().int().nonnegative())),
  }),
)

export interface LinkedInPuzzleFile {
  readonly number: number
  /** Puzzle-file text, ready to write to `puzzles/LinkedIn/<number>.txt`. */
  readonly text: string
}

export interface SkippedPuzzle {
  readonly number: number
  readonly problems: readonly DraftProblem[] | readonly [ParseError]
}

export type ArchiveReading =
  | { readonly ok: true; readonly files: readonly LinkedInPuzzleFile[]; readonly skipped: readonly SkippedPuzzle[] }
  | { readonly ok: false; readonly issues: string }

/**
 * Turns the archive's JSON into Puzzle files, read back the way the game reads them so that only
 * valid Puzzles are kept. The archive has a few broken entries; those are skipped and reported.
 */
export function readLinkedInArchive(json: unknown): ArchiveReading {
  const parsed = archiveSchema.safeParse(json)
  if (!parsed.success) return { ok: false, issues: parsed.error.message }
  const files: LinkedInPuzzleFile[] = []
  const skipped: SkippedPuzzle[] = []
  for (const { id, regions } of parsed.data) {
    const text = formatPuzzle(regions)
    const read = readPuzzle(text)
    if (read.ok) files.push({ number: id, text })
    else skipped.push({ number: id, problems: read.reason === 'unreadable' ? [read.error] : read.problems })
  }
  return { ok: true, files, skipped }
}
