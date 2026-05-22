import {
  analyticsData,
  challengePool,
  cognitiveEntryTemplate,
  curiosityConnections,
  curiosityNodes,
  dashboardData,
  futureModules,
} from '../data/mockIndra'
import type {
  Challenge,
  ChallengeArchetype,
  ChallengeHistoryItem,
  GenerateChallengePayload,
  GeneratedChallenge,
  MutationDiagnostics,
  SubmitChallengeResponsePayload,
} from '../types'

const simulatedLatency = async () => new Promise((resolve) => window.setTimeout(resolve, 320))
const apiBaseUrl = (import.meta.env.VITE_INDRA_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5265'

const fallbackDiagnostics: MutationDiagnostics = {
  repetitivePatterns: ['systems framing'],
  comfortZones: ['Interdisciplinary Synthesis'],
  overSpecialized: false,
  noveltyScore: 0.78,
  abstractionPressure: 0.64,
  diversityMetrics: {
    categoryEntropy: 0.66,
    categoryCoverage: 0.41,
    structuralVariation: 0.58,
    overSpecializationRisk: 0.36,
    flexibilityIndex: 0.69,
  },
  mutationDirective: 'increase abstraction gradually while preserving strategic coherence',
}

const fallbackArchetypes: ChallengeArchetype[] = [
  { category: 'Systems Thinking', structureSignature: 'feedback-architecture', pressureStyle: 'multi-order effects', baseDifficulty: 4, baseNovelty: 0.72 },
  { category: 'Philosophy', structureSignature: 'axiom-collapse', pressureStyle: 'ontological instability', baseDifficulty: 5, baseNovelty: 0.78 },
  { category: 'Abstract Reasoning', structureSignature: 'symbolic-transposition', pressureStyle: 'compression under ambiguity', baseDifficulty: 5, baseNovelty: 0.79 },
  { category: 'Perspective Inversion', structureSignature: 'agent-role-reversal', pressureStyle: 'identity destabilization', baseDifficulty: 4, baseNovelty: 0.74 },
  { category: 'Strategic Thinking', structureSignature: 'adversarial-futures', pressureStyle: 'long-horizon competition', baseDifficulty: 5, baseNovelty: 0.76 },
  { category: 'Paradoxes', structureSignature: 'self-reference-trap', pressureStyle: 'coherence under contradiction', baseDifficulty: 6, baseNovelty: 0.82 },
  { category: 'Interdisciplinary Synthesis', structureSignature: 'domain-collision', pressureStyle: 'conceptual transfer', baseDifficulty: 5, baseNovelty: 0.81 },
  { category: 'Simulated Civilizations', structureSignature: 'civilization-parameter-mutation', pressureStyle: 'macro-systems adaptation', baseDifficulty: 6, baseNovelty: 0.83 },
  { category: 'Impossible Scenarios', structureSignature: 'constraint-impossibility', pressureStyle: 'logic against impossible priors', baseDifficulty: 7, baseNovelty: 0.88 },
  { category: 'Conceptual Compression', structureSignature: 'theory-packing', pressureStyle: 'high-density abstraction', baseDifficulty: 6, baseNovelty: 0.84 },
  { category: 'Creativity Stress Tests', structureSignature: 'novelty-overload', pressureStyle: 'ideation under pressure', baseDifficulty: 5, baseNovelty: 0.8 },
]

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`INDRA API request failed with ${response.status}`)
  }

  return (await response.json()) as T
}

function fallbackHistory(): ChallengeHistoryItem[] {
  return challengePool.map((challenge, index) => ({
    challengeId: challenge.id,
    title: challenge.title,
    category: challenge.category,
    isCompleted: index % 2 === 0,
    reflectionDepth: 5 + (index % 5),
    createdAtUtc: new Date(Date.now() - index * 86_400_000).toISOString(),
  }))
}

export const indraApi = {
  async getDashboardSummary() {
    await simulatedLatency()
    return dashboardData
  },
  async getChallenges() {
    try {
      return await requestJson<Challenge[]>('/api/challenges')
    } catch {
      await simulatedLatency()
      return challengePool
    }
  },
  async getChallengeHistory() {
    try {
      return await requestJson<ChallengeHistoryItem[]>('/api/challenges/history')
    } catch {
      await simulatedLatency()
      return fallbackHistory()
    }
  },
  async getChallengeArchetypes() {
    try {
      return await requestJson<ChallengeArchetype[]>('/api/challenges/archetypes')
    } catch {
      await simulatedLatency()
      return fallbackArchetypes
    }
  },
  async getChallengeMutationAnalysis() {
    try {
      return await requestJson<MutationDiagnostics>('/api/challenges/analysis')
    } catch {
      await simulatedLatency()
      return fallbackDiagnostics
    }
  },
  async generateAdaptiveChallenge(payload: GenerateChallengePayload) {
    try {
      return await requestJson<GeneratedChallenge>('/api/challenges/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      await simulatedLatency()
      const challenge = challengePool[Math.floor(Math.random() * challengePool.length)]
      return {
        challenge: {
          ...challenge,
          id: `${challenge.id}-${Date.now()}`,
          title: `Mutation Cycle · ${challenge.title}`,
        },
        generationRationale: 'Fallback generation mode active while backend endpoint is unavailable.',
        diagnostics: fallbackDiagnostics,
      } satisfies GeneratedChallenge
    }
  },
  async submitChallengeResponse(challengeId: string, payload: SubmitChallengeResponsePayload) {
    try {
      return await requestJson<ChallengeHistoryItem>(`/api/challenges/${challengeId}/responses`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      await simulatedLatency()
      return {
        challengeId,
        title: 'Mutation response',
        category: 'Adaptive',
        isCompleted: payload.isCompleted,
        reflectionDepth: payload.reflectionDepth,
        createdAtUtc: new Date().toISOString(),
      } satisfies ChallengeHistoryItem
    }
  },
  async getCuriosityGraph() {
    await simulatedLatency()
    return { nodes: curiosityNodes, connections: curiosityConnections }
  },
  async getAnalytics() {
    await simulatedLatency()
    return analyticsData
  },
  async getCognitiveTemplate() {
    await simulatedLatency()
    return cognitiveEntryTemplate
  },
  async getFutureModule(key: 'shadow' | 'labyrinth') {
    await simulatedLatency()
    return futureModules[key]
  },
}
