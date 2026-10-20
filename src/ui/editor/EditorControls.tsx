import type { CSSProperties } from 'react'
import { regionLetter } from '../../core/puzzleFormat.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'
import { boardStyle, collectionLook } from '../look.ts'
import type { Collection } from './editorTarget.ts'
import { editorStrings as text } from './editorStrings.ts'
import type { DraftEditor } from './useDraftEditor.ts'

const SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, index) => MIN_SIZE + index)

function NameField({ editor }: { readonly editor: DraftEditor }) {
  return (
    <label className="field">
      {text.name}
      <input
        value={editor.name}
        placeholder={text.namePlaceholder}
        autoCapitalize="off"
        spellCheck={false}
        aria-invalid={editor.name !== '' && !editor.nameValid}
        onChange={(event) => editor.setName(event.target.value)}
      />
    </label>
  )
}

function LinkedInNumberField({ editor }: { readonly editor: DraftEditor }) {
  return (
    <label className="field">
      {text.linkedInNumberField}
      <input
        value={editor.numberText}
        placeholder={text.numberPlaceholder}
        inputMode="numeric"
        aria-invalid={!editor.numberValid}
        onChange={(event) => editor.setNumberText(event.target.value)}
      />
    </label>
  )
}

/** Why the name or LinkedIn number cannot be saved under, if it cannot. */
function TargetRule({ editor }: { readonly editor: DraftEditor }) {
  if (editor.collection === 'linkedIn') return editor.numberValid ? null : <p className="form-error">{text.numberRule}</p>
  return editor.name !== '' && !editor.nameValid ? <p className="form-error">{text.nameRule}</p> : null
}

export function DraftFields({ editor }: { readonly editor: DraftEditor }) {
  const own = editor.collection === 'own'
  return (
    <>
      <div className="field-row">
        <label className="field">
          {text.collection}
          <select
            value={editor.collection}
            disabled={editor.opened !== null || editor.busy}
            onChange={(event) => editor.setCollection(event.target.value as Collection)}
          >
            <option value="own">{text.collectionOwn}</option>
            <option value="linkedIn">{text.collectionLinkedIn}</option>
          </select>
        </label>
        <label className="field">
          {text.size}
          <select
            value={editor.size}
            disabled={editor.opened !== null || editor.busy}
            onChange={(event) => editor.changeSize(Number(event.target.value))}
          >
            {SIZES.map((option) => (
              <option key={option} value={option}>
                {text.sizeOption(option)}
              </option>
            ))}
          </select>
        </label>
        {editor.opened ? (
          // A stored Puzzle keeps its Size and is never generated over; the next one starts afresh.
          <button type="button" className="button" disabled={editor.busy} onClick={editor.createNext}>
            {text.createNext}
          </button>
        ) : (
          own && (
            <button type="button" className="button" disabled={editor.busy} onClick={editor.generate}>
              {editor.generating ? text.generating : text.generate}
            </button>
          )
        )}
        {own ? <NameField editor={editor} /> : <LinkedInNumberField editor={editor} />}
      </div>
      <TargetRule editor={editor} />
    </>
  )
}

export function RegionPalette({ editor }: { readonly editor: DraftEditor }) {
  const colors = boardStyle(collectionLook(editor.collection)).regionColors
  return (
    <div className="palette" role="toolbar">
      {Array.from({ length: editor.size }, (_, region) => (
        <button
          key={region}
          type="button"
          className="swatch"
          aria-pressed={editor.brush === region}
          aria-label={text.regionSwatch(regionLetter(region))}
          style={{ '--swatch': colors[region] } as CSSProperties}
          onClick={() => editor.setBrush(region)}
        >
          {regionLetter(region)}
        </button>
      ))}
      <button
        type="button"
        className="swatch"
        aria-pressed={editor.brush === null}
        aria-label={text.eraserLabel}
        onClick={() => editor.setBrush(null)}
      >
        {text.eraser}
      </button>
    </div>
  )
}

export function EditorActions({ editor, onPlaytest }: { readonly editor: DraftEditor; readonly onPlaytest: () => void }) {
  const valid = editor.inspection.valid
  return (
    <div className="button-row">
      <button
        type="button"
        className="button button-primary"
        disabled={editor.busy || !valid || !editor.targetValid}
        onClick={editor.save}
      >
        {editor.busy ? text.saving : text.save}
      </button>
      <button type="button" className="button" disabled={!valid} onClick={onPlaytest}>
        {text.playtest}
      </button>
      {editor.opened && (
        <button type="button" className="button" disabled={editor.busy} onClick={editor.remove}>
          {text.remove}
        </button>
      )}
    </div>
  )
}
