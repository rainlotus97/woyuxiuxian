import type { BattleReplayEvent, BattleReplayEventType } from '@/game/battle/battleReplay'
import type { StoryBattleReplayRecord } from './storyBattleReplayArchive'

export interface StoryBattleReplayEventView {
  id: string
  turn: number
  type: BattleReplayEventType
  typeLabel: string
  severity: BattleReplayEvent['severity']
  text: string
  actorName: string | null
  targetNames: string[]
  payloadText: string | null
  detailText: string | null
}

export interface StoryBattleReplayTurnView {
  turn: number
  title: string
  majorCount: number
  events: StoryBattleReplayEventView[]
}

export interface StoryBattleReplayViewerState {
  title: string
  resultLabel: string
  subtitle: string
  totalEvents: number
  totalTurns: number
  majorEventCount: number
  actorNames: string[]
  turns: StoryBattleReplayTurnView[]
}

const EVENT_TYPE_LABELS: Record<BattleReplayEventType, string> = {
  battle_start: '开战',
  turn_start: '行动',
  turn_status: '状态',
  command: '出手',
  effect: '结算',
  summon: '召唤',
  summon_exit: '退场',
  defeat: '击败',
  battle_end: '终局'
}

function formatPayload(event: BattleReplayEvent) {
  const payload = event.payload
  if (!payload) return null

  if (event.type === 'command') {
    const skillName = payload.skillName ? String(payload.skillName) : null
    const cost = typeof payload.spiritFireCost === 'number' ? payload.spiritFireCost : null
    if (skillName && cost !== null) return `${skillName} · 灵火 ${cost}`
    if (skillName) return skillName
  }

  if (event.type === 'effect') {
    const parts: string[] = []
    if (typeof payload.amount === 'number' && payload.amount > 0) parts.push(`${payload.amount}`)
    if (payload.absorbed) parts.push(`护盾吸收 ${payload.absorbed}`)
    if (payload.isCrit) parts.push('会心')
    if (payload.statusType) parts.push(String(payload.statusType))
    return parts.length ? parts.join(' · ') : null
  }

  if (event.type === 'summon') {
    return payload.summonName ? String(payload.summonName) : null
  }

  if (event.type === 'battle_end') {
    return payload.result ? String(payload.result) : null
  }

  return null
}

function toEventView(event: BattleReplayEvent): StoryBattleReplayEventView {
  const actorName = event.actor?.name ?? null
  const targetNames = event.targets?.map(target => target.name) ?? []
  const payloadText = formatPayload(event)
  const detailParts: string[] = []
  if (actorName) detailParts.push(`行动：${actorName}`)
  if (targetNames.length) detailParts.push(`目标：${targetNames.join('、')}`)
  if (payloadText) detailParts.push(payloadText)

  return {
    id: event.id,
    turn: event.turn,
    type: event.type,
    typeLabel: EVENT_TYPE_LABELS[event.type],
    severity: event.severity,
    text: event.text,
    actorName,
    targetNames,
    payloadText,
    detailText: detailParts.length ? detailParts.join(' · ') : null
  }
}

export function createStoryBattleReplayViewerState(record: StoryBattleReplayRecord): StoryBattleReplayViewerState {
  const turnMap = new Map<number, StoryBattleReplayEventView[]>()
  const actorNames = new Set<string>()

  for (const event of record.events) {
    const view = toEventView(event)
    const turn = Math.max(1, view.turn || 1)
    if (!turnMap.has(turn)) turnMap.set(turn, [])
    turnMap.get(turn)!.push(view)
    if (view.actorName) actorNames.add(view.actorName)
    for (const targetName of view.targetNames) actorNames.add(targetName)
  }

  const turns = [...turnMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([turn, events]) => ({
      turn,
      title: `第 ${turn} 手`,
      majorCount: events.filter(event => event.severity === 'major').length,
      events
    }))

  return {
    title: record.title,
    resultLabel: record.resultLabel,
    subtitle: record.subtitle,
    totalEvents: record.eventCount,
    totalTurns: record.turns || turns.length,
    majorEventCount: record.majorEventCount,
    actorNames: [...actorNames],
    turns
  }
}
