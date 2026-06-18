import type { Router } from 'vue-router'
import { gameplayBridge } from '../gameplayBridge'
import type { GameplayResult, GameplayTrigger } from '../types'
import { getStoryBattleTemplate } from './storyBattleCatalog'
import { getRouteGameplaySession } from './routeGameplaySession'
import {
  applyStoryGameplayAreaPatch,
  resolveStoryGameplay
} from './storyGameplayRuntime'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'

function createFallbackResult(success: boolean, gameplayType: string, targetId: string): GameplayResult {
  return {
    success,
    gameplayType: gameplayType as GameplayResult['gameplayType'],
    targetId
  }
}

function applyGenericStoryGameplay(trigger: GameplayTrigger): GameplayResult {
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const mapStore = useMapStore()
  const resolution = resolveStoryGameplay(trigger, {
    player: {
      cultivation: playerStore.cultivation,
      stamina: playerStore.stamina,
      maxStamina: playerStore.maxStamina,
      gold: playerStore.gold,
      consumeStamina: playerStore.consumeStamina
    },
    world: {
      currentTimeLabel: worldStore.currentTimeLabel,
      npcDefinitions: worldStore.npcDefinitions,
      unlockedNpcDefinitions: worldStore.unlockedNpcDefinitions
    },
    map: {
      getAreaState: mapStore.getAreaState
    }
  })

  const staminaCost = Number(resolution.result.data?.staminaCost ?? 0)
  if (staminaCost > 0 && !playerStore.consumeStamina(staminaCost)) {
    return {
      ...resolution.result,
      success: false,
      data: {
        ...resolution.result.data,
        resultLabel: '体力不足',
        text: `体力不足，需要 ${staminaCost} 点体力。`
      }
    }
  }

  if (resolution.result.success) {
    if (resolution.reward.cultivation > 0) playerStore.addCultivation(resolution.reward.cultivation)
    if (resolution.reward.gold > 0) playerStore.addGold(resolution.reward.gold)
    if (resolution.reward.stamina > 0) {
      playerStore.recoverStamina()
      playerStore.buyStamina(0, resolution.reward.stamina)
    }
    if (resolution.reward.item) playerStore.addToInventory(resolution.reward.item)
    if (resolution.reward.skillExp) {
      playerStore.addSkillExp(resolution.reward.skillExp.skillId, resolution.reward.skillExp.amount)
    }
    if (resolution.areaPatch) {
      const current = mapStore.getAreaState(resolution.areaPatch.areaId)
      mapStore.upsertAreaState(
        resolution.areaPatch.areaId,
        applyStoryGameplayAreaPatch(resolution.areaPatch, current)
      )
      if (resolution.areaPatch.unlock) {
        mapStore.unlockArea(resolution.areaPatch.areaId, `剧情玩法「${trigger.targetId}」打开了此地后续线索。`)
        playerStore.unlockArea(resolution.areaPatch.areaId)
      }
    }
  }

  worldStore.recordMerchantTradeEvent({
    log: resolution.log,
    relationshipDeltas: resolution.relationshipDeltas
  })

  return resolution.result
}

export function registerDefaultGameplayHandlers(router: Router) {
  const unsubs = [
    gameplayBridge.registerHandler('battle', async trigger => {
      const template = getStoryBattleTemplate(trigger.targetId)
      if (!template) {
        return createFallbackResult(false, trigger.type, trigger.targetId)
      }

      const routeSession = getRouteGameplaySession()

      await router.push({
        path: '/game/battle',
        query: {
          areaId: template.areaId,
          mapAreaId: template.mapAreaId,
          storyBattleId: template.id,
          storySessionId: routeSession?.id
        }
      })

      return gameplayBridge.createPendingRouteResult()
    }),
    gameplayBridge.registerHandler('collect', async trigger => applyGenericStoryGameplay(trigger)),
    gameplayBridge.registerHandler('upgrade', async trigger => applyGenericStoryGameplay(trigger)),
    gameplayBridge.registerHandler('explore', async trigger => applyGenericStoryGameplay(trigger)),
    gameplayBridge.registerHandler('dialog', async trigger => applyGenericStoryGameplay(trigger)),
    gameplayBridge.registerHandler('puzzle', async trigger => applyGenericStoryGameplay(trigger)),
    gameplayBridge.registerHandler('custom', async trigger => applyGenericStoryGameplay(trigger)),
  ]

  return () => {
    for (const off of unsubs) off()
  }
}
