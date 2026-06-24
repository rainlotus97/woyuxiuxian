import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import { isMapAreaUnlocked } from '@/map/runtime/mapAreaUnlockResolver'
import { useWorldBriefings, type WorldBriefingHotspotInput } from '@/composables/useWorldBriefings'
import { resolveP0LoopVerification } from '@/world/runtime/p0LoopVerificationResolver'

export interface P0LoopHotspotArea extends WorldBriefingHotspotInput {
  id: string
}

export interface UseP0LoopStatusOptions {
  hotspotArea?: MaybeRefOrGetter<P0LoopHotspotArea | null>
  worldBriefingCount?: MaybeRefOrGetter<number>
  hasRecentJourney?: MaybeRefOrGetter<boolean>
}

export function useP0LoopStatus(options: UseP0LoopStatusOptions = {}) {
  const playerStore = usePlayerStore()
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const storyStore = useStoryStore()

  const fallbackHotspotArea = computed<P0LoopHotspotArea | null>(() => {
    const ranked = Object.values(mapStore.areaStates)
      .filter(state => {
        const area = mapStore.getAreaInfo(state.areaId)
        return Boolean(area && mapStore.realmUnlockStatus[area.realm] && isMapAreaUnlocked({
          area,
          playerRealm: playerStore.realm,
          playerRealmLevel: playerStore.realmLevel
        }))
      })
      .filter(state => state.riskLevel === 'danger' || state.riskLevel === 'chaos' || state.contested)
      .sort((a, b) => {
        const scoreA = a.pressure + (a.riskLevel === 'chaos' ? 30 : a.riskLevel === 'danger' ? 20 : 8) + (a.contested ? 12 : 0)
        const scoreB = b.pressure + (b.riskLevel === 'chaos' ? 30 : b.riskLevel === 'danger' ? 20 : 8) + (b.contested ? 12 : 0)
        return scoreB - scoreA
      })[0]

    if (!ranked) return null

    const area = mapStore.getAreaInfo(ranked.areaId)
    const anomaly = worldStore.activeAreaAnomalies.find(item => item.areaId === ranked.areaId)
    if (!area) return null

    return {
      id: area.id,
      name: area.name,
      riskLevel: ranked.riskLevel,
      contested: ranked.contested,
      anomalyTitle: anomaly?.title ?? null
    }
  })

  const hotspotArea = computed(() => toValue(options.hotspotArea) ?? fallbackHotspotArea.value)
  const { worldBriefings } = useWorldBriefings({ hotspotArea })

  const resolvedWorldBriefingCount = computed(() => {
    return toValue(options.worldBriefingCount) ?? worldBriefings.value.length
  })

  const resolvedHasRecentJourney = computed(() => {
    return toValue(options.hasRecentJourney) ?? worldStore.recentPlayerJourneys.length > 0
  })

  const p0Verification = computed(() => resolveP0LoopVerification({
    readiness: {
      player: {
        isCaptured: playerStore.captivity.isCaptured,
        isIdling: playerStore.isIdling,
        stamina: playerStore.stamina,
        maxStamina: playerStore.maxStamina,
        canBreakthrough: playerStore.canBreakthrough
      },
      world: {
        unlockedNpcCount: worldStore.unlockedNpcDefinitions.length,
        worldBriefingCount: resolvedWorldBriefingCount.value,
        hasRecentJourney: resolvedHasRecentJourney.value
      },
      story: {
        currentNodeId: storyStore.currentNodeId,
        completedCount: storyStore.completedCount,
        isInitialized: storyStore.isInitialized
      },
      map: {
        conqueredCount: mapStore.conqueredCountInCurrentRealm,
        totalAreaCount: mapStore.currentRealmAreas.length,
        hasHotspot: Boolean(hotspotArea.value)
      },
      sect: {
        joined: Boolean(sectStore.currentSect),
        joinableCount: sectStore.joinCandidates.filter(candidate => candidate.canJoin).length,
        activeWar: Boolean(sectStore.activeWar),
        completedTaskCount: sectStore.completedTasks.length,
        availableTaskCount: sectStore.dailyTasks.length + sectStore.weeklyTasks.length,
        canClaimSalary: sectStore.canClaimSalary
      }
    },
    evidence: {
      playerJourneyTags: worldStore.playerJourneys.map(journey => journey.tags),
      storyCurrentNodeId: storyStore.currentNodeId,
      storyCompletedCount: storyStore.completedCount,
      unlockedNpcCount: worldStore.unlockedNpcDefinitions.length,
      npcStoryCount: worldStore.npcStories.length,
      worldBriefingCount: resolvedWorldBriefingCount.value,
      mapTotalAreaCount: mapStore.currentRealmAreas.length,
      mapConqueredCount: mapStore.conqueredCountInCurrentRealm,
      mapHistoryCount: mapStore.historyEvents.length,
      areaAnomalyCount: worldStore.areaAnomalies.length,
      sectJoined: Boolean(sectStore.currentSect),
      sectJoinableCount: sectStore.joinCandidates.filter(candidate => candidate.canJoin).length
    },
    hotspotAreaId: hotspotArea.value?.id ?? null
  }))

  const loopReadiness = computed(() => p0Verification.value.loopReadiness)
  const p0LoopClosure = computed(() => p0Verification.value.p0LoopClosure)
  const p0NextAction = computed(() => p0Verification.value.p0NextAction)
  const p0Audit = computed(() => p0Verification.value.p0Audit)
  const p0Acceptance = computed(() => p0Verification.value.p0Acceptance)
  const p0Report = computed(() => p0Verification.value.p0Report)
  const p0Checklist = computed(() => p0Verification.value.p0Checklist)

  return {
    hotspotArea,
    loopReadiness,
    p0LoopClosure,
    p0NextAction,
    p0Audit,
    p0Acceptance,
    p0Report,
    p0Checklist
  }
}
