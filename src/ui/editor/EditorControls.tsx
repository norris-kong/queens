import type { CSSProperties } from 'react'
import { REGION_COLORS } from '../../config.ts'
import { regionLetter } from '../../core/puzzleFormat.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'
import { editorStrings as text } from './editorStrings.ts'
import type { DraftEditor } from './useDraftEditor.ts'

const SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, index) => MIN_SIZE + index)

export function DraftFields({ editor }: { readonly editor: DraftEditor }) {
  return (
    <>
      <div className="field-row">
        <label className="field">
          {text.size}
          <select
            value={editor.size}
            disabled={editor.located !== null || editor.busy}
            onChange={(event) => editor.changeSize(Number(event.target.value))}
          >
            {SIZES.map((option) => (
              <option key={option} value={option}>
                {text.sizeOption(option)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" disabled={editor.busy} onClick={editor.generate}>
          {editor.generating ? text.generating : text.generate}
        </button>
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
      </div>
      {editor.name !== '' && !editor.nameValid && <p className="form-error">{text.nameRule}</p>}
    </>
  )
}

export function RegionPalette({ editor }: { readonly editor: DraftEditor }) {
  return (
    <div className="palette" role="toolbar">
      {Array.from({ length: editor.size }, (_, region) => (
        <button
          key={region}
          type="button"
          className="swatch"
          aria-pressed={editor.brush === region}
          aria-label={text.regionSwatch(regionLetter(region))}
          style={{ '--swatch': REGION_COLORS[region] } as CSSProperties}
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
        disabled={editor.busy || !valid || !editor.nameValid}
        onClick={editor.save}
      >
        {editor.busy ? text.saving : text.save}
      </button>
      <button type="button" className="button" disabled={!valid} onClick={onPlaytest}>
        {text.playtest}
      </button>
      {editor.located && (
        <button type="button" className="button" disabled={editor.busy} onClick={editor.remove}>
          {text.remove}
        </button>
      )}
    </div>
  )
}
