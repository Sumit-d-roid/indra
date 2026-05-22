import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../components/Panel'
import { indraApi } from '../lib/api'
import type { Challenge, ChallengeArchetype, ChallengeHistoryItem, MutationDiagnostics } from '../types'

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([])
  const [archetypes, setArchetypes] = useState<ChallengeArchetype[]>([])
  const [analysis, setAnalysis] = useState<MutationDiagnostics | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [index, setIndex] = useState(0)
  const [focusArea, setFocusArea] = useState('interdisciplinary synthesis')
  const [pattern, setPattern] = useState('systems framing')
  const [preferredDifficulty, setPreferredDifficulty] = useState(5)
  const [noveltyTarget, setNoveltyTarget] = useState(0.8)
  const [mutationIntensity, setMutationIntensity] = useState(6)
  const [reflectionDepth, setReflectionDepth] = useState(7)
  const [response, setResponse] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [challengeData, historyData, archetypeData, diagnostics] = await Promise.all([
          indraApi.getChallenges(),
          indraApi.getChallengeHistory(),
          indraApi.getChallengeArchetypes(),
          indraApi.getChallengeMutationAnalysis(),
        ])

        if (!cancelled) {
          setChallenges(challengeData)
          setHistory(historyData)
          setArchetypes(archetypeData)
          setAnalysis(diagnostics)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const challenge = useMemo(() => {
    if (challenges.length === 0) {
      return null
    }

    return challenges[index % challenges.length]
  }, [challenges, index])

  const generateChallenge = async () => {
    setGenerating(true)
    try {
      const generated = await indraApi.generateAdaptiveChallenge({
        focusArea,
        currentPattern: pattern,
        preferredDifficulty,
        noveltyTarget,
        mutationIntensity,
      })

      setChallenges((current) => [generated.challenge, ...current])
      setAnalysis(generated.diagnostics)
      setIndex(0)
    } finally {
      setGenerating(false)
    }
  }

  const submitResponse = async () => {
    if (!challenge || response.trim().length < 8) {
      return
    }

    setSubmitting(true)
    try {
      const historyItem = await indraApi.submitChallengeResponse(challenge.id, {
        responseText: response.trim(),
        reflectionDepth,
        isCompleted: true,
      })

      setHistory((current) => [historyItem, ...current].slice(0, 24))
      setResponse('')
      const diagnostics = await indraApi.getChallengeMutationAnalysis()
      setAnalysis(diagnostics)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !challenge) {
    return (
      <Panel title="Adaptive challenge matrix" eyebrow="mutation engine booting">
        <p className="text-sm text-slate-300">Synchronizing challenge history, mutation diagnostics, and archetype lattice...</p>
      </Panel>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel
        title={challenge.title}
        eyebrow={challenge.category}
        action={
          <button
            type="button"
            onClick={() => setIndex((value) => value + 1)}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100"
          >
            rotate sample
          </button>
        }
      >
        <p className="text-lg leading-8 text-slate-200">{challenge.prompt}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="rounded-full border border-white/10 px-3 py-2">difficulty {challenge.difficulty}</span>
          <span className="rounded-full border border-white/10 px-3 py-2">novelty {(challenge.noveltyIndex * 100).toFixed(0)}%</span>
          <span className="rounded-full border border-white/10 px-3 py-2">adaptive matrix active</span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            focus area
            <input
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none"
            />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            repetitive pattern
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none"
            />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            preferred difficulty ({preferredDifficulty})
            <input
              type="range"
              min={1}
              max={10}
              value={preferredDifficulty}
              onChange={(event) => setPreferredDifficulty(Number(event.target.value))}
              className="mt-3 h-2 w-full accent-cyan-300"
            />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            mutation intensity ({mutationIntensity})
            <input
              type="range"
              min={1}
              max={10}
              value={mutationIntensity}
              onChange={(event) => setMutationIntensity(Number(event.target.value))}
              className="mt-3 h-2 w-full accent-violet-300"
            />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400 md:col-span-2">
            novelty target ({Math.round(noveltyTarget * 100)}%)
            <input
              type="range"
              min={0.2}
              max={0.99}
              step={0.01}
              value={noveltyTarget}
              onChange={(event) => setNoveltyTarget(Number(event.target.value))}
              className="mt-3 h-2 w-full accent-emerald-300"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void generateChallenge()}
            disabled={generating}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100 disabled:opacity-60"
          >
            {generating ? 'mutating...' : 'generate mutation'}
          </button>
        </div>

        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          className="mt-6 min-h-48 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Respond as if the system is pressure-testing your worldview..."
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            reflection depth ({reflectionDepth})
            <input
              type="range"
              min={1}
              max={10}
              value={reflectionDepth}
              onChange={(event) => setReflectionDepth(Number(event.target.value))}
              className="mt-3 h-2 w-full accent-cyan-300"
            />
          </label>
          <button
            type="button"
            onClick={() => void submitResponse()}
            disabled={submitting || response.trim().length < 8}
            className="rounded-2xl border border-violet-300/20 bg-violet-300/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-violet-100 disabled:opacity-60"
          >
            {submitting ? 'submitting...' : 'submit response'}
          </button>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title="Mutation diagnostics" eyebrow="anti-stagnation telemetry">
          {analysis ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/55">mutation directive</p>
                <p className="mt-2 text-slate-200">{analysis.mutationDirective}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">novelty score</p>
                  <p className="mt-2 text-xl text-white">{Math.round(analysis.noveltyScore * 100)}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">flexibility index</p>
                  <p className="mt-2 text-xl text-white">{Math.round(analysis.diversityMetrics.flexibilityIndex * 100)}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">abstraction pressure</p>
                  <p className="mt-2 text-xl text-white">{Math.round(analysis.abstractionPressure * 100)}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">over-specialization</p>
                  <p className="mt-2 text-xl text-white">{analysis.overSpecialized ? 'detected' : 'stable'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">repetitive patterns</p>
                <p className="mt-2 text-slate-200">{analysis.repetitivePatterns.join(', ') || 'none detected'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">comfort zones</p>
                <p className="mt-2 text-slate-200">{analysis.comfortZones.join(', ') || 'none detected'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300">No diagnostics available.</p>
          )}
        </Panel>

        <Panel title="Challenge history" eyebrow="completion tracking">
          <div className="space-y-3">
            {history.slice(0, 8).map((item) => (
              <div key={`${item.challengeId}-${item.createdAtUtc}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/55">{item.category}</p>
                <p className="mt-2 text-base text-white">{item.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {item.isCompleted ? 'completed' : 'incomplete'} · reflection {item.reflectionDepth}/10
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Archetype lattice" eyebrow="mutation blueprints">
          <div className="space-y-3">
            {archetypes.slice(0, 6).map((archetype) => (
              <div key={`${archetype.category}-${archetype.structureSignature}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-violet-200/55">{archetype.category}</p>
                <p className="mt-2 text-white">{archetype.structureSignature}</p>
                <p className="mt-1 text-slate-400">{archetype.pressureStyle}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
