import { Panel } from '../components/Panel'
import { analyticsData } from '../data/mockIndra'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Adaptation scores" eyebrow="long-term cognitive evolution">
          <div className="space-y-4">
            {analyticsData.adaptationScores.map((score) => (
              <div key={score.createdAtUtc} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{new Date(score.createdAtUtc).toLocaleDateString()}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-slate-500">Resonance</p><p className="mt-1 text-white">{score.cognitiveResonance}</p></div>
                  <div><p className="text-slate-500">Entropy</p><p className="mt-1 text-white">{score.patternEntropy}</p></div>
                  <div><p className="text-slate-500">Abstraction</p><p className="mt-1 text-white">{score.abstractionDepth}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Challenge category distribution" eyebrow="intellectual diversity">
          <div className="space-y-4">
            {analyticsData.challengeCategoryDistribution.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.category}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${item.count * 14}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {analyticsData.trendSnapshots.map((snapshot) => (
          <Panel key={snapshot.title} title={snapshot.title} eyebrow={snapshot.indicator}>
            <p className="text-sm leading-6 text-slate-300">{snapshot.summary}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
