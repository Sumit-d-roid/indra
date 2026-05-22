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
}

export type CognitiveTraitConfidence = Record<TraitName, number>

export type CognitiveProfileSnapshot = {
  computedAtUtc: string
  profile: CognitiveProfile
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
}
