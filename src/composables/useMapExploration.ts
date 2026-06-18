import { computed, ref } from 'vue'
import {
  resolveMapExploration,
  resolveMapExplorationPoints,
  type MapExplorationResult
} from '@/map/runtime/mapExplorationResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import type { MapArea } from '@/types/map'

export function useMapExploration() {
  const mapStore = useMapStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const lastExploration = ref<MapExplorationResult | null>(null)

  function getExplorationPoints(area: MapArea) {
    return resolveMapExplorationPoints({
      area,
      areaState: mapStore.getAreaState(area.id),
      weather: worldStore.weather,
      hasAnomaly: worldStore.activeAreaAnomalies.some(item => item.areaId === area.id)
    })
  }

  function explorePoint(area: MapArea, pointId: string) {
    const areaState = mapStore.getAreaState(area.id)
    const result = resolveMapExploration({
      area,
      areaState,
      pointId,
      weather: worldStore.weather,
      hasAnomaly: worldStore.activeAreaAnomalies.some(item => item.areaId === area.id),
      stamina: playerStore.stamina
    })

    if (!result.success) {
      return result
    }

    if (!playerStore.consumeStamina(result.staminaCost)) {
      return {
        ...result,
        success: false,
        reason: `体力不足，需要 ${result.staminaCost} 点体力。`,
        title: '无法探索',
        text: `体力不足，需要 ${result.staminaCost} 点体力。`
      }
    }

    if (result.rewards.cultivation > 0) playerStore.addCultivation(result.rewards.cultivation)
    if (result.rewards.gold > 0) playerStore.addGold(result.rewards.gold)

    if (areaState) {
      mapStore.upsertAreaState(area.id, {
        stability: Math.max(18, Math.min(100, areaState.stability + result.areaPatch.stabilityDelta)),
        pressure: Math.max(0, Math.min(100, areaState.pressure + result.areaPatch.pressureDelta)),
        lastUpdatedTick: worldStore.clock.totalTicks
      })
    }

    worldStore.recordManualPlayerJourney({
      severity: result.severity,
      title: result.title,
      text: result.text,
      rewards: [
        { type: 'cultivation', label: '修为', value: result.rewards.cultivation },
        { type: 'gold', label: '灵石', value: result.rewards.gold },
        ...(result.rewards.itemName
          ? [{ type: 'item' as const, label: result.rewards.itemName, value: 1 }]
          : [])
      ],
      areaId: area.id,
      tags: result.tags
    })

    lastExploration.value = result
    return result
  }

  const hasExploration = computed(() => Boolean(lastExploration.value))

  return {
    lastExploration,
    hasExploration,
    getExplorationPoints,
    explorePoint
  }
}
