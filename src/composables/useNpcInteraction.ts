import { ref } from 'vue'
import { useWorldStore } from '@/stores/worldStore'
import type { NpcInteractionKind, NpcInteractionResolution } from '@/world/runtime/npcCompanionResolver'
import {
  resolveNpcInteractionJourney,
  type NpcInteractionJourneyResult
} from '@/world/runtime/npcInteractionJourneyResolver'

export interface NpcInteractionResult {
  success: boolean
  resolution: NpcInteractionResolution | null
  journey: NpcInteractionJourneyResult | null
}

export function useNpcInteraction() {
  const worldStore = useWorldStore()
  const lastInteractionJourney = ref<NpcInteractionJourneyResult | null>(null)

  function interactWithNpc(npcId: string, kind: NpcInteractionKind): NpcInteractionResult {
    const resolution = worldStore.interactWithNpc(npcId, kind)
    if (!resolution) {
      return {
        success: false,
        resolution: null,
        journey: null
      }
    }

    const profile = worldStore.getNpcDisplayProfile(npcId)
    const state = worldStore.npcStates.find(item => item.id === npcId)
    const journey = resolveNpcInteractionJourney({
      result: resolution,
      npcName: profile?.name ?? npcId,
      npcTitle: profile?.title ?? null,
      locationName: profile?.locationName ?? null
    })

    lastInteractionJourney.value = journey
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: state?.locationMapId
    })

    return {
      success: true,
      resolution,
      journey
    }
  }

  return {
    lastInteractionJourney,
    interactWithNpc
  }
}
