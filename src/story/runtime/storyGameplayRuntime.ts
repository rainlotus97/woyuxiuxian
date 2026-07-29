import type { Effect, GameplayTrigger } from '@/story/types'

interface StoryGameplayAreaState {
  stability: number
  pressure: number
  contested: boolean
}

interface StoryGameplayContext {
  player: {
    cultivation: number
    stamina: number
    maxStamina: number
    gold: number
    consumeStamina: (amount: number) => boolean
  }
  world: {
    currentTimeLabel: string
    npcDefinitions: Array<{ id: string; name: string; homeMapId?: string }>
    unlockedNpcDefinitions: Array<{ id: string; name: string; homeMapId?: string }>
  }
  map: {
    getAreaState: (areaId: string) => StoryGameplayAreaState | null
  }
}

export interface StoryGameplayAreaPatch {
  areaId: string
  unlock?: boolean
  stabilityDelta?: number
  pressureDelta?: number
}

function createLog(context: StoryGameplayContext, scope: 'player' | 'npc', title: string, text: string, tags: string[], effects: Effect[] = []) {
  return {
    id: `story-gameplay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tick: 0,
    lastTick: 0,
    timeLabel: context.world.currentTimeLabel,
    scope,
    severity: 'normal' as const,
    visibility: 'briefing' as const,
    title,
    text,
    actorIds: [],
    tags: ['story', ...tags],
    dedupeKey: `story|${scope}|${title}`,
    repeatCount: 1,
    revealed: true,
    effects
  }
}

function rewardItem(trigger: GameplayTrigger) {
  const params = trigger.params ?? {}
  return {
    id: String(params.itemId ?? `story_item_${trigger.targetId}`),
    name: String(params.itemName ?? trigger.targetId),
    icon: String(params.itemIcon ?? 'herb'),
    type: 'material' as const,
    quality: String(params.quality ?? 'common'),
    quantity: Math.max(1, Number(params.required ?? params.quantity ?? 1))
  }
}

export function applyStoryGameplayAreaPatch(patch: StoryGameplayAreaPatch | undefined, current: StoryGameplayAreaState | null) {
  if (!patch || !current) return current
  return {
    ...current,
    stability: current.stability + (patch.stabilityDelta ?? 0),
    pressure: current.pressure + (patch.pressureDelta ?? 0)
  }
}

export function resolveStoryGameplay(trigger: GameplayTrigger, context: StoryGameplayContext) {
  const params = trigger.params ?? {}
  const staminaCost = Math.max(0, Number(params.staminaCost ?? 0))
  const hasStamina = context.player.stamina >= staminaCost
  if (staminaCost > 0 && !hasStamina) {
    return {
      result: {
        success: false,
        gameplayType: trigger.type,
        targetId: trigger.targetId,
        data: { reason: '体力不足' }
      },
      reward: { cultivation: 0, gold: 0, item: undefined },
      areaPatch: undefined,
      relationshipDeltas: [],
      log: createLog(context, 'player', '剧情行动未果', `你尝试处理${trigger.targetId}，但体力不足。`, ['failure'])
    }
  }

  if (staminaCost > 0 && !context.player.consumeStamina(staminaCost)) {
    return {
      result: { success: false, gameplayType: trigger.type, targetId: trigger.targetId, data: { reason: '体力不足' } },
      reward: { cultivation: 0, gold: 0, item: undefined },
      areaPatch: undefined,
      relationshipDeltas: [],
      log: createLog(context, 'player', '剧情行动未果', `你尝试处理${trigger.targetId}，但行动没有成功。`, ['failure'])
    }
  }

  if (trigger.type === 'collect') {
    const item = rewardItem(trigger)
    const areaId = String(params.areaId ?? '')
    const areaPatch = areaId ? { areaId, pressureDelta: -1 } satisfies StoryGameplayAreaPatch : undefined
    return {
      result: { success: true, gameplayType: trigger.type, targetId: trigger.targetId, data: { rewards: [item] } },
      reward: { cultivation: 0, gold: 0, item },
      areaPatch,
      relationshipDeltas: [],
      log: createLog(context, 'player', '剧情采集', `你取得${item.name} x${item.quantity}。`, ['collect'])
    }
  }

  if (trigger.type === 'dialog') {
    const targetName = String(params.npcId ?? trigger.targetId)
    const definition = context.world.unlockedNpcDefinitions.find(npc => npc.id === targetName)
      ?? context.world.npcDefinitions.find(npc => npc.id === targetName)
      ?? context.world.unlockedNpcDefinitions.find(npc => npc.name === targetName)
      ?? context.world.npcDefinitions.find(npc => npc.name === targetName)
      ?? context.world.unlockedNpcDefinitions.find(npc => npc.id.startsWith('npc_'))
      ?? context.world.npcDefinitions.find(npc => npc.id.startsWith('npc_'))
    const npcId = definition?.id ?? targetName
    const favorDelta = Number(params.favorDelta ?? 0)
    const relationshipDeltas = [{ npcId, favorDelta }]
    return {
      result: { success: true, gameplayType: trigger.type, targetId: trigger.targetId, data: { favorDelta } },
      reward: { cultivation: 0, gold: 0, item: undefined },
      areaPatch: undefined,
      relationshipDeltas,
      log: createLog(context, 'npc', '人物交谈', `${definition?.name ?? targetName}与你的关系有所变化。`, ['relationship'])
    }
  }

  if (trigger.type === 'explore') {
    const areaId = trigger.targetId
    const areaPatch = {
      areaId,
      unlock: Boolean(params.unlockArea),
      stabilityDelta: Number(params.stabilityDelta ?? 0),
      pressureDelta: Number(params.pressureDelta ?? 0)
    } satisfies StoryGameplayAreaPatch
    return {
      result: { success: true, gameplayType: trigger.type, targetId: trigger.targetId, data: { areaId } },
      reward: { cultivation: 0, gold: 0, item: undefined },
      areaPatch,
      relationshipDeltas: [],
      log: createLog(context, 'player', '剧情探索', `你探索了${areaId}。`, ['explore'])
    }
  }

  return {
    result: { success: true, gameplayType: trigger.type, targetId: trigger.targetId, data: {} },
    reward: { cultivation: 0, gold: 0, item: undefined },
    areaPatch: undefined,
    relationshipDeltas: [],
    log: createLog(context, 'player', '剧情推进', `你完成了${trigger.targetId}。`, ['progress'])
  }
}

export function resolveStoryGameplayOutcome(input: Parameters<typeof resolveStoryGameplay>[0], context: Parameters<typeof resolveStoryGameplay>[1]) {
  return resolveStoryGameplay(input, context)
}

export function clearStoryGameplaySession(): void {}
