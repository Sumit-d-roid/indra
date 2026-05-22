import { useState } from 'react'
import { Panel } from '../components/Panel'
import { cognitiveEntryTemplate } from '../data/mockIndra'

const sliders = [
  ['sleepQuality', 'Sleep quality'],
  ['focusLevel', 'Focus level'],
  ['curiosityLevel', 'Curiosity level'],
  ['energy', 'Energy'],
  ['mood', 'Mood'],
  ['mentalSharpness', 'Mental sharpness'],
  ['creativity', 'Creativity'],
  ['stress', 'Stress'],
  ['motivation', 'Motivation'],
  ['intellectualExcitement', 'Intellectual excitement'],
] as const

export function CheckInPage() {
  const [form, setForm] = useState(cognitiveEntryTemplate)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Daily cognitive scan" eyebrow="psychological terminal">
        <div className="grid gap-4 md:grid-cols-2">
          {sliders.map(([key, label]) => (
            <label key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{label}</span>
                <span className="font-mono text-cyan-200">{form[key]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
                className="mt-4 h-2 w-full accent-cyan-300"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 block rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span className="text-sm text-slate-300">Emotional state</span>
          <input
            value={form.emotionalState}
            onChange={(event) => setForm((current) => ({ ...current, emotionalState: event.target.value }))}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
            placeholder="Describe the internal atmosphere"
          />
        </label>
      </Panel>

      <div className="space-y-6">
        <Panel title="Scan interpretation" eyebrow="live diagnostics">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Emotional register: <span className="text-white">{form.emotionalState}</span>
            </p>
            <p>Curiosity vectors remain intense. Perspective-shifting tasks are likely to produce high yield.</p>
            <p>Stress stays moderate enough to support adversarial prompts without collapsing abstraction depth.</p>
          </div>
        </Panel>

        <Panel title="Historical resonance" eyebrow="stored entries">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-4">04:30 UTC · abstraction density stable · creativity spike +11%</div>
            <div className="rounded-2xl border border-violet-300/10 bg-violet-300/5 p-4">Yesterday · focus plateau detected · novel ecological prompts recommended</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Seven-day trend · curiosity remained above 8.2 across all scans</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
