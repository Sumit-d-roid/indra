import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { indraApi } from '../lib/api'
import { listMemoryAnchors } from '../lib/memoryAnchors'
import { getActiveProtocol } from '../lib/protocols'
import type { ActiveProtocol, DashboardData, MemoryAnchor } from '../types'

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [anchors, setAnchors] = useState<MemoryAnchor[]>(() => listMemoryAnchors())
  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(() => getActiveProtocol())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await indraApi.getDashboardSummary()
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.')
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const refreshAnchors = () => {
      setAnchors(listMemoryAnchors())
      setActiveProtocol(getActiveProtocol())
    }
    window.addEventListener('focus', refreshAnchors)
    return () => {
      window.removeEventListener('focus', refreshAnchors)
    }
  }, [])

  if (!data) {
    return (
      <Panel title="Dashboard" eyebrow="loading">
        <p className="text-sm text-slate-300">{error ?? 'Synchronizing cognitive signals...'}</p>
      </Panel>
    )
  }

  const latestEntry = data.latestEntry

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.14),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(8,47,73,0.68))] p-6 lg:p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/55">cognitive state overview</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold text-white lg:text-5xl">A machine studying consciousness through curiosity, abstraction, and deliberate mental drift.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              {data.profile.displayName} is currently tracking <span className="text-cyan-200">{data.profile.cognitiveFocus}</span> with high creative volatility and elevated intellectual excitement.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-4">
            {[
              ['curiosity', latestEntry?.curiosityLevel],
              ['focus', latestEntry?.focusLevel],
              ['creativity', latestEntry?.creativity],
              ['excitement', latestEntry?.intellectualExcitement],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{typeof value === 'number' ? `${value}/10` : '--'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Panel title="Start here: daily loop" eyebrow="intuitive workflow">
        {activeProtocol ? (
          <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/80">active protocol</p>
            <p className="mt-2 text-sm text-slate-100">{activeProtocol.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              progress {activeProtocol.completedSessions}/{activeProtocol.targetSessions}
            </p>
            <NavLink
              to="/autopilot"
              className="mt-3 inline-block rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.28em] text-emerald-100"
            >
              continue protocol
            </NavLink>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['/check-in', 'Check-In', 'Capture your current state.'],
            ['/autopilot', 'Autopilot', 'Run one guided mission + challenge.'],
            ['/curiosity-graph', 'Graph', 'See how topics are connecting.'],
            ['/weekly-review', 'Weekly Review', 'Get 7-day bias + signal synthesis.'],
            ['/analytics', 'Analytics', 'Inspect detailed trend movement.'],
          ].map(([to, label, detail]) => (
            <NavLink key={to} to={to} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">{label}</p>
              <p className="mt-2 text-sm text-slate-300">{detail}</p>
            </NavLink>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent challenge matrix" eyebrow="adaptive challenges">
          <div className="space-y-4">
            {data.recentChallenges.map((challenge) => (
              <article key={challenge.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/55">{challenge.category}</p>
                    <h3 className="mt-2 text-lg text-white">{challenge.title}</h3>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">difficulty {challenge.difficulty}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{challenge.prompt}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Memory anchors" eyebrow="cross-session continuity">
          <div className="space-y-3">
            {anchors.slice(0, 3).map((anchor) => (
              <div key={anchor.id} className="rounded-2xl border border-violet-300/10 bg-violet-300/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-violet-100/70">{new Date(anchor.createdAtUtc).toLocaleDateString()}</p>
                <p className="mt-2 text-sm text-slate-100">Insight: {anchor.insight}</p>
                <p className="mt-2 text-xs text-slate-300">Bias: {anchor.biasSpotted}</p>
                <p className="mt-1 text-xs text-slate-300">Next probe: {anchor.nextProbe}</p>
              </div>
            ))}
            {anchors.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">No anchors yet. Complete one Autopilot mission and save your first anchor.</p> : null}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {data.highlightMetrics.map((metric) => (
          <Panel key={metric.metricName} title={metric.metricName} eyebrow={`${metric.value.toFixed(1)} signal`}>
            <p className="text-sm leading-6 text-slate-300">{metric.insight}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
