import type {
  ActiveProtocol,
  AdaptationInsights,
  BehavioralRhythm,
  ChallengeHistoryItem,
  ContextualTraitMap,
  CognitiveEntry,
  DynamicIdentityState,
  EvolutionEvent,
  InternalTension,
  MetaAwareness,
  MissionImpact,
  CognitivePatterns,
  CognitiveProfile,
  CognitiveProfileSnapshot,
  CognitiveTraitConfidence,
  MemoryAnchor,
  RecoverySignature,
  TraitEvidence,
  TraitName,
} from '../types'

const STORAGE_KEY = 'indra.cognitiveProfile.v1'
const DAY_MS = 86_400_000
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

function emptyContextualMap(): ContextualTraitMap {
  return { creative: 0.5, social: 0.5, physical: 0.5, uncertainty: 0.5 }
}

function inferContextFromCategory(category: string): keyof ContextualTraitMap {
  const normalized = category.toLowerCase()
  if (normalized.includes('social') || normalized.includes('perspective')) return 'social'
  if (normalized.includes('physical') || normalized.includes('embodied')) return 'physical'
  if (normalized.includes('uncertainty') || normalized.includes('hypothetical')) return 'uncertainty'
  return 'creative'
}

function weightedMean(values: Array<{ value: number; weight: number }>, fallback = 0.5) {
  if (values.length === 0) {
    return fallback
  }
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) {
    return fallback
  }
  const total = values.reduce((sum, item) => sum + item.value * item.weight, 0)
  return clamp01(total / totalWeight)
}

function recencyWeight(timestamp: string) {
  const ageDays = (Date.now() - new Date(timestamp).getTime()) / DAY_MS
  if (Number.isNaN(ageDays)) {
    return 0.5
  }
  return clamp01(1 - ageDays / 30)
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
    return {
      ...parsed,
      patterns: {
        ...parsed.patterns,
        reflectionPrompt: parsed.patterns.reflectionPrompt ?? 'Write claim → evidence → counterpoint in three short blocks.',
        protocolBias: parsed.patterns.protocolBias ?? 'consistency-first protocol',
        dashboardEmphasis: parsed.patterns.dashboardEmphasis ?? 'controlled escalation of challenge depth',
      },
      shadowPatterns: Array.isArray(parsed.shadowPatterns) ? parsed.shadowPatterns : [],
      contextualTraits: parsed.contextualTraits ?? {
        challengeTolerance: emptyContextualMap(),
        reflectionDepth: emptyContextualMap(),
      },
      tensions: Array.isArray(parsed.tensions) ? parsed.tensions : [],
      rhythms: Array.isArray(parsed.rhythms) ? parsed.rhythms : [],
      recoverySignature: parsed.recoverySignature ?? {
        failureResponse: 'reset',
        recoveryLatencyHours: 24,
        successfulRecoveryInterventions: [],
      },
      currentState: parsed.currentState ?? 'stabilizing-recovery',
      evolutionEvents: Array.isArray(parsed.evolutionEvents) ? parsed.evolutionEvents : [],
      missionImpacts: Array.isArray(parsed.missionImpacts) ? parsed.missionImpacts : [],
      metaAwareness: parsed.metaAwareness ?? {
        selfEstimationBias: 0,
        confidence: 0.2,
        summary: 'Not enough mission prediction data yet.',
      },
      recursiveReflection: parsed.recursiveReflection ?? {
        detected: false,
        confidence: 0.2,
        detail: 'No recursive reflection pattern detected yet.',
      },
      adaptationInsights: parsed.adaptationInsights ?? {
        growthConditions: [],
        fragmentationConditions: [],
        survivingPatterns: [],
        adaptivePressure: [],
        avoidancePressure: [],
      },
    }
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

function buildSignalStats(signals: TraitEvidence[], trait: TraitName) {
  const relevant = signals.filter((signal) => signal.trait === trait)
  const weighted = relevant.map((signal) => signal.weight * (0.65 + recencyWeight(signal.timestamp) * 0.35))
  return {
    count: relevant.length,
    weightedAvg: weighted.length === 0 ? 0.5 : clamp01(avg(weighted)),
    topSignals: [...relevant].sort((a, b) => b.weight - a.weight).slice(0, 3),
  }
}

function detectShadowPatterns(profile: CognitiveProfile, patterns: CognitivePatterns) {
  const shadows: CognitiveProfileSnapshot['shadowPatterns'] = []

  if (profile.avoidance > 0.68 && profile.selfAwareness < 0.48) {
    shadows.push({
      title: 'Narrative avoidance loop',
      severity: 'high',
      detail: 'Avoidance is elevated while self-awareness is low. The system may default to rationalized delay.',
    })
  }
  if (profile.noveltySeeking > 0.76 && profile.consistency < 0.44) {
    shadows.push({
      title: 'Novelty escape cycle',
      severity: 'medium',
      detail: 'Novelty appetite is outrunning consistency, risking exploration without integration.',
    })
  }
  if (profile.challengeTolerance > 0.7 && profile.emotionalVariance > 0.66) {
    shadows.push({
      title: 'Overextension risk',
      severity: 'medium',
      detail: 'High challenge pressure with volatile emotional rhythm can trigger sharp recovery dips.',
    })
  }
  if (shadows.length === 0) {
    shadows.push({
      title: 'No dominant shadow lock',
      severity: 'low',
      detail: `Current profile looks adaptable. Keep pressure balanced with ${patterns.recoveryLatency} recovery pacing.`,
    })
  }

  return shadows
}

function deriveContextualTraits(history: ChallengeHistoryItem[], signals: TraitEvidence[]) {
  const challengeTolerance = emptyContextualMap()
  const reflectionDepth = emptyContextualMap()
  const contexts: Array<keyof ContextualTraitMap> = ['creative', 'social', 'physical', 'uncertainty']

  for (const context of contexts) {
    const contextualHistory = history.filter((item) => inferContextFromCategory(item.category) === context)
    const contextualSignals = signals.filter((item) => item.context === context)

    challengeTolerance[context] = weightedMean(
      [
        ...contextualHistory.map((item) => ({
          value: item.isCompleted ? 0.7 + item.reflectionDepth / 20 : 0.25,
          weight: 0.9,
        })),
        ...contextualSignals
          .filter((item) => item.trait === 'challengeTolerance' || item.trait === 'avoidance')
          .map((item) => ({
            value: item.trait === 'challengeTolerance' ? item.weight : 1 - item.weight,
            weight: 0.7 * (item.psychologicalWeight ?? 1),
          })),
      ],
      0.5,
    )

    reflectionDepth[context] = weightedMean(
      [
        ...contextualHistory.map((item) => ({
          value: clamp01(item.reflectionDepth / 10),
          weight: 0.85,
        })),
        ...contextualSignals
          .filter((item) => item.trait === 'reflectionDepth' || item.trait === 'selfAwareness')
          .map((item) => ({
            value: item.weight,
            weight: 0.65 * (item.psychologicalWeight ?? 1),
          })),
      ],
      0.5,
    )
  }

  return { challengeTolerance, reflectionDepth }
}

function deriveTensions(profile: CognitiveProfile, contextualTraits: { challengeTolerance: ContextualTraitMap }): InternalTension[] {
  const tensions: InternalTension[] = []
  if (profile.noveltySeeking > 0.62 && profile.avoidance > 0.56) {
    tensions.push({
      declaredIdentity: 'I seek challenge and novelty.',
      observedBehavior: 'Avoidance rises when uncertainty pressure increases.',
      divergenceScore: clamp01((profile.noveltySeeking - 0.45) * (profile.avoidance + 0.1)),
      recurringContexts: ['uncertainty', 'social'],
    })
  }
  if (contextualTraits.challengeTolerance.creative - contextualTraits.challengeTolerance.social > 0.28) {
    tensions.push({
      declaredIdentity: 'I can handle difficult pressure.',
      observedBehavior: 'Tolerance is strong in creative contexts but drops in social exposure.',
      divergenceScore: clamp01(contextualTraits.challengeTolerance.creative - contextualTraits.challengeTolerance.social),
      recurringContexts: ['social'],
    })
  }
  return tensions
}

function deriveRhythms(entries: CognitiveEntry[], history: ChallengeHistoryItem[], profile: CognitiveProfile): BehavioralRhythm[] {
  const rhythms: BehavioralRhythm[] = []
  const sorted = [...entries].sort((a, b) => new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime())
  const latestThree = sorted.slice(-3)
  const stressSlope = latestThree.length < 3 ? 0 : latestThree[2].stress - latestThree[0].stress
  if (stressSlope >= 2 && profile.avoidance > 0.55) {
    rhythms.push({
      trigger: '3-check-in stress rise',
      resultingPattern: 'avoidance increases and engagement narrows',
      confidence: 0.66,
    })
  }
  const misses = history.filter((item) => !item.isCompleted).length
  if (misses >= 3) {
    rhythms.push({
      trigger: 'consecutive incomplete missions',
      resultingPattern: 'passive preference + lower challenge tolerance',
      confidence: clamp01(0.45 + misses / 10),
    })
  }
  if (rhythms.length === 0) {
    rhythms.push({
      trigger: 'steady cadence',
      resultingPattern: 'no strong destabilizing cycle detected',
      confidence: 0.42,
    })
  }
  return rhythms
}

function deriveRecoverySignature(history: ChallengeHistoryItem[], entries: CognitiveEntry[], profile: CognitiveProfile): RecoverySignature {
  const failures = history
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.isCompleted)
  const recoveries = failures
    .map(({ index, item }) => {
      const nextSuccess = history.slice(index + 1).find((next) => next.isCompleted)
      if (!nextSuccess) return null
      const latencyHours = (new Date(nextSuccess.createdAtUtc).getTime() - new Date(item.createdAtUtc).getTime()) / 3_600_000
      return latencyHours > 0 ? latencyHours : null
    })
    .filter((value): value is number => typeof value === 'number')

  const recoveryLatencyHours = recoveries.length === 0 ? 24 : Math.max(1, avg(recoveries))
  const failureResponse: RecoverySignature['failureResponse'] =
    profile.avoidance > 0.7 ? 'withdraw'
      : profile.noveltySeeking > 0.72 && profile.consistency < 0.45 ? 'spiral'
        : profile.consistency > 0.62 ? 'reset'
          : 'compensate'

  const interventions = [
    profile.consistency > 0.6 ? 'fixed-time short mission' : null,
    profile.selfAwareness > 0.58 ? 'anchor-first reflection' : null,
    entries.length >= 5 ? 'daily check-in continuity' : null,
  ].filter((item): item is string => Boolean(item))

  return {
    failureResponse,
    recoveryLatencyHours,
    successfulRecoveryInterventions: interventions,
  }
}

function deriveCurrentState(profile: CognitiveProfile, recovery: RecoverySignature): DynamicIdentityState {
  if (profile.consistency < 0.4 && profile.avoidance > 0.65) return 'withdrawal-loop'
  if (profile.noveltySeeking > 0.72 && profile.consistency < 0.5) return 'fragmented-explorer'
  if (profile.challengeTolerance > 0.72 && profile.emotionalVariance > 0.62) return 'overextended-performer'
  if (recovery.failureResponse === 'reset' && profile.consistency > 0.55) return 'stabilizing-recovery'
  return 'exploratory-growth'
}

function deriveEvolutionEvents(
  previous: CognitiveProfileSnapshot | null,
  profile: CognitiveProfile,
  tensions: InternalTension[],
  recovery: RecoverySignature,
  latestImpact: MissionImpact | null,
): EvolutionEvent[] {
  const events = [...(previous?.evolutionEvents ?? [])]
  const prev = previous?.profile
  const pushEvent = (title: string, detail: string, impact: number) => {
    events.push({ title, detail, impact, createdAtUtc: new Date().toISOString() })
  }

  if (prev && profile.challengeTolerance - prev.challengeTolerance > 0.08) {
    pushEvent('Challenge tolerance breakthrough', 'You increased challenge tolerance within the latest adaptation window.', 0.78)
  }
  if (prev && profile.avoidance - prev.avoidance > 0.08) {
    pushEvent('Avoidance spike detected', 'Avoidance rose sharply; recovery pacing needs stronger guardrails.', 0.64)
  }
  if (tensions.length > 0 && tensions[0].divergenceScore > 0.35) {
    pushEvent('Identity-behavior contradiction surfaced', tensions[0].observedBehavior, 0.71)
  }
  if (recovery.recoveryLatencyHours < 18) {
    pushEvent('Fast recovery milestone', 'You recovered from failure faster than your baseline window.', 0.69)
  }
  if (latestImpact && latestImpact.recursiveReflectionDetected) {
    pushEvent('Recursive reflection event', 'You reflected on a previous reflection pattern, increasing metacognitive depth.', 0.73)
  }
  return events.slice(-30)
}

function deriveMetaAwareness(missionImpacts: MissionImpact[]): MetaAwareness {
  if (missionImpacts.length < 3) {
    return {
      selfEstimationBias: 0,
      confidence: 0.2,
      summary: 'Not enough mission prediction data yet.',
    }
  }
  const deltas = missionImpacts.map((impact) => (impact.actualCompleted ? 1 : 0) - impact.predictedCompletionProbability)
  const bias = avg(deltas)
  const label = bias > 0.12
    ? 'underestimates resilience under pressure'
    : bias < -0.12
      ? 'overestimates reliability in high-motivation states'
      : 'self-estimation is reasonably calibrated'

  return {
    selfEstimationBias: bias,
    confidence: clamp01(0.28 + missionImpacts.length / 20),
    summary: label,
  }
}

function deriveRecursiveReflection(missionImpacts: MissionImpact[]) {
  const recursiveHits = missionImpacts.filter((impact) => impact.recursiveReflectionDetected)
  const confidence = clamp01(0.18 + recursiveHits.length / Math.max(4, missionImpacts.length))
  return {
    detected: recursiveHits.length > 0,
    confidence,
    detail: recursiveHits.length > 0
      ? 'You are reflecting on prior reflection patterns, not just mission content.'
      : 'Recursive reflection has not appeared strongly yet.',
  }
}

function deriveAdaptationInsights(
  profile: CognitiveProfile,
  rhythms: BehavioralRhythm[],
  recovery: RecoverySignature,
  tensions: InternalTension[],
  contextualTraits: { challengeTolerance: ContextualTraitMap; reflectionDepth: ContextualTraitMap },
): AdaptationInsights {
  return {
    growthConditions: [
      profile.consistency > 0.58 ? 'short daily cadence with fixed mission window' : 'low-friction re-entry missions with strict time caps',
      contextualTraits.challengeTolerance.creative > contextualTraits.challengeTolerance.social
        ? 'creative-first challenge ramp before social exposure'
        : 'mixed-context challenge sequencing',
    ],
    fragmentationConditions: [
      profile.emotionalVariance > 0.65 ? 'high volatility + high-pressure challenge stacking' : 'unbounded novelty with no completion guardrail',
      tensions.length > 0 ? 'identity-behavior contradictions left unchallenged' : 'extended periods without anchors',
    ],
    survivingPatterns: [
      profile.selfAwareness > 0.56 ? 'anchor-based self-observation persists across resets' : 'task completion persists better than introspective depth',
      recovery.failureResponse === 'reset' ? 'structured recovery after failure' : `recovery defaults to ${recovery.failureResponse}`,
    ],
    adaptivePressure: rhythms
      .filter((rhythm) => !rhythm.resultingPattern.includes('no strong'))
      .map((rhythm) => `${rhythm.trigger} -> ${rhythm.resultingPattern}`),
    avoidancePressure: [
      profile.avoidance > 0.62 ? 'uncertainty-heavy prompts without scaffold' : 'late-session cognitive overload',
      tensions[0]?.observedBehavior ?? 'low explicit contradiction pressure detected',
    ],
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
    reflectionPrompt: profile.reflectionDepth > 0.7
      ? 'Extract one hidden assumption, invert it, then reframe your final claim.'
      : profile.avoidance > 0.65
        ? 'State one concrete claim and one concrete next action to prevent narrative drift.'
        : 'Write claim → evidence → counterpoint in three short blocks.',
    protocolBias: profile.consistency < 0.5 ? 'consistency-first protocol' : profile.challengeTolerance < 0.5 ? 'tolerance-building protocol' : 'depth-expansion protocol',
    dashboardEmphasis: profile.selfAwareness < 0.5 ? 'anchor quality and bias specificity' : profile.emotionalVariance > 0.65 ? 'recovery pacing and emotional regulation' : 'controlled escalation of challenge depth',
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
  missionImpacts: MissionImpact[]
  previousSnapshot?: CognitiveProfileSnapshot | null
}) {
  const previous = input.previousSnapshot ?? readStoredSnapshot()
  const recentEntries = input.entries.slice(0, 28)
  const recentHistory = input.history.slice(0, 40)
  const recentAnchors = input.anchors.slice(0, 30)
  const signals = input.behaviorSignals.slice(0, 80)
  const missionImpacts = input.missionImpacts.slice(0, 120)
  const signalStats = {
    avoidance: buildSignalStats(signals, 'avoidance'),
    consistency: buildSignalStats(signals, 'consistency'),
    reflectionDepth: buildSignalStats(signals, 'reflectionDepth'),
    challengeTolerance: buildSignalStats(signals, 'challengeTolerance'),
    emotionalVariance: buildSignalStats(signals, 'emotionalVariance'),
    noveltySeeking: buildSignalStats(signals, 'noveltySeeking'),
    selfAwareness: buildSignalStats(signals, 'selfAwareness'),
  }

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
  const missionCompletions = signals.filter((item) => item.source === 'mission' && item.signal.includes('completed')).length
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

  const avoidanceRaw = clamp01(
    0.3 * stress +
      0.2 * protocolGap +
      0.17 * (1 - completionRate) +
      0.13 * (missionRerolls / Math.max(1, missionCompletions + missionRerolls)) +
      0.1 * (1 - focus) +
      0.1 * signalStats.avoidance.weightedAvg,
  )
  const consistencyRaw = clamp01(
    0.34 * cadenceScore +
      0.24 * completionRate +
      0.14 * motivation +
      0.12 * clamp01(checkinsSaved / 8) +
      0.16 * signalStats.consistency.weightedAvg,
  )
  const reflectionDepthRaw = clamp01(0.52 * reflectionHistory + 0.2 * focus + 0.14 * anchorQuality + 0.14 * signalStats.reflectionDepth.weightedAvg)
  const challengeToleranceRaw = clamp01(
    0.32 * completionRate +
      0.2 * clamp01(highDifficultyCompletions / 8) +
      0.18 * (1 - missionRerolls / Math.max(1, missionCompletions + missionRerolls)) +
      0.14 * (1 - avoidanceRaw) +
      0.16 * signalStats.challengeTolerance.weightedAvg,
  )
  const noveltySeekingRaw = clamp01(0.31 * curiosity + 0.2 * creativity + 0.16 * categoryDiversity + 0.14 * (1 - repeatedBiasRatio) + 0.19 * signalStats.noveltySeeking.weightedAvg)
  const selfAwarenessRaw = clamp01(0.34 * anchorQuality + 0.2 * reflectionDepthRaw + 0.14 * (1 - repeatedBiasRatio) + 0.1 * clamp01(journalSignals / 8) + 0.22 * signalStats.selfAwareness.weightedAvg)
  const emotionalVarianceSignal = signalStats.emotionalVariance.weightedAvg
  const emotionalVarianceRaw = clamp01(0.72 * clamp01(stdDev(volatilitySource) / 3.1) + 0.28 * emotionalVarianceSignal)

  addEvidence(evidence, 'avoidance', `Completion rate ${(completionRate * 100).toFixed(0)}% and stress ${Math.round(stress * 100)}% shaped avoidance`, 0.74, 'mission')
  addEvidence(evidence, 'avoidance', `Reroll ratio ${missionRerolls}/${Math.max(1, missionCompletions + missionRerolls)}`, 0.58, 'mission')
  addEvidence(evidence, 'consistency', `Average check-in gap ${averageGapDays.toFixed(1)} days`, 0.71, 'checkin')
  addEvidence(evidence, 'consistency', `Protocol adherence gap ${(protocolGap * 100).toFixed(0)}%`, 0.53, 'mission')
  addEvidence(evidence, 'reflectionDepth', `Average reflection depth ${(reflectionHistory * 10).toFixed(1)}/10`, 0.78, 'mission')
  addEvidence(evidence, 'challengeTolerance', `${highDifficultyCompletions} high-depth completions in recent window`, 0.69, 'mission')
  addEvidence(evidence, 'emotionalVariance', `Mood/stress variance ${emotionalVarianceRaw.toFixed(2)}`, 0.67, 'checkin')
  addEvidence(evidence, 'noveltySeeking', `Category diversity ${uniqueCategories} + repeated bias ratio ${(repeatedBiasRatio * 100).toFixed(0)}%`, 0.65, 'mission')
  addEvidence(evidence, 'selfAwareness', `Anchor quality ${Math.round(anchorQuality * 100)}%${repeatedBiasText ? `; repeated bias "${repeatedBiasText}"` : ''}`, 0.72, 'journal')
  for (const trait of TRAITS) {
    for (const signal of signalStats[trait].topSignals) {
      addEvidence(
        evidence,
        trait,
        signal.signal,
        signal.weight,
        signal.source,
      )
    }
  }

  const confidence: CognitiveTraitConfidence = {
    avoidance: confidenceFromCounts(recentHistory.length + signalStats.avoidance.count),
    consistency: confidenceFromCounts(recentEntries.length + signalStats.consistency.count),
    reflectionDepth: confidenceFromCounts(recentHistory.length + recentAnchors.length + signalStats.reflectionDepth.count),
    challengeTolerance: confidenceFromCounts(recentHistory.length + missionCompletions + signalStats.challengeTolerance.count),
    emotionalVariance: confidenceFromCounts(recentEntries.length + signalStats.emotionalVariance.count),
    noveltySeeking: confidenceFromCounts(recentHistory.length + recentAnchors.length + signalStats.noveltySeeking.count),
    selfAwareness: confidenceFromCounts(recentAnchors.length + journalSignals + signalStats.selfAwareness.count),
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

  const contextualTraits = deriveContextualTraits(recentHistory, signals)
  const tensions = deriveTensions(profile, contextualTraits)
  const patterns = derivePatterns(profile, recentAnchors, recentHistory)
  const rhythms = deriveRhythms(recentEntries, recentHistory, profile)
  const recoverySignature = deriveRecoverySignature(recentHistory, recentEntries, profile)
  const currentState = deriveCurrentState(profile, recoverySignature)
  const latestImpact = missionImpacts[0] ?? null
  const evolutionEvents = deriveEvolutionEvents(previous ?? null, profile, tensions, recoverySignature, latestImpact)
  const metaAwareness = deriveMetaAwareness(missionImpacts)
  const recursiveReflection = deriveRecursiveReflection(missionImpacts)
  const adaptationInsights = deriveAdaptationInsights(profile, rhythms, recoverySignature, tensions, contextualTraits)
  const shadowPatterns = detectShadowPatterns(profile, patterns)
  return {
    computedAtUtc: new Date().toISOString(),
    profile,
    contextualTraits,
    confidence,
    evidence: TRAITS.reduce((acc, trait) => {
      acc[trait] = evidence[trait].slice(0, 6)
      return acc
    }, emptyEvidenceRecord()),
    history,
    patterns,
    shadowPatterns,
    tensions,
    rhythms,
    recoverySignature,
    currentState,
    evolutionEvents,
    missionImpacts,
    metaAwareness,
    recursiveReflection,
    adaptationInsights,
  } satisfies CognitiveProfileSnapshot
}

export function getStoredCognitiveProfile() {
  return readStoredSnapshot()
}

export function persistCognitiveProfile(snapshot: CognitiveProfileSnapshot) {
  storeSnapshot(snapshot)
}
