/**
 * 随机事件系统 — 修炼/历练/社交/世界中的随机趣味事件
 */
import type { ChoiceEffect } from './storyChapter'
export type RandomEventType = 'cultivation' | 'adventure' | 'social' | 'world' | 'sect'

export type RandomEventCondition =
  | { type: 'realm'; value: string }
  | { type: 'flag'; value: string; present?: boolean }
  | { type: 'favor' | 'hatred' | 'debt' | 'fear'; npcId: string; min?: number; max?: number }
  | { type: 'bond'; npcId: string; value: string }
  | { type: 'item'; value: string; min?: number }
  | { type: 'npc_unlocked'; npcId: string }
  | { type: 'story_memory'; eventId?: string; npcId?: string; tag?: string; min?: number; max?: number }

export interface RandomEventMemoryMutation {
  type: 'favor' | 'hatred' | 'debt' | 'fear' | 'flag' | 'unlock_npc' | 'journey_note'
  npcId?: string
  flag?: string
  amount?: number
  title?: string
  text?: string
  tags?: string[]
}

export interface RandomEvent {
  id: string; type: RandomEventType
  title: string; description: string
  prompt?: string
  storyTags?: string[]
  npcHint?: string
  trigger: {
    /** 基础概率 (0-1) */
    probability: number
    /** 前置条件 */
    conditions?: RandomEventCondition[]
    /** 冷却时间（tick数） */
    cooldownTicks: number
    /** 仅挂机时触发 */
    idleOnly?: boolean
    /** 全局最短间隔 */
    minimumIntervalTicks?: number
    /** 事件阶段门槛，按境界/层数折算 */
    stageMin?: number
    /** 事件阶段上限 */
    stageMax?: number
  }
  choices: {
    text: string
    effects: ChoiceEffect[]
    /** 后续链式事件ID */
    nextEventId?: string
    memory?: RandomEventMemoryMutation[]
  }[]
}
export interface RandomEventPool {
  cultivationEvents: RandomEvent[]
  adventureEvents: RandomEvent[]
  socialEvents: RandomEvent[]
  worldEvents: RandomEvent[]
  sectEvents: RandomEvent[]
}
/** 事件冷却状态 */
export interface EventCooldownState {
  eventId: string
  lastTriggerTick: number
}

export interface RandomEventMemoryEntry {
  eventId: string
  choiceIndex: number
  tick: number
  npcId?: string
  title: string
  summary: string
  tags: string[]
}

export interface RandomEventRuntimeState {
  cooldowns: EventCooldownState[]
  history: RandomEventMemoryEntry[]
  globalLastTriggerTick: number | null
  lastTriggerDayKey: string | null
  dailyTriggerCount: number
  storyTriggerCountByDay: Record<string, number>
}
