import { useEffect, useState } from 'react'
import { stageSeed, stageSize } from '../core/nightmare.ts'
import { saveSlot } from '../core/progress.ts'
import { strings } from '../strings.ts'
import { GeneratedPlay } from './GeneratedPlay.tsx'
import { nightmareProgress, nightmareStage } from './progressStorage.ts'
import { routeHash } from './routes.ts'
import { puzzleFromSeed } from './useGeneratedPuzzle.ts'

export function NightmarePage() {
  const [stage, setStage] = useState(() => nightmareStage.currentStage())
  const size = stageSize(stage)

  useEffect(() => {
    // Players never go back, so only the Stage being played needs its save.
    nightmareProgress.forgetAllExcept(new Set([String(stage)]))
  }, [stage])

  function onSolve() {
    nightmareStage.reach(stage + 1)
    // Start on the next Stage straight away, so it is ready by the time the player asks for it.
    void puzzleFromSeed(stageSize(stage + 1), stageSeed(stage + 1))
  }

  return (
    <main className="page">
      <header className="page-header">
        <a className="back-link" href={routeHash({ page: 'home' })}>
          {strings.backToList}
        </a>
        <h1>{strings.nightmareTitle(stage)}</h1>
      </header>
      <p className="muted">{strings.sizeHeading(size)}</p>
      <GeneratedPlay
        key={stage}
        size={size}
        seed={stageSeed(stage)}
        slotFor={(puzzle) => saveSlot(nightmareProgress, String(stage), puzzle)}
        next={{ label: strings.nextStage, go: () => setStage(stage + 1) }}
        onSolve={onSolve}
        canReplay={false}
      />
    </main>
  )
}
