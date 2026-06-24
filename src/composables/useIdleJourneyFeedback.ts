import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getAreaById } from '@/types/map'
import {
  resolveIdleJourney,
  type IdleJourneyResult
} from '@/world/runtime/idleJourneyResolver'

function getAreaLabel(areaId: string | null) {
  if (!areaId) return null
  return getAreaById(areaId)?.name ?? areaId
}

export function useIdleJourneyFeedback() {
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const lastIdleJourneyFeedback = ref<IdleJourneyResult | null>(null)

  function getFocusAreaId() {
    return worldStore.activeAreaAnomalies[0]?.areaId
      ?? sectStore.currentSect?.areaId
      ?? mapStore.currentRealmAreas[0]?.id
      ?? null
  }

  function recordIdleJourney(event: 'start' | 'stop', elapsedSeconds?: number) {
    const areaId = getFocusAreaId()
    const result = resolveIdleJourney({
      event,
      clock: worldStore.clock,
      idleMode: worldStore.idleMode,
      cultivationPerSecond: playerStore.cultivationPerSecond,
      areaName: getAreaLabel(areaId),
      sectName: sectStore.currentSect?.name ?? null,
      elapsedSeconds
    })

    worldStore.recordManualPlayerJourney({
      ...result,
      areaId: areaId ?? undefined
    })
    lastIdleJourneyFeedback.value = result
    return result
  }

  return {
    lastIdleJourneyFeedback,
    recordIdleJourney
  }
}
