import {
  analyticsData,
  challengePool,
  cognitiveEntryTemplate,
  curiosityConnections,
  curiosityNodes,
  dashboardData,
} from '../data/mockIndra'
import type {
  AnalyticsData,
  Challenge,
  ChallengeHistoryItem,
  CognitiveEntry,
  CognitiveEntryInput,
  DashboardData,
} from '../types'

const simulatedLatency = async () => new Promise((resolve) => window.setTimeout(resolve, 320))
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const apiMode = (import.meta.env.VITE_API_MODE ?? 'live').toLowerCase()

type GenerateChallengeRequest = {
  focusArea?: string
  currentPattern?: string
  preferredDifficulty?: number
}

type SubmitChallengeRequest = {
  responseText: string
  reflectionDepth: number
  isCompleted: boolean
}

type CuriosityGraphResponse = {
  nodes: Array<{
    id: string
    topic: string
    cluster: string
    engagementWeight: number
    adjacentDomain: string
    driftSignal: string
  }>
  connections: Array<{
    id: string
    sourceNodeId: string
    targetNodeId: string
    weight: number
    relationshipType: string
  }>
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const payload = await response.json()
      detail = payload?.detail ?? payload?.title ?? detail
    } catch {
      // Keep default status text when response isn't JSON.
    }
    throw new Error(`${response.status}: ${detail}`)
  }

  return (await response.json()) as T
}

async function withFallback<T>(live: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (apiMode === 'mock') {
    return fallback()
  }

  try {
    return await live()
  } catch {
    return fallback()
  }
}

export const indraApi = {
  async getDashboardSummary() {
    return withFallback(
      async () => request<DashboardData>('/dashboard/summary'),
      async () => {
        await simulatedLatency()
        return dashboardData
      },
    )
  },
  async getChallenges() {
    return withFallback(
      async () => request<Challenge[]>('/challenges'),
      async () => {
        await simulatedLatency()
        return challengePool
      },
    )
  },
  async getChallengeHistory() {
    return withFallback(
      async () => request<ChallengeHistoryItem[]>('/challenges/history'),
      async () => {
        await simulatedLatency()
        return []
      },
    )
  },
  async generateChallenge(payload: GenerateChallengeRequest) {
    const data = await request<{ challenge: Challenge; generationRationale: string }>('/challenges/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return data
  },
  async submitChallengeResponse(challengeId: string, payload: SubmitChallengeRequest) {
    return request<ChallengeHistoryItem>(`/challenges/${challengeId}/responses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  async getCuriosityGraph() {
    return withFallback(
      async () => request<CuriosityGraphResponse>('/curiosity-graph'),
      async () => {
        await simulatedLatency()
        return { nodes: curiosityNodes, connections: curiosityConnections }
      },
    )
  },
  async getAnalytics() {
    return withFallback(
      async () => request<AnalyticsData>('/analytics/evolution'),
      async () => {
        await simulatedLatency()
        return analyticsData
      },
    )
  },
  async getCognitiveEntries() {
    return withFallback(
      async () => request<CognitiveEntry[]>('/cognitive-entries'),
      async () => {
        await simulatedLatency()
        return []
      },
    )
  },
  async createCognitiveEntry(payload: CognitiveEntryInput) {
    return request<CognitiveEntry>('/cognitive-entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  async getCognitiveTemplate() {
    await simulatedLatency()
    return cognitiveEntryTemplate
  },
}
