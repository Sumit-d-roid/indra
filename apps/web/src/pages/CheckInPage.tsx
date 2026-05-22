import { useEffect, useState } from 'react'
import { Panel } from '../components/Panel'
import { cognitiveEntryTemplate } from '../data/mockIndra'
import { indraApi } from '../lib/api'
import { recordBehaviorSignal } from '../lib/behaviorSignals'
import { interpretEmotionText } from '../lib/textSignals'
import type { CognitiveEntry, CognitiveEntryInput } from '../types'

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
  const [form, setForm] = useState<CognitiveEntryInput>(cognitiveEntryTemplate)
  const [entries, setEntries] = useState<CognitiveEntry[]>([])
  const [status, setStatus] = useState<string>('Ready to capture scan.')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const history = await indraApi.getCognitiveEntries()
        if (!active) {
          return
        }
        setEntries(history)
        if (history.length > 0) {
          const latest = history[0]
          setForm({
            sleepQuality: latest.sleepQuality,
            focusLevel: latest.focusLevel,
            curiosityLevel: latest.curiosityLevel,
            energy: latest.energy,
            mood: latest.mood,
            mentalSharpness: latest.mentalSharpness,
            creativity: latest.creativity,
            stress: latest.stress,
            motivation: latest.motivation,
            intellectualExcitement: latest.intellectualExcitement,
            emotionalState: latest.emotionalState,
          })
        }
      } catch {
        if (active) {
          setStatus('Live history unavailable. Using local template.')
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const saveScan = async () => {
    setSaving(true)
    setStatus('Saving scan...')
    try {
      const created = await indraApi.createCognitiveEntry(form)
      const previous = entries[0]
      const gapDays = previous ? (new Date(created.createdAtUtc).getTime() - new Date(previous.createdAtUtc).getTime()) / 86_400_000 : null
      const emotion = interpretEmotionText(form.emotionalState)
      setEntries((current) => [created, ...current])
      recordBehaviorSignal({
        trait: 'consistency',
        source: 'checkin',
        signal: `daily check-in saved with focus ${form.focusLevel}/10 and stress ${form.stress}/10`,
        weight: 0.64,
      })
      recordBehaviorSignal({
        trait: 'emotionalVariance',
        source: 'checkin',
        signal: `emotional state "${form.emotionalState}" volatility ${emotion.volatility.toFixed(2)}`,
        weight: 0.52 + emotion.volatility * 0.36,
      })
      if (gapDays !== null) {
        recordBehaviorSignal({
          trait: 'consistency',
          source: 'checkin',
          signal: `check-in gap ${gapDays.toFixed(1)} days`,
          weight: gapDays <= 1.5 ? 0.74 : 0.42,
        })
      }
      setStatus('Scan saved.')
    } catch (error) {
      setStatus(error instanceof Error ? `Save failed: ${error.message}` : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel
        title="Daily cognitive scan"
        eyebrow="psychological terminal"
        action={
          <button
            type="button"
            onClick={saveScan}
            disabled={saving}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100 disabled:opacity-50"
          >
            {saving ? 'saving...' : 'save scan'}
          </button>
        }
      >
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
            <p className="text-cyan-100">{status}</p>
            <p>Curiosity vectors remain intense. Perspective-shifting tasks are likely to produce high yield.</p>
            <p>Stress stays moderate enough to support adversarial prompts without collapsing abstraction depth.</p>
          </div>
        </Panel>

        <Panel title="Historical resonance" eyebrow="stored entries">
          <div className="space-y-3 text-sm text-slate-300">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-4">
                {new Date(entry.createdAtUtc).toLocaleString()} · curiosity {entry.curiosityLevel}/10 · focus {entry.focusLevel}/10 · {entry.emotionalState}
              </div>
            ))}
            {entries.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">No saved scans yet. Save one to build your personal signal trail.</div> : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}
