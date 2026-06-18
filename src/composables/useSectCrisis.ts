import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getSectById } from '@/types/sect'
import { resolveSectEventChoice } from '@/sect/runtime/sectEventResolver'
import {
  resolveSectCrisisJourney,
  type SectCrisisJourneyResult
} from '@/sect/runtime/sectCrisisJourneyResolver'
import type { SectRecoveryActionId } from '@/sect/runtime/sectRecoveryResolver'

export interface SectRescueCost {
  contribution: number
  gold: number
}

export interface SectCapturedNpcTarget {
  id: string
  name: string
}

export function useSectCrisis() {
  const mapStore = useMapStore()
  const playerStore = usePlayerStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastCrisisJourney = ref<SectCrisisJourneyResult | null>(null)

  function applyRecoveryAction(actionId: SectRecoveryActionId) {
    const sect = sectStore.currentSect
    if (!sect) {
      return { success: false as const, message: '尚未加入宗门', journey: null }
    }

    const option = sectStore.recoveryState.options.find(item => item.id === actionId) ?? null
    const result = sectStore.applyRecoveryAction(actionId)

    if (!result.success) {
      return { ...result, journey: null }
    }

    const journey = resolveSectCrisisJourney({
      action: 'recovery',
      sectName: sect.name,
      recoveryTitle: result.title,
      recoveryMessage: result.message,
      recoveryActionId: actionId,
      contributionCost: option?.contributionCost ?? null,
      goldCost: option?.goldCost ?? null,
      hpRestore: result.hpRestore,
      progressGain: result.progressGain
    })
    recordJourney(journey, sect.areaId)

    return { ...result, journey }
  }

  function rescueNpc(npcId: string, target: SectCapturedNpcTarget | null, cost: SectRescueCost) {
    const sect = sectStore.currentSect
    if (!sect || !sectStore.joinedSectId) {
      return { success: false as const, reason: '尚未加入宗门', journey: null, targetName: target?.name ?? null }
    }
    if (!target || target.id !== npcId) {
      return { success: false as const, reason: '当前没有可营救的宗门人物', journey: null, targetName: null }
    }
    if (sectStore.contribution < cost.contribution) {
      return { success: false as const, reason: `贡献不足，需要 ${cost.contribution}`, journey: null, targetName: target.name }
    }
    if (playerStore.gold < cost.gold) {
      return { success: false as const, reason: `灵石不足，需要 ${cost.gold}`, journey: null, targetName: target.name }
    }
    if (!worldStore.rescueCapturedNpc(npcId, sectStore.joinedSectId)) {
      return { success: false as const, reason: '营救失败，目标状态已变化', journey: null, targetName: target.name }
    }

    sectStore.addContribution(-cost.contribution)
    playerStore.addGold(-cost.gold)

    const journey = resolveSectCrisisJourney({
      action: 'npc_rescue',
      sectName: sect.name,
      npcName: target.name,
      contributionCost: cost.contribution,
      goldCost: cost.gold
    })
    recordJourney(journey, sect.areaId)

    return { success: true as const, journey, targetName: target.name }
  }

  function declareWar(sectId: string) {
    const sect = sectStore.currentSect
    const targetSect = getSectById(sectId)

    if (!sect) {
      return { success: false as const, journey: null, targetName: targetSect?.name ?? null }
    }
    if (!sectStore.declareWar(sectId)) {
      return { success: false as const, journey: null, targetName: targetSect?.name ?? null }
    }

    const journey = resolveSectCrisisJourney({
      action: 'war_declaration',
      sectName: sect.name,
      targetSectName: targetSect?.name ?? sectId
    })
    recordJourney(journey, sect.areaId)

    return { success: true as const, journey, targetName: targetSect?.name ?? sectId }
  }

  function handleEventChoice(choiceId: string) {
    const sect = sectStore.currentSect
    const event = sectStore.activeEvent
    const choice = event?.choices.find(item => item.id === choiceId) ?? null
    const resolution = resolveSectEventChoice(event, choiceId)

    if (!sect || !resolution.success) {
      return { success: false as const, journey: null }
    }
    if (!sectStore.handleEventChoice(choiceId)) {
      return { success: false as const, journey: null }
    }

    const journey = resolveSectCrisisJourney({
      action: 'event_choice',
      sectName: sect.name,
      eventTitle: event?.title ?? null,
      choiceText: choice?.text ?? null,
      effects: resolution.effects
    })
    recordJourney(journey, sect.areaId)

    return { success: true as const, journey }
  }

  function recordJourney(journey: SectCrisisJourneyResult, areaId: string) {
    lastCrisisJourney.value = journey
    const area = mapStore.getAreaInfo(areaId)
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: area?.id ?? areaId
    })
  }

  return {
    lastCrisisJourney,
    applyRecoveryAction,
    rescueNpc,
    declareWar,
    handleEventChoice
  }
}
