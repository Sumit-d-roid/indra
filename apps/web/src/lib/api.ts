import {
  analyticsData,
  challengePool,
  cognitiveEntryTemplate,
  curiosityConnections,
  curiosityNodes,
  dashboardData,
  futureModules,
} from '../data/mockIndra'

const simulatedLatency = async () => new Promise((resolve) => window.setTimeout(resolve, 320))

export const indraApi = {
  async getDashboardSummary() {
    await simulatedLatency()
    return dashboardData
  },
  async getChallenges() {
    await simulatedLatency()
    return challengePool
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
