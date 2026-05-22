import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { indraApi } from '../lib/api'
import { getStoredCognitiveProfile } from '../lib/cognitiveProfile'
import { listMemoryAnchors } from '../lib/memoryAnchors'
import { activateProtocol, clearActiveProtocol, getActiveProtocol } from '../lib/protocols'
import type { ActiveProtocol, CognitiveEntry, MemoryAnchor } from '../types'

type MetricDelta = {
  key: keyof Pick<CognitiveEntry, 'focusLevel' | 'curiosityLevel' | 'creativity' | 'stress' | 'motivation' | 'mentalSharpness'>
  label: string
  delta: number
}

const TRACKED_METRICS: Array<{ key: MetricDelta['key']; label: string; invert?: boolean }> = [
  { key: 'focusLevel', label: 'Focus' },
  { key: 'curiosityLevel', label: 'Curiosity' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'mentalSharpness', label: 'Mental sharpness' },
  { key: 'stress', label: 'Stress', invert: true },
]

function last7Days<T extends { createdAtUtc: string }>(items: T[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return items.filter((item) => new Date(item.createdAtUtc).getTime() >= cutoff)
}

function normalizeBias(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function toDelta(entries: CognitiveEntry[]) {
  if (entries.length < 2) {
    return []
  }

  const oldest = entries[entries.length - 1]
  const latest = entries[0]
  return TRACKED_METRICS.map((metric) => {
    const raw = latest[metric.key] - oldest[metric.key]
    return {
      key: metric.key,
      label: metric.label,
      delta: metric.invert ? -raw : raw,
    }
  })
}

function buildProtocol(topBias: string | null, stagnating: MetricDelta | null) {
  if (!topBias && !stagnating) {
    return 'Run 3 autopilot missions and save anchors after each mission to create enough weekly signal.'
  }
  if (topBias && stagnating) {
    return `Run 3 missions that directly pressure-test "${topBias}" and force one response rewrite focused on ${stagnating.label.toLowerCase()}.`
  }
  if (topBias) {
    return `Run 3 perspective-inversion missions targeting "${topBias}" and save one concrete counter-assumption per day.`
  }
  return `Run 3 missions with explicit ${stagnating?.label.toLowerCase()} targets and save anchors with measurable outcomes.`
}

export function WeeklyReviewPage() {
  const [entries, setEntries] = useState<CognitiveEntry[]>([])
  const [anchors, setAnchors] = useState<MemoryAnchor[]>([])
  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(() => getActiveProtocol())
  const [profileSnapshot, setProfileSnapshot] = useState(() => getStoredCognitiveProfile())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const allEntries = await indraApi.getCognitiveEntries()
        if (!active) {
          return
        }
        setEntries(last7Days(allEntries))
        setAnchors(last7Days(listMemoryAnchors()))
        setProfileSnapshot(getStoredCognitiveProfile())
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to build weekly review.')
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const biasCounts = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const anchor of anchors) {
      const normalized = normalizeBias(anchor.biasSpotted)
      const current = counts.get(normalized)
      if (current) {
        current.count += 1
      } else {
        counts.set(normalized, { label: anchor.biasSpotted, count: 1 })
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count)
  }, [anchors])

  const deltas = useMemo(() => toDelta(entries), [entries])
  const strongestImproving = deltas.length > 0 ? [...deltas].sort((a, b) => b.delta - a.delta)[0] : null
  const stagnating = deltas.length > 0 ? [...deltas].sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0] : null
  const protocol = buildProtocol(biasCounts[0]?.label ?? null, stagnating)
  const previousHistory = profileSnapshot && profileSnapshot.history.length >= 2
    ? profileSnapshot.history[profileSnapshot.history.length - 2]?.profile
    : null
  const challengeDrift = profileSnapshot && previousHistory
    ? profileSnapshot.profile.challengeTolerance - previousHistory.challengeTolerance
    : null
  const avoidanceDrift = profileSnapshot && previousHistory
    ? profileSnapshot.profile.avoidance - previousHistory.avoidance
    : null
  const protocolTitle = biasCounts[0]?.label
    ? `Bias reset: ${biasCounts[0].label}`
    : stagnating
      ? `Signal boost: ${stagnating.label}`
      : 'Baseline consistency protocol'

  return (
    <div className="space-y-6">
      <Panel title="Weekly Evolution Review" eyebrow="7-day synthesis">
        <p className="text-sm leading-7 text-slate-300">
          This review compresses your last 7 days into recurring biases, strongest gains, stagnation points, and a single weekly protocol.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.28em] text-slate-300">
          <span className="rounded-full border border-white/10 px-3 py-2">entries: {entries.length}</span>
          <span className="rounded-full border border-white/10 px-3 py-2">anchors: {anchors.length}</span>
          <span className="rounded-full border border-white/10 px-3 py-2">window: last 7 days</span>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Top recurring biases" eyebrow="from memory anchors">
          <div className="space-y-3">
            {biasCounts.slice(0, 3).map((bias) => (
              <div key={bias.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-100">{bias.label}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400">{bias.count} occurrence{bias.count > 1 ? 's' : ''}</p>
              </div>
            ))}
            {biasCounts.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">No anchors yet this week.</p> : null}
          </div>
        </Panel>

        <Panel title="Signal movement" eyebrow="from check-ins">
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/80">strongest improving signal</p>
              <p className="mt-2 text-sm text-slate-100">
                {strongestImproving ? `${strongestImproving.label} (${strongestImproving.delta >= 0 ? '+' : ''}${strongestImproving.delta.toFixed(1)})` : 'Not enough check-ins yet.'}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/80">stagnating signal</p>
              <p className="mt-2 text-sm text-slate-100">
                {stagnating ? `${stagnating.label} (${stagnating.delta >= 0 ? '+' : ''}${stagnating.delta.toFixed(1)})` : 'Not enough check-ins yet.'}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {profileSnapshot ? (
        <Panel title="Why INDRA believes this" eyebrow="cognitive evidence">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">challenge tolerance drift</p>
              <p className="mt-2 text-slate-100">
                {challengeDrift === null ? 'Need one more profile update.' : `${challengeDrift >= 0 ? '+' : ''}${challengeDrift.toFixed(2)} vs previous snapshot`}
              </p>
              <p className="mt-2 text-slate-300">
                {profileSnapshot.evidence.challengeTolerance[0]?.signal ?? 'No challenge evidence yet.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">avoidance drift</p>
              <p className="mt-2 text-slate-100">
                {avoidanceDrift === null ? 'Need one more profile update.' : `${avoidanceDrift >= 0 ? '+' : ''}${avoidanceDrift.toFixed(2)} vs previous snapshot`}
              </p>
              <p className="mt-2 text-slate-300">
                {profileSnapshot.evidence.avoidance[0]?.signal ?? 'No avoidance evidence yet.'}
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel title="Next-week protocol" eyebrow="single concrete plan">
        <p className="text-sm leading-7 text-slate-100">{protocol}</p>
        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">active protocol</p>
          {activeProtocol ? (
            <>
              <p className="mt-2 text-sm text-slate-100">{activeProtocol.title}</p>
              <p className="mt-2 text-sm text-slate-300">
                Progress: {activeProtocol.completedSessions}/{activeProtocol.targetSessions} mission sessions
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-300">No active protocol yet.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveProtocol(
                activateProtocol({
                  title: protocolTitle,
                  details: protocol,
                  targetSessions: 3,
                }),
              )
            }
            className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-emerald-100"
          >
            activate protocol
          </button>
          {activeProtocol ? (
            <button
              type="button"
              onClick={() => {
                clearActiveProtocol()
                setActiveProtocol(null)
              }}
              className="rounded-full border border-rose-300/25 bg-rose-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-rose-100"
            >
              clear active
            </button>
          ) : null}
          <NavLink
            to="/autopilot"
            className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-100"
          >
            run autopilot
          </NavLink>
          <NavLink
            to="/check-in"
            className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.32em] text-slate-200"
          >
            log check-in
          </NavLink>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </Panel>
    </div>
  )
}
