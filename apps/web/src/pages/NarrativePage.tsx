import { useMemo } from 'react'
import { Panel } from '../components/Panel'
import { buildLongitudinalNarrative, listLongitudinalNarratives } from '../lib/narrativeEngine'

export function NarrativePage() {
  const narrative = useMemo(() => {
    const generated = buildLongitudinalNarrative()
    if (generated) return generated
    return listLongitudinalNarratives()[0] ?? null
  }, [])

  if (!narrative) {
    return (
      <Panel title="Longitudinal Narrative" eyebrow="evolution memory">
        <p className="text-sm text-slate-300">Narrative engine needs more longitudinal data to synthesize your arc.</p>
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <Panel title="Longitudinal Narrative Engine" eyebrow="psychological continuity">
        <p className="text-sm leading-7 text-slate-100">{narrative.compressedNarrative}</p>
        <p className="mt-3 text-sm leading-7 text-violet-100">{narrative.recursiveNarrativeAwareness}</p>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Evolution arcs" eyebrow="identity movement">
          <div className="space-y-3 text-sm text-slate-200">
            <p>Current arc: <span className="text-white">{narrative.currentArc.name}</span></p>
            <p>Previous arc: <span className="text-white">{narrative.previousArc?.name ?? 'Not enough history yet'}</span></p>
            <p>Emerging arc: <span className="text-white">{narrative.emergingArc?.name ?? 'Not enough signal yet'}</span></p>
          </div>
        </Panel>

        <Panel title="Recurring themes" eyebrow="persistent motifs">
          <div className="space-y-2 text-sm text-slate-200">
            {narrative.recurringThemes.map((theme) => (
              <div key={theme} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">{theme}</div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Turning points" eyebrow="permanent memory artifacts">
        <div className="space-y-3 text-sm text-slate-200">
          {narrative.turningPoints.map((point) => (
            <div key={`${point.title}-${point.timestamp}`} className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="text-slate-100">{point.title}</p>
              <p className="mt-1 text-slate-300">{point.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Existential synthesis" eyebrow="who is emerging">
        <div className="space-y-2 text-sm text-slate-200">
          <p><span className="text-slate-400">Who was I six months ago:</span> {narrative.existentialAnswers.changedFromPastSelf}</p>
          <p><span className="text-slate-400">What changed me:</span> {narrative.existentialAnswers.whatChangedYou}</p>
          <p><span className="text-slate-400">What keeps repeating:</span> {narrative.existentialAnswers.whatKeepsRepeating}</p>
          <p><span className="text-slate-400">What version is emerging:</span> {narrative.existentialAnswers.emergingSelf}</p>
          <p><span className="text-slate-400">What fragments me:</span> {narrative.existentialAnswers.fragmentationConditions}</p>
          <p><span className="text-slate-400">What makes me coherent:</span> {narrative.existentialAnswers.coherenceConditions}</p>
        </div>
      </Panel>
    </div>
  )
}
