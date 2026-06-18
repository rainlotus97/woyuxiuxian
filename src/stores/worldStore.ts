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
  getNpcPotentialScore,
  getNpcRootLabel,
  getNpcSpotlightScore,
  getOriginTypeLabel,
  getRootGradeLabel,
  getTalentGradeLabel,
  getNpcTemperamentSummary
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
import { getAreaById } from '@/types/map'
import { getSectById } from '@/types/sect'
import type {
  WorldRuntimeAftermathResult,
  WorldRuntimeLogEffect,
  WorldRuntimeNpcPatch,
  WorldRuntimeRelationshipDelta
} from '@/world/runtime/worldRuntimeTypes'
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
    worldFlags: []
  }
}

function mergeNpcDefinitionsWithDefaults(definitions: NpcDefinition[] | undefined, defaults: NpcDefinition[]) {
  if (!definitions?.length) return defaults

  return defaults.map(defaultDefinition => {
    const existing = definitions.find(item => item.id === defaultDefinition.id)
    if (!existing) return defaultDefinition

    return {
      ...defaultDefinition,
      ...existing,
      aptitude: { ...defaultDefinition.aptitude, ...existing.aptitude },
      personality: { ...defaultDefinition.personality, ...existing.personality },
      profile: { ...defaultDefinition.profile, ...existing.profile }
    }
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
        logs: parsed.logs ?? defaults.logs,
        playerJourneys: parsed.playerJourneys ?? defaults.playerJourneys,
        npcStories: parsed.npcStories ?? defaults.npcStories,
        areaAnomalies: parsed.areaAnomalies ?? defaults.areaAnomalies,
        unlockedNpcIds: parsed.unlockedNpcIds ?? defaults.unlockedNpcIds,
        worldFlags: parsed.worldFlags ?? defaults.worldFlags
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
  const logs = ref<WorldLogEntry[]>([...initialData.logs])
  const playerJourneys = ref<PlayerJourneyEntry[]>([...initialData.playerJourneys])
  const npcStories = ref<NpcStoryRecord[]>([...initialData.npcStories])
  const areaAnomalies = ref<WorldAreaAnomaly[]>([...initialData.areaAnomalies])
  const unlockedNpcIds = ref<string[]>([...initialData.unlockedNpcIds])
  const worldFlags = ref<string[]>([...initialData.worldFlags])

  const currentTimeLabel = computed(() => formatWorldTime(clock.value))
  const visibleLogs = computed(() => logs.value.slice(0, 12))
  const recentPlayerJourneys = computed(() => playerJourneys.value.slice(0, 6))
  const importantNpcStories = computed(() => npcStories.value.slice(0, 6))
  const activeAreaAnomalies = computed(() => areaAnomalies.value.slice(0, 6))
  const unlockedNpcDefinitions = computed(() => npcDefinitions.value.filter(definition => unlockedNpcIds.value.includes(definition.id)))
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
      worldFlags: toRaw(worldFlags.value)
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
      advanceTick(false)
    }
    clock.value.lastSimulatedAt = Date.now()
    if (ticks >= 3) {
      addLog('world', 'major', '离线结算', `你闭关期间，天地自行流转了${ticks}个时辰。`, [], ['offline'])
    }
    return ticks
  }

  function advanceTick(updateTimestamp = true) {
    advanceClock(updateTimestamp)
    resolveWeather()
    resolveWorldSystems()
    resolvePlayerAction()
    resolveNpcActions()
    resolveNarrativeWorldPulse()
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

  function resolveWeather() {
    const roll = seededWorldRoll(clock.value.totalTicks, clock.value.day, 'weather')
    const previous = weather.value
    if (roll > 0.985) weather.value = 'fire'
    else if (roll > 0.955) weather.value = 'flood'
    else if (roll > 0.9) weather.value = 'storm'
    else if (roll > 0.75) weather.value = 'rain'
    else if (roll < 0.08) weather.value = 'mist'
    else weather.value = 'clear'

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
  }

  function resolvePlayerAction() {
    const playerStore = usePlayerStore()
    const petStore = usePetStore()
    const mapStore = useMapStore()
    const mode = idleMode.value
    const baseGain = Math.max(1, Math.floor(playerStore.cultivationPerSecond * 60))

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
        sectReputation: useSectStore().reputation
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

    if (mode === 'cultivate') {
      const gain = weather.value === 'rain' ? Math.floor(baseGain * 1.1) : baseGain
      playerStore.addCultivation(gain)
      if (petStore.equippedPet) {
        petStore.addPetExp(petStore.equippedPet.owned.definitionId, 2)
        if (seededWorldRoll(clock.value.totalTicks, 'pet-cultivate-exp') > 0.58) {
          petStore.addPetExp(petStore.equippedPet.owned.definitionId, 2)
        }
      }
      if (seededWorldRoll(clock.value.totalTicks, 'player-cultivate-insight') > 0.94) {
        recordPlayerJourney('major', '修炼顿悟', `你在${currentTimeLabel.value}心有所感，额外凝聚了${gain}点修为。`, [
          { type: 'cultivation', label: '修为', value: gain }
        ], undefined, ['cultivation', 'insight'])
      }
    } else if (mode === 'adventure') {
      playerStore.addCultivation(Math.floor(baseGain * 0.35))
      if (petStore.equippedPet) {
        petStore.addPetExp(petStore.equippedPet.owned.definitionId, 3)
        petStore.addIntimacy(petStore.equippedPet.owned.definitionId, 1)
        if (seededWorldRoll(clock.value.totalTicks, 'pet-adventure-exp') > 0.7) {
          petStore.addPetExp(petStore.equippedPet.owned.definitionId, 3)
        }
      }
      if (seededWorldRoll(clock.value.totalTicks, 'player-adventure-find') > 0.78) {
        const gold = 8 + Math.floor(seededWorldRoll(clock.value.totalTicks, 'player-adventure-gold') * 24)
        playerStore.addGold(gold)
        const anomaly = areaAnomalies.value[0]
        recordPlayerJourney('normal', '游历所得', `你在城外寻到一处废弃洞府，带回${gold}枚灵石。`, [
          { type: 'gold', label: '灵石', value: gold }
        ], anomaly?.areaId, ['adventure', 'loot'])
      }
      if (seededWorldRoll(clock.value.totalTicks, 'player-adventure-encounter') > 0.9) {
        const anomaly = areaAnomalies.value[0]
        const areaId = anomaly?.areaId ?? mapStore.currentRealmAreas[0]?.id
        const cultivationGain = 12 + Math.floor(seededWorldRoll(clock.value.totalTicks, 'player-adventure-insight') * 30)
        playerStore.addCultivation(cultivationGain)
        recordPlayerJourney('major', '奇遇现身', `你在${getAreaLabel(areaId)}偶遇一处残阵，借机参悟，额外获得${cultivationGain}点修为。`, [
          { type: 'cultivation', label: '修为', value: cultivationGain }
        ], areaId, ['adventure', 'fortune'])
      }
    } else if (mode === 'gatherHerbs') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-herb-gather') > 0.62) {
        const quantity = 1 + Math.floor(seededWorldRoll(clock.value.totalTicks, 'player-herb-count') * 3)
        playerStore.addToInventory({
          id: `world_herb_${Date.now()}_${clock.value.totalTicks}`,
          definitionId: 'herb_spirit_grass',
          name: '灵草',
          icon: '草',
          type: 'material',
          quality: 'common',
          quantity,
          description: '世界游历采得的灵草'
        })
        recordPlayerJourney('normal', '采得灵草', '你循着雨后灵气，在山石夹缝间采到几株灵草。', [
          { type: 'item', label: '灵草', value: quantity }
        ], undefined, ['herb', 'gather'])
      }
    } else if (mode === 'sectDuty') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-sect-duty') > 0.8) {
        const sectStore = useSectStore()
        sectStore.addContribution(8)
        sectStore.addReputation(3)
        recordPlayerJourney('normal', '宗门差遣', '宗门执事派你巡查山门，几名外门弟子对你多了些敬意。', [
          { type: 'contribution', label: '贡献', value: 8 },
          { type: 'reputation', label: '声望', value: 3 }
        ], sectStore.currentSect?.areaId, ['sect', 'duty'])
      }
    } else if (mode === 'trainSkill') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-skill-train') > 0.86) {
        recordPlayerJourney('normal', '功法熟稔', '你反复演练剑诀，灵力运转比先前顺畅了些。', [], undefined, ['skill', 'training'])
      }
    }
  }

  function resolveNpcActions() {
    const playerStore = usePlayerStore()
    const engagedNpcIds = new Set<string>()
    const definitionMap = new Map(npcDefinitions.value.map(definition => [definition.id, definition]))
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
        playerGold: playerStore.gold
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

  function addLog(
    scope: WorldLogEntry['scope'],
    severity: WorldLogEntry['severity'],
    title: string,
    text: string,
    actorIds: string[],
    tags: string[],
    mapId?: string
  ) {
    logs.value.unshift({
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
    if (logs.value.length > 120) {
      logs.value = logs.value.slice(0, 120)
    }
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
    npcDefinitions,
    npcStates,
    logs,
    playerJourneys,
    npcStories,
    areaAnomalies,
    unlockedNpcIds,
    worldFlags,
    lastCaptivityEscapeTick,
    currentTimeLabel,
    visibleLogs,
    recentPlayerJourneys,
    importantNpcStories,
    activeAreaAnomalies,
    unlockedNpcDefinitions,
    importantNpcStates,
    setIdleMode,
    simulateOffline,
    advanceTick,
    getIdleModeLabel,
    unlockNpc,
    isNpcUnlocked,
    getRelationshipState,
    getNpcDisplayProfile,
    getCaptivityForecast,
    canAttemptCaptivityEscape,
    attemptCaptivityEscape,
    applyStoryRelationshipChange,
    addWorldFlag,
    hasWorldFlag
  }
})
