import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import {
  resolveSectRewardJourney,
  type SectRewardJourneyResult
} from '@/sect/runtime/sectRewardJourneyResolver'

export interface SectSalaryClaimResult {
  success: boolean
  gold: number
  contribution: number
  journey: SectRewardJourneyResult | null
}

export interface SectTaskClaimAllResult {
  claimedCount: number
  totalContribution: number
  totalGold: number
  totalExp: number
  journey: SectRewardJourneyResult | null
}

export function useSectRewards() {
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastRewardJourney = ref<SectRewardJourneyResult | null>(null)

  function claimDailySalary(): SectSalaryClaimResult {
    const sect = sectStore.currentSect
    const result = sectStore.claimDailySalary()
    if (!result || !sect) {
      return {
        success: false,
        gold: 0,
        contribution: 0,
        journey: null
      }
    }

    const journey = resolveSectRewardJourney({
      action: 'stipend',
      sectName: sect.name,
      positionName: sectStore.positionName,
      rewards: {
        contribution: result.contribution,
        gold: result.gold
      }
    })
    recordJourney(journey, sect.areaId)

    return {
      success: true,
      gold: result.gold,
      contribution: result.contribution,
      journey
    }
  }

  function claimAllCompletedTaskRewards(): SectTaskClaimAllResult {
    const sect = sectStore.currentSect
    const result = sectStore.claimAllCompletedTaskRewards()
    if (result.claimedCount <= 0 || !sect) {
      return {
        ...result,
        journey: null
      }
    }

    const journey = resolveSectRewardJourney({
      action: 'task_claim_all',
      sectName: sect.name,
      claimedCount: result.claimedCount,
      rewards: {
        contribution: result.totalContribution,
        gold: result.totalGold,
        cultivation: result.totalExp
      }
    })
    recordJourney(journey, sect.areaId)

    return {
      ...result,
      journey
    }
  }

  function recordJourney(journey: SectRewardJourneyResult, areaId: string) {
    lastRewardJourney.value = journey
    const area = mapStore.getAreaInfo(areaId)
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: area?.id ?? areaId
    })
  }

  return {
    lastRewardJourney,
    claimDailySalary,
    claimAllCompletedTaskRewards
  }
}
