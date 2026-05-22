import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { computeCognitiveProfile, getStoredCognitiveProfile, persistCognitiveProfile } from '../lib/cognitiveProfile'
import { indraApi } from '../lib/api'
import { listBehaviorSignals, recordBehaviorSignal } from '../lib/behaviorSignals'
import { getLatestMemoryAnchor, listMemoryAnchors, saveMemoryAnchor } from '../lib/memoryAnchors'
import { getActiveProtocol, recordProtocolSession } from '../lib/protocols'
import { interpretReflectionText } from '../lib/textSignals'
import type { ActiveProtocol, Challenge, ChallengeHistoryItem, CognitiveEntry, CognitiveProfileSnapshot, MemoryAnchor } from '../types'

type Stage = 'mission' | 'challenge' | 'summary'

type MissionPlan = {
  objective: string
  reason: string
  focusArea: string
  preferredDifficulty: number
  reflectionDepth: number
  wordingMode: string
  pacingHint: string
  atmosphereTag: string
}

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function inferFocusFromBias(bias: string) {
  const normalized = bias.toLowerCase()
  if (normalized.includes('narrow') || normalized.includes('rigid') || normalized.includes('loop')) {
    return 'perspective inversion'
  }
  if (normalized.includes('vague') || normalized.includes('shallow')) {
    return 'abstract reasoning'
  }
  return 'systems thinking'
}

function createMission(
  entry: CognitiveEntry | null,
  latestAnchor: MemoryAnchor | null,
  snapshot: CognitiveProfileSnapshot | null,
): MissionPlan {
  const profile = snapshot?.profile
  const patterns = snapshot?.patterns
  const currentState = snapshot?.currentState
  const topTension = snapshot?.tensions[0]
  const focusFromAnchor = latestAnchor ? inferFocusFromBias(latestAnchor.biasSpotted) : null
  const uncertaintyTolerance = snapshot?.contextualTraits.challengeTolerance.uncertainty ?? 0.5

  const preferredDifficulty = profile
    ? clampNumber(Math.round(2 + profile.challengeTolerance * 5 + profile.consistency * 2 - profile.avoidance * 2 + (uncertaintyTolerance - 0.5) * 2), 1, 10)
    : 3

  const reflectionDepth = profile
    ? clampNumber(Math.round(4 + profile.reflectionDepth * 6), 1, 10)
    : 6

  const pacingHint = profile
    ? profile.consistency > 0.7
      ? 'steady cadence: 1 mission daily'
      : 'compressed cadence: 1 mission every 48h'
    : 'baseline cadence: 3 missions this week'

  const wordingMode = profile
    ? profile.selfAwareness > 0.6
      ? 'abstract'
      : 'direct'
    : 'balanced'

  const atmosphereTag = profile
    ? profile.emotionalVariance > 0.68
      ? 'stabilizing'
      : profile.noveltySeeking > 0.7
        ? 'exploratory'
        : 'focused'
    : 'baseline'

  if (!entry) {
    return {
      objective: wordingMode === 'direct' ? 'Run one orienting mission with clear constraints' : 'Run a baseline orientation mission',
      reason: latestAnchor
        ? `No recent check-in found, so we adapt from your last bias: "${latestAnchor.biasSpotted}".`
        : 'No recent check-in found, so this mission establishes current baseline.',
      focusArea: focusFromAnchor ?? (patterns?.curiosityStyle.includes('explor') ? 'systems thinking' : 'abstract reasoning'),
      preferredDifficulty,
      reflectionDepth,
      wordingMode,
      pacingHint,
      atmosphereTag,
    }
  }

  if (topTension && topTension.divergenceScore > 0.35) {
    return {
      objective: 'Confront declared identity vs observed pattern in one concrete action',
      reason: `Detected tension: ${topTension.observedBehavior}`,
      focusArea: focusFromAnchor ?? 'uncertainty exposure',
      preferredDifficulty: clampNumber(preferredDifficulty, 2, 8),
      reflectionDepth,
      wordingMode: 'direct',
      pacingHint,
      atmosphereTag: currentState === 'withdrawal-loop' ? 'stabilizing' : atmosphereTag,
    }
  }

  if (profile && profile.avoidance > 0.7) {
    return {
      objective: 'Stabilize cognition with constrained, low-ambiguity pressure',
      reason: `Friction avoidance is elevated; run precise scope with shorter recovery loop. (${patterns?.avoidanceStyle ?? 'adaptive fallback'})`,
      focusArea: focusFromAnchor ?? 'abstract reasoning',
      preferredDifficulty: clampNumber(preferredDifficulty - 2, 1, 10),
      reflectionDepth: clampNumber(reflectionDepth - 1, 1, 10),
      wordingMode,
      pacingHint,
      atmosphereTag,
    }
  }

  if (profile && profile.noveltySeeking > 0.68 && profile.challengeTolerance > 0.62) {
    return {
      objective: 'Push synthesis under high ambiguity and novelty pressure',
      reason: `Profile supports deeper abstraction and novelty throughput. (${patterns?.challengeTolerance ?? 'high tolerance'})`,
      focusArea: focusFromAnchor ?? 'systems thinking',
      preferredDifficulty: clampNumber(preferredDifficulty + 1, 1, 10),
      reflectionDepth: clampNumber(reflectionDepth + 1, 1, 10),
      wordingMode,
      pacingHint,
      atmosphereTag,
    }
  }

  return {
    objective: 'Rebuild momentum with one targeted challenge',
    reason: latestAnchor
      ? `Mission tuned using latest bias: "${latestAnchor.biasSpotted}".`
      : 'Balanced adaptation from current cognitive state.',
    focusArea: focusFromAnchor ?? 'perspective inversion',
    preferredDifficulty,
    reflectionDepth,
    wordingMode,
    pacingHint,
    atmosphereTag,
  }
}

function pickChallenge(challenges: Challenge[], preferredDifficulty: number) {
  return [...challenges].sort((a, b) => {
    const aDistance = Math.abs(a.difficulty - preferredDifficulty)
    const bDistance = Math.abs(b.difficulty - preferredDifficulty)
    if (aDistance !== bDistance) {
      return aDistance - bDistance
    }
    return b.noveltyIndex - a.noveltyIndex
  })[0]
}

function buildInsight(plan: MissionPlan, challenge: Challenge, response: string, depth: number) {
  const density = response.length > 260 ? 'high' : response.length > 140 ? 'medium' : 'light'
  return `Mission complete: ${plan.objective.toLowerCase()}. You closed "${challenge.title}" at depth ${depth}/10 with ${density} response density. Next move: update anchor, inspect graph drift, then review weekly protocol alignment.`
}

function createAnchorDraft(challenge: Challenge, response: string, snapshot: CognitiveProfileSnapshot | null) {
  const compact = response.replace(/\s+/g, ' ').trim()
  const firstLine = compact.slice(0, 90)
  return {
    insight: firstLine.length > 0 ? firstLine : `I made progress on "${challenge.title}".`,
    biasSpotted:
      response.length < 140
        ? 'I stayed too surface-level in reasoning.'
        : snapshot?.patterns.selfDeceptionPattern ?? 'I leaned too hard on familiar framing.',
    nextProbe: `Test the opposite assumption behind "${challenge.title}" in tomorrow's mission.`,
  }
}

export function AutopilotPage() {
  const [entries, setEntries] = useState<CognitiveEntry[]>([])
  const [entry, setEntry] = useState<CognitiveEntry | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [latestAnchor, setLatestAnchor] = useState<MemoryAnchor | null>(null)
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([])
  const [profileSnapshot, setProfileSnapshot] = useState<CognitiveProfileSnapshot | null>(() => getStoredCognitiveProfile())
  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(() => getActiveProtocol())
  const [stage, setStage] = useState<Stage>('mission')
  const [response, setResponse] = useState('')
  const [insight, setInsight] = useState('')
  const [anchorInsight, setAnchorInsight] = useState('')
  const [anchorBias, setAnchorBias] = useState('')
  const [anchorProbe, setAnchorProbe] = useState('')
  const [anchorSaved, setAnchorSaved] = useState(false)
  const [reflectionDepth, setReflectionDepth] = useState(7)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mission = useMemo(
    () => createMission(entry, latestAnchor, profileSnapshot),
    [entry, latestAnchor, profileSnapshot],
  )

  const missionTonePlaceholder =
    profileSnapshot?.patterns.reflectionPrompt
      ? `${profileSnapshot.patterns.reflectionPrompt} Keep it under 220 words.`
      : mission.wordingMode === 'direct'
      ? 'Write concise reasoning: claim, evidence, counterpoint, revised claim.'
      : mission.wordingMode === 'abstract'
        ? 'Write your response, then invert one assumption and re-synthesize at a higher abstraction level.'
        : 'Write your response. Keep it concrete, then push one abstraction level deeper.'

  const missionThemeClass =
    mission.atmosphereTag === 'stabilizing'
      ? 'border-amber-300/20 bg-amber-300/10'
      : mission.atmosphereTag === 'exploratory'
        ? 'border-violet-300/20 bg-violet-300/10'
        : 'border-cyan-300/20 bg-cyan-300/10'

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [entries, challenges, challengeHistory] = await Promise.all([
          indraApi.getCognitiveEntries(),
          indraApi.getChallenges(),
          indraApi.getChallengeHistory(),
        ])
        if (!active) {
          return
        }

        const storedAnchor = getLatestMemoryAnchor()
        const storedProtocol = getActiveProtocol()
        const allAnchors = listMemoryAnchors()

        setLatestAnchor(storedAnchor)
        setEntries(entries)
        setActiveProtocol(storedProtocol)
        setHistory(challengeHistory)

        const snapshot = computeCognitiveProfile({
          entries,
          anchors: allAnchors,
          history: challengeHistory,
          activeProtocol: storedProtocol,
          behaviorSignals: listBehaviorSignals(),
        })
        persistCognitiveProfile(snapshot)
        setProfileSnapshot(snapshot)

        const latestEntry = entries[0] ?? null
        setEntry(latestEntry)

        const derivedMission = createMission(latestEntry, storedAnchor, snapshot)
        setReflectionDepth(derivedMission.reflectionDepth)

        if (challenges.length > 0) {
          setChallenge(pickChallenge(challenges, derivedMission.preferredDifficulty))
        } else {
          const generated = await indraApi.generateChallenge({
            focusArea: derivedMission.focusArea,
            preferredDifficulty: derivedMission.preferredDifficulty,
          })
          if (active) {
            setChallenge(generated.challenge)
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to initialize autopilot.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const rerollChallenge = async () => {
    setBusy(true)
    try {
      recordBehaviorSignal({
        trait: 'avoidance',
        source: 'mission',
        signal: 'challenge reroll before completion',
        weight: 0.55,
        context: challenge ? (challenge.category.toLowerCase().includes('uncertain') ? 'uncertainty' : 'creative') : 'creative',
        psychologicalWeight: clampNumber((challenge?.difficulty ?? mission.preferredDifficulty) / 10, 0.25, 1),
      })
      const generated = await indraApi.generateChallenge({
        focusArea: mission.focusArea,
        currentPattern: challenge?.title,
        preferredDifficulty: mission.preferredDifficulty,
      })
      setChallenge(generated.challenge)
      setResponse('')
      setStage('challenge')
      setError(null)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Failed to generate challenge.')
    } finally {
      setBusy(false)
    }
  }

  const completeMission = async () => {
    if (!challenge || response.trim().length < 12) {
      setError('Write at least 12 characters to complete the mission.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const reflectionSignals = interpretReflectionText(response.trim())
      const submitted = await indraApi.submitChallengeResponse(challenge.id, {
        responseText: response.trim(),
        reflectionDepth,
        isCompleted: true,
      })
      recordBehaviorSignal({
        trait: 'challengeTolerance',
        source: 'mission',
        signal: `mission completed at reflection depth ${reflectionDepth}`,
        weight: 0.78,
        context: challenge.category.toLowerCase().includes('perspective') ? 'social' : challenge.category.toLowerCase().includes('hypothetical') ? 'uncertainty' : 'creative',
        psychologicalWeight: clampNumber((challenge.difficulty + challenge.noveltyIndex * 10) / 20, 0.3, 1),
      })
      recordBehaviorSignal({
        trait: 'reflectionDepth',
        source: 'mission',
        signal: `response depth score ${reflectionSignals.depthScore.toFixed(2)} with ${reflectionSignals.tokenCount} tokens`,
        weight: 0.48 + reflectionSignals.depthScore * 0.45,
        context: challenge.category.toLowerCase().includes('perspective') ? 'social' : 'creative',
        psychologicalWeight: clampNumber(challenge.difficulty / 10, 0.3, 1),
      })
      recordBehaviorSignal({
        trait: 'noveltySeeking',
        source: 'mission',
        signal: `response novelty score ${reflectionSignals.noveltyScore.toFixed(2)}`,
        weight: 0.42 + reflectionSignals.noveltyScore * 0.42,
        context: challenge.category.toLowerCase().includes('hypothetical') ? 'uncertainty' : 'creative',
        psychologicalWeight: clampNumber(challenge.noveltyIndex, 0.25, 1),
      })
      recordBehaviorSignal({
        trait: 'avoidance',
        source: 'mission',
        signal: `response avoidance cue score ${reflectionSignals.avoidanceScore.toFixed(2)}`,
        weight: 0.35 + reflectionSignals.avoidanceScore * 0.5,
        context: challenge.category.toLowerCase().includes('perspective') ? 'social' : 'uncertainty',
        psychologicalWeight: clampNumber(challenge.difficulty / 10, 0.3, 1),
      })

      const updatedHistory = [submitted, ...history]
      setHistory(updatedHistory)
      const updatedProtocol = recordProtocolSession()
      setActiveProtocol(updatedProtocol)

      const snapshot = computeCognitiveProfile({
        entries,
        anchors: listMemoryAnchors(),
        history: updatedHistory,
        activeProtocol: updatedProtocol,
        behaviorSignals: listBehaviorSignals(),
        previousSnapshot: profileSnapshot,
      })
      persistCognitiveProfile(snapshot)
      setProfileSnapshot(snapshot)

      const summary = buildInsight(mission, challenge, response.trim(), reflectionDepth)
      const draft = createAnchorDraft(challenge, response.trim(), snapshot)
      setInsight(summary)
      setAnchorInsight(draft.insight)
      setAnchorBias(draft.biasSpotted)
      setAnchorProbe(draft.nextProbe)
      setAnchorSaved(false)
      setStage('summary')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Mission completion failed.')
    } finally {
      setBusy(false)
    }
  }

  const saveAnchor = () => {
    if (!challenge || !anchorInsight.trim() || !anchorBias.trim() || !anchorProbe.trim()) {
      setError('Fill insight, bias, and next probe before saving anchor.')
      return
    }

    const stored = saveMemoryAnchor({
      insight: anchorInsight.trim(),
      biasSpotted: anchorBias.trim(),
      nextProbe: anchorProbe.trim(),
      missionObjective: mission.objective,
      challengeTitle: challenge.title,
    })
    recordBehaviorSignal({
      trait: 'selfAwareness',
      source: 'journal',
      signal: `saved anchor with bias "${anchorBias.trim()}"`,
      weight: 0.72,
      context: mission.focusArea.toLowerCase().includes('perspective') ? 'social' : 'creative',
      psychologicalWeight: clampNumber(mission.preferredDifficulty / 10, 0.25, 1),
    })
    const anchorSignals = interpretReflectionText(`${anchorInsight}. ${anchorBias}. ${anchorProbe}`)
    recordBehaviorSignal({
      trait: 'selfAwareness',
      source: 'journal',
      signal: `anchor introspection score ${anchorSignals.selfAwarenessScore.toFixed(2)}`,
      weight: 0.44 + anchorSignals.selfAwarenessScore * 0.48,
    })
    setLatestAnchor(stored)
    setAnchorSaved(true)
    setError(null)
  }

  if (loading || !challenge) {
    return (
      <Panel title="Session Autopilot" eyebrow="initializing mission">
        <p className="text-sm text-slate-300">{error ?? 'Building today’s mission from your cognitive profile...'}</p>
      </Panel>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Session Autopilot" eyebrow="one mission per session">
        {stage === 'mission' ? (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${missionThemeClass}`}>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/60">mission objective</p>
              <p className="mt-2 text-lg text-white">{mission.objective}</p>
            </div>
            <p className="text-sm leading-7 text-slate-300">{mission.reason}</p>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.28em] text-slate-300">
              <span className="rounded-full border border-white/10 px-3 py-2">focus: {mission.focusArea}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">difficulty: {mission.preferredDifficulty}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">depth: {mission.reflectionDepth}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">pacing: {mission.pacingHint}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                recordBehaviorSignal({
                  trait: 'consistency',
                  source: 'mission',
                  signal: 'mission challenge stage started',
                  weight: 0.45,
                })
                setStage('challenge')
              }}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-cyan-100"
            >
              begin challenge
            </button>
          </div>
        ) : null}

        {stage === 'challenge' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/60">{challenge.category}</p>
              <h3 className="mt-2 text-xl text-white">{challenge.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{challenge.prompt}</p>
            </div>
            <textarea
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              className="min-h-48 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
              placeholder={missionTonePlaceholder}
            />
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span>reflection depth</span>
              <input
                type="range"
                min="1"
                max="10"
                value={reflectionDepth}
                onChange={(event) => setReflectionDepth(Number(event.target.value))}
                className="h-2 w-44 accent-cyan-300"
              />
              <span className="font-mono text-cyan-200">{reflectionDepth}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={completeMission}
                disabled={busy}
                className="rounded-full border border-violet-300/20 bg-violet-300/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-violet-100 disabled:opacity-50"
              >
                complete mission
              </button>
              <button
                type="button"
                onClick={rerollChallenge}
                disabled={busy}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-cyan-100 disabled:opacity-50"
              >
                reroll challenge
              </button>
            </div>
          </div>
        ) : null}

        {stage === 'summary' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">insight summary</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">{insight}</p>
            </div>

            <div className="rounded-2xl border border-violet-300/15 bg-violet-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-violet-100/70">memory anchor</p>
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Insight</span>
                  <input
                    value={anchorInsight}
                    onChange={(event) => setAnchorInsight(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Bias spotted</span>
                  <input
                    value={anchorBias}
                    onChange={(event) => setAnchorBias(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Next probe</span>
                  <input
                    value={anchorProbe}
                    onChange={(event) => setAnchorProbe(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={saveAnchor}
                className="mt-4 rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-violet-100"
              >
                save anchor
              </button>
              {anchorSaved ? <p className="mt-3 text-sm text-emerald-200">Anchor saved. Tomorrow’s mission will adapt from it.</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/curiosity-graph"
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-100"
              >
                open graph
              </NavLink>
              <NavLink
                to="/analytics"
                className="rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-violet-100"
              >
                open analytics
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setStage('mission')
                  setResponse('')
                  setInsight('')
                  setAnchorSaved(false)
                  setError(null)
                }}
                className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.32em] text-slate-200"
              >
                run again
              </button>
            </div>
            {activeProtocol ? (
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">
                Protocol progress: {activeProtocol.completedSessions}/{activeProtocol.targetSessions}
              </p>
            ) : null}
          </div>
        ) : null}
      </Panel>

      <div className="space-y-6">
        <Panel title="Cognitive profile" eyebrow="inferred operating pattern">
          {profileSnapshot ? (
            <div className="space-y-3 text-sm text-slate-300">
              <p>Curiosity style: <span className="text-slate-100">{profileSnapshot.patterns.curiosityStyle}</span></p>
              <p>Avoidance style: <span className="text-slate-100">{profileSnapshot.patterns.avoidanceStyle}</span></p>
              <p>Challenge tolerance: <span className="text-slate-100">{profileSnapshot.patterns.challengeTolerance}</span></p>
              <p>Recovery latency: <span className="text-slate-100">{profileSnapshot.patterns.recoveryLatency}</span></p>
              <p>Reflection prompt: <span className="text-slate-100">{profileSnapshot.patterns.reflectionPrompt}</span></p>
              <p>Protocol bias: <span className="text-slate-100">{profileSnapshot.patterns.protocolBias}</span></p>
              <p>Current state: <span className="text-slate-100">{profileSnapshot.currentState.replace(/-/g, ' ')}</span></p>
              {profileSnapshot.tensions[0] ? <p>Tension: <span className="text-slate-100">{profileSnapshot.tensions[0].observedBehavior}</span></p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate-300">Profile initializing from your recent data.</p>
          )}
        </Panel>

        <Panel title="Autopilot context" eyebrow="signal source">
          <p className="text-sm leading-7 text-slate-300">
            {entry
              ? `Using check-in from ${new Date(entry.createdAtUtc).toLocaleString()} with focus ${entry.focusLevel}/10, stress ${entry.stress}/10, curiosity ${entry.curiosityLevel}/10.`
              : 'No check-in found yet. Autopilot is using baseline mission mode.'}
          </p>
          <NavLink
            to="/check-in"
            className="mt-4 inline-block rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.32em] text-slate-200"
          >
            update check-in
          </NavLink>
        </Panel>

        <Panel title="Latest memory anchor" eyebrow="continuity layer">
          {latestAnchor ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/60">{new Date(latestAnchor.createdAtUtc).toLocaleString()}</p>
              <p>Insight: <span className="text-slate-100">{latestAnchor.insight}</span></p>
              <p>Bias: <span className="text-slate-100">{latestAnchor.biasSpotted}</span></p>
              <p>Probe: <span className="text-slate-100">{latestAnchor.nextProbe}</span></p>
            </div>
          ) : (
            <p className="text-sm leading-7 text-slate-300">No anchor saved yet. Save one after mission completion.</p>
          )}
        </Panel>

        <Panel title="Mission rule" eyebrow="single-session discipline">
          <p className="text-sm leading-7 text-slate-300">
            One mission, one response, one insight, one anchor. Keep sessions short and repeat daily to compound cognitive adaptation.
          </p>
          {activeProtocol ? <p className="mt-3 text-sm text-cyan-100">Active protocol: {activeProtocol.title}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </Panel>
      </div>
    </div>
  )
}
