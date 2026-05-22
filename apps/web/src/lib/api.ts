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
const COGNITIVE_ENTRIES_STORAGE_KEY = 'indra.cognitiveEntries.v1'

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

function pickFallbackChallenge(preferredDifficulty?: number) {
  if (typeof preferredDifficulty !== 'number') {
    return challengePool[0]
  }
  return [...challengePool].sort(
    (a, b) => Math.abs(a.difficulty - preferredDifficulty) - Math.abs(b.difficulty - preferredDifficulty),
  )[0]
}

function readStoredCognitiveEntries() {
  if (typeof window === 'undefined') {
    return []
  }
  const payload = window.localStorage.getItem(COGNITIVE_ENTRIES_STORAGE_KEY)
  if (!payload) {
    return []
  }

  try {
    const parsed = JSON.parse(payload) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .filter((item): item is CognitiveEntry => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.createdAtUtc === 'string' &&
          typeof item.sleepQuality === 'number' &&
          typeof item.focusLevel === 'number' &&
          typeof item.curiosityLevel === 'number' &&
          typeof item.energy === 'number' &&
          typeof item.mood === 'number' &&
          typeof item.mentalSharpness === 'number' &&
          typeof item.creativity === 'number' &&
          typeof item.stress === 'number' &&
          typeof item.motivation === 'number' &&
          typeof item.intellectualExcitement === 'number' &&
          typeof item.emotionalState === 'string'
        )
      })
      .sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))
  } catch {
    return []
  }
}

function writeStoredCognitiveEntries(entries: CognitiveEntry[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(COGNITIVE_ENTRIES_STORAGE_KEY, JSON.stringify(entries))
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
    return withFallback(
      async () =>
        request<{ challenge: Challenge; generationRationale: string }>('/challenges/generate', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      async () => {
        await simulatedLatency()
        const challenge = pickFallbackChallenge(payload.preferredDifficulty)
        return {
          challenge,
          generationRationale: 'Fallback challenge used while live generator is unavailable.',
        }
      },
    )
  },
  async submitChallengeResponse(challengeId: string, payload: SubmitChallengeRequest) {
    return withFallback(
      async () =>
        request<ChallengeHistoryItem>(`/challenges/${challengeId}/responses`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      async () => {
        await simulatedLatency()
        const sourceChallenge = challengePool.find((item) => item.id === challengeId) ?? challengePool[0]
        return {
          challengeId,
          title: sourceChallenge?.title ?? 'Adaptive challenge',
          category: sourceChallenge?.category ?? 'Adaptive',
          isCompleted: payload.isCompleted,
          reflectionDepth: payload.reflectionDepth,
          createdAtUtc: new Date().toISOString(),
        }
      },
    )
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
        return readStoredCognitiveEntries()
      },
    )
  },
  async createCognitiveEntry(payload: CognitiveEntryInput) {
    return withFallback(
      async () =>
        request<CognitiveEntry>('/cognitive-entries', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      async () => {
        await simulatedLatency()
        const created: CognitiveEntry = {
          id: crypto.randomUUID(),
          createdAtUtc: new Date().toISOString(),
          ...payload,
        }
        const existing = readStoredCognitiveEntries()
        writeStoredCognitiveEntries([created, ...existing].slice(0, 300))
        return created
      },
    )
  },
  async getCognitiveTemplate() {
    await simulatedLatency()
    return cognitiveEntryTemplate
  },
}
