import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { isMapAreaUnlocked } from '@/map/runtime/mapAreaUnlockResolver'
import { getSectById } from '@/types/sect'
import {
  resolveWorldBriefings,
  type WorldBriefingItem
} from '@/world/runtime/worldBriefingResolver'

type BriefingSeverity = 'minor' | 'normal' | 'major' | 'legendary'
type BriefingRiskLevel = 'safe' | 'watch' | 'danger' | 'chaos'

export interface WorldBriefingHotspotInput {
  name: string
  riskLevel: BriefingRiskLevel
  contested: boolean
  anomalyTitle?: string | null
}

export interface WorldBriefingSpotlightNpcInput {
  name: string
  goalLabel: string
  bondLabel: string
  hpLabel: string
  destinyRankLabel: string
  notorietyLabel: string
  bondTone: string
}

export interface WorldBriefingLogInput {
  title: string
  severity: BriefingSeverity
  timeLabel: string
}

export interface UseWorldBriefingsOptions {
  hotspotArea?: MaybeRefOrGetter<WorldBriefingHotspotInput | null>
  spotlightNpc?: MaybeRefOrGetter<WorldBriefingSpotlightNpcInput | null>
  latestNpcStory?: MaybeRefOrGetter<WorldBriefingLogInput | null>
  latestLog?: MaybeRefOrGetter<WorldBriefingLogInput | null>
  limit?: number
}

export function useWorldBriefings(options: UseWorldBriefingsOptions = {}): {
  worldBriefings: ComputedRef<WorldBriefingItem[]>
} {
  const playerStore = usePlayerStore()
  const sectStore = useSectStore()
  const mapStore = useMapStore()
  const worldStore = useWorldStore()

  const captivityForecast = computed(() => worldStore.getCaptivityForecast())

  const fallbackHotspotArea = computed<WorldBriefingHotspotInput | null>(() => {
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
      name: area.name,
      riskLevel: ranked.riskLevel,
      contested: ranked.contested,
      anomalyTitle: anomaly?.title ?? null
    }
  })

  const capturedNpcBriefing = computed(() => {
    const target = worldStore.getCapturedNpcRescueTarget(sectStore.joinedSectId)
    if (!target) return null
    return {
      name: target.name,
      title: target.title,
      sectName: sectStore.currentSect?.name ?? '相关宗门',
      captorName: target.captorName,
      locationName: target.locationName,
      severity: target.severity
    }
  })

  const fallbackLatestLog = computed<WorldBriefingLogInput | null>(() => {
    const log = worldStore.visibleLogViews[0]
    if (!log) return null
    return {
      title: log.entry.title,
      severity: log.entry.severity,
      timeLabel: log.entry.timeLabel
    }
  })

  const worldBriefings = computed(() => {
    const hotspotArea = toValue(options.hotspotArea) ?? fallbackHotspotArea.value
    const latestLog = toValue(options.latestLog) ?? fallbackLatestLog.value
    const items = resolveWorldBriefings({
      captivity: {
        isCaptured: playerStore.captivity.isCaptured,
        captorName: playerStore.captivity.captorSectId
          ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
          : null,
        forecastLabel: captivityForecast.value?.label,
        forecastHint: captivityForecast.value?.hint,
        canAttemptEscape: worldStore.canAttemptCaptivityEscape()
      },
      sect: {
        name: sectStore.currentSect?.name ?? null,
        status: sectStore.currentSect ? sectStore.worldCondition.status : null,
        activeWar: Boolean(sectStore.activeWar)
      },
      capturedNpc: capturedNpcBriefing.value,
      hotspotArea,
      spotlightNpc: toValue(options.spotlightNpc) ?? null,
      latestNpcStory: toValue(options.latestNpcStory) ?? null,
      latestLog
    })

    return typeof options.limit === 'number' ? items.slice(0, options.limit) : items
  })

  return {
    worldBriefings
  }
}
