import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getSectById } from '@/types/sect'
import {
  resolveSectMembershipJourney,
  type SectMembershipJourneyResult
} from '@/sect/runtime/sectMembershipJourneyResolver'

export interface SectMembershipActionResult {
  success: boolean
  journey: SectMembershipJourneyResult | null
  sectName: string | null
}

export function useSectMembership() {
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastMembershipJourney = ref<SectMembershipJourneyResult | null>(null)

  function joinSect(sectId: string): SectMembershipActionResult {
    const sect = sectStore.joinCandidates.find(item => item.sect.id === sectId)?.sect
      ?? getSectById(sectId)
    const area = sect ? mapStore.getAreaInfo(sect.areaId) : null

    if (!sectStore.joinSect(sectId) || !sect) {
      return { success: false, journey: null, sectName: sect?.name ?? null }
    }

    const journey = resolveSectMembershipJourney({
      action: 'join',
      sectName: sect.name,
      areaName: area?.name ?? null,
      positionName: sectStore.positionName
    })
    lastMembershipJourney.value = journey
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: sect.areaId
    })

    return { success: true, journey, sectName: sect.name }
  }

  function leaveSect(): SectMembershipActionResult {
    const sect = sectStore.currentSect
    const area = sect ? mapStore.getAreaInfo(sect.areaId) : null

    if (!sectStore.leaveSect() || !sect) {
      return { success: false, journey: null, sectName: sect?.name ?? null }
    }

    const journey = resolveSectMembershipJourney({
      action: 'leave',
      sectName: sect.name,
      areaName: area?.name ?? null
    })
    lastMembershipJourney.value = journey
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: sect.areaId
    })

    return { success: true, journey, sectName: sect.name }
  }

  return {
    lastMembershipJourney,
    joinSect,
    leaveSect
  }
}
