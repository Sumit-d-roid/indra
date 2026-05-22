import type {
  AnalyticsData,
  Challenge,
  CuriosityConnection,
  CuriosityNode,
  DashboardData,
  FutureModule,
} from '../types'

export const loadingMessages = [
  'Mapping cognitive topology...',
  'Analyzing conceptual drift...',
  'Synchronizing neural vectors...',
  'Monitoring abstraction density...',
  'Initializing adaptive challenge matrix...',
]

export const dashboardData: DashboardData = {
  profile: {
    displayName: 'Primary Observer',
    cognitiveFocus: 'Neuroplasticity / Systems Imagination',
  },
  latestEntry: {
    emotionalState: 'quietly electrified',
    curiosityLevel: 9,
    focusLevel: 8,
    creativity: 9,
    intellectualExcitement: 10,
  },
  recentChallenges: [
    {
      id: 'c1',
      category: 'Interdisciplinary Synthesis',
      title: 'Telepathic Civil Design',
      prompt:
        'Design a civilization optimized for telepathic communication, then identify the first hidden failure mode it would create.',
      difficulty: 4,
      noveltyIndex: 0.91,
    },
    {
      id: 'c2',
      category: 'Perspective Inversion',
      title: 'Forest Capitalism',
      prompt: 'Explain capitalism using forest ecology, then invert the analogy until it becomes a critique of scarcity itself.',
      difficulty: 3,
      noveltyIndex: 0.82,
    },
    {
      id: 'c3',
      category: 'Strategic Thinking',
      title: 'Immortal Politics',
      prompt: 'Design a political system for immortal humans and show how boredom becomes a constitutional threat.',
      difficulty: 5,
      noveltyIndex: 0.95,
    },
  ],
  notifications: [
    {
      title: 'Curiosity divergence detected.',
      detail: 'Philosophy prompts are now branching into infrastructure, ritual systems, and ecological governance.',
    },
    {
      title: 'Pattern rigidity increasing.',
      detail: 'Novelty tolerance dipped across the last two cycles. Adjacent biological metaphors recommended.',
    },
    {
      title: 'Creative volatility elevated.',
      detail: 'Recent responses show more conceptual leaps and denser metaphor layering.',
    },
  ],
  highlightMetrics: [
    {
      metricName: 'Pattern Entropy',
      value: 78.4,
      insight: 'Curiosity vectors remain diversified across adjacent domains.',
    },
    {
      metricName: 'Conceptual Density',
      value: 64.2,
      insight: 'High clustering around systems thinking and speculative design.',
    },
    {
      metricName: 'Novelty Exposure',
      value: 52.8,
      insight: 'Introduce unfamiliar political or biological metaphors.',
    },
  ],
}

export const challengePool: Challenge[] = [
  ...dashboardData.recentChallenges,
  {
    id: 'c4',
    category: 'Hypothetical Simulations',
    title: 'Tradeable Memory Market',
    prompt: 'What happens if memory becomes tradeable and forgetting becomes a premium service?',
    difficulty: 4,
    noveltyIndex: 0.88,
  },
  {
    id: 'c5',
    category: 'Creative Problem Solving',
    title: 'Mars Religion Architecture',
    prompt: 'Create a religion designed for Mars colonists and explain how low gravity alters ritual meaning.',
    difficulty: 3,
    noveltyIndex: 0.8,
  },
]

export const cognitiveEntryTemplate = {
  sleepQuality: 7,
  focusLevel: 8,
  curiosityLevel: 9,
  energy: 6,
  mood: 7,
  mentalSharpness: 8,
  creativity: 9,
  stress: 4,
  motivation: 8,
  intellectualExcitement: 10,
  emotionalState: 'quietly electrified',
}

export const curiosityNodes: CuriosityNode[] = [
  {
    id: 'n1',
    topic: 'Neuroscience',
    cluster: 'Biology',
    engagementWeight: 0.94,
    adjacentDomain: 'Architecture',
    driftSignal: 'Synaptic metaphor expansion',
  },
  {
    id: 'n2',
    topic: 'Philosophy',
    cluster: 'Metaphysics',
    engagementWeight: 0.87,
    adjacentDomain: 'Game Theory',
    driftSignal: 'Meaning recursion spike',
  },
  {
    id: 'n3',
    topic: 'Cybernetics',
    cluster: 'Systems',
    engagementWeight: 0.92,
    adjacentDomain: 'Mythology',
    driftSignal: 'Feedback ritual convergence',
  },
  {
    id: 'n4',
    topic: 'Simulation Theory',
    cluster: 'Speculation',
    engagementWeight: 0.74,
    adjacentDomain: 'Geopolitics',
    driftSignal: 'Scenario density rising',
  },
  {
    id: 'n5',
    topic: 'AI',
    cluster: 'Intelligence',
    engagementWeight: 0.98,
    adjacentDomain: 'Psychology',
    driftSignal: 'Adversarial reflection forming',
  },
]

export const curiosityConnections: CuriosityConnection[] = [
  { id: 'l1', sourceNodeId: 'n1', targetNodeId: 'n3', weight: 0.82, relationshipType: 'feedback-loop' },
  { id: 'l2', sourceNodeId: 'n2', targetNodeId: 'n4', weight: 0.68, relationshipType: 'speculative-framing' },
  { id: 'l3', sourceNodeId: 'n3', targetNodeId: 'n5', weight: 0.91, relationshipType: 'adaptive-intelligence' },
  { id: 'l4', sourceNodeId: 'n5', targetNodeId: 'n1', weight: 0.72, relationshipType: 'cognitive-modeling' },
]

export const analyticsData: AnalyticsData = {
  metrics: dashboardData.highlightMetrics,
  adaptationScores: [
    {
      createdAtUtc: '2026-05-18T08:00:00Z',
      cognitiveResonance: 81.4,
      patternEntropy: 76.3,
      abstractionDepth: 88.1,
    },
    {
      createdAtUtc: '2026-05-22T08:00:00Z',
      cognitiveResonance: 84.9,
      patternEntropy: 79.6,
      abstractionDepth: 89.5,
    },
  ],
  trendSnapshots: [
    {
      title: 'Curiosity divergence detected',
      summary: 'Recurring philosophy prompts now branch into infrastructure and ecology.',
      indicator: 'divergence',
    },
    {
      title: 'Pattern rigidity increasing',
      summary: 'Novel domain exposure recommended to reduce overfitting around systems language.',
      indicator: 'rigidity',
    },
    {
      title: 'Creative volatility elevated',
      summary: 'Metaphor density and conceptual leaps spiked during the latest response cycle.',
      indicator: 'volatility',
    },
  ],
  challengeCategoryDistribution: [
    { category: 'Interdisciplinary Synthesis', count: 6 },
    { category: 'Perspective Inversion', count: 4 },
    { category: 'Strategic Thinking', count: 5 },
    { category: 'Hypothetical Simulations', count: 3 },
  ],
}

export const futureModules: Record<'shadow' | 'labyrinth', FutureModule> = {
  shadow: {
    title: 'Shadow Module',
    status: 'Foundational stub',
    purpose:
      'Future adversarial intelligence layer for blind-spot analysis, assumption attacks, and alternative viewpoint simulation.',
    signals: ['assumption fracture detection', 'counter-narrative synthesis', 'reasoning pressure tests'],
  },
  labyrinth: {
    title: 'Reality Disruption System',
    status: 'Foundational stub',
    purpose:
      'Expandable architecture for paradox generators, impossible scenarios, worldview inversions, and surreal cognitive prompts.',
    signals: ['constraint mutations', 'world-model inversions', 'surreal prompt seeds'],
  },
}
