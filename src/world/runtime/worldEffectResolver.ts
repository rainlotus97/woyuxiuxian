import type { ChoiceEffect } from '@/types/storyChapter'
import type { WorldEffect } from '@/types/worldEvent'
import type { Effect } from '@/story/types'
import type { RandomEvent, RandomEventMemoryMutation } from '@/types/randomEvent'
import type { PlayerJourneyReward, WorldLogSeverity } from '@/types/world'

function createRelationshipEffect(
  targetId: string | undefined,
  value: number,
  label: string,
  relation: string,
  reason?: string
): WorldEffect {
  return {
    type: 'relationship',
    targetId,
    value,
    label,
    reason,
    metadata: { relation }
  }
}

export function resolveChoiceEffect(effect: ChoiceEffect): WorldEffect {
  switch (effect.type) {
    case 'realm_exp':
      return { type: 'cultivation', value: effect.value ?? 0, label: '修为' }
    case 'gold':
      return { type: 'gold', value: effect.value ?? 0, label: '灵石' }
    case 'flag_set':
      return {
        type: 'flag',
        targetId: effect.flag,
        value: effect.flagValue === false ? 0 : 1,
        label: effect.flagValue === false ? '旗标移除' : '旗标'
      }
    case 'npc_favor':
      return createRelationshipEffect(effect.npcId, effect.value ?? 0, '好感', 'favor')
    case 'npc_hatred':
      return createRelationshipEffect(effect.npcId, effect.value ?? 0, '仇恨', 'hatred')
    case 'npc_fear':
      return createRelationshipEffect(effect.npcId, effect.value ?? 0, '畏惧', 'fear')
    case 'npc_unlock':
      return { type: 'npc', targetId: effect.npcId, value: 1, label: '人物解锁' }
    case 'item_gain':
      return { type: 'item', targetId: effect.itemId, value: effect.quantity ?? 1, label: '获得物品' }
    case 'item_lose':
      return { type: 'item', targetId: effect.itemId, value: -(effect.quantity ?? 1), label: '失去物品' }
    case 'skill_unlock':
      return { type: 'skill', targetId: effect.skillId, value: 1, label: '技能解锁' }
    case 'map_unlock':
      return { type: 'area', targetId: effect.mapId, value: 1, label: '区域开放' }
    case 'ending_point':
      return {
        type: 'outcome',
        targetId: effect.endingKey,
        value: effect.endingValue ?? 0,
        label: '结局倾向'
      }
  }
}

export function resolveStoryEffect(effect: Effect): WorldEffect {
  switch (effect.type) {
    case 'realm_exp':
      return { type: 'cultivation', value: Number(effect.value ?? 0), label: '修为' }
    case 'gold':
      return { type: 'gold', value: Number(effect.value ?? 0), label: '灵石' }
    case 'flag_set':
      return { type: 'flag', targetId: effect.target, value: Number(effect.value ?? 1), label: '旗标' }
    case 'npc_favor':
      return createRelationshipEffect(effect.target, Number(effect.value ?? 0), '好感', 'favor')
    case 'npc_hatred':
      return createRelationshipEffect(effect.target, Number(effect.value ?? 0), '仇恨', 'hatred')
    case 'npc_fear':
      return createRelationshipEffect(effect.target, Number(effect.value ?? 0), '畏惧', 'fear')
    case 'npc_unlock':
      return { type: 'npc', targetId: effect.target, value: 1, label: '人物解锁' }
    case 'gain_item':
      return { type: 'item', targetId: effect.target, value: Number(effect.value ?? 1), label: '获得物品' }
    case 'lose_item':
      return { type: 'item', targetId: effect.target, value: -Number(effect.value ?? 1), label: '失去物品' }
    case 'unlock_feature':
      return { type: 'skill', targetId: effect.target, value: 1, label: '技能解锁' }
    case 'unlock_clue':
      return { type: 'area', targetId: effect.target, value: 1, label: '区域线索' }
    case 'route':
      return { type: 'area', targetId: effect.target, value: effect.target, label: '路线变化' }
    case 'ending':
      return { type: 'outcome', targetId: effect.target, value: Number(effect.value ?? 0), label: '结局倾向' }
    default:
      return {
        type: 'outcome',
        targetId: effect.target,
        value: effect.value ?? effect.type,
        label: '剧情结果'
      }
  }
}

export function resolveRandomMemoryEffect(memory: RandomEventMemoryMutation): WorldEffect {
  switch (memory.type) {
    case 'favor':
      return createRelationshipEffect(memory.npcId, memory.amount ?? 1, '好感', 'favor', memory.text)
    case 'hatred':
      return createRelationshipEffect(memory.npcId, memory.amount ?? 1, '仇恨', 'hatred', memory.text)
    case 'debt':
      return createRelationshipEffect(memory.npcId, memory.amount ?? 1, '人情', 'debt', memory.text)
    case 'fear':
      return createRelationshipEffect(memory.npcId, memory.amount ?? 1, '畏惧', 'fear', memory.text)
    case 'flag':
      return { type: 'flag', targetId: memory.flag, value: 1, label: '旗标', reason: memory.text }
    case 'unlock_npc':
      return { type: 'npc', targetId: memory.npcId, value: 1, label: '人物解锁', reason: memory.text }
    case 'journey_note':
      return {
        type: 'outcome',
        targetId: memory.npcId,
        value: memory.title ?? '经历留痕',
        label: '经历留痕',
        reason: memory.text
      }
  }
}

export interface RandomEventChoiceResolution {
  eventId: string
  choiceIndex: number
  title: string
  text: string
  severity: WorldLogSeverity
  rewards: PlayerJourneyReward[]
  effects: WorldEffect[]
  actorIds: string[]
  tags: string[]
}

function signedEffectValue(value: number) {
  return value > 0 ? `+${value}` : String(value)
}

function summarizeRandomEventEffect(effect: WorldEffect) {
  const target = effect.targetId ? `「${effect.targetId}」` : ''
  if (typeof effect.value === 'number') {
    if (effect.type === 'cultivation' || effect.type === 'gold' || effect.type === 'stamina' || effect.type === 'relationship') {
      return `${effect.label || '数值'}${signedEffectValue(effect.value)}`
    }
    if (effect.type === 'item') {
      return `${effect.value >= 0 ? '获得' : '失去'}${target} x${Math.abs(effect.value)}`
    }
    return `${effect.label || '结果'}${target}`
  }
  if (effect.value !== undefined) return `${effect.label || '结果'}${target}：${effect.value}`
  return `${effect.label || '结果'}${target}`
}

function resolveRandomEventRewards(effects: WorldEffect[]): PlayerJourneyReward[] {
  const rewards: PlayerJourneyReward[] = []
  for (const effect of effects) {
    if (effect.type === 'cultivation' || effect.type === 'gold') {
      rewards.push({ type: effect.type, label: effect.label || (effect.type === 'gold' ? '灵石' : '修为'), value: effect.value ?? 0 })
      continue
    }
    if (effect.type === 'item') {
      rewards.push({ type: 'item', label: effect.label || effect.targetId || '物品', value: effect.value ?? 0 })
      continue
    }
    if (effect.type === 'flag') {
      rewards.push({ type: 'flag', label: effect.label || '旗标', value: effect.targetId || effect.value || '已记录' })
    }
  }
  return rewards
}

/**
 * 将奇遇的选择效果和记忆突变统一成一份可提交的世界后果。
 * 具体状态仍由现有 choice action 应用，resolver 只负责稳定地产出记录所需的结构。
 */
export function resolveRandomEventChoice(
  event: RandomEvent,
  choiceIndex: number
): RandomEventChoiceResolution | null {
  const choice = event.choices[choiceIndex]
  if (!choice) return null

  const effects = [
    ...(choice.effects ?? []).map(resolveChoiceEffect),
    ...(choice.memory ?? []).map(resolveRandomMemoryEffect)
  ]
  const actorIds = collectWorldEffectActorIds(effects)
  const effectSummary = effects.map(summarizeRandomEventEffect).filter(Boolean).join('；')
  const text = effectSummary
    ? `${choice.text}。后果：${effectSummary}。`
    : `${choice.text}。这一步暂未换取资源，但已经留下了一条可回看的选择记录。`
  const isStoryEncounter = Boolean(
    event.npcHint
    || event.storyTags?.length
    || choice.memory?.length
  )
  const tags = [...new Set([
    'random-event',
    'choice',
    event.type,
    `choice-${choiceIndex}`,
    ...(event.storyTags ?? []),
    ...(isStoryEncounter ? ['story-encounter'] : [])
  ])]

  return {
    eventId: event.id,
    choiceIndex,
    title: event.title,
    text,
    severity: isStoryEncounter ? 'major' : 'normal',
    rewards: resolveRandomEventRewards(effects),
    effects,
    actorIds,
    tags
  }
}

export function collectWorldEffectActorIds(effects: WorldEffect[], actorIds: string[] = ['player']) {
  const ids = new Set(actorIds)
  for (const effect of effects) {
    if ((effect.type === 'npc' || effect.type === 'relationship') && effect.targetId) {
      ids.add(effect.targetId)
    }
  }
  return [...ids]
}
