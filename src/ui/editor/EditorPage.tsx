import { useState } from 'react'
import type { FileRef } from '../../core/catalog.ts'
import { strings } from '../../strings.ts'
import { PlayScreen } from '../PlayScreen.tsx'
import { routeHash } from '../routes.ts'
import { DraftBoard } from './DraftBoard.tsx'
import { DraftReport } from './DraftReport.tsx'
import { DraftFields, EditorActions, RegionPalette } from './EditorControls.tsx'
import { EditorSidebar } from './EditorSidebar.tsx'
import { editorStrings as text } from './editorStrings.ts'
import { useDraftEditor } from './useDraftEditor.ts'

export default function EditorPage(stored: Partial<FileRef>) {
  const editor = useDraftEditor(stored)
  const [playtesting, setPlaytesting] = useState(false)

  if (playtesting && editor.inspection.valid) {
    return (
      <main className="page">
        <header className="page-header">
          <button type="button" className="button" onClick={() => setPlaytesting(false)}>
            {text.backToEditing}
          </button>
          <h1>{text.playtest}</h1>
        </header>
        <PlayScreen key={editor.inspection.puzzle.id} puzzle={editor.inspection.puzzle} persist={false} />
      </main>
    )
  }

  return (
    <main className="page page-wide">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{text.title}</h1>
      </header>
      {stored.name !== undefined && !editor.located && <p className="form-error">{text.notFound}</p>}
      <div className="editor-layout">
        <EditorSidebar current={editor.located ? { size: editor.located.size, name: editor.located.entry.name } : null} />
        <section>
          <DraftFields editor={editor} />
          <RegionPalette editor={editor} />
          <DraftBoard editor={editor} />
          <DraftReport inspection={editor.inspection} size={editor.size} />
          {editor.error && <p className="form-error">{editor.error}</p>}
          <EditorActions editor={editor} onPlaytest={() => setPlaytesting(true)} />
        </section>
      </div>
    </main>
  )
}
