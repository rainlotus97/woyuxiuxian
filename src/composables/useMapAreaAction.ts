import { computed, ref } from 'vue'
import { resolveMapAreaAction, resolveMapAreaActionOptions, type MapAreaActionKind } from '@/map/runtime/mapAreaActionResolver'
import { resolveMapAreaActionJourney } from '@/map/runtime/mapAreaActionJourneyResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import type { MapArea } from '@/types/map'

export interface MapAreaActionFeedback {
  title: string
  text: string
  stabilityDelta: number
  pressureDelta: number
}

export function useMapAreaAction() {
  const mapStore = useMapStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const lastFeedback = ref<MapAreaActionFeedback | null>(null)

  function getActionOptions(area: MapArea) {
    const areaState = mapStore.getAreaState(area.id)
    if (!areaState) return []
    return resolveMapAreaActionOptions({
      areaState,
      hasAnomaly: worldStore.activeAreaAnomalies.some(item => item.areaId === area.id)
    })
  }

  function applyAreaAction(area: MapArea, kind: MapAreaActionKind) {
    const areaState = mapStore.getAreaState(area.id)
    if (!areaState) {
      return { success: false as const, message: '区域状态尚未初始化' }
    }

    const option = getActionOptions(area).find(item => item.kind === kind)
    if (!option) {
      return { success: false as const, message: '当前无法执行该处置' }
    }

    if (playerStore.stamina < option.staminaCost) {
      return { success: false as const, message: `体力不足，需要 ${option.staminaCost}` }
    }

    const result = resolveMapAreaAction({
      areaName: area.name,
      areaState,
      weather: worldStore.weather,
      hasAnomaly: worldStore.activeAreaAnomalies.some(item => item.areaId === area.id)
    }, kind)

    playerStore.consumeStamina(option.staminaCost)
    mapStore.upsertAreaState(area.id, {
      stability: Math.max(18, Math.min(100, areaState.stability + result.stabilityDelta)),
      pressure: Math.max(0, Math.min(100, areaState.pressure + result.pressureDelta)),
      contested: result.contested,
      lastUpdatedTick: worldStore.clock.totalTicks
    })

    worldStore.recordMerchantTradeEvent({
      log: {
        scope: 'world',
        severity: result.severity,
        title: result.title,
        text: result.text,
        actorIds: ['player'],
        mapId: area.id,
        tags: result.tags
      }
    })
    const journey = resolveMapAreaActionJourney({ result, option })
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: area.id
    })

    lastFeedback.value = {
      title: result.title,
      text: result.text,
      stabilityDelta: result.stabilityDelta,
      pressureDelta: result.pressureDelta
    }

    return {
      success: true as const,
      option,
      result
    }
  }

  const hasFeedback = computed(() => Boolean(lastFeedback.value))

  return {
    lastFeedback,
    hasFeedback,
    getActionOptions,
    applyAreaAction
  }
}
