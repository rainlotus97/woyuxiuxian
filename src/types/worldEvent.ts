import type { AreaRiskLevel } from '@/map/runtime/mapRuntimeTypes'
import type { IdleMode, WorldLogSeverity, WorldWeather } from './world'

export type WorldEffectType =
  | 'outcome'
  | 'cultivation'
  | 'gold'
  | 'stamina'
  | 'item'
  | 'skill'
  | 'relationship'
  | 'npc'
  | 'area'
  | 'sect'
  | 'weather'
  | 'flag'

export interface WorldEffect {
  type: WorldEffectType
  targetId?: string
  value?: number | string
  label?: string
  reason?: string
  metadata?: Record<string, string | number | boolean | null>
}

export type WorldEffectSource =
  | 'weather'
  | 'idle'
  | 'travel'
  | 'battle'
  | 'random_event'
  | 'story_choice'
  | 'companion'
  | 'sect'
  | 'map'
  | 'npc'
  | 'manual'

export interface WorldEffectTransaction {
  id: string
  tick: number
  timeLabel: string
  source: WorldEffectSource
  sourceId: string
  title: string
  summary: string
  actorIds: string[]
  locationId?: string
  effects: WorldEffect[]
  tags: string[]
}

export interface WorldJournalEntry {
  id: string
  tick: number
  actorIds: string[]
  locationId?: string
  type: 'travel' | 'weather' | 'encounter' | 'battle' | 'sect' | 'story' | 'unlock' | 'cultivation'
  severity: WorldLogSeverity
  title: string
  summary: string
  effects: WorldEffect[]
  tags: string[]
}

export type WorldUnlockSourceKind = 'realm' | 'conquest' | 'event' | 'adjacent' | 'story' | 'sect'

export interface WorldUnlockSource {
  kind: WorldUnlockSourceKind
  id: string
  label: string
  reason: string
}

export interface WorldUnlock {
  id: string
  kind: 'area' | 'sect' | 'npc' | 'companion' | 'skill' | 'recipe' | 'item' | 'boss'
  targetId: string
  title: string
  reason: string
  source: WorldUnlockSource
  sourceEventId: string
  route?: string
}

export interface WorldNotification {
  id: string
  kind: 'weather' | 'unlock' | 'encounter' | 'reward' | 'battle' | 'story'
  title: string
  message: string
  severity: WorldLogSeverity
  sourceEventId: string
  source?: WorldUnlockSource
  createdAtTick: number
  read: boolean
  route?: string
}

export interface TravelResult {
  destinationId: string
  destinationName: string
  status: 'arrived' | 'delayed' | 'blocked' | 'interrupted'
  weather: WorldWeather
  ticksSpent: number
  staminaSpent: number
  message: string
  effects: WorldEffect[]
  fromAreaId?: string
  routeRisk?: AreaRiskLevel
  weatherModifier?: {
    staminaDelta: number
    ticksDelta: number
    riskDelta: number
    label: string
  }
  interruption?: {
    id: string
    title: string
    text: string
    severity: WorldLogSeverity
    effects: WorldEffect[]
  }
}

export interface WorldTickResult {
  tickId: string
  tick: number
  mode: IdleMode
  weatherChange?: {
    previous: WorldWeather
    current: WorldWeather
    effects: WorldEffect[]
  }
  travel?: TravelResult
  effects: WorldEffect[]
  transactions: WorldEffectTransaction[]
  journals: WorldJournalEntry[]
  unlocks: WorldUnlock[]
  notifications: WorldNotification[]
}

export interface WorldEventCallbacks {
  onCommitted?: (result: WorldTickResult) => void
  onJournal?: (entry: WorldJournalEntry) => void
  onUnlock?: (unlock: WorldUnlock) => void
  onNotification?: (notification: WorldNotification) => void
  onEffectTransaction?: (transaction: WorldEffectTransaction) => void
}
