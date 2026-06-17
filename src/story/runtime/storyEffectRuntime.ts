import type { Effect, GameplayTrigger } from '../types'
import { useCompanionStore } from '@/stores/companionStore'
import { useMapStore } from '@/stores/mapStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getStoryBattleTemplate } from './storyBattleCatalog'
import { describeStoryCharacterTarget, resolveStoryCharacterTarget } from './storyCharacterRegistry'

export interface SerializedStoryRuntimeState {
  unlockedNpcIds: string[]
  unlockedFeatureIds: string[]
  branchFlags: string[]
  storyVariables: Record<string, string | number>
  pendingBattleId: string | null
  pendingGameplayTrigger: GameplayTrigger | null
}

export interface StoryRuntimeState {
  unlockedNpcIds: Set<string>
  unlockedFeatureIds: Set<string>
  branchFlags: Set<string>
  storyVariables: Map<string, string | number>
  pendingBattleId: string | null
  pendingGameplayTrigger: GameplayTrigger | null
}

export function createStoryRuntimeState(): StoryRuntimeState {
  return {
    unlockedNpcIds: new Set(),
    unlockedFeatureIds: new Set(),
    branchFlags: new Set(),
    storyVariables: new Map(),
    pendingBattleId: null,
    pendingGameplayTrigger: null
  }
}

export interface StoryEffectRuntime {
  state: StoryRuntimeState
  execute(effect: Effect): Promise<void>
  resetPendingBattle(): void
  peekPendingGameplayTrigger(): GameplayTrigger | null
  consumePendingGameplayTrigger(): GameplayTrigger | null
  clearPendingGameplayTrigger(): void
  serializeState(): SerializedStoryRuntimeState
  hydrateState(serialized?: Partial<SerializedStoryRuntimeState> | null): void
}

export function createStoryEffectRuntime(): StoryEffectRuntime {
  const worldStore = useWorldStore()
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const companionStore = useCompanionStore()
  const state = createStoryRuntimeState()

  function cloneGameplayTrigger(trigger: GameplayTrigger | null): GameplayTrigger | null {
    if (!trigger) return null
    return {
      ...trigger,
      params: trigger.params ? { ...trigger.params } : undefined,
      completionCondition: trigger.completionCondition ? [...trigger.completionCondition] : undefined
    }
  }

  function createBattleGameplayTrigger(battleId: string): GameplayTrigger | null {
    const template = getStoryBattleTemplate(battleId)
    if (!template) return null

    return {
      type: 'battle',
      targetId: template.id,
      params: {
        areaId: template.areaId,
        mapAreaId: template.mapAreaId,
        description: template.description
      },
      onFailure: 'retry'
    }
  }

  async function execute(effect: Effect) {
    switch (effect.type) {
      case 'unlock_npc':
        if (effect.target) {
          const resolved = resolveStoryCharacterTarget(effect.target)
          if (resolved.worldNpcId && worldStore.unlockNpc(
            resolved.worldNpcId,
            `因剧情推进，你与${resolved.storyCharacterName}的因果开始纠缠。`
          )) {
            state.unlockedNpcIds.add(resolved.worldNpcId)
          }
        }
        return
      case 'unlock_companion':
        if (effect.target) {
          const resolved = resolveStoryCharacterTarget(effect.target)
          if (resolved.companionDefinitionId) {
            companionStore.unlockCompanionById(resolved.companionDefinitionId)
          }
        }
        return
      case 'sect_reputation':
        if (typeof effect.value === 'number') {
          sectStore.applyStoryReputation(effect.value, `剧情事件改变了你在宗门中的评价。`)
        }
        return
      case 'unlock_map':
        if (effect.target) {
          mapStore.unlockArea(effect.target, `剧情推进后，${effect.target}对应区域已被记录进你的行程图。`)
        }
        return
      case 'world_flag':
        if (effect.target) {
          worldStore.addWorldFlag(effect.target, '命运震荡', `世界接受了新的剧情标记：${describeStoryCharacterTarget(effect.target)}`)
        }
        return
      case 'story_battle':
        if (effect.target) {
          state.pendingBattleId = effect.target
          state.pendingGameplayTrigger = createBattleGameplayTrigger(effect.target)
        }
        return
      case 'branch_flag':
        if (effect.target) {
          state.branchFlags.add(effect.target)
        }
        return
      case 'unlock_feature':
        if (effect.target) {
          state.unlockedFeatureIds.add(effect.target)
        }
        return
      case 'set_var':
        if (effect.target) {
          state.storyVariables.set(effect.target, effect.value ?? '')
        }
        return
      case 'trigger_event':
        if (effect.target) {
          worldStore.addWorldFlag(`event:${effect.target}`, '剧情异动', `剧情事件 ${effect.target} 已被挂起，等待后续系统消费。`)
        }
        return
      default:
        return
    }
  }

  function resetPendingBattle() {
    state.pendingBattleId = null
    state.pendingGameplayTrigger = null
  }

  function peekPendingGameplayTrigger() {
    return cloneGameplayTrigger(state.pendingGameplayTrigger)
  }

  function consumePendingGameplayTrigger() {
    const trigger = peekPendingGameplayTrigger()
    if (trigger) {
      clearPendingGameplayTrigger()
    }
    return trigger
  }

  function clearPendingGameplayTrigger() {
    state.pendingBattleId = null
    state.pendingGameplayTrigger = null
  }

  function serializeState(): SerializedStoryRuntimeState {
    return {
      unlockedNpcIds: Array.from(state.unlockedNpcIds),
      unlockedFeatureIds: Array.from(state.unlockedFeatureIds),
      branchFlags: Array.from(state.branchFlags),
      storyVariables: Object.fromEntries(state.storyVariables),
      pendingBattleId: state.pendingBattleId,
      pendingGameplayTrigger: cloneGameplayTrigger(state.pendingGameplayTrigger)
    }
  }

  function hydrateState(serialized?: Partial<SerializedStoryRuntimeState> | null) {
    state.unlockedNpcIds.clear()
    for (const npcId of serialized?.unlockedNpcIds ?? []) {
      state.unlockedNpcIds.add(npcId)
    }

    state.unlockedFeatureIds.clear()
    for (const featureId of serialized?.unlockedFeatureIds ?? []) {
      state.unlockedFeatureIds.add(featureId)
    }

    state.branchFlags.clear()
    for (const flag of serialized?.branchFlags ?? []) {
      state.branchFlags.add(flag)
    }

    state.storyVariables.clear()
    for (const [key, value] of Object.entries(serialized?.storyVariables ?? {})) {
      state.storyVariables.set(key, value)
    }

    state.pendingBattleId = serialized?.pendingBattleId ?? null
    state.pendingGameplayTrigger = cloneGameplayTrigger(serialized?.pendingGameplayTrigger ?? null)
  }

  return {
    state,
    execute,
    resetPendingBattle,
    peekPendingGameplayTrigger,
    consumePendingGameplayTrigger,
    clearPendingGameplayTrigger,
    serializeState,
    hydrateState
  }
}
