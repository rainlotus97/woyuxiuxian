import type { MapArea } from '@/types/map'
import type { Realm } from '@/types/unit'

const REALM_ORDER: Realm[] = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']

export type MapAreaUnlockSourceKind = 'realm' | 'conquest' | 'event' | 'adjacent' | 'story' | 'sect'

export interface MapAreaUnlockSource {
  kind: MapAreaUnlockSourceKind
  id: string
  label: string
  reason: string
}

export interface MapAreaUnlockRules {
  eventIds?: readonly string[]
  storyNodeIds?: readonly string[]
  sectIds?: readonly string[]
}

export interface MapAreaUnlockInput {
  area: Pick<MapArea, 'id' | 'name' | 'requiredRealm' | 'requiredRealmLevel' | 'adjacentAreas' | 'sects' | 'isUnlocked'> & {
    unlockRules?: MapAreaUnlockRules
  }
  playerRealm: Realm
  playerRealmLevel: number
  conqueredAreaIds?: readonly string[]
  knownAreaIds?: readonly string[]
  eventIds?: readonly string[]
  worldFlags?: readonly string[]
  completedStoryNodeIds?: readonly string[]
  currentStoryNodeId?: string | null
  storyClueIds?: readonly string[]
  unlockedSectIds?: readonly string[]
  joinedSectId?: string | null
}

export interface MapAreaUnlockResult {
  unlocked: boolean
  sources: MapAreaUnlockSource[]
  primarySource: MapAreaUnlockSource | null
  reason: string
}

const SOURCE_PRIORITY: MapAreaUnlockSourceKind[] = ['event', 'story', 'sect', 'adjacent', 'conquest', 'realm']

function hasValue(values: readonly string[], candidates: readonly string[]) {
  return candidates.find(candidate => values.includes(candidate)) ?? null
}

function meetsRealmRequirement(input: MapAreaUnlockInput) {
  const playerRealmIndex = REALM_ORDER.indexOf(input.playerRealm)
  const requiredRealmIndex = REALM_ORDER.indexOf(input.area.requiredRealm)

  if (playerRealmIndex < 0 || requiredRealmIndex < 0) return false
  if (playerRealmIndex > requiredRealmIndex) return true
  return playerRealmIndex === requiredRealmIndex && input.playerRealmLevel >= input.area.requiredRealmLevel
}

function sourceReason(kind: MapAreaUnlockSourceKind, area: MapAreaUnlockInput['area'], sourceId: string) {
  switch (kind) {
    case 'realm':
      return `${area.name}的境界门槛已满足（${area.requiredRealm}${area.requiredRealmLevel}层）。`
    case 'conquest':
      return `你已经在${area.name}留下征服记录，区域入口保持开放。`
    case 'event':
      return `世界事件「${sourceId}」改写了前往${area.name}的路况。`
    case 'adjacent':
      return `已打通相邻区域「${sourceId}」，可以沿界路前往${area.name}。`
    case 'story':
      return `主线节点「${sourceId}」已经把${area.name}接入你的行程。`
    case 'sect':
      return `宗门势力「${sourceId}」为你打开了${area.name}的入口。`
  }
}

function createSource(kind: MapAreaUnlockSourceKind, area: MapAreaUnlockInput['area'], id: string): MapAreaUnlockSource {
  const labels: Record<MapAreaUnlockSourceKind, string> = {
    realm: '境界门槛',
    conquest: '征服记录',
    event: '世界事件',
    adjacent: '邻接路径',
    story: '主线节点',
    sect: '宗门势力'
  }
  return {
    kind,
    id,
    label: labels[kind],
    reason: sourceReason(kind, area, id)
  }
}

export function resolveMapAreaUnlock(input: MapAreaUnlockInput): MapAreaUnlockResult {
  const area = input.area
  const conqueredAreaIds = input.conqueredAreaIds ?? []
  const knownAreaIds = input.knownAreaIds ?? conqueredAreaIds
  const eventIds = input.eventIds ?? []
  const worldFlags = input.worldFlags ?? []
  const completedStoryNodeIds = input.completedStoryNodeIds ?? []
  const storyClueIds = input.storyClueIds ?? []
  const unlockedSectIds = input.unlockedSectIds ?? []
  const sources: MapAreaUnlockSource[] = []

  if (area.isUnlocked || meetsRealmRequirement(input)) {
    sources.push(createSource('realm', area, `${area.requiredRealm}${area.requiredRealmLevel}`))
  }

  if (conqueredAreaIds.includes(area.id)) {
    sources.push(createSource('conquest', area, area.id))
  }

  const eventCandidates = [
    ...(area.unlockRules?.eventIds ?? []),
    `map_unlock:${area.id}`,
    `area_unlock:${area.id}`,
    `event_unlock:${area.id}`,
    `event:${area.id}:unlock`
  ]
  const eventId = hasValue([...eventIds, ...worldFlags], eventCandidates)
  if (eventId) {
    sources.push(createSource('event', area, eventId))
  }

  const adjacentAreaId = (area.adjacentAreas ?? []).find(areaId => knownAreaIds.includes(areaId))
  if (adjacentAreaId) {
    sources.push(createSource('adjacent', area, adjacentAreaId))
  }

  const storyCandidates = [
    ...(area.unlockRules?.storyNodeIds ?? []),
    `story_node:${area.id}`,
    `story_unlock:${area.id}`,
    `story_map_unlock:${area.id}`,
    `mainline:${area.id}`,
    area.id
  ]
  const storyNodeId = hasValue(
    [...completedStoryNodeIds, ...(input.currentStoryNodeId ? [input.currentStoryNodeId] : []), ...worldFlags],
    storyCandidates
  )
  const storyClueId = hasValue(storyClueIds, [area.id, `map:${area.id}`, `area:${area.id}`])
  if (storyNodeId || storyClueId) {
    sources.push(createSource('story', area, storyNodeId ?? storyClueId ?? area.id))
  }

  const sectCandidates = area.unlockRules?.sectIds ?? area.sects ?? []
  const sectId = hasValue(
    [...unlockedSectIds, ...(input.joinedSectId ? [input.joinedSectId] : [])],
    sectCandidates
  )
  if (sectId) {
    sources.push(createSource('sect', area, sectId))
  }

  sources.sort((left, right) => SOURCE_PRIORITY.indexOf(left.kind) - SOURCE_PRIORITY.indexOf(right.kind))
  const primarySource = sources[0] ?? null
  return {
    unlocked: sources.length > 0,
    sources,
    primarySource,
    reason: primarySource?.reason ?? `尚未找到前往${area.name}的有效路径。`
  }
}

export function isMapAreaUnlocked(input: MapAreaUnlockInput): boolean {
  return resolveMapAreaUnlock(input).unlocked
}
