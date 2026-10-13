import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LINKEDIN_336 } from '../src/core/testing.ts'
import { createPuzzleRepository, type PuzzleRepository } from './puzzleRepository.ts'

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
  it('only reads two-digit Size folders, the only ones it ever writes', async () => {
    await mkdir(join(root, '4'))
    await writeFile(join(root, '4', 'stray.txt'), FOUR)

    expect(await repository.list()).toEqual([])
  })

  it('saves a new Puzzle so that it is listed under its Size and Puzzle Name', async () => {
    const result = await repository.save({ size: 4, name: 'corner', text: FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'corner', text: FOUR }])
  })

  it('saves a Puzzle Name with capitals and spaces', async () => {
    const result = await repository.save({ size: 4, name: 'Beginner 1', text: FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'Beginner 1', text: FOUR }])
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

  it('refuses a new name that differs from a used one only in case, as the files would clash', async () => {
    await repository.save({ size: 4, name: 'Beginner 1', text: FOUR })

    const result = await repository.save({ size: 4, name: 'beginner 1', text: OTHER_FOUR })

    expect(result).toEqual({ ok: false, error: { kind: 'nameTaken' } })
    expect(await repository.list()).toEqual([{ size: 4, name: 'Beginner 1', text: FOUR }])
  })

  it('refuses a layout already in the library, even re-lettered', async () => {
    await repository.save({ size: 4, name: 'corner', text: FOUR })
    const relettered = FOUR.replaceAll('A', 'x').replaceAll('D', 'A').replaceAll('x', 'D')

    const result = await repository.save({ size: 4, name: 'copy', text: relettered })

    expect(result).toEqual({ ok: false, error: { kind: 'duplicate', sameAs: { size: 4, name: 'corner' } } })
  })

  it('refuses a copy of a LinkedIn Puzzle, naming its LinkedIn number', async () => {
    await mkdir(join(root, 'LinkedIn'))
    await writeFile(join(root, 'LinkedIn', '250.txt'), FOUR)

    const result = await repository.save({ size: 4, name: 'Beginner 1', text: FOUR })

    expect(result).toEqual({ ok: false, error: { kind: 'linkedInDuplicate', number: 250 } })
    expect(await repository.list()).toEqual([])
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

  it('renames a Puzzle by changing only the case of its name', async () => {
    const result = await repository.save({ size: 4, name: 'Corner', previousName: 'corner', text: OTHER_FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.list()).toEqual([{ size: 4, name: 'Corner', text: OTHER_FOUR }])
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

describe('LinkedIn Puzzles', () => {
  it('saves a LinkedIn Puzzle under its number, apart from the Size folders', async () => {
    const result = await repository.saveLinkedIn({ number: 523, text: FOUR })

    expect(result).toEqual({ ok: true })
    expect(await repository.listLinkedIn()).toEqual([{ name: '523', text: FOUR }])
    expect(await repository.list()).toEqual([])
  })

  it.each([
    ['a number that is not a positive whole number', { number: 0, text: FOUR }, { kind: 'invalidNumber' }],
    ['a fractional number', { number: 1.5, text: FOUR }, { kind: 'invalidNumber' }],
    ['text that is not a grid', { number: 7, text: 'AB\nBAA' }, { kind: 'unreadable' }],
    ['a Draft that is not a Puzzle', { number: 7, text: 'AAAA\nBBBB\nCCCC\nDDDD' }, { kind: 'notAPuzzle' }],
  ])('refuses %s and writes nothing', async (_, request, error) => {
    const result = await repository.saveLinkedIn(request)

    expect(result).toMatchObject({ ok: false, error })
    expect(await repository.listLinkedIn()).toEqual([])
  })

  it("saves #336, LinkedIn's April Fools' puzzle, with its split Regions, but no other number with them", async () => {
    expect(await repository.saveLinkedIn({ number: 336, text: LINKEDIN_336 })).toEqual({ ok: true })
    expect(await repository.saveLinkedIn({ number: 337, text: LINKEDIN_336 })).toMatchObject({
      ok: false,
      error: { kind: 'notAPuzzle' },
    })
  })

  it('refuses a number already used by another LinkedIn Puzzle', async () => {
    await repository.saveLinkedIn({ number: 523, text: FOUR })

    expect(await repository.saveLinkedIn({ number: 523, text: OTHER_FOUR })).toEqual({
      ok: false,
      error: { kind: 'numberTaken' },
    })
  })

  it('saves a rerun of an earlier LinkedIn Puzzle under its own number, as LinkedIn ran it again', async () => {
    await repository.saveLinkedIn({ number: 72, text: FOUR })

    expect(await repository.saveLinkedIn({ number: 113, text: FOUR })).toEqual({ ok: true })
    expect(await repository.saveLinkedIn({ number: 113, previousNumber: 113, text: FOUR })).toEqual({ ok: true })
  })

  it("refuses a copy of one of the author's own Puzzles", async () => {
    await repository.save({ size: 4, name: 'Beginner 1', text: FOUR })

    expect(await repository.saveLinkedIn({ number: 523, text: FOUR })).toEqual({
      ok: false,
      error: { kind: 'duplicate', sameAs: { size: 4, name: 'Beginner 1' } },
    })
  })

  it('corrects a LinkedIn Puzzle in place, or moves it to the right number', async () => {
    await repository.saveLinkedIn({ number: 523, text: FOUR })

    expect(await repository.saveLinkedIn({ number: 523, previousNumber: 523, text: OTHER_FOUR })).toEqual({ ok: true })
    expect(await repository.saveLinkedIn({ number: 532, previousNumber: 523, text: OTHER_FOUR })).toEqual({ ok: true })
    expect(await repository.listLinkedIn()).toEqual([{ name: '532', text: OTHER_FOUR }])
  })

  it('refuses to correct a LinkedIn Puzzle that is no longer stored', async () => {
    expect(await repository.saveLinkedIn({ number: 523, previousNumber: 523, text: FOUR })).toEqual({
      ok: false,
      error: { kind: 'notFound' },
    })
  })

  it('deletes a LinkedIn Puzzle, and reports one that is not stored', async () => {
    await repository.saveLinkedIn({ number: 523, text: FOUR })

    expect(await repository.removeLinkedIn(523)).toEqual({ ok: true })
    expect(await repository.listLinkedIn()).toEqual([])
    expect(await repository.removeLinkedIn(523)).toEqual({ ok: false, error: { kind: 'notFound' } })
  })
})
