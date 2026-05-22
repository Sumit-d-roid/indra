export type Metric = {
  metricName: string
  value: number
  insight: string
}

export type CognitiveEntry = {
  id: string
  createdAtUtc: string
  sleepQuality: number
  focusLevel: number
  curiosityLevel: number
  energy: number
  mood: number
  mentalSharpness: number
  creativity: number
  stress: number
  motivation: number
  intellectualExcitement: number
  emotionalState: string
}

export type CognitiveEntryInput = Omit<CognitiveEntry, 'id' | 'createdAtUtc'>

export type Challenge = {
  id: string
  category: string
  title: string
  prompt: string
  difficulty: number
  noveltyIndex: number
}

export type ChallengeHistoryItem = {
  challengeId: string
  title: string
  category: string
  isCompleted: boolean
  reflectionDepth: number
  createdAtUtc: string
}

export type ChallengeArchetype = {
  category: string
  structureSignature: string
  pressureStyle: string
  baseDifficulty: number
  baseNovelty: number
}

export type CognitiveDiversityMetrics = {
  categoryEntropy: number
  categoryCoverage: number
  structuralVariation: number
  overSpecializationRisk: number
  flexibilityIndex: number
}

export type MutationDiagnostics = {
  repetitivePatterns: string[]
  comfortZones: string[]
  overSpecialized: boolean
  noveltyScore: number
  abstractionPressure: number
  diversityMetrics: CognitiveDiversityMetrics
  mutationDirective: string
}

export type GenerateChallengePayload = {
  focusArea?: string
  currentPattern?: string
  preferredDifficulty?: number
  noveltyTarget?: number
  mutationIntensity?: number
}

export type SubmitChallengeResponsePayload = {
  responseText: string
  reflectionDepth: number
  isCompleted: boolean
}

export type GeneratedChallenge = {
  challenge: Challenge
  generationRationale: string
  diagnostics: MutationDiagnostics
}

export type Notification = {
  title: string
  detail: string
}

export type CuriosityNode = {
  id: string
  topic: string
  cluster: string
  engagementWeight: number
  adjacentDomain: string
  driftSignal: string
}

export type CuriosityConnection = {
  id: string
  sourceNodeId: string
  targetNodeId: string
  weight: number
  relationshipType: string
}

export type DashboardData = {
  profile: {
    displayName: string
    cognitiveFocus: string
  }
  latestEntry: CognitiveEntry | null
  recentChallenges: Challenge[]
  notifications: Notification[]
  highlightMetrics: Metric[]
}

export type AnalyticsData = {
  metrics: Metric[]
  adaptationScores: Array<{
    createdAtUtc: string
    cognitiveResonance: number
    patternEntropy: number
    abstractionDepth: number
  }>
  trendSnapshots: Array<{
    createdAtUtc?: string
    title: string
    summary: string
    indicator: string
  }>
  challengeCategoryDistribution: Array<{
    category: string
    count: number
  }>
}

export type MemoryAnchor = {
  id: string
  createdAtUtc: string
  insight: string
  biasSpotted: string
  nextProbe: string
  missionObjective: string
  challengeTitle: string
}

export type ActiveProtocol = {
  id: string
  createdAtUtc: string
  title: string
  details: string
  targetSessions: number
  completedSessions: number
  lastCompletedAtUtc?: string
}

export type CognitiveProfile = {
  avoidance: number
  consistency: number
  reflectionDepth: number
  challengeTolerance: number
  emotionalVariance: number
  noveltySeeking: number
  selfAwareness: number
}

export type ContextualTraitMap = {
  creative: number
  social: number
  physical: number
  uncertainty: number
}

export type InternalTension = {
  declaredIdentity: string
  observedBehavior: string
  divergenceScore: number
  recurringContexts: string[]
}

export type BehavioralRhythm = {
  trigger: string
  resultingPattern: string
  confidence: number
}

export type RecoverySignature = {
  failureResponse: 'withdraw' | 'compensate' | 'spiral' | 'reset'
  recoveryLatencyHours: number
  successfulRecoveryInterventions: string[]
}

export type DynamicIdentityState =
  | 'exploratory-growth'
  | 'overextended-performer'
  | 'fragmented-explorer'
  | 'withdrawal-loop'
  | 'stabilizing-recovery'

export type EvolutionEvent = {
  title: string
  detail: string
  impact: number
  createdAtUtc: string
}

export type MissionImpact = {
  missionId: string
  createdAtUtc: string
  resistanceLevel: number
  emotionalEffect: number
  recoveryCost: number
  confidenceShift: number
  futureAvoidanceProbability: number
  predictedCompletionProbability: number
  actualCompleted: boolean
  recursiveReflectionDetected: boolean
  summary: string
}

export type MetaAwareness = {
  selfEstimationBias: number
  confidence: number
  summary: string
}

export type AdaptationInsights = {
  growthConditions: string[]
  fragmentationConditions: string[]
  survivingPatterns: string[]
  adaptivePressure: string[]
  avoidancePressure: string[]
}

export type EvolutionArc = {
  name: string
  dominantPatterns: string[]
  activeSince: string
  confidence: number
}

export type NarrativeTurningPoint = {
  title: string
  detail: string
  timestamp: string
  weight: number
}

export type LongitudinalNarrative = {
  generatedAtUtc: string
  recurringThemes: string[]
  currentArc: EvolutionArc
  previousArc?: EvolutionArc
  emergingArc?: EvolutionArc
  turningPoints: NarrativeTurningPoint[]
  compressedNarrative: string
  recursiveNarrativeAwareness: string
  existentialAnswers: {
    changedFromPastSelf: string
    whatChangedYou: string
    whatKeepsRepeating: string
    emergingSelf: string
    fragmentationConditions: string
    coherenceConditions: string
  }
}

export type CognitivePatterns = {
  curiosityStyle: string
  avoidanceStyle: string
  energyRhythm: string
  emotionalTriggers: string
  challengeTolerance: string
  recoveryLatency: string
  obsessionCycles: string
  noveltyDecay: string
  reflectionPattern: string
  selfDeceptionPattern: string
  reflectionPrompt: string
  protocolBias: string
  dashboardEmphasis: string
}

export type TraitName = keyof CognitiveProfile

export type TraitEvidence = {
  trait: TraitName
  signal: string
  weight: number
  timestamp: string
  source: 'mission' | 'checkin' | 'journal'
  context?: keyof ContextualTraitMap
  psychologicalWeight?: number
}

export type CognitiveTraitConfidence = Record<TraitName, number>

export type CognitiveProfileSnapshot = {
  computedAtUtc: string
  profile: CognitiveProfile
  contextualTraits: {
    challengeTolerance: ContextualTraitMap
    reflectionDepth: ContextualTraitMap
  }
  confidence: CognitiveTraitConfidence
  evidence: Record<TraitName, TraitEvidence[]>
  history: Array<{
    timestamp: string
    profile: CognitiveProfile
  }>
  patterns: CognitivePatterns
  shadowPatterns: Array<{
    title: string
    severity: 'low' | 'medium' | 'high'
    detail: string
  }>
  tensions: InternalTension[]
  rhythms: BehavioralRhythm[]
  recoverySignature: RecoverySignature
  currentState: DynamicIdentityState
  evolutionEvents: EvolutionEvent[]
  missionImpacts: MissionImpact[]
  metaAwareness: MetaAwareness
  recursiveReflection: {
    detected: boolean
    confidence: number
    detail: string
  }
  adaptationInsights: AdaptationInsights
}
