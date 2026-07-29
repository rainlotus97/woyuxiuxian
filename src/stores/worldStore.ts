import { defineStore } from 'pinia'
import { computed, ref, toRaw, watchEffect } from 'vue'
import type {
  IdleMode,
  NpcDefinition,
  NpcRuntimeState,
  NpcStoryRecord,
  PlayerJourneyEntry,
  RelationshipState,
  WorldAreaAnomaly,
  WorldClock,
  WorldLogEntry,
  WorldWeather
} from '@/types/world'
import { formatWorldTime } from '@/types/world'
import { resolveNpcAction } from '@/world/runtime/npcActionResolver'
import {
  mergeNpcRelationshipNetwork,
  pickNpcInteractionTarget
} from '@/world/runtime/npcRelationshipNetwork'
import { resolveNpcSocialAction } from '@/world/runtime/npcSocialActionResolver'
import {
  applyRelationshipDeltaToState,
  createDefaultRelationshipState
} from '@/world/runtime/relationshipState'
import {
  formatNpcNotoriety,
  getBondLabel as getNpcBondLabel,
  getDestinyRankLabel,
  getBloodlineGradeLabel,
  getConstitutionLabel,
  getFactionStanceLabel,
  getNpcGrowthFlawSummary,
  getNpcLineageSummary,
  getNpcPotentialScore,
  getNpcRootLabel,
  getNpcSpotlightScore,
  getOriginTypeLabel,
  getRootGradeLabel,
  getTalentGradeLabel,
  getNpcTemperamentSummary,
  normalizeNpcDefinitionProfile
} from '@/world/runtime/npcProfile'
import {
  createDefaultNpcDefinitions,
  createDefaultUnlockedNpcIds,
  createNpcRuntimeStates
} from '@/world/runtime/npcRoster'
import { resolveWarAftermath } from '@/world/runtime/warAftermathResolver'
import { seededWorldRoll } from '@/world/runtime/worldSeed'
import {
  getPlayerCaptivityForecast,
  resolvePlayerCaptivityEscape,
  resolvePlayerCaptivityTick
} from '@/world/runtime/playerCaptivityResolver'
import { resolvePlayerJourney, resolvePlayerTravel } from '@/world/runtime/playerJourneyResolver'
import { toSkillProgressInput } from '@/character/runtime/characterSkillProgressResolver'
import { ALL_AREAS, getAreaById } from '@/types/map'
import { resolveMapAreaUnlock, type MapAreaUnlockResult } from '@/map/runtime/mapAreaUnlockResolver'
import { getSectById } from '@/types/sect'
import type {
  WorldRuntimeAftermathResult,
  WorldRuntimeLogEffect,
  WorldRuntimeNpcPatch,
  WorldRuntimeRelationshipDelta
} from '@/world/runtime/worldRuntimeTypes'
import type {
  WorldEffect,
  WorldEffectSource,
  WorldEffectTransaction,
  WorldJournalEntry,
  WorldNotification,
  WorldTickResult,
  WorldUnlock
} from '@/types/worldEvent'
import { worldEventBus } from '@/world/runtime/worldEventBus'
import { usePlayerStore } from './playerStore'
import { usePetStore } from './petStore'
import { useMapStore } from './mapStore'
import { useSectStore } from './sectStore'
import {
  createAreaAnomaly,
  createNpcStoryRecord,
  createPlayerJourney,
  resolveWorldDisasterTrigger
} from '@/world/runtime/worldNarrativeResolver'
import {
  createWorldLogEntry,
  getVisibleWorldLogs,
  insertWorldLog,
  normalizeWorldLogs
} from '@/world/runtime/worldLogResolver'
import {
  resolveNpcStoryContextView,
  resolveWorldLogContextView
} from '@/world/runtime/worldLogContextResolver'
import {
  resolveNpcCompanionCandidates,
  resolveNpcPlayerInteraction,
  type NpcInteractionKind
} from '@/world/runtime/npcCompanionResolver'

interface WorldState {
  clock: WorldClock
  idleMode: IdleMode
  weather: WorldWeather
  npcDefinitions: NpcDefinition[]
  npcStates: NpcRuntimeState[]
  logs: WorldLogEntry[]
  playerJourneys: PlayerJourneyEntry[]
  npcStories: NpcStoryRecord[]
  areaAnomalies: WorldAreaAnomaly[]
  unlockedNpcIds: string[]
  worldFlags: string[]
  effectTransactions: WorldEffectTransaction[]
  playerAreaId: string | null
}

interface WorldUnlockSnapshot {
  realms: Set<string>
  areas: Set<string>
  playerAreas: Set<string>
  sects: Set<string>
  npcs: Set<string>
}

function normalizeLoadedPlayerJourneys(journeys: PlayerJourneyEntry[]) {
  return journeys.map(entry => {
    if (entry.title !== '修炼顿悟') return entry
    const cultivationReward = entry.rewards.find(reward => reward.type === 'cultivation')
    const rewardValue = typeof cultivationReward?.value === 'number' ? cultivationReward.value : null
    if (rewardValue === null || rewardValue <= 120) return entry

    const normalizedValue = Math.max(12, Math.min(72, Math.round(rewardValue * 0.28)))
    return {
      ...entry,
      text: entry.text.replace(/额外凝聚了\d+点修为/u, `顺手补上了${normalizedValue}点修为`),
      rewards: entry.rewards.map(reward => reward.type === 'cultivation'
        ? { ...reward, value: normalizedValue }
        : reward)
    }
  })
}

const STORAGE_KEY = 'woyu-xiuxian-world'
const TICK_MS = 10 * 60 * 1000
const MAX_OFFLINE_TICKS = 144

function createDefaultClock(): WorldClock {
  return {
    year: 1,
    month: 1,
    day: 1,
    shichenIndex: 4,
    totalTicks: 0,
    lastSimulatedAt: Date.now()
  }
}

function createNpcDefinitions(): NpcDefinition[] {
  return createDefaultNpcDefinitions()
}

function createNpcStates(definitions: NpcDefinition[]): NpcRuntimeState[] {
  return mergeNpcRelationshipNetwork(definitions, createNpcRuntimeStates(definitions))
}

function getDefaultWorldState(): WorldState {
  const npcDefinitions = createNpcDefinitions()
  return {
    clock: createDefaultClock(),
    idleMode: 'cultivate',
    weather: 'clear',
    npcDefinitions,
    npcStates: createNpcStates(npcDefinitions),
    logs: [],
    playerJourneys: [],
    npcStories: [],
    areaAnomalies: [],
    unlockedNpcIds: createDefaultUnlockedNpcIds(npcDefinitions),
    worldFlags: [],
    effectTransactions: [],
    playerAreaId: null
  }
}

function mergeNpcDefinitionsWithDefaults(definitions: NpcDefinition[] | undefined, defaults: NpcDefinition[]) {
  if (!definitions?.length) return defaults.map(normalizeNpcDefinitionProfile)

  return defaults.map(defaultDefinition => {
    const existing = definitions.find(item => item.id === defaultDefinition.id)
    if (!existing) return normalizeNpcDefinitionProfile(defaultDefinition)

    return normalizeNpcDefinitionProfile({
      ...defaultDefinition,
      ...existing,
      aptitude: { ...defaultDefinition.aptitude, ...existing.aptitude },
      personality: { ...defaultDefinition.personality, ...existing.personality },
      profile: { ...defaultDefinition.profile, ...existing.profile }
    })
  })
}

export const useWorldStore = defineStore('world', () => {
  let initialData: WorldState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<WorldState>
      const defaults = getDefaultWorldState()
      const mergedNpcDefinitions = mergeNpcDefinitionsWithDefaults(parsed.npcDefinitions, defaults.npcDefinitions)
      initialData = {
        ...defaults,
        ...parsed,
        clock: { ...defaults.clock, ...parsed.clock },
        npcDefinitions: mergedNpcDefinitions,
        npcStates: mergeNpcRelationshipNetwork(
          mergedNpcDefinitions,
          parsed.npcStates?.length ? parsed.npcStates : defaults.npcStates
        ),
        logs: normalizeWorldLogs(parsed.logs ?? defaults.logs),
        playerJourneys: normalizeLoadedPlayerJourneys(parsed.playerJourneys ?? defaults.playerJourneys),
        npcStories: parsed.npcStories ?? defaults.npcStories,
        areaAnomalies: parsed.areaAnomalies ?? defaults.areaAnomalies,
        unlockedNpcIds: parsed.unlockedNpcIds ?? defaults.unlockedNpcIds,
        worldFlags: parsed.worldFlags ?? defaults.worldFlags,
        effectTransactions: Array.isArray(parsed.effectTransactions)
          ? parsed.effectTransactions
          : defaults.effectTransactions,
        playerAreaId: typeof parsed.playerAreaId === 'string' ? parsed.playerAreaId : defaults.playerAreaId
      }
    } else {
      initialData = getDefaultWorldState()
    }
  } catch (error) {
    console.warn('Failed to load world data, using defaults:', error)
    initialData = getDefaultWorldState()
  }

  const clock = ref<WorldClock>({ ...initialData.clock })
  const idleMode = ref<IdleMode>(initialData.idleMode)
  const weather = ref<WorldWeather>(initialData.weather)
  const npcDefinitions = ref<NpcDefinition[]>([...initialData.npcDefinitions])
  const npcStates = ref<NpcRuntimeState[]>([...initialData.npcStates])
  const logs = ref<WorldLogEntry[]>(normalizeWorldLogs(initialData.logs))
  const playerJourneys = ref<PlayerJourneyEntry[]>(normalizeLoadedPlayerJourneys([...initialData.playerJourneys]))
  const npcStories = ref<NpcStoryRecord[]>([...initialData.npcStories])
  const areaAnomalies = ref<WorldAreaAnomaly[]>([...initialData.areaAnomalies])
  const unlockedNpcIds = ref<string[]>([...initialData.unlockedNpcIds])
  const worldFlags = ref<string[]>([...initialData.worldFlags])
  const effectTransactions = ref<WorldEffectTransaction[]>([...initialData.effectTransactions])
  const playerAreaId = ref<string | null>(initialData.playerAreaId)
  const worldNotifications = ref<WorldNotification[]>([])
  const lastWorldTickResult = ref<WorldTickResult | null>(null)
  let observedUnlockState: WorldUnlockSnapshot | null = null

  const currentTimeLabel = computed(() => formatWorldTime(clock.value))
  const visibleLogs = computed(() => getVisibleWorldLogs(logs.value, 12))
  const recentPlayerJourneys = computed(() => playerJourneys.value.slice(0, 6))
  const recentEffectTransactions = computed(() => effectTransactions.value.slice(0, 12))
  const importantNpcStories = computed(() => npcStories.value.slice(0, 6))
  const visibleLogViews = computed(() => visibleLogs.value.map(log => resolveWorldLogContextView(log, {
    npcDefinitions: npcDefinitions.value,
    npcStates: npcStates.value
  })))
  const importantNpcStoryViews = computed(() => importantNpcStories.value.map(story => resolveNpcStoryContextView(story, {
    npcDefinitions: npcDefinitions.value,
    npcStates: npcStates.value
  })))
  const activeAreaAnomalies = computed(() => areaAnomalies.value.slice(0, 6))
  const unlockedNpcDefinitions = computed(() => npcDefinitions.value.filter(definition => unlockedNpcIds.value.includes(definition.id)))
  const npcCompanionCandidates = computed(() => resolveNpcCompanionCandidates({
    definitions: npcDefinitions.value,
    states: npcStates.value,
    unlockedNpcIds: unlockedNpcIds.value,
    getRelationship: getRelationshipState,
    getLocationName: getAreaLabel
  }))
  const importantNpcStates = computed(() => {
    return npcStates.value
      .map(state => {
        const definition = npcDefinitions.value.find(def => def.id === state.id)
        if (!definition) return null
        const relationship = getRelationshipState(state.id)
        const unlocked = unlockedNpcIds.value.includes(state.id)
        return {
          state,
          definition,
          relationship,
          spotlightScore: getNpcSpotlightScore(definition, state, relationship, unlocked)
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.spotlightScore - a.spotlightScore)
  })
  const lastCaptivityEscapeTick = ref<number | null>(null)

  function saveToStorage() {
    const data: WorldState = {
      clock: toRaw(clock.value),
      idleMode: idleMode.value,
      weather: weather.value,
      npcDefinitions: toRaw(npcDefinitions.value),
      npcStates: toRaw(npcStates.value),
      logs: toRaw(logs.value),
      playerJourneys: toRaw(playerJourneys.value),
      npcStories: toRaw(npcStories.value),
      areaAnomalies: toRaw(areaAnomalies.value),
      unlockedNpcIds: toRaw(unlockedNpcIds.value),
      worldFlags: toRaw(worldFlags.value),
      effectTransactions: toRaw(effectTransactions.value),
      playerAreaId: playerAreaId.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function setIdleMode(mode: IdleMode) {
    idleMode.value = mode
    addLog('player', 'normal', '行程更改', `你将接下来的行动调整为${getIdleModeLabel(mode)}。`, ['player'], ['idle'])
  }

  function simulateOffline() {
    const elapsed = Date.now() - clock.value.lastSimulatedAt
    const ticks = Math.min(MAX_OFFLINE_TICKS, Math.floor(elapsed / TICK_MS))
    if (ticks <= 0) return 0
    for (let i = 0; i < ticks; i++) {
      advanceTick(false, false)
    }
    clock.value.lastSimulatedAt = Date.now()
    if (ticks >= 3) {
      addLog('world', 'major', '离线结算', `你闭关期间，天地自行流转了${ticks}个时辰。`, [], ['offline'])
    }
    return ticks
  }

  function advanceTick(updateTimestamp = true, publishResult = true): WorldTickResult {
    const mapStore = useMapStore()
    const sectStore = useSectStore()
    const playerStore = usePlayerStore()
    const previousWeather = weather.value
    const previousLogIds = new Set(logs.value.map(log => log.id))
    const previousUnlockState = observedUnlockState ?? readWorldUnlockSnapshot(mapStore, sectStore, playerStore)
    advanceClock(updateTimestamp)
    const weatherChange = resolveWeather()
    resolveWorldSystems()
    resolvePlayerAction()
    resolveNpcActions()
    resolveNarrativeWorldPulse()

    const unlocks = resolveNewWorldUnlocks(previousUnlockState)
    for (const unlock of unlocks) {
      addLog(
        'world',
        'major',
        unlock.title,
        unlock.reason,
        unlock.kind === 'npc' ? [unlock.targetId] : [],
        ['unlock', `unlock-${unlock.kind}`],
        unlock.kind === 'area' ? unlock.targetId : undefined
      )
    }

    const newLogs = logs.value.filter(log => !previousLogIds.has(log.id))
    const journals: WorldJournalEntry[] = newLogs.map(log => createWorldJournalEntry(log, weatherChange.effects))
    const transactions = journals
      .filter(journal => journal.effects.length > 0)
      .map(journal => persistEffectTransaction(createTransactionFromJournal(journal)))
    const unlockNotifications: WorldNotification[] = unlocks.map(unlock => ({
      id: `notice-${unlock.id}`,
      kind: 'unlock',
      title: unlock.title,
      message: `${unlock.reason} 来源：${unlock.source.label}「${unlock.source.id}」。`,
      severity: 'major',
      sourceEventId: unlock.sourceEventId,
      source: unlock.source,
      createdAtTick: clock.value.totalTicks,
      read: false,
      route: unlock.route
    }))
    const logNotifications = newLogs
      .filter(log => log.severity !== 'minor' || log.tags.some(tag => ['weather', 'unlock', 'story', 'anomaly'].includes(tag)))
      .filter(log => !log.tags.includes('unlock'))
      .slice(0, 8)
      .map(log => ({
        id: `notice-${log.id}`,
        kind: log.scope === 'weather'
          ? 'weather' as const
          : log.tags.includes('unlock') || log.tags.includes('unlock-npc')
            ? 'unlock' as const
            : log.scope === 'npc'
              ? 'story' as const
              : 'encounter' as const,
        title: log.title,
        message: log.text,
        severity: log.severity,
        sourceEventId: log.id,
        createdAtTick: log.tick,
        read: false
      }))
    const notifications = [...unlockNotifications, ...logNotifications].slice(0, 8)
    const result: WorldTickResult = {
      tickId: `world-tick-${clock.value.totalTicks}-${Date.now()}`,
      tick: clock.value.totalTicks,
      mode: idleMode.value,
      weatherChange: previousWeather !== weather.value
        ? { ...weatherChange, effects: weatherChange.effects }
        : undefined,
      effects: weatherChange.effects,
      transactions,
      journals,
      unlocks,
      notifications
    }
    if (notifications.length) {
      worldNotifications.value = [...notifications, ...worldNotifications.value].slice(0, 24)
    }
    lastWorldTickResult.value = result
    observedUnlockState = readWorldUnlockSnapshot(mapStore, sectStore, playerStore)
    if (publishResult) worldEventBus.publish(result)
    return result
  }

  function travelTo(input: { fromAreaId: string; toAreaId: string }): WorldTickResult {
    const mapStore = useMapStore()
    const playerStore = usePlayerStore()
    const fromArea = getAreaById(input.fromAreaId)
    const toArea = getAreaById(input.toAreaId)
    const fromState = mapStore.getAreaState(input.fromAreaId)
    const toState = mapStore.getAreaState(input.toAreaId)

    playerStore.recoverStamina()
    const resolution = resolvePlayerTravel({
      clock: clock.value,
      weather: weather.value,
      fromAreaId: input.fromAreaId,
      toAreaId: input.toAreaId,
      fromAreaName: fromArea?.name ?? null,
      toAreaName: toArea?.name ?? null,
      routeRisk: fromState?.riskLevel ?? toState?.riskLevel ?? toArea?.defaultRiskLevel ?? fromArea?.defaultRiskLevel,
      hasAnomaly: areaAnomalies.value.some(anomaly => anomaly.areaId === input.fromAreaId || anomaly.areaId === input.toAreaId),
      stamina: playerStore.stamina
    })

    if (resolution.travel.status !== 'blocked' && resolution.travel.staminaSpent > 0) {
      playerStore.consumeStamina(resolution.travel.staminaSpent)
    }

    if (resolution.travel.status !== 'blocked' && resolution.travel.ticksSpent > 0) {
      for (let index = 0; index < resolution.travel.ticksSpent; index++) {
        advanceClock(index === resolution.travel.ticksSpent - 1)
      }
    }

    if (resolution.travel.status === 'arrived') {
      playerAreaId.value = resolution.travel.destinationId
    }

    recordPlayerJourney(
      resolution.journey.severity,
      resolution.journey.title,
      resolution.journey.text,
      resolution.journey.rewards,
      resolution.journey.areaId,
      resolution.journey.tags
    )

    const log = logs.value.find(entry => (
      entry.tick === clock.value.totalTicks
      && entry.title === resolution.journey.title
      && entry.text === resolution.journey.text
    ))
    const journal = log
      ? {
          ...createWorldJournalEntry(log, []),
          effects: [...resolution.travel.effects],
          tags: [...new Set([...log.tags, 'travel'])]
        }
      : null
    const transaction = journal
      ? persistEffectTransaction({
          ...createTransactionFromJournal(journal),
          source: 'travel',
          sourceId: `travel:${input.fromAreaId}:${input.toAreaId}:${clock.value.totalTicks}`,
          effects: journal.effects
        })
      : null
    const notifications: WorldNotification[] = resolution.travel.interruption
      ? [{
          id: `notice-${resolution.travel.interruption.id}`,
          kind: 'encounter',
          title: resolution.travel.interruption.title,
          message: resolution.travel.interruption.text,
          severity: resolution.travel.interruption.severity,
          sourceEventId: resolution.travel.interruption.id,
          createdAtTick: clock.value.totalTicks,
          read: false
        }]
      : []
    const result: WorldTickResult = {
      tickId: `travel-${clock.value.totalTicks}-${Date.now()}`,
      tick: clock.value.totalTicks,
      mode: idleMode.value,
      travel: resolution.travel,
      effects: [...resolution.travel.effects],
      transactions: transaction ? [transaction] : [],
      journals: journal ? [journal] : [],
      unlocks: [],
      notifications
    }
    if (notifications.length) {
      worldNotifications.value = [...notifications, ...worldNotifications.value].slice(0, 24)
    }
    lastWorldTickResult.value = result
    worldEventBus.publish(result)
    saveToStorage()
    return result
  }

  function readWorldUnlockSnapshot(
    mapStore = useMapStore(),
    sectStore = useSectStore(),
    playerStore = usePlayerStore()
  ): WorldUnlockSnapshot {
    const areaUnlocks = resolveWorldAreaUnlocks(mapStore, sectStore, playerStore)
    return {
      realms: new Set<string>(mapStore.unlockedRealms),
      areas: new Set<string>([
        ...mapStore.conqueredAreas,
        ...[...areaUnlocks.entries()].filter(([, result]) => result.unlocked).map(([areaId]) => areaId)
      ]),
      playerAreas: new Set<string>(playerStore.areaProgress.filter(progress => progress.unlocked).map(progress => progress.areaId)),
      sects: new Set<string>(sectStore.unlockedSects),
      npcs: new Set<string>(unlockedNpcIds.value)
    }
  }

  function resolveWorldAreaUnlocks(
    mapStore = useMapStore(),
    sectStore = useSectStore(),
    playerStore = usePlayerStore()
  ): Map<string, MapAreaUnlockResult> {
    const knownAreaIds = new Set<string>(mapStore.conqueredAreas)
    playerStore.areaProgress
      .filter(progress => progress.unlocked && ALL_AREAS.some(area => area.id === progress.areaId))
      .forEach(progress => knownAreaIds.add(progress.areaId))

    const eventIds = logs.value
      .filter(log => log.mapId && (log.tags.includes('unlock') || log.tags.includes('area-unlock') || log.tags.includes('event')))
      .map(log => log.id)
    const storyNodeIds = worldFlags.value
      .filter(flag => flag.startsWith('story_node:'))
      .map(flag => flag.slice('story_node:'.length))
    const storyClueIds = worldFlags.value
      .filter(flag => flag.startsWith('story_map_unlock:'))
      .map(flag => flag.slice('story_map_unlock:'.length))
    const results = new Map<string, MapAreaUnlockResult>()

    for (const area of ALL_AREAS) {
      results.set(area.id, resolveMapAreaUnlock({
        area,
        playerRealm: playerStore.realm,
        playerRealmLevel: playerStore.realmLevel,
        conqueredAreaIds: mapStore.conqueredAreas,
        knownAreaIds: [...knownAreaIds],
        eventIds,
        worldFlags: worldFlags.value,
        completedStoryNodeIds: storyNodeIds,
        storyClueIds,
        unlockedSectIds: sectStore.unlockedSects,
        joinedSectId: sectStore.joinedSectId
      }))
    }

    return results
  }

  function createWorldJournalEntry(log: WorldLogEntry, weatherEffects: WorldEffect[]): WorldJournalEntry {
    return {
      id: log.id,
      tick: log.tick,
      actorIds: log.actorIds,
      locationId: log.mapId,
      type: resolveJournalType(log),
      severity: log.severity,
      title: log.title,
      summary: log.text,
      effects: resolveJournalEffects(log, weatherEffects),
      tags: log.tags
    }
  }

  function resolveJournalType(log: WorldLogEntry): WorldJournalEntry['type'] {
    if (log.scope === 'weather') return 'weather'
    if (log.scope === 'npc') return 'story'
    if (log.scope === 'sect') return 'sect'
    if (log.tags.includes('battle')) return 'battle'
    if (log.tags.includes('travel')) return 'travel'
    if (log.tags.includes('unlock')) return 'unlock'
    return 'cultivation'
  }

  function resolveNewWorldUnlocks(previous: WorldUnlockSnapshot): WorldUnlock[] {
    const mapStore = useMapStore()
    const sectStore = useSectStore()
    const playerStore = usePlayerStore()
    const areaUnlocks = resolveWorldAreaUnlocks(mapStore, sectStore, playerStore)
    const sourcePrefix = `world-tick-${clock.value.totalTicks}`
    const unlocks: WorldUnlock[] = []
    const seen = new Set<string>()

    const pushUnlock = (unlock: Omit<WorldUnlock, 'id' | 'sourceEventId' | 'source'> & { source?: WorldUnlock['source'] }) => {
      if (seen.has(`${unlock.kind}:${unlock.targetId}`)) return
      seen.add(`${unlock.kind}:${unlock.targetId}`)
      const source = unlock.source ?? {
        kind: unlock.kind === 'sect' ? 'sect' as const : 'event' as const,
        id: unlock.targetId,
        label: unlock.kind === 'sect' ? '宗门势力' : '世界事件',
        reason: unlock.reason
      }
      unlocks.push({
        ...unlock,
        source,
        id: `${sourcePrefix}-${unlock.kind}-${unlock.targetId}`,
        sourceEventId: `${sourcePrefix}-${unlock.kind}-${unlock.targetId}`
      })
    }

    for (const realm of mapStore.unlockedRealms) {
      if (previous.realms.has(realm)) continue
      pushUnlock({
        kind: 'area',
        targetId: realm,
        title: `解锁${realm}界域`,
        reason: `你的境界与经历已经达到条件，${realm}的区域与宗门开始对你开放。`,
        source: {
          kind: 'realm',
          id: realm,
          label: '境界门槛',
          reason: `${realm}界域的境界门槛已满足。`
        },
        route: '/game/map'
      })
    }

    for (const [areaId, unlockResult] of areaUnlocks) {
      if (!unlockResult.unlocked || previous.areas.has(areaId) || previous.playerAreas.has(areaId)) continue
      const area = getAreaById(areaId)
      const source = unlockResult.primarySource
      if (!area || !source) continue
      pushUnlock({
        kind: 'area',
        targetId: area.id,
        title: `开放${area.name}`,
        reason: `${area.name}已纳入你的行程。${source.reason}`,
        source,
        route: '/game/map'
      })
    }

    for (const sectId of sectStore.unlockedSects) {
      if (previous.sects.has(sectId)) continue
      const sect = getSectById(sectId)
      if (!sect) continue
      pushUnlock({
        kind: 'sect',
        targetId: sect.id,
        title: `发现宗门：${sect.name}`,
        reason: `${sect.name}的山门与修行体系已进入你的世界记录，之后可以前往查看入门条件。`,
        source: {
          kind: 'conquest',
          id: sect.areaId,
          label: '征服记录',
          reason: `宗门所在区域${sect.areaId}已进入你的征服记录。`
        },
        route: '/game/sect'
      })
    }

    for (const npcId of unlockedNpcIds.value) {
      if (previous.npcs.has(npcId)) continue
      const definition = npcDefinitions.value.find(item => item.id === npcId)
      if (!definition) continue
      pushUnlock({
        kind: 'npc',
        targetId: npcId,
        title: `人物入命：${definition.name}`,
        reason: `${definition.name}正式进入你的命运轨迹，后续行动会留下可回看的经历。`,
        source: {
          kind: 'story',
          id: npcId,
          label: '主线节点',
          reason: `${definition.name}已经被故事与世界事件带入你的命运轨迹。`
        },
        route: '/game/companion'
      })
    }

    return unlocks
  }

  function resolveJournalEffects(log: WorldLogEntry, weatherEffects: WorldEffect[]): WorldEffect[] {
    if (log.scope === 'weather') return weatherEffects
    const journey = playerJourneys.value.find(entry => (
      entry.tick === log.tick && entry.title === log.title && entry.text === log.text
    ))
    if (!journey) return []
    return journey.rewards.map(reward => {
      if (reward.type === 'cultivation') return { type: 'cultivation' as const, value: reward.value, label: reward.label, reason: log.title }
      if (reward.type === 'gold') return { type: 'gold' as const, value: reward.value, label: reward.label, reason: log.title }
      if (reward.type === 'item') return { type: 'item' as const, value: reward.value, label: reward.label, reason: log.title }
      if (reward.type === 'skill_exp') return { type: 'skill' as const, value: reward.value, label: reward.label, reason: log.title }
      if (reward.type === 'contribution' || reward.type === 'reputation') return { type: 'sect' as const, value: reward.value, label: reward.label, reason: log.title }
      if (reward.type === 'flag') return { type: 'flag' as const, value: reward.value, label: reward.label, reason: log.title }
      return { type: 'relationship' as const, value: reward.value, label: reward.label, reason: log.title }
    })
  }

  function resolveEffectSource(tags: string[]): WorldEffectSource {
    if (tags.includes('battle')) return 'battle'
    if (tags.includes('story-choice') || tags.includes('story')) return 'story_choice'
    if (tags.includes('encounter') || tags.includes('story-encounter')) return 'random_event'
    if (tags.includes('travel')) return 'travel'
    if (tags.includes('sect')) return 'sect'
    if (tags.includes('map') || tags.includes('explore')) return 'map'
    if (tags.includes('npc') || tags.includes('relationship')) return 'npc'
    if (tags.includes('weather')) return 'weather'
    if (tags.includes('idle') || tags.includes('cultivation')) return 'idle'
    return 'manual'
  }

  function createTransactionFromJournal(journal: WorldJournalEntry): Omit<WorldEffectTransaction, 'id'> {
    const effects = journal.effects.length > 0
      ? journal.effects
      : [{
          type: 'outcome' as const,
          targetId: journal.id,
          value: journal.title,
          label: '结果',
          reason: journal.summary
        }]
    return {
      tick: journal.tick,
      timeLabel: currentTimeLabel.value,
      source: resolveEffectSource(journal.tags),
      sourceId: journal.id,
      title: journal.title,
      summary: journal.summary,
      actorIds: [...journal.actorIds],
      locationId: journal.locationId,
      effects,
      tags: [...journal.tags, 'effect-transaction']
    }
  }

  function persistEffectTransaction(input: Omit<WorldEffectTransaction, 'id'>): WorldEffectTransaction {
    const transaction: WorldEffectTransaction = {
      ...input,
      id: `effect-${input.tick}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    }
    effectTransactions.value.unshift(transaction)
    if (effectTransactions.value.length > 120) {
      effectTransactions.value = effectTransactions.value.slice(0, 120)
    }
    return transaction
  }

  function recordWorldEffectTransaction(input: {
    source: WorldEffectSource
    sourceId?: string
    title: string
    summary: string
    effects: WorldEffect[]
    actorIds?: string[]
    locationId?: string
    tags?: string[]
  }) {
    const transaction = persistEffectTransaction({
      tick: clock.value.totalTicks,
      timeLabel: currentTimeLabel.value,
      source: input.source,
      sourceId: input.sourceId ?? `tick-${clock.value.totalTicks}`,
      title: input.title,
      summary: input.summary,
      actorIds: input.actorIds ?? ['player'],
      locationId: input.locationId,
      effects: input.effects.length > 0
        ? input.effects
        : [{ type: 'outcome', value: input.title, label: '结果', reason: input.summary }],
      tags: [...new Set([...(input.tags ?? []), 'effect-transaction'])]
    })
    saveToStorage()
    worldEventBus.emit('world:effect-transaction', transaction)
    return transaction
  }

  function resolveWorldSystems() {
    const mapStore = useMapStore()
    const sectStore = useSectStore()
    mapStore.syncCalendarFromWorldClock(clock.value)
    const sectUpdate = sectStore.updateWorldState(clock.value.totalTicks)
    const mapUpdate = mapStore.updateAreaWorldState(clock.value.totalTicks, weather.value, sectUpdate.warResolution)
    if (mapUpdate.ownershipChanges.length > 0) {
      for (const change of mapUpdate.ownershipChanges) {
        if (!change.worldLog) continue
        addLog(
          change.worldLog.scope,
          change.worldLog.severity,
          change.worldLog.title,
          change.worldLog.text,
          change.worldLog.actorIds,
          change.worldLog.tags,
          change.worldLog.mapId
        )
      }
    }
    if (sectUpdate.warResolution) {
      const aftermath = resolveWarAftermath({
        totalTicks: clock.value.totalTicks,
        warResolution: sectUpdate.warResolution,
        joinedSectId: sectStore.joinedSectId,
        npcDefinitions: npcDefinitions.value,
        npcStates: npcStates.value
      })
      applyWarAftermath(aftermath)
    }
  }

  function resolveNarrativeWorldPulse() {
    const mapStore = useMapStore()
    const anomaly = resolveWorldDisasterTrigger({
      clock: clock.value,
      weather: weather.value,
      areaStates: mapStore.areaStates
    })

    if (!anomaly) return

    const area = getAreaById(anomaly.areaId)
    if (!area) return

    const runtimeAnomaly = createAreaAnomaly(clock.value, area, anomaly)
    areaAnomalies.value.unshift(runtimeAnomaly)
    if (areaAnomalies.value.length > 40) {
      areaAnomalies.value = areaAnomalies.value.slice(0, 40)
    }

    mapStore.upsertAreaState(area.id, {
      stability: Math.max(12, (mapStore.getAreaState(area.id)?.stability ?? 50) + anomaly.stabilityDelta),
      pressure: Math.max(0, (mapStore.getAreaState(area.id)?.pressure ?? 20) + anomaly.pressureDelta),
      lastUpdatedTick: clock.value.totalTicks
    })

    addLog(
      'world',
      runtimeAnomaly.severity,
      runtimeAnomaly.title,
      runtimeAnomaly.text,
      [],
      ['world', 'anomaly', runtimeAnomaly.type],
      runtimeAnomaly.areaId
    )
  }

  function advanceClock(updateTimestamp: boolean) {
    clock.value.totalTicks++
    clock.value.shichenIndex++
    if (clock.value.shichenIndex >= 12) {
      clock.value.shichenIndex = 0
      clock.value.day++
    }
    if (clock.value.day > 30) {
      clock.value.day = 1
      clock.value.month++
    }
    if (clock.value.month > 12) {
      clock.value.month = 1
      clock.value.year++
    }
    if (updateTimestamp) {
      clock.value.lastSimulatedAt = Date.now()
    }
  }

  function resolveWeather(): { previous: WorldWeather; current: WorldWeather; effects: WorldEffect[] } {
    const roll = seededWorldRoll(clock.value.totalTicks, clock.value.day, 'weather')
    const previous = weather.value
    if (roll > 0.985) weather.value = 'fire'
    else if (roll > 0.955) weather.value = 'flood'
    else if (roll > 0.9) weather.value = 'storm'
    else if (roll > 0.75) weather.value = 'rain'
    else if (roll < 0.08) weather.value = 'mist'
    else weather.value = 'clear'

    const effects: WorldEffect[] = weather.value === 'rain'
      ? [{ type: 'weather', value: 'rain', label: '灵雨：修炼与药园收益提高' }]
      : weather.value === 'storm'
        ? [{ type: 'weather', value: 'storm', label: '雷暴：雷系技能与雷属性事件增强' }]
        : weather.value === 'flood'
          ? [{ type: 'weather', value: 'flood', label: '洪水：部分路线受阻，水域事件增加' }]
          : weather.value === 'fire'
            ? [{ type: 'weather', value: 'fire', label: '火潮：火系技能与火属性掉落增强' }]
            : weather.value === 'mist'
              ? [{ type: 'weather', value: 'mist', label: '浓雾：赶路更慢，但隐藏奇遇更容易出现' }]
              : []

    if (weather.value !== previous && weather.value !== 'clear') {
      const weatherText: Record<WorldWeather, string> = {
        clear: '天色放晴。',
        rain: '青阳城落下细雨，灵草长势稍旺。',
        storm: '雷雨压城，城外妖兽躁动。',
        flood: '连日暴雨引发山洪，几处村镇断了路。',
        fire: '城南突起大火，疑似修士斗法所致。',
        mist: '雾气遮住山道，适合潜行，也适合埋伏。'
      }
      addLog('weather', weather.value === 'fire' || weather.value === 'flood' ? 'major' : 'normal', '天象变化', weatherText[weather.value], [], ['weather'])
    }
    return { previous, current: weather.value, effects }
  }

  function consumeWorldNotifications() {
    const pending = worldNotifications.value.filter(notification => !notification.read)
    worldNotifications.value = worldNotifications.value.map(notification => ({ ...notification, read: true }))
    return pending
  }

  function resolvePlayerAction() {
    const playerStore = usePlayerStore()
    const petStore = usePetStore()
    const mapStore = useMapStore()
    const sectStore = useSectStore()
    const mode = idleMode.value
    const baseGain = Math.max(1, Math.floor(playerStore.cultivationPerSecond * 18))

    if (playerStore.captivity.isCaptured) {
      const captorName = playerStore.captivity.captorSectId
        ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
        : '敌对势力'
      const shouldRecordCaptivityJourney = Boolean(
        (clock.value.totalTicks - (playerStore.captivity.sinceTick ?? clock.value.totalTicks)) % 4 === 0
      )
      const captivityResult = resolvePlayerCaptivityTick({
        currentTick: clock.value.totalTicks,
        sinceTick: playerStore.captivity.sinceTick,
        captorName,
        realm: playerStore.realm,
        realmLevel: playerStore.realmLevel,
        weather: weather.value,
        sectReputation: sectStore.reputation
      })
      playerStore.addCultivation(captivityResult.cultivationGain)
      if (captivityResult.narrative || shouldRecordCaptivityJourney) {
        recordPlayerJourney(
          captivityResult.narrative?.severity ?? 'normal',
          captivityResult.narrative?.title ?? '囚中运气',
          captivityResult.narrative?.text ?? `你在${captorName}的囚禁中压缩呼吸与灵力流转，勉强维持修行进度。`,
          [{ type: 'cultivation', label: '修为', value: captivityResult.cultivationGain }],
          undefined,
          captivityResult.narrative?.tags ?? ['captivity', 'survival']
        )
      }
      return
    }

    const journey = resolvePlayerJourney({
      clock: clock.value,
      idleMode: mode,
      weather: weather.value,
      baseCultivationGain: baseGain,
      hasEquippedPet: Boolean(petStore.equippedPet),
      petBondEffects: petStore.equippedPet?.bondEffects.journeyEffects ?? null,
      learnedSkills: toSkillProgressInput(playerStore.learnedSkills),
      activeAnomaly: areaAnomalies.value[0] ?? null,
      fallbackAreaId: mapStore.currentRealmAreas[0]?.id ?? null,
      sectHomeAreaId: sectStore.currentSect?.areaId ?? null
    })

    if (journey.cultivationDelta) playerStore.addCultivation(journey.cultivationDelta)
    if (journey.goldDelta) playerStore.addGold(journey.goldDelta)
    for (const delta of journey.skillExpDeltas) {
      playerStore.addSkillExp(delta.skillId, delta.exp)
    }
    for (const item of journey.inventoryItems) {
      playerStore.addToInventory(item)
    }
    if (petStore.equippedPet && journey.petExpDelta) {
      petStore.addPetExp(petStore.equippedPet.owned.definitionId, journey.petExpDelta)
    }
    if (petStore.equippedPet && journey.petIntimacyDelta) {
      petStore.addIntimacy(petStore.equippedPet.owned.definitionId, journey.petIntimacyDelta)
    }
    if (journey.sectContributionDelta) {
      sectStore.addContribution(journey.sectContributionDelta)
    }
    if (journey.sectReputationDelta) {
      sectStore.addReputation(journey.sectReputationDelta)
    }
    for (const entry of journey.journeys) {
      recordPlayerJourney(entry.severity, entry.title, entry.text, entry.rewards, entry.areaId, entry.tags)
    }
  }

  function resolveNpcActions() {
    const playerStore = usePlayerStore()
    const sectStore = useSectStore()
    const engagedNpcIds = new Set<string>()
    const definitionMap = new Map(npcDefinitions.value.map(definition => [definition.id, definition]))
    const playerFocusMapId = getPlayerFocusMapId()
    for (const npc of npcStates.value) {
      const def = npcDefinitions.value.find(item => item.id === npc.id)
      if (!def || npc.hpState === 'dead' || npc.hpState === 'captured') continue
      const playerRelationship = getRelationshipState(npc.id, 'player')
      let result = resolveNpcAction({
        clock: clock.value,
        weather: weather.value,
        npcDefinition: def,
        npcState: npc,
        playerRelationship,
        playerGold: playerStore.gold,
        playerSectId: sectStore.joinedSectId,
        playerFocusMapId,
        idleMode: idleMode.value
      })

      if (!result) {
        const targetState = pickNpcInteractionTarget(
          def,
          npc,
          npc.relationships,
          definitionMap,
          npcStates.value,
          clock.value.totalTicks,
          engagedNpcIds
        )
        if (targetState) {
          const targetDefinition = definitionMap.get(targetState.id)
          const actorRelationship = getRelationshipState(npc.id, targetState.id)
          const targetRelationship = getRelationshipState(targetState.id, npc.id)
          if (targetDefinition) {
            result = resolveNpcSocialAction({
              clock: clock.value,
              weather: weather.value,
              actorDefinition: def,
              actorState: npc,
              actorRelationship,
              targetDefinition,
              targetState,
              targetRelationship
            })
            if (result) {
              engagedNpcIds.add(npc.id)
              engagedNpcIds.add(targetState.id)
            }
          }
        }
      }

      if (!result) continue

      if (result.npcPatch) {
        applyNpcPatch(result.npcPatch)
      }
      if (result.npcPatches?.length) {
        for (const patch of result.npcPatches) {
          applyNpcPatch(patch)
        }
      }
      if (result.relationshipDeltas?.length) {
        applyRelationshipDeltas(result.relationshipDeltas)
      }
      if (result.playerEffect?.cultivationDelta) {
        playerStore.addCultivation(result.playerEffect.cultivationDelta)
      }
      if (result.playerEffect?.goldDelta) {
        playerStore.addGold(result.playerEffect.goldDelta)
      }
      if (result.logs?.length) {
        for (const log of result.logs) {
          addWorldRuntimeLog(log)
          propagateNpcSchemeLog(log)
          if (log.actorIds[0]) {
            appendNpcStory(log.actorIds[0], log.title, log.text, log.severity, log.mapId, log.tags)
          }
        }
      }
    }
  }

  function applyWarAftermath(result: WorldRuntimeAftermathResult | null) {
    if (!result) return
    const playerStore = usePlayerStore()
    const sectStore = useSectStore()
    if (result.npcPatches?.length) {
      for (const patch of result.npcPatches) {
        applyNpcPatch(patch)
      }
    }
    if (result.relationshipDeltas?.length) {
      applyRelationshipDeltas(result.relationshipDeltas)
    }
    if (result.playerCaptivity) {
      playerStore.setCaptivity(result.playerCaptivity.captorSectId, result.playerCaptivity.sinceTick)
      if (result.playerCaptivity.isCaptured) {
        addWorldFlag(
          `player_captured_by:${result.playerCaptivity.captorSectId}`,
          '你成为俘虏',
          '你的行踪已被敌对势力控制，外界对你的命运议论纷纷。'
        )
      }
    }
    if (result.sectCondition && result.sectCondition.sectId === sectStore.joinedSectId) {
      sectStore.applyWorldCondition(result.sectCondition)
    }
    if (result.logs?.length) {
      for (const log of result.logs) {
        addWorldRuntimeLog(log)
      }
    }
  }

  function applyNpcPatch(patch: WorldRuntimeNpcPatch) {
    const npc = npcStates.value.find(item => item.id === patch.id)
    if (!npc) return

    if (patch.currentGoal) npc.currentGoal = patch.currentGoal
    if (patch.hpState) npc.hpState = patch.hpState
    if (patch.locationMapId) npc.locationMapId = patch.locationMapId
    if (typeof patch.lastActionTick === 'number') npc.lastActionTick = patch.lastActionTick
    if (typeof patch.cultivationDelta === 'number') npc.cultivation += patch.cultivationDelta
    if (typeof patch.realmLevelDelta === 'number') {
      npc.realmLevel = Math.max(1, Math.min(9, npc.realmLevel + patch.realmLevelDelta))
    }
    if (typeof patch.notorietyDelta === 'number') {
      npc.notoriety = Math.max(0, Math.min(100, npc.notoriety + patch.notorietyDelta))
    }
    if (patch.addFlags?.length) {
      for (const flag of patch.addFlags) {
        if (!npc.flags.includes(flag)) {
          npc.flags.push(flag)
        }
      }
    }
  }

  function applyRelationshipDeltas(deltas: WorldRuntimeRelationshipDelta[]) {
    for (const delta of deltas) {
      const relationship = getRelationshipState(delta.npcId, delta.subjectId || 'player')
      applyRelationshipDeltaToState(relationship, delta)
    }
  }

  function addWorldRuntimeLog(log: WorldRuntimeLogEffect) {
    addLog(log.scope, log.severity, log.title, log.text, log.actorIds, log.tags, log.mapId)
  }

  function propagateNpcSchemeLog(log: WorldRuntimeLogEffect) {
    if (!log.tags.includes('scheme') || log.actorIds.length < 2) return
    const [actorId, targetId] = log.actorIds
    if (!actorId || !targetId) return

    const actorDefinition = npcDefinitions.value.find(item => item.id === actorId)
    const targetDefinition = npcDefinitions.value.find(item => item.id === targetId)
    if (!actorDefinition || !targetDefinition) return

    const witnessPairs = npcStates.value.map(state => ({
      state,
      definition: npcDefinitions.value.find(item => item.id === state.id)
    })).filter(({ state, definition }) => {
      if (state.id === actorId || state.id === targetId) return false
      if (state.hpState === 'dead' || state.hpState === 'captured') return false
      if (!definition) return false
      return state.locationMapId === log.mapId
        || Boolean(definition.sectId && definition.sectId === targetDefinition.sectId)
        || Boolean(definition.sectId && definition.sectId === actorDefinition.sectId)
    }).slice(0, 4)

    for (const { state, definition } of witnessPairs) {
      if (!definition) continue
      const towardActor = getRelationshipState(state.id, actorId)
      const towardTarget = getRelationshipState(state.id, targetId)
      const sameSectAsTarget = definition.sectId === targetDefinition.sectId
      const sameSectAsActor = definition.sectId === actorDefinition.sectId
      applyRelationshipDeltaToState(towardActor, {
        hatredDelta: sameSectAsTarget ? 4 : 2,
        fearDelta: log.tags.includes('captured') ? 3 : 1
      })
      applyRelationshipDeltaToState(towardTarget, {
        favorDelta: sameSectAsTarget ? 2 : 1,
        debtDelta: sameSectAsTarget ? 1 : 0,
        fearDelta: sameSectAsActor ? 2 : 0
      })
    }
  }

  function addLog(
    scope: WorldLogEntry['scope'],
    severity: WorldLogEntry['severity'],
    title: string,
    text: string,
    actorIds: string[],
    tags: string[],
    mapId?: string
  ) {
    const entry = createWorldLogEntry({
      id: `world_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tick: clock.value.totalTicks,
      timeLabel: currentTimeLabel.value,
      scope,
      severity,
      title,
      text,
      actorIds,
      mapId,
      tags,
      revealed: true
    })
    logs.value = insertWorldLog(logs.value, entry, 120)
  }

  function recordPlayerJourney(
    severity: WorldLogEntry['severity'],
    title: string,
    text: string,
    rewards: PlayerJourneyEntry['rewards'],
    areaId?: string,
    tags: string[] = []
  ) {
    const entry = createPlayerJourney(clock.value, idleMode.value, {
      severity,
      title,
      text,
      rewards,
      areaId,
      tags
    })
    playerJourneys.value.unshift(entry)
    if (playerJourneys.value.length > 80) {
      playerJourneys.value = playerJourneys.value.slice(0, 80)
    }
    addLog('player', severity, title, text, ['player'], ['player-journey', ...tags], areaId)
  }

  function recordManualPlayerJourney(input: {
    severity: WorldLogEntry['severity']
    title: string
    text: string
    rewards: PlayerJourneyEntry['rewards']
    areaId?: string
    tags?: string[]
    effects?: WorldEffect[]
    source?: WorldEffectSource
    sourceId?: string
    relatedNpcIds?: string[]
  }) {
    recordPlayerJourney(
      input.severity,
      input.title,
      input.text,
      input.rewards,
      input.areaId,
      input.tags ?? []
    )

    const journey = playerJourneys.value[0]
    const log = journey
      ? logs.value.find(entry => entry.tick === journey.tick && entry.title === journey.title && entry.text === journey.text)
      : null
    if (!journey || !log) return

    const journal = createWorldJournalEntry(log, [])
    if (input.effects?.length) journal.effects = [...input.effects]
    const transactionBase = createTransactionFromJournal(journal)
    const transaction = persistEffectTransaction({
      ...transactionBase,
      source: input.source ?? transactionBase.source,
      sourceId: input.sourceId ?? transactionBase.sourceId,
      effects: journal.effects
    })
    for (const npcId of input.relatedNpcIds ?? []) {
      const definition = npcDefinitions.value.find(item => item.id === npcId)
      if (!definition) continue
      appendNpcStory(
        npcId,
        input.title,
        input.text,
        input.severity,
        input.areaId,
        [...new Set([...(input.tags ?? []), 'player-choice', 'npc-echo'])]
      )
    }
    const result: WorldTickResult = {
      tickId: `journal-${log.id}`,
      tick: log.tick,
      mode: journey.mode,
      effects: journal.effects,
      transactions: [transaction],
      journals: [journal],
      unlocks: [],
      notifications: []
    }
    lastWorldTickResult.value = result
    worldEventBus.publish(result)
    saveToStorage()
  }

  function appendNpcStory(
    npcId: string,
    title: string,
    text: string,
    severity: WorldLogEntry['severity'],
    mapId?: string,
    tags: string[] = []
  ) {
    const record = createNpcStoryRecord(clock.value, npcId, {
      title,
      text,
      severity,
      mapId,
      tags
    })
    npcStories.value.unshift(record)
    if (npcStories.value.length > 80) {
      npcStories.value = npcStories.value.slice(0, 80)
    }
  }

  function getAreaLabel(areaId?: string) {
    if (!areaId) return '未知地带'
    return getAreaById(areaId)?.name ?? areaId
  }

  function getPlayerFocusMapId() {
    const mapStore = useMapStore()
    const sectStore = useSectStore()
    if (playerAreaId.value && getAreaById(playerAreaId.value)) return playerAreaId.value
    if (idleMode.value === 'sectDuty') {
      return sectStore.currentSect?.areaId ?? activeAreaAnomalies.value[0]?.areaId ?? mapStore.currentRealmAreas[0]?.id ?? null
    }
    if (idleMode.value === 'adventure' || idleMode.value === 'gatherHerbs') {
      return activeAreaAnomalies.value[0]?.areaId ?? mapStore.currentRealmAreas[0]?.id ?? null
    }
    return sectStore.currentSect?.areaId ?? mapStore.currentRealmAreas[0]?.id ?? null
  }

  function getNpcDisplayProfile(npcId: string) {
    const definition = npcDefinitions.value.find(item => item.id === npcId)
    const state = npcStates.value.find(item => item.id === npcId)
    const relationship = getRelationshipState(npcId)
    if (!definition || !state) return null

    return {
      id: npcId,
      name: definition.name,
      title: definition.profile.title,
      origin: definition.profile.origin,
      originType: definition.profile.originType,
      originLabel: getOriginTypeLabel(definition.profile.originType),
      background: definition.profile.background,
      familyStatus: definition.profile.familyStatus,
      identityHook: definition.profile.identityHook,
      destinyRank: definition.profile.destinyRank,
      destinyRankLabel: getDestinyRankLabel(definition.profile.destinyRank),
      destinyTags: definition.profile.destinyTags,
      bloodline: definition.profile.bloodline,
      bloodlineGradeLabel: getBloodlineGradeLabel(definition.aptitude.bloodlineGrade),
      constitution: getConstitutionLabel(definition.aptitude.constitution),
      constitutionNote: definition.profile.constitutionNote,
      lineageSummary: getNpcLineageSummary(definition),
      factionStance: definition.profile.factionStance,
      factionStanceLabel: getFactionStanceLabel(definition.profile.factionStance),
      growthFlawSummary: getNpcGrowthFlawSummary(definition),
      sectName: definition.sectId ? getSectById(definition.sectId)?.name ?? definition.sectId : '散修',
      root: getNpcRootLabel(definition.aptitude),
      rootGradeLabel: getRootGradeLabel(definition.aptitude.rootGrade),
      talent: getTalentGradeLabel(definition.aptitude.talent),
      potentialScore: getNpcPotentialScore(definition),
      temperament: getNpcTemperamentSummary(definition),
      realm: `${state.realm}${state.realmLevel}层`,
      locationName: getAreaLabel(state.locationMapId),
      notoriety: state.notoriety,
      notorietyLabel: formatNpcNotoriety(state.notoriety),
      bond: relationship.bond,
      bondLabel: getNpcBondLabel(relationship.bond),
      hpState: state.hpState
    }
  }

  function getCaptivityForecast() {
    const playerStore = usePlayerStore()
    if (!playerStore.captivity.isCaptured) return null

    const captorName = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
      : '敌对势力'

    return getPlayerCaptivityForecast({
      currentTick: clock.value.totalTicks,
      sinceTick: playerStore.captivity.sinceTick,
      captorName,
      realm: playerStore.realm,
      realmLevel: playerStore.realmLevel,
      weather: weather.value,
      sectReputation: useSectStore().reputation
    })
  }

  function canAttemptCaptivityEscape() {
    const playerStore = usePlayerStore()
    if (!playerStore.captivity.isCaptured) return false
    return lastCaptivityEscapeTick.value !== clock.value.totalTicks
  }

  function attemptCaptivityEscape() {
    const playerStore = usePlayerStore()
    if (!playerStore.captivity.isCaptured || !canAttemptCaptivityEscape()) {
      return null
    }

    const captorName = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
      : '敌对势力'
    const result = resolvePlayerCaptivityEscape({
      currentTick: clock.value.totalTicks,
      sinceTick: playerStore.captivity.sinceTick,
      captorName,
      realm: playerStore.realm,
      realmLevel: playerStore.realmLevel,
      weather: weather.value,
      sectReputation: useSectStore().reputation
    })

    lastCaptivityEscapeTick.value = clock.value.totalTicks
    playerStore.addCultivation(result.cultivationGain)
    recordPlayerJourney(
      result.narrative.severity,
      result.narrative.title,
      result.narrative.text,
      [{ type: 'cultivation', label: '修为', value: result.cultivationGain }],
      undefined,
      result.narrative.tags
    )

    if (result.success) {
      playerStore.clearCaptivity()
      addLog('world', 'legendary', '重获自由', `你已经摆脱${captorName}的控制，重新回到可行动状态。`, ['player'], ['captivity', 'escape', 'success'])
      const sectStore = useSectStore()
      if (sectStore.worldCondition.status === 'collapsed' || sectStore.worldCondition.status === 'rebuilding') {
        sectStore.applyWorldCondition({
          status: 'rebuilding',
          occupiedBySectId: null,
          lastUpdatedTick: clock.value.totalTicks
        })
      }
    }

    return result
  }

  function getCapturedNpcRescueTarget(sectId?: string | null) {
    const target = importantNpcStates.value
      .filter(item => item.state.hpState === 'captured')
      .filter(item => !sectId || item.definition.sectId === sectId)
      .sort((a, b) => b.spotlightScore - a.spotlightScore)[0]

    if (!target) return null

    const profile = getNpcDisplayProfile(target.state.id)
    const captorFlag = target.state.flags.find(flag => flag.startsWith('captured_by:'))
    const captorId = captorFlag?.split(':')[1]
    const captor = captorId ? getNpcDisplayProfile(captorId) : null

    return {
      id: target.state.id,
      name: target.definition.name,
      title: profile?.title ?? '无名修士',
      sectId: target.definition.sectId ?? null,
      captorId: captorId ?? null,
      captorName: captor?.name ?? captorId ?? null,
      locationName: profile?.locationName ?? '未知地带',
      severity: target.definition.role === 'main' || target.definition.profile.destinyRank === 'legendary'
        ? 'legendary' as const
        : 'major' as const
    }
  }

  function rescueCapturedNpc(npcId: string, rescuerSectId?: string | null) {
    const npc = npcStates.value.find(item => item.id === npcId)
    const definition = npcDefinitions.value.find(item => item.id === npcId)
    if (!npc || !definition || npc.hpState !== 'captured') return false

    const captorFlag = npc.flags.find(flag => flag.startsWith('captured_by:'))
    const captorId = captorFlag?.split(':')[1]
    const captorDefinition = captorId ? npcDefinitions.value.find(item => item.id === captorId) : null
    const rescuerName = rescuerSectId ? getSectById(rescuerSectId)?.name ?? rescuerSectId : '宗门'

    npc.hpState = 'injured'
    npc.currentGoal = 'recover'
    npc.locationMapId = definition.homeMapId
    npc.flags = npc.flags.filter(flag => !flag.startsWith('captured_by:'))
    if (!npc.flags.includes('rescued_from_captivity')) {
      npc.flags.push('rescued_from_captivity')
    }
    npc.notoriety = Math.max(0, Math.min(100, npc.notoriety + 4))

    addLog(
      'sect',
      definition.profile.destinyRank === 'legendary' ? 'legendary' : 'major',
      `${definition.name}获救`,
      `${rescuerName}派人接应，将${definition.name}从${captorDefinition?.name ?? captorId ?? '敌手'}控制中救出。此人仍需疗伤，但已重新回到自身势力范围。`,
      [npcId],
      ['npc', 'captivity', 'rescued'],
      definition.homeMapId
    )
    appendNpcStory(
      npcId,
      `${definition.name}脱离囚局`,
      `${definition.name}被${rescuerName}救回，短期内会以恢复为主。`,
      definition.profile.destinyRank === 'legendary' ? 'legendary' : 'major',
      definition.homeMapId,
      ['npc', 'captivity', 'rescued']
    )
    return true
  }

  function unlockNpc(npcId: string, reason?: string) {
    const definition = npcDefinitions.value.find(item => item.id === npcId)
    if (!definition) return false
    if (!unlockedNpcIds.value.includes(npcId)) {
      unlockedNpcIds.value.push(npcId)
      addLog('npc', 'major', `结识${definition.name}`, reason || `${definition.name}正式进入你的命运轨迹。`, [npcId], ['story', 'unlock-npc'])
    }
    return true
  }

  function isNpcUnlocked(npcId: string) {
    return unlockedNpcIds.value.includes(npcId)
  }

  function getRelationshipState(npcId: string, subjectId: string = 'player'): RelationshipState {
    const npc = npcStates.value.find(item => item.id === npcId)
    if (!npc) return createDefaultRelationshipState()
    const relationship = npc.relationships[subjectId]
    if (!relationship) {
      const created = createDefaultRelationshipState()
      npc.relationships[subjectId] = created
      return created
    }
    return relationship
  }

  function applyStoryRelationshipChange(
    npcId: string,
    input: {
      favorDelta?: number
      hatredDelta?: number
      fearDelta?: number
      debtDelta?: number
      title?: string
      text?: string
      subjectId?: string
    }
  ) {
    const definition = npcDefinitions.value.find(item => item.id === npcId)
    const npc = npcStates.value.find(item => item.id === npcId)
    if (!definition || !npc) return false

    const subjectId = input.subjectId || 'player'
    const relationship = getRelationshipState(npcId, subjectId)
    applyRelationshipDeltaToState(relationship, input)

    addLog(
      'npc',
      Math.abs(input.favorDelta || 0) >= 10 ? 'major' : 'normal',
      input.title || `${definition.name}态度变化`,
      input.text || `${definition.name}对你的态度出现了新的波动。`,
      [npcId],
      ['story', 'relationship', relationship.bond]
    )
    return true
  }

  function interactWithNpc(npcId: string, kind?: NpcInteractionKind) {
    const definition = npcDefinitions.value.find(item => item.id === npcId)
    const state = npcStates.value.find(item => item.id === npcId)
    if (!definition || !state || !unlockedNpcIds.value.includes(npcId)) {
      return null
    }

    const relationship = getRelationshipState(npcId)
    const result = resolveNpcPlayerInteraction({
      definition,
      state,
      relationship,
      clock: clock.value,
      kind
    })
    if (!result) return null

    addLog(
      'npc',
      result.severity,
      result.title,
      result.text,
      [npcId],
      ['npc', 'relationship', result.nextBond],
      state.locationMapId
    )
    appendNpcStory(
      npcId,
      result.title,
      result.text,
      result.severity,
      state.locationMapId,
      ['relationship', result.nextBond]
    )
    return result
  }

  function recordMerchantTradeEvent(input: {
    log: {
      scope: WorldLogEntry['scope']
      severity: WorldLogEntry['severity']
      title: string
      text: string
      actorIds: string[]
      mapId?: string
      tags: string[]
    }
    relationshipDeltas?: WorldRuntimeRelationshipDelta[]
  }) {
    if (input.relationshipDeltas?.length) {
      applyRelationshipDeltas(input.relationshipDeltas)
    }
    addLog(
      input.log.scope,
      input.log.severity,
      input.log.title,
      input.log.text,
      input.log.actorIds,
      input.log.tags,
      input.log.mapId
    )
  }

  function addWorldFlag(flag: string, title?: string, text?: string) {
    if (!worldFlags.value.includes(flag)) {
      worldFlags.value.push(flag)
      addLog('world', 'normal', title || '世界异动', text || `世界留下了新的标记：${flag}`, [], ['story', 'world-flag'])
    }
  }

  function hasWorldFlag(flag: string) {
    return worldFlags.value.includes(flag)
  }

  function getIdleModeLabel(mode: IdleMode): string {
    const labels: Record<IdleMode, string> = {
      cultivate: '闭关修炼',
      adventure: '外出游历',
      sectDuty: '宗门差遣',
      gatherHerbs: '采集灵草',
      trainSkill: '演练功法'
    }
    return labels[mode]
  }

  watchEffect(() => {
    saveToStorage()
  })

  return {
    clock,
    idleMode,
    weather,
    playerAreaId,
    npcDefinitions,
    npcStates,
    logs,
    playerJourneys,
    npcStories,
    areaAnomalies,
    unlockedNpcIds,
    worldFlags,
    worldNotifications,
    lastWorldTickResult,
    effectTransactions,
    lastCaptivityEscapeTick,
    currentTimeLabel,
    visibleLogs,
    visibleLogViews,
    recentPlayerJourneys,
    recentEffectTransactions,
    importantNpcStories,
    importantNpcStoryViews,
    activeAreaAnomalies,
    unlockedNpcDefinitions,
    npcCompanionCandidates,
    importantNpcStates,
    setIdleMode,
    simulateOffline,
    advanceTick,
    travelTo,
    consumeWorldNotifications,
    getIdleModeLabel,
    unlockNpc,
    isNpcUnlocked,
    getRelationshipState,
    getNpcDisplayProfile,
    getCaptivityForecast,
    canAttemptCaptivityEscape,
    attemptCaptivityEscape,
    getCapturedNpcRescueTarget,
    rescueCapturedNpc,
    applyStoryRelationshipChange,
    interactWithNpc,
    recordMerchantTradeEvent,
    recordManualPlayerJourney,
    recordWorldEffectTransaction,
    addWorldFlag,
    hasWorldFlag
  }
})
