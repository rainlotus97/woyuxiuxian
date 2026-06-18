import type { InventoryItem } from '@/stores/playerStore'
import type { GameplayResult, GameplayTrigger, GameplayType } from '@/story/types'
import { resolveStoryCharacterTarget } from './storyCharacterRegistry'
import { getAreaById } from '@/types/map'
import type { WorldRuntimeLogEffect, WorldRuntimeRelationshipDelta } from '@/world/runtime/worldRuntimeTypes'

export interface StoryGameplayStoreContext {
  player: {
    cultivation: number
    stamina: number
    maxStamina: number
    gold: number
    consumeStamina(amount: number): boolean
  }
  world: {
    currentTimeLabel: string
    npcDefinitions: Array<{ id: string; name: string; homeMapId: string }>
    unlockedNpcDefinitions: Array<{ id: string; name: string; homeMapId: string }>
  }
  map: {
    getAreaState(areaId: string): { stability: number; pressure: number; contested: boolean } | null
  }
}

export interface StoryGameplayReward {
  cultivation: number
  gold: number
  stamina: number
  item?: InventoryItem
  skillExp?: {
    skillId: string
    amount: number
  }
}

export interface StoryGameplayAreaPatch {
  areaId: string
  stabilityDelta: number
  pressureDelta: number
  unlock?: boolean
}

export interface StoryGameplayResolution {
  result: GameplayResult
  reward: StoryGameplayReward
  log: WorldRuntimeLogEffect
  relationshipDeltas: WorldRuntimeRelationshipDelta[]
  areaPatch?: StoryGameplayAreaPatch
}

interface RuntimeProfile {
  title: string
  successText: string
  failureText: string
  tags: string[]
  baseCultivation: number
  baseGold: number
  baseStaminaCost: number
  baseDifficulty: number
  areaPressureDelta?: number
  areaStabilityDelta?: number
  favorDelta?: number
  itemIcon?: string
}

const TYPE_PROFILE: Record<GameplayType, RuntimeProfile> = {
  battle: {
    title: '剧情战',
    successText: '战斗胜负已由战斗页结算。',
    failureText: '战斗未能完成。',
    tags: ['story', 'gameplay', 'battle'],
    baseCultivation: 0,
    baseGold: 0,
    baseStaminaCost: 0,
    baseDifficulty: 1
  },
  collect: {
    title: '采集收束',
    successText: '你按卷宗线索完成采集，收获被写入行囊与世界记录。',
    failureText: '线索中断，采集未能完成。',
    tags: ['story', 'gameplay', 'collect'],
    baseCultivation: 6,
    baseGold: 4,
    baseStaminaCost: 4,
    baseDifficulty: 1,
    areaPressureDelta: -1,
    areaStabilityDelta: 1,
    itemIcon: '材'
  },
  upgrade: {
    title: '临阵参悟',
    successText: '你借剧情契机参悟功法，修为与功法熟练均有所增长。',
    failureText: '气机未稳，这次参悟没有成功。',
    tags: ['story', 'gameplay', 'upgrade'],
    baseCultivation: 28,
    baseGold: 0,
    baseStaminaCost: 6,
    baseDifficulty: 2,
    areaPressureDelta: 0,
    areaStabilityDelta: 0
  },
  explore: {
    title: '剧情探索',
    successText: '你完成探索，新的区域态势与见闻已经回流到世界。',
    failureText: '探索受阻，只留下零散线索。',
    tags: ['story', 'gameplay', 'explore'],
    baseCultivation: 12,
    baseGold: 8,
    baseStaminaCost: 5,
    baseDifficulty: 1,
    areaPressureDelta: -3,
    areaStabilityDelta: 2,
    itemIcon: '迹'
  },
  dialog: {
    title: '人物交锋',
    successText: '对话推进了人物关系，相关好感或恩怨已进入世界关系网。',
    failureText: '这次对话没有说服对方。',
    tags: ['story', 'gameplay', 'dialog', 'relationship'],
    baseCultivation: 4,
    baseGold: 0,
    baseStaminaCost: 2,
    baseDifficulty: 1,
    favorDelta: 5
  },
  puzzle: {
    title: '机关解谜',
    successText: '你破解机关，获得一段可继续使用的线索。',
    failureText: '机关仍未解开。',
    tags: ['story', 'gameplay', 'puzzle'],
    baseCultivation: 10,
    baseGold: 6,
    baseStaminaCost: 3,
    baseDifficulty: 2,
    areaPressureDelta: -1,
    areaStabilityDelta: 1,
    itemIcon: '符'
  },
  custom: {
    title: '特殊事件',
    successText: '特殊事件完成，结果已经写入世界。',
    failureText: '特殊事件未能完成。',
    tags: ['story', 'gameplay', 'custom'],
    baseCultivation: 8,
    baseGold: 4,
    baseStaminaCost: 3,
    baseDifficulty: 1,
    itemIcon: '奇'
  }
}

function toNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function toStringValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function toOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function resolveNpcId(context: StoryGameplayStoreContext, rawTargetId: string, explicitNpcId?: string) {
  if (explicitNpcId && context.world.npcDefinitions.some(item => item.id === explicitNpcId)) return explicitNpcId
  const resolvedStoryTarget = resolveStoryCharacterTarget(explicitNpcId || rawTargetId)
  if (resolvedStoryTarget.worldNpcId && context.world.npcDefinitions.some(item => item.id === resolvedStoryTarget.worldNpcId)) {
    return resolvedStoryTarget.worldNpcId
  }
  const target = rawTargetId.trim()
  const definition = context.world.npcDefinitions.find(item => item.id === target || item.name === target)
  return definition?.id
}

function resolveAreaId(trigger: GameplayTrigger, context: StoryGameplayStoreContext) {
  const explicit = toOptionalString(trigger.params?.areaId ?? trigger.params?.mapId)
  if (explicit && getAreaById(explicit)) return explicit

  const targetArea = getAreaById(trigger.targetId)
  if (targetArea) return targetArea.id

  const npcId = resolveNpcId(context, trigger.targetId, toOptionalString(trigger.params?.npcId))
  if (npcId) {
    return context.world.npcDefinitions.find(item => item.id === npcId)?.homeMapId
  }

  return undefined
}

function resolveSuccess(trigger: GameplayTrigger, context: StoryGameplayStoreContext, profile: RuntimeProfile, areaId?: string) {
  const difficulty = Math.max(1, toNumber(trigger.params?.difficulty, profile.baseDifficulty))
  const required = Math.max(1, toNumber(trigger.params?.required, 1))
  const staminaCost = Math.max(0, toNumber(trigger.params?.staminaCost, profile.baseStaminaCost + required - 1))
  const areaState = areaId ? context.map.getAreaState(areaId) : null
  const pressurePenalty = areaState ? Math.floor(areaState.pressure / 32) : 0
  const contestedPenalty = areaState?.contested ? 1 : 0
  const cultivationEdge = Math.floor(context.player.cultivation / 120)
  const staminaEdge = context.player.stamina >= staminaCost ? 1 : -3
  const score = cultivationEdge + staminaEdge + toNumber(trigger.params?.bonus, 0) - difficulty - pressurePenalty - contestedPenalty

  return {
    success: score >= -1,
    staminaCost,
    difficulty,
    required,
    score
  }
}

function createReward(trigger: GameplayTrigger, profile: RuntimeProfile, success: boolean, required: number): StoryGameplayReward {
  if (!success) {
    return { cultivation: 0, gold: 0, stamina: 0 }
  }

  const cultivation = Math.max(0, toNumber(trigger.params?.cultivation, profile.baseCultivation * required))
  const gold = Math.max(0, toNumber(trigger.params?.gold, profile.baseGold * required))
  const stamina = Math.max(0, toNumber(trigger.params?.stamina, 0))
  const skillId = toOptionalString(trigger.params?.skillId)
  const skillExpAmount = Math.max(0, toNumber(trigger.params?.skillExp, trigger.type === 'upgrade' ? 12 : 0))
  const itemName = toOptionalString(trigger.params?.itemName ?? trigger.params?.item)
  const itemQuantity = Math.max(1, toNumber(trigger.params?.quantity, required))

  const item = itemName
    ? {
        id: `story_${trigger.type}_${trigger.targetId}_${Date.now()}`,
        definitionId: toOptionalString(trigger.params?.itemId),
        name: itemName,
        icon: toStringValue(trigger.params?.itemIcon, profile.itemIcon ?? '物'),
        type: toStringValue(trigger.params?.itemType, 'material') as InventoryItem['type'],
        quality: toStringValue(trigger.params?.quality, 'common'),
        quantity: itemQuantity,
        description: toStringValue(trigger.params?.description, `剧情玩法「${trigger.targetId}」所得。`)
      } satisfies InventoryItem
    : undefined

  return {
    cultivation,
    gold,
    stamina,
    item,
    skillExp: skillId && skillExpAmount > 0
      ? { skillId, amount: skillExpAmount }
      : undefined
  }
}

function createData(input: {
  trigger: GameplayTrigger
  title: string
  text: string
  success: boolean
  staminaCost: number
  reward: StoryGameplayReward
  areaId?: string
  npcId?: string
  score: number
}) {
  const rewards = [
    input.reward.cultivation ? `修为 +${input.reward.cultivation}` : null,
    input.reward.gold ? `灵石 +${input.reward.gold}` : null,
    input.reward.stamina ? `体力 +${input.reward.stamina}` : null,
    input.reward.item ? `${input.reward.item.name} x${input.reward.item.quantity}` : null,
    input.reward.skillExp ? `功法熟练 +${input.reward.skillExp.amount}` : null
  ].filter((item): item is string => Boolean(item))

  return {
    title: input.title,
    text: input.text,
    resultLabel: input.success ? '完成' : '受阻',
    staminaCost: input.staminaCost,
    rewards,
    areaId: input.areaId,
    npcId: input.npcId,
    score: input.score
  }
}

export function resolveStoryGameplay(trigger: GameplayTrigger, context: StoryGameplayStoreContext): StoryGameplayResolution {
  const profile = TYPE_PROFILE[trigger.type] ?? TYPE_PROFILE.custom
  const areaId = resolveAreaId(trigger, context)
  const npcId = resolveNpcId(context, trigger.targetId, toOptionalString(trigger.params?.npcId))
  const successState = resolveSuccess(trigger, context, profile, areaId)
  const reward = createReward(trigger, profile, successState.success, successState.required)
  const targetLabel = toStringValue(trigger.params?.label, trigger.targetId)
  const title = toStringValue(trigger.params?.title, `${profile.title}：${targetLabel}`)
  const text = toStringValue(
    trigger.params?.text,
    successState.success ? profile.successText : profile.failureText
  )
  const severity = successState.success && (
    reward.cultivation >= 30
    || reward.gold >= 20
    || trigger.type === 'upgrade'
  ) ? 'major' : 'normal'

  const relationshipDeltas: WorldRuntimeRelationshipDelta[] = []
  const favorDelta = toNumber(trigger.params?.favorDelta, profile.favorDelta ?? 0)
  if (npcId && favorDelta !== 0) {
    relationshipDeltas.push({
      npcId,
      favorDelta: successState.success ? favorDelta : -Math.max(1, Math.floor(Math.abs(favorDelta) / 2))
    })
  }

  const areaPatch = areaId && successState.success && (
    profile.areaPressureDelta !== undefined
    || profile.areaStabilityDelta !== undefined
    || trigger.params?.unlockArea
  )
    ? {
        areaId,
        stabilityDelta: toNumber(trigger.params?.stabilityDelta, profile.areaStabilityDelta ?? 0),
        pressureDelta: toNumber(trigger.params?.pressureDelta, profile.areaPressureDelta ?? 0),
        unlock: trigger.params?.unlockArea === true || trigger.params?.unlockArea === 'true'
      }
    : undefined

  const data = createData({
    trigger,
    title,
    text,
    success: successState.success,
    staminaCost: successState.staminaCost,
    reward,
    areaId,
    npcId,
    score: successState.score
  })

  return {
    result: {
      success: successState.success,
      gameplayType: trigger.type,
      targetId: trigger.targetId,
      data,
      duration: Math.max(1, successState.difficulty + successState.required)
    },
    reward,
    areaPatch,
    relationshipDeltas,
    log: {
      scope: trigger.type === 'dialog' ? 'npc' : 'player',
      severity,
      title,
      text,
      actorIds: npcId ? ['player', npcId] : ['player'],
      mapId: areaId,
      tags: [...profile.tags, successState.success ? 'success' : 'failure']
    }
  }
}

export function applyStoryGameplayAreaPatch(
  patch: StoryGameplayAreaPatch,
  current: { stability: number; pressure: number; contested: boolean } | null
) {
  return {
    stability: clamp((current?.stability ?? 55) + patch.stabilityDelta, 10, 100),
    pressure: clamp((current?.pressure ?? 20) + patch.pressureDelta, 0, 100),
    contested: current?.contested ?? false
  }
}
