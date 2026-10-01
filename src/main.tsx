import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { library } from './puzzleLibrary.ts'
import './styles.css'
import { App } from './ui/App.tsx'
import { allEntries } from './ui/libraryLookup.ts'
import { progressStore } from './ui/progressStorage.ts'

// Saves of Puzzles whose Regions were edited (or that were deleted) no longer match anything.
progressStore.forgetAllExcept(new Set(allEntries(library).map(({ entry }) => entry.puzzle.id)))

const root = document.getElementById('root')
if (!root) throw new Error('The page is missing its #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
