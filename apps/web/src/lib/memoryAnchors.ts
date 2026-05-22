import type { MemoryAnchor } from '../types'

const STORAGE_KEY = 'indra.memoryAnchors.v1'

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
    return parsed.filter((item): item is MemoryAnchor => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.createdAtUtc === 'string' &&
        typeof item.insight === 'string' &&
        typeof item.biasSpotted === 'string' &&
        typeof item.nextProbe === 'string' &&
        typeof item.missionObjective === 'string' &&
        typeof item.challengeTitle === 'string'
      )
    })
  } catch {
    return []
  }
}

function writeRaw(anchors: MemoryAnchor[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(anchors))
}

export function listMemoryAnchors() {
  return readRaw().sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))
}

export function getLatestMemoryAnchor() {
  return listMemoryAnchors()[0] ?? null
}

export function saveMemoryAnchor(anchor: Omit<MemoryAnchor, 'id' | 'createdAtUtc'>) {
  const nextAnchor: MemoryAnchor = {
    ...anchor,
    id: crypto.randomUUID(),
    createdAtUtc: new Date().toISOString(),
  }

  const all = [nextAnchor, ...listMemoryAnchors()].slice(0, 40)
  writeRaw(all)
  return nextAnchor
}
