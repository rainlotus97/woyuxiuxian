/**
 * 随机事件运行时
 * 在游戏 tick 中检查并触发随机事件
 */
import { ref, computed } from 'vue'
import type {
  RandomEvent,
  RandomEventType,
  EventCooldownState,
  RandomEventRuntimeState,
  RandomEventMemoryEntry,
  RandomEventCondition
} from '@/types/randomEvent'
import { ALL_RANDOM_EVENTS } from '@/world/runtime/randomEventDefinitions'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import { useToast } from '@/composables/useToast'

const STORAGE_KEY = 'woyu-xiuxian-random-event-state'
const GLOBAL_MIN_INTERVAL_TICKS = 6
const DAILY_TRIGGER_LIMIT = 1
const DAILY_STORY_TRIGGER_LIMIT = 1
const ENCOUNTER_DEBUG_LIMIT = 3

const REALM_STAGE_BASE: Record<string, number> = {
  炼气: 0,
  筑基: 9,
  金丹: 18,
  元婴: 27,
  化神: 36,
  渡劫: 45,
  大乘: 54,
  仙人: 63
}

export function useRandomEvent() {
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const storyStore = useStoryStore()
  const { info, success } = useToast()

  const state = ref<RandomEventRuntimeState>(loadState())
  const cooldowns = computed(() => state.value.cooldowns)
  const eventHistory = computed(() => state.value.history)
  
  // 当前待玩家处理的事件（null=无事件）
  const currentEvent = ref<RandomEvent | null>(null)
  const hasCurrentEvent = computed(() => currentEvent.value !== null)

  function createDefaultState(): RandomEventRuntimeState {
    return {
      cooldowns: [],
      history: [],
      globalLastTriggerTick: null,
      lastTriggerDayKey: null,
      dailyTriggerCount: 0,
      storyTriggerCountByDay: {}
    }
  }

  function getCurrentDayKey() {
    const { year, month, day } = worldStore.clock
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function loadState(): RandomEventRuntimeState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return createDefaultState()
      const parsed = JSON.parse(saved) as Partial<RandomEventRuntimeState> | EventCooldownState[]
      if (Array.isArray(parsed)) {
        return {
          ...createDefaultState(),
          cooldowns: parsed
        }
      }
      return {
        cooldowns: parsed.cooldowns ?? [],
        history: parsed.history ?? [],
        globalLastTriggerTick: parsed.globalLastTriggerTick ?? null,
        lastTriggerDayKey: parsed.lastTriggerDayKey ?? null,
        dailyTriggerCount: parsed.dailyTriggerCount ?? 0,
        storyTriggerCountByDay: parsed.storyTriggerCountByDay ?? {}
      }
    } catch {
      return createDefaultState()
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch { /* ignore */ }
  }

  // 检查事件是否在冷却中
  function isOnCooldown(eventId: string, currentTick: number): boolean {
    const entry = state.value.cooldowns.find(c => c.eventId === eventId)
    if (!entry) return false
    const event = getEventById(eventId)
    if (!event) return false
    return (currentTick - entry.lastTriggerTick) < event.trigger.cooldownTicks
  }

  function isGloballySuppressed(currentTick: number, event: RandomEvent) {
    const lastTick = state.value.globalLastTriggerTick
    const minInterval = event.trigger.minimumIntervalTicks ?? GLOBAL_MIN_INTERVAL_TICKS
    if (lastTick === null) return false
    return (currentTick - lastTick) < minInterval
  }

  function getRealmStage() {
    const base = REALM_STAGE_BASE[playerStore.realm] ?? 0
    return base + Math.max(0, playerStore.realmLevel - 1)
  }

  function getEarlyStageEncounterLimit() {
    const stage = getRealmStage()
    if (stage <= 2) return 0
    if (stage <= 5) return 1
    if (stage <= 8) return 2
    if (stage <= 12) return 3
    return Infinity
  }

  function getTodayTriggeredCount() {
    const today = getCurrentDayKey()
    return state.value.lastTriggerDayKey === today ? state.value.dailyTriggerCount : 0
  }

  function isDailySuppressed() {
    return getTodayTriggeredCount() >= DAILY_TRIGGER_LIMIT
  }

  function getStoryEncounterHistoryCount() {
    return state.value.history.filter(entry => entry.tags.includes('story-encounter')).length
  }

  function getStoryProgressStage() {
    const completed = storyStore.completedCount
    if (!storyStore.currentNodeId) return 0
    if (completed >= 10) return 4
    if (completed >= 6) return 3
    if (completed >= 3) return 2
    if (completed >= 1) return 1
    return 0
  }

  function isStoryEncounter(event: RandomEvent) {
    return Boolean(
      event.npcHint
      || event.storyTags?.length
      || event.choices.some(choice => choice.memory?.length)
    )
  }

  function getPrimaryNpcId(event: RandomEvent) {
    const memoryNpcId = event.choices
      .flatMap(choice => choice.memory ?? [])
      .find(memory => memory.npcId)?.npcId
    return memoryNpcId ?? event.npcHint ?? null
  }

  function getRelationshipPressure(event: RandomEvent) {
    const npcId = event.choices
      .flatMap(choice => choice.memory ?? [])
      .find(memory => memory.npcId)?.npcId
    if (!npcId) return 0
    const relationship = worldStore.getRelationshipState(npcId)
    return relationship.favor + relationship.debt * 1.2 + relationship.hatred * 1.4 + relationship.fear * 0.8
  }

  function getRecentMemoryEcho(event: RandomEvent) {
    const npcId = event.choices
      .flatMap(choice => choice.memory ?? [])
      .find(memory => memory.npcId)?.npcId
    const relevant = state.value.history.find(entry => {
      if (npcId && entry.npcId === npcId) return true
      return (event.storyTags ?? []).some(tag => entry.tags.includes(tag))
    })
    if (!relevant) return 0
    const age = Math.max(1, (worldStore.clock?.totalTicks ?? 0) - relevant.tick)
    return Math.max(0, 36 - Math.min(36, age))
  }

  function getEncounterWeight(event: RandomEvent) {
    let weight = Math.max(1, event.trigger.probability * 1000)
    if (isStoryEncounter(event)) weight += 24
    weight += Math.max(0, getRelationshipPressure(event))
    weight += getRecentMemoryEcho(event)
    return weight
  }

  function resolveEncounterBiasLabel(event: RandomEvent) {
    const relationshipPressure = getRelationshipPressure(event)
    const memoryEcho = getRecentMemoryEcho(event)
    if (relationshipPressure >= 10 || memoryEcho >= 18) {
      if (event.trigger.conditions?.some(condition => condition.type === 'hatred')) return '旧怨在前'
      if (event.trigger.conditions?.some(condition => condition.type === 'debt' || condition.type === 'favor')) return '旧恩在前'
      return '旧事压上来'
    }
    return '按常规浮动'
  }

  function buildEncounterDebugLine(event: RandomEvent) {
    const weight = getEncounterWeight(event)
    const pressure = Math.round(getRelationshipPressure(event) * 10) / 10
    const echo = getRecentMemoryEcho(event)
    return `${event.title} · 权重${weight} · 人情${pressure} · 回响${echo} · ${resolveEncounterBiasLabel(event)}`
  }

  function getStoryEncounterLifetimeLimit() {
    const realmStage = getRealmStage()
    const storyStage = getStoryProgressStage()

    if (storyStage <= 0 || realmStage <= 2) return 0
    if (realmStage <= 5 || storyStage <= 1) return 1
    if (realmStage <= 8 || storyStage <= 2) return 2
    if (realmStage <= 12 || storyStage <= 3) return 3
    return Infinity
  }

  function getStoryTriggerCountForToday() {
    return state.value.storyTriggerCountByDay[getCurrentDayKey()] ?? 0
  }

  function getDailyStatus() {
    return {
      dayKey: getCurrentDayKey(),
      dailyCount: getTodayTriggeredCount(),
      dailyLimit: DAILY_TRIGGER_LIMIT,
      storyCount: getStoryTriggerCountForToday(),
      storyLimit: DAILY_STORY_TRIGGER_LIMIT
    }
  }

  function isStoryDailySuppressed(event: RandomEvent) {
    if (!isStoryEncounter(event)) return false
    return getStoryTriggerCountForToday() >= DAILY_STORY_TRIGGER_LIMIT
  }

  function isStageSuppressed(event: RandomEvent) {
    const stage = getRealmStage()
    if (typeof event.trigger.stageMin === 'number' && stage < event.trigger.stageMin) return true
    if (typeof event.trigger.stageMax === 'number' && stage > event.trigger.stageMax) return true

    if (!isStoryEncounter(event)) {
      const stageLimit = getEarlyStageEncounterLimit()
      if (!Number.isFinite(stageLimit)) return false
      return false
    }

    const storyLimit = getStoryEncounterLifetimeLimit()
    if (!Number.isFinite(storyLimit)) return false
    return getStoryEncounterHistoryCount() >= storyLimit
  }

  function isStoryProgressSuppressed(event: RandomEvent) {
    if (!isStoryEncounter(event)) return false

    const progressStage = getStoryProgressStage()
    if (progressStage <= 0) return true

    const progressGateByEvent: Partial<Record<RandomEvent['id'], number>> = {
      adv_stranger_help: 1,
      social_mysterious_stranger: 2,
      npc_old_man_fight: 2,
      adv_old_enemy: 3
    }

    const requiredStage = progressGateByEvent[event.id] ?? 1
    return progressStage < requiredStage
  }

  function getEncounterStatus() {
    const daily = getDailyStatus()
    const storyStage = getStoryProgressStage()
    const realmStage = getRealmStage()
    const storyLifetimeLimit = getStoryEncounterLifetimeLimit()
    const storyHistoryCount = getStoryEncounterHistoryCount()
    const availableEvents = getAvailableEvents()
    const availableStoryEvents = availableEvents.filter(isStoryEncounter)

    let storyGateReason = '当前还碰不上与主线相关的人和事。'
    if (daily.storyCount >= daily.storyLimit) {
      storyGateReason = '今天的人情与旧怨已经露过一次面，后续要等明日再起。'
    } else if (storyStage <= 0) {
      storyGateReason = '前头还没撞上事，先去走动走动。'
    } else if (storyLifetimeLimit <= 0) {
      storyGateReason = '境界还浅，暂时压住与主线强相关的奇遇。'
    } else if (Number.isFinite(storyLifetimeLimit) && storyHistoryCount >= storyLifetimeLimit) {
      storyGateReason = '这一段该露面的伏笔已经差不多见完，得等这条事再往前走。'
    } else if (availableStoryEvents.length > 0) {
      storyGateReason = '已经有合适的因果在池子里，后面只会按概率和条件慢慢浮上来。'
    }

    const memoryHighlights = state.value.history
      .filter(entry => entry.npcId || entry.tags.includes('story-encounter'))
      .slice(0, 3)
      .map(entry => {
        const npcId = entry.npcId
        if (!npcId) return entry.title
        const relationship = worldStore.getRelationshipState(npcId)
        if (relationship.hatred >= 6) return `${entry.title}（记仇）`
        if (relationship.debt >= 6 || relationship.favor >= 8) return `${entry.title}（记恩）`
        if (relationship.fear >= 6) return `${entry.title}（余悸）`
        return entry.title
      })

    const weightedStoryPreview = availableStoryEvents
      .slice(0, 2)
      .map(event => {
        const npcId = event.choices
          .flatMap(choice => choice.memory ?? [])
          .find(memory => memory.npcId)?.npcId
        const relationship = npcId ? worldStore.getRelationshipState(npcId) : null
        if (relationship && relationship.hatred >= 6) return `${event.title}偏向旧怨回头`
        if (relationship && (relationship.debt >= 6 || relationship.favor >= 8)) return `${event.title}偏向旧恩回响`
        return `${event.title}仍在因果池里`
      })
    const weightedStoryDebug = availableStoryEvents
      .slice(0, ENCOUNTER_DEBUG_LIMIT)
      .map(buildEncounterDebugLine)

    return {
      dailyCount: daily.dailyCount,
      dailyLimit: daily.dailyLimit,
      storyCount: daily.storyCount,
      storyLimit: daily.storyLimit,
      realmStage,
      storyStage,
      storyHistoryCount,
      storyLifetimeLimit,
      availableCount: availableEvents.length,
      availableStoryCount: availableStoryEvents.length,
      weightedStoryPreview,
      weightedStoryDebug,
      isDailyBlocked: daily.dailyCount >= daily.dailyLimit,
      isStoryDailyBlocked: daily.storyCount >= daily.storyLimit,
      storyGateReason,
      memoryHighlights
    }
  }

  // 记录事件触发时间
  function recordCooldown(eventId: string, currentTick: number) {
    const existing = state.value.cooldowns.find(c => c.eventId === eventId)
    if (existing) {
      existing.lastTriggerTick = currentTick
    } else {
      state.value.cooldowns.push({ eventId, lastTriggerTick: currentTick })
    }
    state.value.globalLastTriggerTick = currentTick
    const today = getCurrentDayKey()
    if (state.value.lastTriggerDayKey === today) {
      state.value.dailyTriggerCount += 1
    } else {
      state.value.lastTriggerDayKey = today
      state.value.dailyTriggerCount = 1
    }
    const event = getEventById(eventId)
    if (event && isStoryEncounter(event)) {
      state.value.storyTriggerCountByDay[today] = (state.value.storyTriggerCountByDay[today] ?? 0) + 1
    }
    saveState()
  }

  function addEventMemory(entry: RandomEventMemoryEntry) {
    state.value.history.unshift(entry)
    if (state.value.history.length > 60) {
      state.value.history = state.value.history.slice(0, 60)
    }
    saveState()
  }

  // 按 ID 获取事件
  function getEventById(id: string): RandomEvent | undefined {
    return ALL_RANDOM_EVENTS.find(e => e.id === id)
  }

  // 检查条件是否满足
  function getRelationshipMetric(condition: Extract<RandomEventCondition, { type: 'favor' | 'hatred' | 'debt' | 'fear' | 'bond' }>) {
    const relationship = worldStore.getRelationshipState(condition.npcId)
    if (condition.type === 'bond') {
      return relationship.bond
    }
    return relationship[condition.type]
  }

  function checkCondition(cond: RandomEventCondition): boolean {
    switch (cond.type) {
      case 'realm':
        return playerStore.realm === cond.value
      case 'flag': {
        const present = cond.present ?? true
        return present ? worldStore.hasWorldFlag(cond.value) : !worldStore.hasWorldFlag(cond.value)
      }
      case 'favor':
      case 'hatred':
      case 'debt':
      case 'fear': {
        const value = Number(getRelationshipMetric(cond))
        if (typeof cond.min === 'number' && value < cond.min) return false
        if (typeof cond.max === 'number' && value > cond.max) return false
        return true
      }
      case 'bond':
        return getRelationshipMetric(cond) === cond.value
      case 'npc_unlocked':
        return worldStore.isNpcUnlocked(cond.npcId)
      case 'story_memory': {
        const matches = state.value.history.filter(entry => {
          if (cond.eventId && entry.eventId !== cond.eventId) return false
          if (cond.npcId && entry.npcId !== cond.npcId) return false
          if (cond.tag && !entry.tags.includes(cond.tag)) return false
          return true
        }).length
        if (typeof cond.min === 'number' && matches < cond.min) return false
        if (typeof cond.max === 'number' && matches > cond.max) return false
        return true
      }
      case 'item':
        return playerStore.inventory.some(item => item.id === cond.value || item.definitionId === cond.value)
      default:
        return true
    }
  }

  function checkConditions(event: RandomEvent): boolean {
    if (!event.trigger.conditions) return true
    return event.trigger.conditions.every(checkCondition)
  }

  function getAllowedTypesForCurrentRoute() {
    const path = window.location.pathname
    if (path.includes('/game/cultivation')) return new Set<RandomEventType>(['cultivation', 'social'])
    if (path.includes('/game/adventure')) return new Set<RandomEventType>(['adventure', 'social', 'world'])
    if (path.includes('/game/map')) return new Set<RandomEventType>(['world', 'social', 'adventure'])
    if (path.includes('/game/sect')) return new Set<RandomEventType>(['sect', 'social'])
    if (path.includes('/game/companion')) return new Set<RandomEventType>(['social'])
    return new Set<RandomEventType>(['social'])
  }

  // 获取可触发的事件（不过滤概率）
  function getAvailableEvents(type?: RandomEventType): RandomEvent[] {
    const currentTick = worldStore.clock?.totalTicks ?? 0
    const allowedTypes = type ? null : getAllowedTypesForCurrentRoute()
    return ALL_RANDOM_EVENTS.filter(event => {
      if (type && event.type !== type) return false
      if (allowedTypes && !allowedTypes.has(event.type)) return false
      if (isOnCooldown(event.id, currentTick)) return false
      if (isGloballySuppressed(currentTick, event)) return false
      if (isDailySuppressed()) return false
      if (isStoryDailySuppressed(event)) return false
      if (isStageSuppressed(event)) return false
      if (isStoryProgressSuppressed(event)) return false
      if (!checkConditions(event)) return false
      return true
    }).sort((left, right) => getEncounterWeight(right) - getEncounterWeight(left))
  }

  // 检查并获取一个随机事件（按概率 roll）
  function tryTriggerEvent(type?: RandomEventType): RandomEvent | null {
    const available = getAvailableEvents(type)
    const currentTick = worldStore.clock?.totalTicks ?? 0
    const rolledPool = [...available]

    for (const event of rolledPool) {
      if (event.trigger.idleOnly && !playerStore.isIdling) continue
      const weightedProbability = Math.min(
        0.85,
        event.trigger.probability + getEncounterWeight(event) / 5000
      )
      if (Math.random() < weightedProbability) {
        recordCooldown(event.id, currentTick)
        return event
      }
    }
    return null
  }

  // 检查事件并设置为待处理（交互模式）
  function checkForEvent(type?: RandomEventType): boolean {
    if (currentEvent.value) return false // 已有待处理事件
    if (window.location.pathname.includes('/game/story')) return false
    if (window.location.pathname.includes('/game/battle')) return false
    if (isDailySuppressed()) return false
    const event = tryTriggerEvent(type)
    if (event) {
      currentEvent.value = event
      return true
    }
    return false
  }

  // 玩家确认选项
  function confirmChoice(choiceIndex: number) {
    const event = currentEvent.value
    if (!event) return
    fireEvent(event, choiceIndex)
    showEventToast(event)
    currentEvent.value = null
  }

  // 忽略事件
  function dismissEvent() {
    currentEvent.value = null
  }

  // 触发事件（执行效果+显示通知）
  function fireEvent(event: RandomEvent, choiceIndex: number) {
    const choice = event.choices[choiceIndex]
    if (!choice) return

    for (const effect of choice.effects) {
      switch (effect.type) {
        case 'realm_exp':
          if (effect.value) playerStore.addCultivation(effect.value)
          break
        case 'gold':
          if (effect.value) playerStore.addGold(effect.value)
          break
        case 'flag_set':
          if (effect.flag) worldStore.addWorldFlag(effect.flag)
          break
        case 'npc_favor':
          if (effect.npcId && effect.value) {
            worldStore.applyStoryRelationshipChange(effect.npcId, {
              favorDelta: effect.value,
              title: `${event.title}留下回响`,
              text: `你的抉择让${effect.npcId}对你另眼相看。`
            })
          }
          break
      }
    }

    if (choice.memory?.length) {
      for (const memory of choice.memory) {
        if (memory.type === 'flag' && memory.flag) {
          worldStore.addWorldFlag(memory.flag, memory.title, memory.text)
        }
        if (memory.type === 'unlock_npc' && memory.npcId) {
          worldStore.unlockNpc(memory.npcId, memory.text || `${event.title}让此人记住了你。`)
        }
        if (memory.type === 'favor' && memory.npcId) {
          worldStore.applyStoryRelationshipChange(memory.npcId, {
            favorDelta: memory.amount ?? 1,
            title: memory.title || `${event.title}结下善缘`,
            text: memory.text || '这段因果会在后续再次回响。'
          })
        }
        if (memory.type === 'hatred' && memory.npcId) {
          worldStore.applyStoryRelationshipChange(memory.npcId, {
            hatredDelta: memory.amount ?? 1,
            title: memory.title || `${event.title}结下仇怨`,
            text: memory.text || '这段仇怨不会就此消失。'
          })
        }
        if (memory.type === 'debt' && memory.npcId) {
          worldStore.applyStoryRelationshipChange(memory.npcId, {
            debtDelta: memory.amount ?? 1,
            title: memory.title || `${event.title}留下一笔人情`,
            text: memory.text || '对方会记住这份恩情。'
          })
        }
        if (memory.type === 'fear' && memory.npcId) {
          worldStore.applyStoryRelationshipChange(memory.npcId, {
            fearDelta: memory.amount ?? 1,
            title: memory.title || `${event.title}留下阴影`,
            text: memory.text || '你的手段让对方生出畏惧。'
          })
        }
        if (memory.type === 'journey_note') {
          worldStore.recordManualPlayerJourney({
            severity: 'normal',
            title: memory.title || event.title,
            text: memory.text || event.description,
            rewards: [],
            tags: memory.tags ?? ['encounter-memory', 'story-encounter', event.id]
          })
        }
      }
    }

    addEventMemory({
      eventId: event.id,
      choiceIndex,
      tick: worldStore.clock?.totalTicks ?? 0,
      npcId: choice.memory?.find(item => item.npcId)?.npcId,
      title: event.title,
      summary: choice.text,
      tags: [...(event.storyTags ?? []), event.type, ...(isStoryEncounter(event) ? ['story-encounter'] : [])]
    })
  }

  // 显示事件通知（toast）
  function showEventToast(event: RandomEvent) {
    const title = `缘起 · ${event.title}`
    success(title)
    info(event.prompt || event.description)
  }

  return {
    tryTriggerEvent, getAvailableEvents,
    fireEvent, showEventToast,
    cooldowns, currentEvent, hasCurrentEvent, eventHistory,
    checkForEvent, confirmChoice, dismissEvent,
    getEncounterStatus
  }
}
