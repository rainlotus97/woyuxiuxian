import type { BattleReplayEvent } from '@/game/battle/battleReplay'

const STORAGE_KEY = 'woyu-xiuxian-story-battle-replay-archive'
const MAX_ARCHIVE_ITEMS = 6

export interface StoryBattleReplaySummary {
  id: string
  sessionId: string | null
  storyBattleId: string
  targetId: string
  result: 'victory' | 'defeat' | 'fled'
  resultLabel: string
  title: string
  subtitle: string
  eventCount: number
  majorEventCount: number
  turns: number
  highlights: string[]
  createdAt: number
}

export interface StoryBattleReplayRecord extends StoryBattleReplaySummary {
  events: BattleReplayEvent[]
}

interface CreateStoryBattleReplayRecordInput {
  sessionId?: string | null
  storyBattleId?: string | null
  targetId: string
  result: 'victory' | 'defeat' | 'fled'
  events: BattleReplayEvent[]
  title?: string | null
  subtitle?: string | null
  now?: number
}

let memoryArchive: StoryBattleReplayRecord[] = []

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function cloneRecord(record: StoryBattleReplayRecord): StoryBattleReplayRecord {
  return {
    ...record,
    highlights: [...record.highlights],
    events: record.events.map(event => ({
      ...event,
      actor: event.actor ? { ...event.actor } : undefined,
      targets: event.targets?.map(target => ({ ...target })),
      payload: event.payload ? { ...event.payload } : undefined
    }))
  }
}

function resultLabel(result: StoryBattleReplaySummary['result']) {
  if (result === 'victory') return '胜利'
  if (result === 'defeat') return '败北'
  return '脱离'
}

function readArchive(): StoryBattleReplayRecord[] {
  if (memoryArchive.length > 0) return memoryArchive.map(cloneRecord)
  if (!canUseStorage()) return []

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as StoryBattleReplayRecord[]
    memoryArchive = Array.isArray(parsed) ? parsed : []
    return memoryArchive.map(cloneRecord)
  } catch (error) {
    console.error('[storyBattleReplayArchive] Failed to parse archive:', error)
    localStorage.removeItem(STORAGE_KEY)
    memoryArchive = []
    return []
  }
}

function writeArchive(records: StoryBattleReplayRecord[]) {
  memoryArchive = records.slice(0, MAX_ARCHIVE_ITEMS).map(cloneRecord)
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryArchive))
}

export function createStoryBattleReplayRecord(input: CreateStoryBattleReplayRecordInput): StoryBattleReplayRecord {
  const events = input.events.map(event => ({ ...event }))
  const majorEvents = events.filter(event => event.severity === 'major')
  const highlights = majorEvents
    .filter(event => event.type !== 'battle_start')
    .slice(-4)
    .map(event => event.text)

  const turns = events.reduce((max, event) => Math.max(max, event.turn), 0)
  const storyBattleId = input.storyBattleId || input.targetId
  const createdAt = input.now ?? Date.now()

  return {
    id: `story-battle-replay-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId: input.sessionId ?? null,
    storyBattleId,
    targetId: input.targetId,
    result: input.result,
    resultLabel: resultLabel(input.result),
    title: input.title || `剧情战：${storyBattleId}`,
    subtitle: input.subtitle || `${resultLabel(input.result)} · ${turns || 1} 手 · ${events.length} 条战况`,
    eventCount: events.length,
    majorEventCount: majorEvents.length,
    turns,
    highlights,
    createdAt,
    events
  }
}

export function saveStoryBattleReplayRecord(record: StoryBattleReplayRecord) {
  const archive = readArchive()
  const nextArchive = [
    cloneRecord(record),
    ...archive.filter(item => item.id !== record.id && (!record.sessionId || item.sessionId !== record.sessionId))
  ]
  writeArchive(nextArchive)
}

export function getStoryBattleReplayArchive(): StoryBattleReplayRecord[] {
  return readArchive()
}

export function getStoryBattleReplaySummaries(): StoryBattleReplaySummary[] {
  return readArchive().map(({ events: _events, ...summary }) => summary)
}

export function clearStoryBattleReplayArchive() {
  memoryArchive = []
  if (canUseStorage()) {
    localStorage.removeItem(STORAGE_KEY)
  }
}
