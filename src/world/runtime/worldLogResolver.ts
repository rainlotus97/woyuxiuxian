import type {
  WorldLogEntry,
  WorldLogScope,
  WorldLogSeverity,
  WorldLogVisibility
} from '@/types/world'

export interface WorldLogDraft {
  id: string
  tick: number
  timeLabel: string
  scope: WorldLogScope
  severity: WorldLogSeverity
  title: string
  text: string
  actorIds: string[]
  tags: string[]
  mapId?: string
  revealed?: boolean
}

const DEFAULT_MAX_LOGS = 120
const DEDUPE_TICK_WINDOW = 12

const severityPriority: Record<WorldLogSeverity, number> = {
  minor: 1,
  normal: 2,
  major: 3,
  legendary: 4
}

const visibilityPriority: Record<WorldLogVisibility, number> = {
  hidden: 0,
  record: 1,
  briefing: 2
}

const backgroundDedupeTags = new Set([
  'breakthrough',
  'cultivation',
  'weather'
])

const briefingTags = new Set([
  'anomaly',
  'captivity',
  'captured',
  'escape',
  'relationship',
  'rescued',
  'scheme',
  'story',
  'summon',
  'unlock-npc',
  'war',
  'world-flag'
])

export function createWorldLogEntry(draft: WorldLogDraft): WorldLogEntry {
  const dedupeKey = createWorldLogDedupeKey(draft)
  const revealed = draft.revealed ?? true
  return {
    ...draft,
    actorIds: uniqueStrings(draft.actorIds),
    tags: uniqueStrings(draft.tags),
    lastTick: draft.tick,
    visibility: resolveWorldLogVisibility(draft),
    dedupeKey,
    repeatCount: 1,
    revealed
  }
}

export function normalizeWorldLogs(logs: WorldLogEntry[]): WorldLogEntry[] {
  return logs.map(log => {
    const normalized = createWorldLogEntry({
      id: log.id,
      tick: log.tick,
      timeLabel: log.timeLabel,
      scope: log.scope,
      severity: log.severity,
      title: log.title,
      text: stripLegacyRepeatSuffix(log.text),
      actorIds: log.actorIds ?? [],
      tags: log.tags ?? [],
      mapId: log.mapId,
      revealed: log.revealed
    })
    return {
      ...normalized,
      lastTick: log.lastTick ?? log.tick,
      visibility: log.visibility ?? normalized.visibility,
      dedupeKey: log.dedupeKey ?? normalized.dedupeKey,
      repeatCount: log.repeatCount ?? 1
    }
  })
}

export function insertWorldLog(
  currentLogs: WorldLogEntry[],
  entry: WorldLogEntry,
  maxLogs = DEFAULT_MAX_LOGS
): WorldLogEntry[] {
  const logs = normalizeWorldLogs(currentLogs)
  const duplicateIndex = logs.findIndex(log => canMergeWorldLog(log, entry))

  if (duplicateIndex >= 0) {
    const duplicate = logs[duplicateIndex]!
    const merged = mergeWorldLogEntry(duplicate, entry)
    const nextLogs = [merged, ...logs.slice(0, duplicateIndex), ...logs.slice(duplicateIndex + 1)]
    return nextLogs.slice(0, maxLogs)
  }

  return [entry, ...logs].slice(0, maxLogs)
}

export function getVisibleWorldLogs(logs: WorldLogEntry[], limit = 12): WorldLogEntry[] {
  return normalizeWorldLogs(logs)
    .filter(log => log.revealed && log.visibility !== 'hidden')
    .slice(0, 40)
    .sort((a, b) => {
      const repetitiveDelta = getRepetitivePenalty(a) - getRepetitivePenalty(b)
      if (repetitiveDelta !== 0) return repetitiveDelta
      const visibilityDelta = visibilityPriority[b.visibility] - visibilityPriority[a.visibility]
      if (visibilityDelta !== 0) return visibilityDelta
      const severityDelta = severityPriority[b.severity] - severityPriority[a.severity]
      if (severityDelta !== 0) return severityDelta
      return (b.lastTick ?? b.tick) - (a.lastTick ?? a.tick)
    })
    .slice(0, limit)
}

function resolveWorldLogVisibility(draft: WorldLogDraft): WorldLogVisibility {
  if (draft.revealed === false) return 'hidden'
  if (draft.severity === 'legendary' || draft.severity === 'major') return 'briefing'
  if (draft.tags.some(tag => briefingTags.has(tag))) return 'briefing'
  if ((draft.scope === 'player' || draft.scope === 'npc' || draft.scope === 'sect') && draft.severity === 'normal') {
    return 'briefing'
  }
  if (draft.severity === 'minor') return 'hidden'
  return 'record'
}

function createWorldLogDedupeKey(draft: Pick<WorldLogDraft, 'scope' | 'title' | 'actorIds' | 'tags' | 'mapId'>) {
  const actorPart = uniqueStrings(draft.actorIds).slice(0, 3).join(',')
  const tagPart = uniqueStrings(draft.tags).slice(0, 4).join(',')
  return [draft.scope, draft.mapId ?? 'world', draft.title, actorPart, tagPart].join('|')
}

function canMergeWorldLog(existing: WorldLogEntry, incoming: WorldLogEntry) {
  if (existing.dedupeKey !== incoming.dedupeKey) return false
  return Math.abs((incoming.lastTick ?? incoming.tick) - (existing.lastTick ?? existing.tick)) <= DEDUPE_TICK_WINDOW
}

function mergeWorldLogEntry(existing: WorldLogEntry, incoming: WorldLogEntry): WorldLogEntry {
  const severity = pickHigherSeverity(existing.severity, incoming.severity)
  const visibility = pickHigherVisibility(existing.visibility, incoming.visibility)
  const repeatCount = (existing.repeatCount || 1) + 1
  return {
    ...existing,
    tick: incoming.tick,
    lastTick: incoming.lastTick ?? incoming.tick,
    timeLabel: incoming.timeLabel,
    severity,
    visibility,
    text: incoming.text,
    actorIds: uniqueStrings([...existing.actorIds, ...incoming.actorIds]),
    tags: uniqueStrings([...existing.tags, ...incoming.tags]),
    mapId: incoming.mapId ?? existing.mapId,
    repeatCount,
    revealed: existing.revealed || incoming.revealed
  }
}

function pickHigherSeverity(a: WorldLogSeverity, b: WorldLogSeverity): WorldLogSeverity {
  return severityPriority[b] > severityPriority[a] ? b : a
}

function pickHigherVisibility(a: WorldLogVisibility, b: WorldLogVisibility): WorldLogVisibility {
  return visibilityPriority[b] > visibilityPriority[a] ? b : a
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function stripLegacyRepeatSuffix(text: string) {
  return text.replace(/（近来已反复出现\s*\d+\s*次）$/u, '').trim()
}

function getRepetitivePenalty(log: WorldLogEntry) {
  const repeatCount = log.repeatCount ?? 1
  if (repeatCount < 3) return 0
  const backgroundTagCount = log.tags.filter(tag => backgroundDedupeTags.has(tag)).length
  if (backgroundTagCount <= 0) return 0
  return Math.min(4, repeatCount - 2)
}
