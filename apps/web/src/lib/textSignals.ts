const TOKEN_SPLIT = /[^a-zA-Z]+/

const DEPTH_WORDS = ['because', 'therefore', 'however', 'assumption', 'counter', 'evidence', 'model', 'system']
const AVOIDANCE_WORDS = ['maybe', 'later', 'eventually', 'should', 'not sure', 'skip', 'avoid', 'someday']
const NOVELTY_WORDS = ['new', 'experiment', 'unknown', 'unexpected', 'novel', 'explore', 'inversion']
const EMOTIONAL_WORDS = ['afraid', 'anxious', 'excited', 'frustrated', 'calm', 'overwhelmed', 'confident']
const SELF_AWARENESS_WORDS = ['i noticed', 'i realized', 'pattern', 'bias', 'trigger', 'assumption']

function countMatches(text: string, words: string[]) {
  const normalized = text.toLowerCase()
  return words.reduce((sum, word) => sum + (normalized.includes(word) ? 1 : 0), 0)
}

function density(text: string) {
  const tokens = text
    .toLowerCase()
    .split(TOKEN_SPLIT)
    .filter(Boolean)
  return tokens.length
}

function normalize(value: number, max: number) {
  if (max <= 0) {
    return 0
  }
  return Math.max(0, Math.min(1, value / max))
}

export function interpretReflectionText(text: string) {
  const tokenCount = density(text)
  const depthHits = countMatches(text, DEPTH_WORDS)
  const avoidanceHits = countMatches(text, AVOIDANCE_WORDS)
  const noveltyHits = countMatches(text, NOVELTY_WORDS)
  const emotionalHits = countMatches(text, EMOTIONAL_WORDS)
  const awarenessHits = countMatches(text, SELF_AWARENESS_WORDS)

  return {
    depthScore: normalize(depthHits + tokenCount / 55, 8),
    avoidanceScore: normalize(avoidanceHits, 4),
    noveltyScore: normalize(noveltyHits, 4),
    emotionalCharge: normalize(emotionalHits, 4),
    selfAwarenessScore: normalize(awarenessHits + tokenCount / 90, 6),
    tokenCount,
  }
}

export function interpretEmotionText(text: string) {
  const normalized = text.toLowerCase()
  const negative = ['anxious', 'drained', 'stuck', 'overwhelmed', 'tense', 'frustrated']
  const positive = ['calm', 'energized', 'focused', 'clear', 'excited', 'stable']
  const volatility = ['swing', 'spike', 'crash', 'chaotic', 'volatile']

  const negativeHits = countMatches(normalized, negative)
  const positiveHits = countMatches(normalized, positive)
  const volatilityHits = countMatches(normalized, volatility)

  return {
    valence: normalize(positiveHits, 3) - normalize(negativeHits, 3),
    volatility: normalize(volatilityHits + negativeHits * 0.35, 4),
  }
}
