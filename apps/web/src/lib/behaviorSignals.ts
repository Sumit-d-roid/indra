import type { TraitEvidence } from '../types'

const STORAGE_KEY = 'indra.behaviorSignals.v1'

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
    return parsed.filter((item): item is TraitEvidence => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.trait === 'string' &&
        typeof item.signal === 'string' &&
        typeof item.weight === 'number' &&
        typeof item.timestamp === 'string' &&
        (item.source === 'mission' || item.source === 'checkin' || item.source === 'journal') &&
        (typeof item.context === 'undefined' || item.context === 'creative' || item.context === 'social' || item.context === 'physical' || item.context === 'uncertainty') &&
        (typeof item.psychologicalWeight === 'undefined' || typeof item.psychologicalWeight === 'number')
      )
    })
  } catch {
    return []
  }
}

function writeRaw(events: TraitEvidence[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export function listBehaviorSignals() {
  return readRaw().sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function recordBehaviorSignal(signal: Omit<TraitEvidence, 'timestamp'>) {
  const next: TraitEvidence = {
    ...signal,
    timestamp: new Date().toISOString(),
  }
  const all = [next, ...listBehaviorSignals()].slice(0, 400)
  writeRaw(all)
  return next
}
