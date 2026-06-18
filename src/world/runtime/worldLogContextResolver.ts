import type { NpcDefinition, NpcRuntimeState, NpcStoryRecord, WorldLogEntry } from '@/types/world'
import { getAreaById } from '@/types/map'
import { getSectById } from '@/types/sect'

export interface WorldLogContextBadge {
  label: string
  tone: 'area' | 'sect' | 'actor' | 'tag'
}

export interface WorldLogContextView<T extends WorldLogEntry | NpcStoryRecord> {
  entry: T
  areaName: string | null
  sectNames: string[]
  actorNames: string[]
  badges: WorldLogContextBadge[]
  contextLabel: string
}

interface WorldLogContextCatalog {
  npcDefinitions: NpcDefinition[]
  npcStates?: NpcRuntimeState[]
}

const tagLabels: Record<string, string> = {
  adventure: '游历',
  anomaly: '异动',
  breakthrough: '破境',
  captured: '被俘',
  captivity: '俘虏',
  challenge: '斗法',
  cultivation: '修炼',
  escape: '脱困',
  injured: '负伤',
  lineage: '血脉',
  npc: '人物',
  player: '主角',
  relationship: '关系',
  rescued: '营救',
  scheme: '谋算',
  sect: '宗门',
  story: '剧情',
  war: '战争',
  weather: '天象',
  world: '天下'
}

const genericTags = new Set(['npc', 'player', 'world'])

export function resolveWorldLogContextView(
  log: WorldLogEntry,
  catalog: WorldLogContextCatalog
): WorldLogContextView<WorldLogEntry> {
  const actorNames = resolveActorNames(log.actorIds, catalog.npcDefinitions)
  const sectNames = resolveSectNames(log.actorIds, log.mapId, catalog)
  return createContextView(log, log.mapId, actorNames, sectNames, log.tags)
}

export function resolveNpcStoryContextView(
  story: NpcStoryRecord,
  catalog: WorldLogContextCatalog
): WorldLogContextView<NpcStoryRecord> {
  const actorNames = resolveActorNames([story.npcId], catalog.npcDefinitions)
  const sectNames = resolveSectNames([story.npcId], story.mapId, catalog)
  return createContextView(story, story.mapId, actorNames, sectNames, story.tags)
}

function createContextView<T extends WorldLogEntry | NpcStoryRecord>(
  entry: T,
  mapId: string | undefined,
  actorNames: string[],
  sectNames: string[],
  tags: string[]
): WorldLogContextView<T> {
  const areaName = mapId ? getAreaById(mapId)?.name ?? mapId : null
  const badges: WorldLogContextBadge[] = []

  if (areaName) badges.push({ label: areaName, tone: 'area' })
  for (const sectName of sectNames.slice(0, 2)) {
    badges.push({ label: sectName, tone: 'sect' })
  }
  for (const actorName of actorNames.slice(0, 2)) {
    badges.push({ label: actorName, tone: 'actor' })
  }
  for (const tag of resolveTagLabels(tags).slice(0, 2)) {
    badges.push({ label: tag, tone: 'tag' })
  }

  return {
    entry,
    areaName,
    sectNames,
    actorNames,
    badges: dedupeBadges(badges).slice(0, 5),
    contextLabel: createContextLabel(areaName, sectNames, actorNames)
  }
}

function resolveActorNames(actorIds: string[], npcDefinitions: NpcDefinition[]) {
  return uniqueStrings(actorIds.map(actorId => {
    if (actorId === 'player') return '主角'
    return npcDefinitions.find(definition => definition.id === actorId)?.name ?? actorId
  }))
}

function resolveSectNames(
  actorIds: string[],
  mapId: string | undefined,
  catalog: WorldLogContextCatalog
) {
  const actorSectIds = actorIds
    .map(actorId => catalog.npcDefinitions.find(definition => definition.id === actorId)?.sectId)
    .filter((sectId): sectId is string => Boolean(sectId))

  const areaSectIds = mapId ? getAreaById(mapId)?.sects ?? [] : []
  return uniqueStrings([...actorSectIds, ...areaSectIds])
    .map(sectId => getSectById(sectId)?.name ?? sectId)
}

function createContextLabel(areaName: string | null, sectNames: string[], actorNames: string[]) {
  const parts = [
    areaName,
    sectNames[0],
    actorNames.length ? actorNames.slice(0, 2).join('、') : null
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : '天下'
}

function labelTag(tag: string) {
  return tagLabels[tag] ?? null
}

function resolveTagLabels(tags: string[]) {
  return uniqueStrings([...tags].sort((a, b) => Number(genericTags.has(a)) - Number(genericTags.has(b)))
    .map(labelTag)
    .filter((label): label is string => Boolean(label)))
}

function dedupeBadges(badges: WorldLogContextBadge[]) {
  const seen = new Set<string>()
  return badges.filter(badge => {
    const key = `${badge.tone}:${badge.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}
