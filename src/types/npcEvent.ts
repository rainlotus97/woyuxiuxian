/**
 * NPC日常事件系统 — NPC主动发起互动（邀约/赠礼/求助/切磋等）
 */
import type { ChoiceEffect } from './storyChapter'
export type NpcEventType = 'invite' | 'visit' | 'gift' | 'conflict' | 'help' | 'challenge' | 'secret'
export interface NpcEvent {
  id: string; npcId: string; type: NpcEventType
  title: string; description: string
  trigger: {
    minFavor: number; requiredRealm?: string
    /** 冷却tick数 */
    cooldownTicks: number
    /** 触发概率 (0-1) 每次tick */
    probability: number
    /** 额外条件 */
    conditions?: { type: 'flag' | 'item' | 'sect'; value: string }[]
  }
  choices: {
    text: string; effects: ChoiceEffect[]
    /** 是否消耗体力 */
    staminaCost?: number
    /** 触发故事章节ID */
    triggerChapterId?: string
  }[]
}
/** NPC事件冷却状态 */
export interface NpcEventCooldown {
  npcId: string; eventId: string
  lastTriggerTick: number
}
