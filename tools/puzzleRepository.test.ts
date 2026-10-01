import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPuzzleRepository, type PuzzleRepository } from './puzzleRepository'

const FOUR = 'CABB\nCCBB\nCCDD\nDDDD\n'
const OTHER_FOUR = 'AAAB\nCCBB\nCCCB\nCCDD\n'

let root: string
let repository: PuzzleRepository

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'queens-puzzles-'))
  repository = createPuzzleRepository(root)
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('puzzle repository', () => {
  it('saves a new Puzzle so that it is listed under its Size and Puzzle Name', async () => {
    const result = await repository.save({ size: 4, name: 'corner', text: FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'corner', text: FOUR }])
  })

  it.each([
    ['an invalid Puzzle Name', { size: 4, name: '../escape', text: FOUR }, { kind: 'invalidName' }],
    ['an unsupported Size', { size: 99, name: 'huge', text: FOUR }, { kind: 'invalidSize' }],
    ['text that is not a grid', { size: 4, name: 'broken', text: 'AB\nBAA' }, { kind: 'unreadable' }],
    ['a Draft that is not a Puzzle', { size: 4, name: 'two', text: 'AAAA\nBBBB\nCCCC\nDDDD' }, { kind: 'notAPuzzle' }],
    ['a Puzzle of another Size', { size: 5, name: 'small', text: FOUR }, { kind: 'wrongSize' }],
  ])('refuses %s and writes nothing', async (_, request, error) => {
    const result = await repository.save(request)

    expect(result).toMatchObject({ ok: false, error })
    expect(await repository.list()).toEqual([])
  })

  it('refuses a new Puzzle whose name is already used in that Size', async () => {
    await repository.save({ size: 4, name: 'corner', text: FOUR })

    const result = await repository.save({ size: 4, name: 'corner', text: OTHER_FOUR })

    expect(result).toEqual({ ok: false, error: { kind: 'nameTaken' } })
  })

  it('refuses a layout already in the library, even re-lettered', async () => {
    await repository.save({ size: 4, name: 'corner', text: FOUR })
    const relettered = FOUR.replaceAll('A', 'x').replaceAll('D', 'A').replaceAll('x', 'D')

    const result = await repository.save({ size: 4, name: 'copy', text: relettered })

    expect(result).toEqual({ ok: false, error: { kind: 'duplicate', sameAs: { size: 4, name: 'corner' } } })
  })
})

describe('editing stored Puzzles', () => {
  beforeEach(async () => {
    await repository.save({ size: 4, name: 'corner', text: FOUR })
  })

  it('replaces a Puzzle in place when saved under its own name', async () => {
    const result = await repository.save({ size: 4, name: 'corner', previousName: 'corner', text: OTHER_FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'corner', text: OTHER_FOUR }])
  })

  it('does not count a Puzzle saved unchanged over itself as a duplicate', async () => {
    const result = await repository.save({ size: 4, name: 'corner', previousName: 'corner', text: FOUR })

    expect(result).toEqual({ ok: true })
  })

  it('renames a Puzzle, leaving no file under the old name', async () => {
    const result = await repository.save({ size: 4, name: 'renamed', previousName: 'corner', text: FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'renamed', text: FOUR }])
  })

  it('refuses to rename onto a name used by another Puzzle', async () => {
    await repository.save({ size: 4, name: 'other', text: OTHER_FOUR })

    const result = await repository.save({ size: 4, name: 'other', previousName: 'corner', text: FOUR })

    expect(result).toEqual({ ok: false, error: { kind: 'nameTaken' } })
  })

  it('refuses to edit a Puzzle that is no longer stored', async () => {
    const result = await repository.save({ size: 4, name: 'ghost', previousName: 'ghost', text: OTHER_FOUR })

    expect(result).toEqual({ ok: false, error: { kind: 'notFound' } })
  })

  it('deletes a Puzzle', async () => {
    expect(await repository.remove(4, 'corner')).toEqual({ ok: true })
    expect(await repository.list()).toEqual([])
  })

  it('reports deleting a Puzzle that is not stored', async () => {
    expect(await repository.remove(4, 'ghost')).toEqual({ ok: false, error: { kind: 'notFound' } })
  })
})
