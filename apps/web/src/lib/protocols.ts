import type { ActiveProtocol } from '../types'

const STORAGE_KEY = 'indra.activeProtocol.v1'

function readRaw() {
  if (typeof window === 'undefined') {
    return null
  }

  const payload = window.localStorage.getItem(STORAGE_KEY)
  if (!payload) {
    return null
  }

  try {
    const parsed = JSON.parse(payload) as unknown
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }
    const item = parsed as Partial<ActiveProtocol>
    if (
      typeof item.id !== 'string' ||
      typeof item.createdAtUtc !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.details !== 'string' ||
      typeof item.targetSessions !== 'number' ||
      typeof item.completedSessions !== 'number'
    ) {
      return null
    }
    return item as ActiveProtocol
  } catch {
    return null
  }
}

function writeRaw(protocol: ActiveProtocol | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (protocol === null) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(protocol))
}

export function getActiveProtocol() {
  return readRaw()
}

export function activateProtocol(payload: Omit<ActiveProtocol, 'id' | 'createdAtUtc' | 'completedSessions'>) {
  const protocol: ActiveProtocol = {
    ...payload,
    id: crypto.randomUUID(),
    createdAtUtc: new Date().toISOString(),
    completedSessions: 0,
  }
  writeRaw(protocol)
  return protocol
}

export function clearActiveProtocol() {
  writeRaw(null)
}

export function recordProtocolSession() {
  const protocol = readRaw()
  if (!protocol) {
    return null
  }

  const updated: ActiveProtocol = {
    ...protocol,
    completedSessions: Math.min(protocol.targetSessions, protocol.completedSessions + 1),
    lastCompletedAtUtc: new Date().toISOString(),
  }
  writeRaw(updated)
  return updated
}
