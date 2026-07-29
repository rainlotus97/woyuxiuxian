import { ref } from 'vue'
import {
  createInventoryItemsFromDrops,
  type EncounterDropStack
} from '@/character/runtime/inventoryDropResolver'
import {
  resolveAdventureSweep,
  type AdventureSweepResolution
} from '@/map/runtime/adventureSweepResolver'
import { resolveAdventureSweepJourney } from '@/map/runtime/adventureSweepJourneyResolver'
import type { AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import type { MapAreaEncounterContext } from '@/map/runtime/mapAreaEncounterResolver'
import { resolveEncounterDrops } from '@/map/runtime/mapEncounterComposition'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { rollReward, type AreaDefinition } from '@/types/adventure'
import type { DropNamingKind } from '@/game/battle/config/dropNaming'

export interface AdventureSweepFeedback {
  result: AdventureSweepResolution
  dropMessages: string[]
}

export function useAdventureSweep() {
  const playerStore = usePlayerStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastSweepFeedback = ref<AdventureSweepFeedback | null>(null)

  function applySweep(area: AreaDefinition, access: AreaGameplayAccess, encounter: MapAreaEncounterContext | null) {
    const result = resolveAdventureSweep({
      area,
      access,
      encounter,
      sweepCount: 3,
      rollReward,
      resolveDrops: resolveEncounterDrops as (drops: AreaDefinition['drops'], encounter: MapAreaEncounterContext | null) => EncounterDropStack[]
    })

    if (!result.success) return result
    if (playerStore.stamina < result.staminaCost) {
      return {
        success: false as const,
        reason: `体力不足！需要${result.staminaCost}点体力`,
        staminaCost: result.staminaCost
      }
    }

    playerStore.consumeStamina(result.staminaCost)
    playerStore.addCultivation(result.cultivationGain)
    playerStore.addGold(result.goldGain)

    const dropMessages: string[] = []
    const namingKind: DropNamingKind = encounter?.anomaly
      ? 'event'
      : worldStore.weather !== 'clear'
        ? 'weather'
        : encounter
          ? 'region'
          : 'normal'
    const inventoryItems = createInventoryItemsFromDrops(result.drops, {
      idPrefix: `sweep_drop_${area.id}`,
      serial: Date.now(),
      rewardContext: {
        kind: namingKind,
        weather: worldStore.weather,
        regionName: area.name,
        eventName: encounter?.anomalyTitle
      }
    })
    for (const item of inventoryItems) {
      const added = playerStore.addToInventory(item)
      if (added) {
        dropMessages.push(`${item.icon}${item.name} x${item.quantity}`)
      }
    }

    const progress = playerStore.getAreaProgress(area.id)
    if (progress) {
      playerStore.updateAreaProgress(area.id, {
        clearCount: progress.clearCount + result.sweepCount,
        stars: Math.max(progress.stars, 1)
      })
    }

    for (const task of result.taskProgress) {
      for (let index = 0; index < task.times; index++) {
        sectStore.updateTaskProgress(task.type, task.target)
      }
    }
    const journey = resolveAdventureSweepJourney({ result })
    worldStore.recordManualPlayerJourney(journey)

    lastSweepFeedback.value = {
      result,
      dropMessages
    }

    return result
  }

  return {
    lastSweepFeedback,
    applySweep
  }
}
