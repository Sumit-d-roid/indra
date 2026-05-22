import type { MissionImpact } from '../types'

const STORAGE_KEY = 'indra.missionImpacts.v1'

function readRaw() {
  if (typeof window === 'undefined') {
    return []
  }

  const payload = window.localStorage.getItem(STORAGE_KEY)
  if (!payload) {
    return []
  }

  try {
    const parsed = JSON.parse(payload) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .filter((item): item is MissionImpact => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.missionId === 'string' &&
          typeof item.createdAtUtc === 'string' &&
          typeof item.resistanceLevel === 'number' &&
          typeof item.emotionalEffect === 'number' &&
          typeof item.recoveryCost === 'number' &&
          typeof item.confidenceShift === 'number' &&
          typeof item.futureAvoidanceProbability === 'number' &&
          typeof item.predictedCompletionProbability === 'number' &&
          typeof item.actualCompleted === 'boolean' &&
          typeof item.recursiveReflectionDetected === 'boolean' &&
          typeof item.summary === 'string'
        )
      })
      .sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))
  } catch {
    return []
  }
}

function writeRaw(values: MissionImpact[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
}

export function listMissionImpacts() {
  return readRaw()
}

export function recordMissionImpact(item: MissionImpact) {
  const next = [item, ...readRaw()].slice(0, 240)
  writeRaw(next)
  return item
}
