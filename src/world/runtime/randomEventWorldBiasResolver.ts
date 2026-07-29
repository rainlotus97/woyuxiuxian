import type { RandomEvent } from '@/types/randomEvent'
import type { AreaRiskLevel } from '@/map/runtime/mapRuntimeTypes'
import type { SectWorldStatus } from '@/types/sect'

export interface RandomEventWorldAreaState {
  areaId: string
  riskLevel: AreaRiskLevel
  stability: number
  pressure: number
  contested: boolean
}

export interface RandomEventWorldNpcState {
  id: string
  locationMapId: string
  hpState: string
}

export interface RandomEventWorldBiasInput {
  event: RandomEvent
  areaStates: RandomEventWorldAreaState[]
  activeAreaAnomalyCount: number
  currentRealmAreaIds: string[]
  joinedSectId: string | null
  activeWar: boolean
  worldStatus: SectWorldStatus | null
  npcStates?: RandomEventWorldNpcState[]
}

function hasTag(tags: string[], pattern: RegExp) {
  return tags.some(tag => pattern.test(tag))
}

function getEventNpcIds(event: RandomEvent) {
  return new Set(event.choices.flatMap(choice => choice.memory ?? []).flatMap(memory => memory.npcId ? [memory.npcId] : []))
}

export function resolveRandomEventWorldBias(input: RandomEventWorldBiasInput) {
  const tags = input.event.storyTags ?? []
  const averagePressure = input.areaStates.length > 0
    ? input.areaStates.reduce((sum, area) => sum + area.pressure, 0) / input.areaStates.length
    : 0
  const contestedCount = input.areaStates.filter(area => area.contested).length
  const unstableCount = input.areaStates.filter(area => (
    area.riskLevel === 'danger'
    || area.riskLevel === 'chaos'
    || area.pressure >= 72
    || area.stability < 38
  )).length
  const mapDriven = input.event.type === 'adventure'
    || input.event.type === 'world'
    || hasTag(tags, /地图|山道|历练|战线|区域/u)
  const marketDriven = hasTag(tags, /坊市|商路/u)
  const sectDriven = input.event.type === 'sect' || hasTag(tags, /宗门|山门|战事|叛徒/u)
  const npcIds = getEventNpcIds(input.event)
  const realmNpcCount = input.npcStates?.filter(state => (
    npcIds.has(state.id)
    && input.currentRealmAreaIds.includes(state.locationMapId)
    && state.hpState !== 'dead'
  )).length ?? 0

  let weight = 0
  if (mapDriven) {
    weight += Math.min(18, input.activeAreaAnomalyCount * 5)
    weight += Math.min(14, Math.round(averagePressure / 12))
    weight += Math.min(12, contestedCount * 4)
  }
  if (marketDriven) {
    weight += Math.min(10, unstableCount * 3)
    weight += contestedCount > 0 ? 4 : 0
    weight += input.joinedSectId ? 2 : 0
  }
  if (sectDriven) {
    weight += input.activeWar ? 18 : 0
    weight += input.worldStatus === 'collapsed' ? 14 : input.worldStatus === 'rebuilding' ? 9 : 0
  }
  if (realmNpcCount > 0) weight += Math.min(10, realmNpcCount * 5)

  return weight
}
