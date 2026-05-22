import type {
  ActiveProtocol,
  ChallengeHistoryItem,
  CognitiveEntry,
  CognitivePatterns,
  CognitiveProfile,
  CognitiveProfileSnapshot,
  CognitiveTraitConfidence,
  MemoryAnchor,
  TraitEvidence,
  TraitName,
} from '../types'

const STORAGE_KEY = 'indra.cognitiveProfile.v1'
const TRAITS: TraitName[] = [
  'avoidance',
  'consistency',
  'reflectionDepth',
  'challengeTolerance',
  'emotionalVariance',
  'noveltySeeking',
  'selfAwareness',
]

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const avg = (values: number[]) => (values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length)

function stdDev(values: number[]) {
  if (values.length < 2) {
    return 0
  }
  const mean = avg(values)
  const variance = avg(values.map((value) => (value - mean) ** 2))
  return Math.sqrt(variance)
}

function normalize10(values: number[]) {
  return clamp01(avg(values) / 10)
}

function readStoredSnapshot() {
  if (typeof window === 'undefined') {
    return null
  }

  const payload = window.localStorage.getItem(STORAGE_KEY)
  if (!payload) {
    return null
  }

  try {
    const parsed = JSON.parse(payload) as CognitiveProfileSnapshot
    if (!parsed?.profile || !parsed?.patterns || !parsed?.confidence || !parsed?.evidence || !Array.isArray(parsed?.history)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function storeSnapshot(snapshot: CognitiveProfileSnapshot) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

function emptyEvidenceRecord() {
  return {
    avoidance: [],
    consistency: [],
    reflectionDepth: [],
    challengeTolerance: [],
    emotionalVariance: [],
    noveltySeeking: [],
    selfAwareness: [],
  } satisfies Record<TraitName, TraitEvidence[]>
}

function summarizeBias(anchors: MemoryAnchor[]) {
  const counts = new Map<string, number>()
  for (const anchor of anchors) {
    const key = anchor.biasSpotted.trim().toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const mostRepeated = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return {
    repeatedBiasRatio: anchors.length === 0 || !mostRepeated ? 0 : mostRepeated[1] / anchors.length,
    repeatedBiasText: mostRepeated?.[0] ?? '',
  }
}

function derivePatterns(profile: CognitiveProfile, anchors: MemoryAnchor[], history: ChallengeHistoryItem[]): CognitivePatterns {
  const { repeatedBiasText } = summarizeBias(anchors)
  const topCategory = history.length === 0
    ? 'mixed'
    : [...history.reduce((acc, item) => acc.set(item.category, (acc.get(item.category) ?? 0) + 1), new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mixed'

  return {
    curiosityStyle: profile.noveltySeeking > 0.72 ? 'exploratory collider' : profile.noveltySeeking > 0.48 ? 'guided explorer' : 'stability-seeking explorer',
    avoidanceStyle: profile.avoidance > 0.68 ? 'high avoidance under uncertainty' : profile.avoidance > 0.42 ? 'selective avoidance around ambiguity' : 'low avoidance, high engagement',
    energyRhythm: profile.consistency > 0.7 ? 'stable cadence' : profile.emotionalVariance > 0.62 ? 'spiky bursts with recovery dips' : 'cyclical variation',
    emotionalTriggers: repeatedBiasText || 'no dominant trigger pattern yet',
    challengeTolerance: profile.challengeTolerance > 0.7 ? 'high tolerance for abstract pressure' : profile.challengeTolerance > 0.45 ? 'moderate tolerance with structure support' : 'prefers constrained challenge framing',
    recoveryLatency: profile.consistency > 0.72 ? 'fast' : profile.consistency > 0.45 ? 'moderate' : 'slow',
    obsessionCycles: topCategory === 'mixed' ? 'no dominant cycle yet' : `recurring cycle around ${topCategory.toLowerCase()}`,
    noveltyDecay: profile.noveltySeeking > 0.68 && profile.avoidance < 0.5 ? 'low decay' : 'moderate decay',
    reflectionPattern: profile.reflectionDepth > 0.7 ? 'deep recursive reflection' : profile.reflectionDepth > 0.45 ? 'balanced reflection' : 'surface-first reflection',
    selfDeceptionPattern: repeatedBiasText.includes('familiar') || repeatedBiasText.includes('surface') ? repeatedBiasText : 'watch for comfort-language rationalization',
  }
}

function addEvidence(
  evidence: Record<TraitName, TraitEvidence[]>,
  trait: TraitName,
  signal: string,
  weight: number,
  source: TraitEvidence['source'],
) {
  evidence[trait].push({
    trait,
    signal,
    weight,
    source,
    timestamp: new Date().toISOString(),
  })
}

function confidenceFromCounts(sampleCount: number) {
  return clamp01(0.2 + Math.min(1, sampleCount / 20) * 0.75)
}

function smoothTrait(previous: number | undefined, nextRaw: number, confidence: number) {
  if (typeof previous !== 'number') {
    return clamp01(nextRaw)
  }
  const alpha = 0.16 + confidence * 0.28
  return clamp01(previous * (1 - alpha) + nextRaw * alpha)
}

export function computeCognitiveProfile(input: {
  entries: CognitiveEntry[]
  anchors: MemoryAnchor[]
  history: ChallengeHistoryItem[]
  activeProtocol: ActiveProtocol | null
  behaviorSignals: TraitEvidence[]
  previousSnapshot?: CognitiveProfileSnapshot | null
}) {
  const previous = input.previousSnapshot ?? readStoredSnapshot()
  const recentEntries = input.entries.slice(0, 28)
  const recentHistory = input.history.slice(0, 40)
  const recentAnchors = input.anchors.slice(0, 30)
  const signals = input.behaviorSignals.slice(0, 80)

  const evidence = emptyEvidenceRecord()
  const { repeatedBiasRatio, repeatedBiasText } = summarizeBias(recentAnchors)

  const stress = normalize10(recentEntries.map((entry) => entry.stress))
  const curiosity = normalize10(recentEntries.map((entry) => entry.curiosityLevel))
  const creativity = normalize10(recentEntries.map((entry) => entry.creativity))
  const motivation = normalize10(recentEntries.map((entry) => entry.motivation))
  const focus = normalize10(recentEntries.map((entry) => entry.focusLevel))

  const completionRate = recentHistory.length === 0 ? 0.5 : recentHistory.filter((item) => item.isCompleted).length / recentHistory.length
  const reflectionHistory = recentHistory.length === 0 ? 0.5 : clamp01(avg(recentHistory.map((item) => item.reflectionDepth)) / 10)
  const highDifficultyCompletions = recentHistory.filter((item) => item.isCompleted && item.reflectionDepth >= 7).length

  const missionRerolls = signals.filter((item) => item.source === 'mission' && item.signal.includes('reroll')).length
  const missionCompletions = signals.filter((item) => item.source === 'mission' && item.signal.includes('complete')).length
  const checkinsSaved = signals.filter((item) => item.source === 'checkin').length
  const journalSignals = signals.filter((item) => item.source === 'journal').length
  const protocolGap = input.activeProtocol ? 1 - input.activeProtocol.completedSessions / Math.max(1, input.activeProtocol.targetSessions) : 0.4

  const spacingDays = recentEntries
    .map((entry) => new Date(entry.createdAtUtc).getTime())
    .sort((a, b) => b - a)
    .slice(0, 10)
  const averageGapDays = spacingDays.length < 2 ? 1.8 : avg(spacingDays.slice(0, -1).map((value, index) => (value - spacingDays[index + 1]) / 86_400_000))
  const cadenceScore = clamp01(1 - (averageGapDays - 1) / 5)

  const volatilitySource = recentEntries.flatMap((entry) => [entry.stress, entry.mood, entry.energy])
  const emotionalVarianceRaw = clamp01(stdDev(volatilitySource) / 3.1)

  const uniqueCategories = new Set(recentHistory.map((item) => item.category.toLowerCase())).size
  const categoryDiversity = clamp01(uniqueCategories / 6)

  const anchorQuality = recentAnchors.length === 0
    ? 0.45
    : clamp01(
      avg(
        recentAnchors.map((anchor) => {
          const insightLen = Math.min(1, anchor.insight.length / 120)
          const probeLen = Math.min(1, anchor.nextProbe.length / 120)
          const biasSpecificity = anchor.biasSpotted.length > 25 ? 1 : 0.6
          return 0.4 * insightLen + 0.35 * probeLen + 0.25 * biasSpecificity
        }),
      ),
    )

  const avoidanceRaw = clamp01(0.34 * stress + 0.22 * protocolGap + 0.2 * (1 - completionRate) + 0.14 * (missionRerolls / Math.max(1, missionCompletions + missionRerolls)) + 0.1 * (1 - focus))
  const consistencyRaw = clamp01(0.42 * cadenceScore + 0.3 * completionRate + 0.14 * motivation + 0.14 * clamp01(checkinsSaved / 8))
  const reflectionDepthRaw = clamp01(0.62 * reflectionHistory + 0.22 * focus + 0.16 * anchorQuality)
  const challengeToleranceRaw = clamp01(0.4 * completionRate + 0.25 * clamp01(highDifficultyCompletions / 8) + 0.2 * (1 - missionRerolls / Math.max(1, missionCompletions + missionRerolls)) + 0.15 * (1 - avoidanceRaw))
  const noveltySeekingRaw = clamp01(0.36 * curiosity + 0.23 * creativity + 0.21 * categoryDiversity + 0.2 * (1 - repeatedBiasRatio))
  const selfAwarenessRaw = clamp01(0.45 * anchorQuality + 0.22 * reflectionDepthRaw + 0.18 * (1 - repeatedBiasRatio) + 0.15 * clamp01(journalSignals / 8))

  addEvidence(evidence, 'avoidance', `Completion rate ${(completionRate * 100).toFixed(0)}% and stress ${Math.round(stress * 100)}% shaped avoidance`, 0.74, 'mission')
  addEvidence(evidence, 'avoidance', `Reroll ratio ${missionRerolls}/${Math.max(1, missionCompletions + missionRerolls)}`, 0.58, 'mission')
  addEvidence(evidence, 'consistency', `Average check-in gap ${averageGapDays.toFixed(1)} days`, 0.71, 'checkin')
  addEvidence(evidence, 'consistency', `Protocol adherence gap ${(protocolGap * 100).toFixed(0)}%`, 0.53, 'mission')
  addEvidence(evidence, 'reflectionDepth', `Average reflection depth ${(reflectionHistory * 10).toFixed(1)}/10`, 0.78, 'mission')
  addEvidence(evidence, 'challengeTolerance', `${highDifficultyCompletions} high-depth completions in recent window`, 0.69, 'mission')
  addEvidence(evidence, 'emotionalVariance', `Mood/stress variance ${emotionalVarianceRaw.toFixed(2)}`, 0.67, 'checkin')
  addEvidence(evidence, 'noveltySeeking', `Category diversity ${uniqueCategories} + repeated bias ratio ${(repeatedBiasRatio * 100).toFixed(0)}%`, 0.65, 'mission')
  addEvidence(evidence, 'selfAwareness', `Anchor quality ${Math.round(anchorQuality * 100)}%${repeatedBiasText ? `; repeated bias "${repeatedBiasText}"` : ''}`, 0.72, 'journal')

  const confidence: CognitiveTraitConfidence = {
    avoidance: confidenceFromCounts(recentHistory.length + signals.length),
    consistency: confidenceFromCounts(recentEntries.length + checkinsSaved),
    reflectionDepth: confidenceFromCounts(recentHistory.length + recentAnchors.length),
    challengeTolerance: confidenceFromCounts(recentHistory.length + missionCompletions),
    emotionalVariance: confidenceFromCounts(recentEntries.length),
    noveltySeeking: confidenceFromCounts(recentHistory.length + recentAnchors.length),
    selfAwareness: confidenceFromCounts(recentAnchors.length + journalSignals),
  }

  const profile: CognitiveProfile = {
    avoidance: smoothTrait(previous?.profile.avoidance, avoidanceRaw, confidence.avoidance),
    consistency: smoothTrait(previous?.profile.consistency, consistencyRaw, confidence.consistency),
    reflectionDepth: smoothTrait(previous?.profile.reflectionDepth, reflectionDepthRaw, confidence.reflectionDepth),
    challengeTolerance: smoothTrait(previous?.profile.challengeTolerance, challengeToleranceRaw, confidence.challengeTolerance),
    emotionalVariance: smoothTrait(previous?.profile.emotionalVariance, emotionalVarianceRaw, confidence.emotionalVariance),
    noveltySeeking: smoothTrait(previous?.profile.noveltySeeking, noveltySeekingRaw, confidence.noveltySeeking),
    selfAwareness: smoothTrait(previous?.profile.selfAwareness, selfAwarenessRaw, confidence.selfAwareness),
  }

  const history = [
    ...(previous?.history ?? []),
    { timestamp: new Date().toISOString(), profile },
  ].slice(-120)

  const patterns = derivePatterns(profile, recentAnchors, recentHistory)
  return {
    computedAtUtc: new Date().toISOString(),
    profile,
    confidence,
    evidence: TRAITS.reduce((acc, trait) => {
      acc[trait] = evidence[trait].slice(0, 6)
      return acc
    }, emptyEvidenceRecord()),
    history,
    patterns,
  } satisfies CognitiveProfileSnapshot
}

export function getStoredCognitiveProfile() {
  return readStoredSnapshot()
}

export function persistCognitiveProfile(snapshot: CognitiveProfileSnapshot) {
  storeSnapshot(snapshot)
}
