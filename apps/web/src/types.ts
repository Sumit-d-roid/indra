export type Metric = {
  metricName: string
  value: number
  insight: string
}

export type Challenge = {
  id: string
  category: string
  title: string
  prompt: string
  difficulty: number
  noveltyIndex: number
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
  latestEntry: {
    emotionalState: string
    curiosityLevel: number
    focusLevel: number
    creativity: number
    intellectualExcitement: number
  }
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
    title: string
    summary: string
    indicator: string
  }>
  challengeCategoryDistribution: Array<{
    category: string
    count: number
  }>
}

export type FutureModule = {
  title: string
  status: string
  purpose: string
  signals: string[]
}
