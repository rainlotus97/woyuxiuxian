import { defineStore } from 'pinia'
import { computed, ref, toRaw, watchEffect } from 'vue'
import type {
  IdleMode,
  NpcDefinition,
  NpcRuntimeState,
  RelationshipState,
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
import { resolveWarAftermath } from '@/world/runtime/warAftermathResolver'
import { seededWorldRoll } from '@/world/runtime/worldSeed'
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

interface WorldState {
  clock: WorldClock
  idleMode: IdleMode
  weather: WorldWeather
  npcDefinitions: NpcDefinition[]
  npcStates: NpcRuntimeState[]
  logs: WorldLogEntry[]
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
  return [
    {
      id: 'npc_su_qingyuan',
      name: '苏清鸢',
      gender: 'female',
      role: 'main',
      homeMapId: 'qingyang_city',
      sectId: 'qingyun_sect',
      aptitude: { root: '水', rootGrade: 'heavenly', talent: 'destined', comprehension: 96, luck: 88, physique: 74, willpower: 98 },
      personality: { ambition: 54, loyalty: 92, cruelty: 12, affection: 72, caution: 88, greed: 8 },
      tags: ['圣女', '轮回', '主线保护']
    },
    {
      id: 'npc_mo_lao',
      name: '墨老',
      gender: 'male',
      role: 'main',
      homeMapId: 'qingyang_well',
      aptitude: { root: '空', rootGrade: 'mutated', talent: 'monster', comprehension: 90, luck: 62, physique: 48, willpower: 99 },
      personality: { ambition: 35, loyalty: 96, cruelty: 38, affection: 70, caution: 91, greed: 10 },
      tags: ['残魂', '守护者', '主线保护']
    },
    {
      id: 'npc_xue_yan',
      name: '薛焰',
      gender: 'male',
      role: 'enemy',
      homeMapId: 'qingyang_city',
      sectId: 'blood_sect',
      aptitude: { root: '火', rootGrade: 'single', talent: 'genius', comprehension: 78, luck: 56, physique: 84, willpower: 71 },
      personality: { ambition: 92, loyalty: 18, cruelty: 86, affection: 12, caution: 42, greed: 74 },
      tags: ['反派种子', '魔修']
    },
    {
      id: 'npc_lu_heng',
      name: '陆衡',
      gender: 'male',
      role: 'sect',
      homeMapId: 'qingyun_mountain',
      sectId: 'qingyun_sect',
      aptitude: { root: '金', rootGrade: 'dual', talent: 'spirit', comprehension: 67, luck: 50, physique: 66, willpower: 64 },
      personality: { ambition: 61, loyalty: 72, cruelty: 20, affection: 52, caution: 59, greed: 28 },
      tags: ['同门候选', '剑修']
    }
  ]
}

function createNpcStates(definitions: NpcDefinition[]): NpcRuntimeState[] {
  return mergeNpcRelationshipNetwork(definitions, definitions.map(definition => ({
    id: definition.id,
    realm: definition.aptitude.talent === 'destined' ? '筑基' : '炼气',
    realmLevel: definition.aptitude.talent === 'destined' ? 3 : 1 + Math.floor(definition.aptitude.comprehension / 25),
    cultivation: 0,
    hpState: 'healthy',
    locationMapId: definition.homeMapId,
    currentGoal: definition.personality.ambition > 80 ? 'challenge' : definition.personality.caution > 80 ? 'cultivate' : 'adventure',
    relationships: {},
    flags: [],
    lastActionTick: 0
  })))
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
    unlockedNpcIds: npcDefinitions.filter(item => item.role === 'main').map(item => item.id),
    worldFlags: []
  }
}

export const useWorldStore = defineStore('world', () => {
  let initialData: WorldState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<WorldState>
      const defaults = getDefaultWorldState()
      initialData = {
        ...defaults,
        ...parsed,
        clock: { ...defaults.clock, ...parsed.clock },
        npcDefinitions: parsed.npcDefinitions?.length ? parsed.npcDefinitions : defaults.npcDefinitions,
        npcStates: mergeNpcRelationshipNetwork(
          parsed.npcDefinitions?.length ? parsed.npcDefinitions : defaults.npcDefinitions,
          parsed.npcStates?.length ? parsed.npcStates : defaults.npcStates
        ),
        logs: parsed.logs ?? defaults.logs,
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
  const unlockedNpcIds = ref<string[]>([...initialData.unlockedNpcIds])
  const worldFlags = ref<string[]>([...initialData.worldFlags])

  const currentTimeLabel = computed(() => formatWorldTime(clock.value))
  const visibleLogs = computed(() => logs.value.slice(0, 12))
  const unlockedNpcDefinitions = computed(() => npcDefinitions.value.filter(definition => unlockedNpcIds.value.includes(definition.id)))
  const importantNpcStates = computed(() => npcStates.value.map(state => ({
    state,
    definition: npcDefinitions.value.find(def => def.id === state.id)
  })).filter(item => item.definition))

  function saveToStorage() {
    const data: WorldState = {
      clock: toRaw(clock.value),
      idleMode: idleMode.value,
      weather: weather.value,
      npcDefinitions: toRaw(npcDefinitions.value),
      npcStates: toRaw(npcStates.value),
      logs: toRaw(logs.value),
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
  }

  function resolveWorldSystems() {
    const mapStore = useMapStore()
    const sectStore = useSectStore()
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
    const mode = idleMode.value
    const baseGain = Math.max(1, Math.floor(playerStore.cultivationPerSecond * 60))
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
        addLog('player', 'major', '修炼顿悟', `你在${currentTimeLabel.value}心有所感，额外凝聚了${gain}点修为。`, ['player'], ['cultivation'])
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
        addLog('player', 'normal', '游历所得', `你在城外寻到一处废弃洞府，带回${gold}枚灵石。`, ['player'], ['adventure'])
      }
    } else if (mode === 'gatherHerbs') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-herb-gather') > 0.62) {
        playerStore.addToInventory({
          id: `world_herb_${Date.now()}_${clock.value.totalTicks}`,
          name: '灵草',
          icon: '草',
          type: 'material',
          quality: 'common',
          quantity: 1 + Math.floor(seededWorldRoll(clock.value.totalTicks, 'player-herb-count') * 3),
          description: '世界游历采得的灵草'
        })
        addLog('player', 'normal', '采得灵草', '你循着雨后灵气，在山石夹缝间采到几株灵草。', ['player'], ['herb'])
      }
    } else if (mode === 'sectDuty') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-sect-duty') > 0.8) {
        addLog('sect', 'normal', '宗门差遣', '宗门执事派你巡查山门，几名外门弟子对你多了些敬意。', ['player'], ['sect'])
      }
    } else if (mode === 'trainSkill') {
      if (seededWorldRoll(clock.value.totalTicks, 'player-skill-train') > 0.86) {
        addLog('player', 'normal', '功法熟稔', '你反复演练剑诀，灵力运转比先前顺畅了些。', ['player'], ['skill'])
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
    if (result.sectCondition) {
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
    unlockedNpcIds,
    worldFlags,
    currentTimeLabel,
    visibleLogs,
    unlockedNpcDefinitions,
    importantNpcStates,
    setIdleMode,
    simulateOffline,
    advanceTick,
    getIdleModeLabel,
    unlockNpc,
    isNpcUnlocked,
    getRelationshipState,
    applyStoryRelationshipChange,
    addWorldFlag,
    hasWorldFlag
  }
})
