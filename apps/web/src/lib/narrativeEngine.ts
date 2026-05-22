import { getStoredCognitiveProfile } from './cognitiveProfile'
import type { CognitiveProfileSnapshot, LongitudinalNarrative, NarrativeTurningPoint } from '../types'

const STORAGE_KEY = 'indra.longitudinalNarrative.v1'

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function readRaw() {
  if (typeof window === 'undefined') {
    return []
  }
  const payload = window.localStorage.getItem(STORAGE_KEY)
  if (!payload) {
    return []
  }
  try {
    const parsed = JSON.parse(payload) as unknown
    return Array.isArray(parsed) ? (parsed as LongitudinalNarrative[]) : []
  } catch {
    return []
  }
}

function writeRaw(narratives: LongitudinalNarrative[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(narratives))
}

function extractThemes(snapshot: CognitiveProfileSnapshot) {
  const themes: string[] = []
  const missionImpacts = snapshot.missionImpacts.slice(0, 20)

  if (snapshot.profile.avoidance > 0.62) themes.push('avoidance after emotional friction')
  if (snapshot.profile.consistency > 0.62) themes.push('consistency as recovery scaffold')
  if (snapshot.profile.noveltySeeking > 0.68 && snapshot.profile.consistency < 0.55) themes.push('reinvention impulses over gradual integration')
  if (snapshot.tensions.length > 0) themes.push('identity-behavior contradiction pressure')
  if (snapshot.recursiveReflection.detected) themes.push('recursive self-observation')

  const highRecovery = missionImpacts.filter((impact) => impact.recoveryCost > 0.55).length
  const confidenceGains = missionImpacts.filter((impact) => impact.confidenceShift > 0.15).length
  if (highRecovery >= 3) themes.push('high adaptation cost after intense missions')
  if (confidenceGains >= 3) themes.push('confidence building through completed discomfort')
  if (themes.length === 0) themes.push('early narrative formation')

  return themes.slice(0, 6)
}

function inferArc(snapshot: CognitiveProfileSnapshot) {
  if (snapshot.currentState === 'withdrawal-loop') {
    return {
      name: 'Collapse and re-entry',
      dominantPatterns: ['withdrawal after pressure', 'short re-engagement windows', 'fragile continuity'],
      activeSince: snapshot.computedAtUtc,
      confidence: 0.72,
    }
  }
  if (snapshot.currentState === 'overextended-performer') {
    return {
      name: 'Intensity-driven adaptation',
      dominantPatterns: ['high output', 'rising emotional volatility', 'performance over integration'],
      activeSince: snapshot.computedAtUtc,
      confidence: 0.69,
    }
  }
  if (snapshot.currentState === 'stabilizing-recovery') {
    return {
      name: 'Reconstruction',
      dominantPatterns: ['steady protocol adherence', 'lower recovery latency', 'less collapse after friction'],
      activeSince: snapshot.computedAtUtc,
      confidence: 0.76,
    }
  }
  return {
    name: 'Exploratory consolidation',
    dominantPatterns: ['novelty with moderate stability', 'growing metacognition', 'adaptive pacing'],
    activeSince: snapshot.computedAtUtc,
    confidence: 0.64,
  }
}

function detectTurningPoints(snapshot: CognitiveProfileSnapshot): NarrativeTurningPoint[] {
  const points: NarrativeTurningPoint[] = []
  const latestImpact = snapshot.missionImpacts[0]
  const latestEvent = snapshot.evolutionEvents[snapshot.evolutionEvents.length - 1]

  if (latestEvent) {
    points.push({
      title: latestEvent.title,
      detail: latestEvent.detail,
      timestamp: latestEvent.createdAtUtc,
      weight: latestEvent.impact,
    })
  }
  if (latestImpact?.recursiveReflectionDetected) {
    points.push({
      title: 'Recursive reflection threshold crossed',
      detail: 'Reflection shifted from task commentary to pattern-on-pattern awareness.',
      timestamp: latestImpact.createdAtUtc,
      weight: 0.74,
    })
  }
  if (snapshot.recoverySignature.recoveryLatencyHours < 18) {
    points.push({
      title: 'Faster recovery milestone',
      detail: 'Re-engagement now happens within a shorter post-failure window.',
      timestamp: snapshot.computedAtUtc,
      weight: 0.68,
    })
  }
  return points.slice(0, 4)
}

function compressNarrative(themes: string[]) {
  const first = themes[0] ?? 'adaptation under pressure'
  const second = themes[1] ?? 'consistency-driven recovery'
  return `Across recent cycles, your pattern is shifting from reactive intensity toward more coherent adaptation. ${first} remains active, yet ${second} is becoming a stronger stabilizer. You are less likely to abandon growth after emotional friction and more likely to re-engage through structured continuity.`
}

function recursiveNarrativeAwareness(snapshot: CognitiveProfileSnapshot) {
  if (snapshot.recursiveReflection.detected) {
    return 'You are no longer only reacting to friction—you are noticing how you narrate the reaction itself, and that meta-awareness is reducing collapse patterns.'
  }
  return 'Your narrative still leans on first-order explanation; the next leap is observing how your explanations themselves repeat.'
}

function deriveExistentialAnswers(snapshot: CognitiveProfileSnapshot) {
  return {
    changedFromPastSelf: snapshot.profile.consistency > 0.58
      ? 'You now re-enter after friction faster than your earlier pattern of extended withdrawal.'
      : 'You are still vulnerable to friction-driven disengagement, but recovery structures are forming.',
    whatChangedYou: snapshot.adaptationInsights.growthConditions[0] ?? 'Short, repeated mission cycles with explicit reflection.',
    whatKeepsRepeating: snapshot.tensions[0]?.observedBehavior ?? 'Avoidance rises when emotional load and ambiguity combine.',
    emergingSelf: snapshot.currentState === 'stabilizing-recovery'
      ? 'A version that tolerates gradual progress without dramatic reset.'
      : 'A version that seeks depth but is still negotiating pressure tolerance.',
    fragmentationConditions: snapshot.adaptationInsights.fragmentationConditions[0] ?? 'Unbounded pressure without recovery guardrails.',
    coherenceConditions: snapshot.adaptationInsights.growthConditions[0] ?? 'Consistent low-friction mission cadence with anchors.',
  }
}

export function buildLongitudinalNarrative(snapshot = getStoredCognitiveProfile()) {
  if (!snapshot) {
    return null
  }

  const previousNarrative = readRaw()[0]
  const themes = extractThemes(snapshot)
  const currentArc = inferArc(snapshot)
  const turningPoints = detectTurningPoints(snapshot)
  const narrative: LongitudinalNarrative = {
    generatedAtUtc: new Date().toISOString(),
    recurringThemes: themes,
    currentArc,
    previousArc: previousNarrative?.currentArc,
    emergingArc: {
      name: snapshot.profile.consistency > 0.62 ? 'Stability without intensity' : 'Adaptive stability in progress',
      dominantPatterns: ['lower collapse probability', 'more deliberate pacing', 'higher emotional truth in reflection'],
      activeSince: new Date().toISOString(),
      confidence: clamp01(0.44 + snapshot.profile.selfAwareness * 0.38),
    },
    turningPoints,
    compressedNarrative: compressNarrative(themes),
    recursiveNarrativeAwareness: recursiveNarrativeAwareness(snapshot),
    existentialAnswers: deriveExistentialAnswers(snapshot),
  }
  return narrative
}

export function listLongitudinalNarratives() {
  return readRaw()
}

export function persistLongitudinalNarrative(narrative: LongitudinalNarrative) {
  const next = [narrative, ...readRaw()].slice(0, 120)
  writeRaw(next)
  return narrative
}
