import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type { WorldRealm, GameDate, MapArea, HistoryEvent, HistoryEventType } from '@/types/map'
import {
  WORLD_REALMS,
  WORLD_REALM_CONFIGS,
  SEASON_EFFECTS,
  createInitialGameDate,
  advanceGameDate,
  formatDate,
  getAreasByRealm,
  getAreaById,
  isRealmUnlocked
} from '@/types/map'
import { usePlayerStore } from './playerStore'
import { useSectStore } from './sectStore'

// 随机事件模板
const RANDOM_EVENTS = [
  { type: 'world' as const, title: '灵气波动', description: '天地间灵气突然变得浓郁...', impact: '今日修炼效率提升' },
  { type: 'world' as const, title: '妖兽入侵', description: '某处妖兽突然暴动，需要修仙者前去镇压。', impact: '历练区域敌人增强' },
  { type: 'world' as const, title: '仙缘降临', description: '传说中有仙缘降临人间，机缘巧合者可得奇遇。', impact: '可能遇到稀有NPC' },
  { type: 'personal' as const, title: '顿悟', description: '修炼中突有所感，对大道的理解更深一层。', impact: '获得额外修为' },
  { type: 'personal' as const, title: '发现秘境', description: '在一处隐蔽之地发现了上古遗留的秘境入口。', impact: '解锁新的探索地点' },
  { type: 'world' as const, title: '宗门大比', description: '各大宗门即将举行大比，天下修士齐聚一堂。', impact: '宗门声望奖励提升' },
  { type: 'world' as const, title: '天象异变', description: '星象显示有大变将至，各方势力蠢蠢欲动。', impact: '可能触发特殊事件' }
]

// 地图状态接口
interface MapState {
  // 游戏日期
  currentDate: GameDate
  // 已解锁的界域
  unlockedRealms: WorldRealm[]
  // 已攻占的区域ID
  conqueredAreas: string[]
  // 当前选中的界域
  currentRealm: WorldRealm
  // 历史事件记录
  historyEvents: HistoryEvent[]
  // 总游戏天数（用于统计）
  totalDaysPlayed: number
}

// 默认地图数据
function getDefaultMapState(): MapState {
  return {
    currentDate: createInitialGameDate(),
    unlockedRealms: ['人界'], // 初始只解锁人界
    conqueredAreas: [],
    currentRealm: '人界',
    historyEvents: [],
    totalDaysPlayed: 0
  }
}

// LocalStorage key
const STORAGE_KEY = 'woyu-xiuxian-map'

// 事件ID计数器
let eventIdCounter = 0

export const useMapStore = defineStore('map', () => {
  // ====== 状态 ======

  // 从 localStorage 加载或使用默认值
  let initialData: MapState
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData) as Partial<MapState>
      const defaults = getDefaultMapState()
      initialData = {
        ...defaults,
        ...parsed,
        // 确保日期格式正确
        currentDate: parsed.currentDate ?? defaults.currentDate,
        unlockedRealms: parsed.unlockedRealms ?? defaults.unlockedRealms,
        historyEvents: parsed.historyEvents ?? defaults.historyEvents
      }
    } else {
      initialData = getDefaultMapState()
    }
  } catch (e) {
    console.warn('Failed to load map data from localStorage, using defaults:', e)
    initialData = getDefaultMapState()
  }

  // 游戏日期
  const currentDate = ref<GameDate>({ ...initialData.currentDate })

  // 已解锁的界域
  const unlockedRealms = ref<WorldRealm[]>([...initialData.unlockedRealms])

  // 已攻占的区域
  const conqueredAreas = ref<string[]>([...initialData.conqueredAreas])

  // 当前选中的界域
  const currentRealm = ref<WorldRealm>(initialData.currentRealm)

  // 历史事件
  const historyEvents = ref<HistoryEvent[]>([...initialData.historyEvents])

  // 总游戏天数
  const totalDaysPlayed = ref(initialData.totalDaysPlayed)

  // ====== 计算属性 ======

  // 当前季节效果
  const currentSeasonEffect = computed(() => SEASON_EFFECTS[currentDate.value.season])

  // ��前界域配置
  const currentRealmConfig = computed(() => WORLD_REALM_CONFIGS[currentRealm.value])

  // 当前界域的区域列表
  const currentRealmAreas = computed(() => getAreasByRealm(currentRealm.value))

  // 当前界域已攻占的区域数量
  const conqueredCountInCurrentRealm = computed(() => {
    const areaIds = currentRealmAreas.value.map(a => a.id)
    return conqueredAreas.value.filter(id => areaIds.includes(id)).length
  })

  // 当前界域是否已完全征服
  const isCurrentRealmConquered = computed(() => {
    return conqueredCountInCurrentRealm.value >= currentRealmAreas.value.length
  })

  // 日期显示文本
  const dateDisplayText = computed(() => formatDate(currentDate.value))

  // 所有界域的解锁状态
  const realmUnlockStatus = computed(() => {
    const playerStore = usePlayerStore()
    const status: Record<WorldRealm, boolean> = {} as Record<WorldRealm, boolean>

    for (const realm of WORLD_REALMS) {
      status[realm] = isRealmUnlocked(
        realm,
        playerStore.realm,
        playerStore.realmLevel
      )
    }

    return status
  })

  // ====== 方法 ======

  // 保存到 localStorage
  function saveToStorage() {
    try {
      const data: MapState = {
        currentDate: toRaw(currentDate.value),
        unlockedRealms: toRaw(unlockedRealms.value),
        conqueredAreas: toRaw(conqueredAreas.value),
        currentRealm: currentRealm.value,
        historyEvents: toRaw(historyEvents.value),
        totalDaysPlayed: totalDaysPlayed.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save map data to localStorage:', e)
    }
  }

  // 推进日期（每天调用）
  function advanceDay() {
    currentDate.value = advanceGameDate(currentDate.value)
    totalDaysPlayed.value++

    // 检查是否需要解锁新界域
    checkRealmUnlocks()

    // 刷新宗门任务
    const sectStore = useSectStore()
    sectStore.refreshTasks()

    // 记录日期推进事件（每10天记录一次）
    if (totalDaysPlayed.value % 10 === 0) {
      recordEvent({
        type: 'personal',
        title: '修仙岁月',
        description: `不知不觉已修仙${totalDaysPlayed.value}天，道心渐固...`
      })
    }

    // 随机触发世界事件（10%概率）
    if (Math.random() < 0.1) {
      const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
      if (randomEvent) {
        recordEvent({
          type: randomEvent.type,
          title: randomEvent.title,
          description: randomEvent.description,
          impact: randomEvent.impact
        })
      }
    }

    return currentDate.value
  }

  // 检查界域解锁
  function checkRealmUnlocks() {
    const playerStore = usePlayerStore()

    for (const realm of WORLD_REALMS) {
      if (!unlockedRealms.value.includes(realm)) {
        if (isRealmUnlocked(realm, playerStore.realm, playerStore.realmLevel)) {
          unlockRealm(realm)
        }
      }
    }
  }

  // 解锁界域
  function unlockRealm(realm: WorldRealm) {
    if (!unlockedRealms.value.includes(realm)) {
      unlockedRealms.value.push(realm)

      // 记录事件
      const config = WORLD_REALM_CONFIGS[realm]
      recordEvent({
        type: 'world',
        title: `踏入${realm}`,
        description: config.description,
        impact: `解锁${realm}的所有区域和宗门`
      })
    }
  }

  // 攻占区域
  function conquerArea(areaId: string) {
    if (!conqueredAreas.value.includes(areaId)) {
      conqueredAreas.value.push(areaId)

      const area = getAreaById(areaId)
      if (area) {
        // 记录事件
        recordEvent({
          type: 'personal',
          title: `攻占${area.name}`,
          description: `成功征服${area.name}，该区域的宗门现已向你开放。`,
          impact: `解锁${area.sects.length}个宗门`
        })

        // 检查并解锁宗门
        const sectStore = useSectStore()
        sectStore.checkUnlockedSects()

        // 检查是否完成当前界域
        if (isCurrentRealmConquered.value) {
          recordEvent({
            type: 'world',
            title: `${currentRealm.value}平定`,
            description: `恭喜！你已征服${currentRealm.value}所有区域，可以前往下一个界域了。`
          })
        }
      }
    }
  }

  // 切换当前界域
  function switchRealm(realm: WorldRealm) {
    if (unlockedRealms.value.includes(realm)) {
      currentRealm.value = realm
    }
  }

  // 记录历史事件
  function recordEvent(event: { type: HistoryEventType; title: string; description: string; impact?: string }) {
    const newEvent: HistoryEvent = {
      id: `event_${Date.now()}_${eventIdCounter++}`,
      date: { ...currentDate.value },
      ...event
    }
    historyEvents.value.unshift(newEvent)

    // 只保留最近100条事件
    if (historyEvents.value.length > 100) {
      historyEvents.value = historyEvents.value.slice(0, 100)
    }
  }

  // 获取区域信息
  function getAreaInfo(areaId: string): MapArea | undefined {
    return getAreaById(areaId)
  }

  // 检查区域是否已攻占
  function isAreaConquered(areaId: string): boolean {
    return conqueredAreas.value.includes(areaId)
  }

  // 检查界域是否已解锁
  function isRealmUnlockedByPlayer(realm: WorldRealm): boolean {
    return unlockedRealms.value.includes(realm)
  }

  // 获取区域中的宗门ID列表
  function getSectsInArea(areaId: string): string[] {
    const area = getAreaById(areaId)
    return area?.sects ?? []
  }

  // 获取已攻占区域的所有宗门
  function getUnlockedSects(): string[] {
    const sects: string[] = []
    for (const areaId of conqueredAreas.value) {
      const area = getAreaById(areaId)
      if (area) {
        sects.push(...area.sects)
      }
    }
    return sects
  }

  // 获取指定类型的事件
  function getEventsByType(type: HistoryEventType): HistoryEvent[] {
    return historyEvents.value.filter(e => e.type === type)
  }

  // 获取最近的事件
  function getRecentEvents(count: number = 10): HistoryEvent[] {
    return historyEvents.value.slice(0, count)
  }

  // 监听变化自动保存
  watchEffect(() => {
    saveToStorage()
  })

  return {
    // 状态
    currentDate,
    unlockedRealms,
    conqueredAreas,
    currentRealm,
    historyEvents,
    totalDaysPlayed,

    // 计算属性
    currentSeasonEffect,
    currentRealmConfig,
    currentRealmAreas,
    conqueredCountInCurrentRealm,
    isCurrentRealmConquered,
    dateDisplayText,
    realmUnlockStatus,

    // 方法
    advanceDay,
    unlockRealm,
    conquerArea,
    switchRealm,
    recordEvent,
    getAreaInfo,
    isAreaConquered,
    isRealmUnlockedByPlayer,
    getSectsInArea,
    getUnlockedSects,
    getEventsByType,
    getRecentEvents,
    saveToStorage
  }
})
