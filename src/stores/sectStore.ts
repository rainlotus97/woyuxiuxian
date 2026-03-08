import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type {
  SectDefinition,
  SectPosition,
  SectTask,
  SectTaskType,
  SectRelation,
  SectWar,
  SectEvent
} from '@/types/sect'
import {
  SECT_POSITIONS,
  SECT_FACILITIES,
  ALL_SECTS,
  getSectById,
  generateRandomTask
} from '@/types/sect'
import { useMapStore } from './mapStore'
import { usePlayerStore } from './playerStore'

const STORAGE_KEY = 'woyu-xiuxian-sect'

// 宗门状态接口
interface SectState {
  joinedSectId: string | null
  positionLevel: number
  contribution: number
  reputation: number
  sectHp: number
  sectMaxHp: number
  relations: Record<string, SectRelation>
  tasks: SectTask[]
  activeWar: SectWar | null
  activeEvent: SectEvent | null
  unlockedSects: string[]
  facilityLevels: Record<string, number>
  lastTaskRefresh: number
  lastSalaryClaim: number
}

// 默认宗门状态
function getDefaultSectState(): SectState {
  return {
    joinedSectId: null,
    positionLevel: 1,
    contribution: 0,
    reputation: 0,
    sectHp: 0,
    sectMaxHp: 0,
    relations: {},
    tasks: [],
    activeWar: null,
    activeEvent: null,
    unlockedSects: [],
    facilityLevels: {},
    lastTaskRefresh: Date.now(),
    lastSalaryClaim: 0
  }
}

export const useSectStore = defineStore('sect', () => {
  // 从 localStorage 加载或使用默认值
  let initialData: SectState
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData) as Partial<SectState>
      const defaults = getDefaultSectState()
      initialData = {
        ...defaults,
        ...parsed,
        joinedSectId: parsed.joinedSectId ?? defaults.joinedSectId,
        positionLevel: parsed.positionLevel ?? defaults.positionLevel,
        contribution: parsed.contribution ?? defaults.contribution,
        reputation: parsed.reputation ?? defaults.reputation,
        relations: parsed.relations ?? defaults.relations,
        tasks: parsed.tasks ?? defaults.tasks,
        unlockedSects: parsed.unlockedSects ?? defaults.unlockedSects,
        facilityLevels: parsed.facilityLevels ?? defaults.facilityLevels
      }
    } else {
      initialData = getDefaultSectState()
    }
  } catch (e) {
    console.warn('Failed to load sect data from localStorage, using defaults:', e)
    initialData = getDefaultSectState()
  }

  // 状态
  const joinedSectId = ref<string | null>(initialData.joinedSectId)
  const positionLevel = ref<number>(initialData.positionLevel)
  const contribution = ref<number>(initialData.contribution)
  const reputation = ref<number>(initialData.reputation)
  const sectHp = ref<number>(initialData.sectHp)
  const sectMaxHp = ref<number>(initialData.sectMaxHp)
  const relations = ref<Record<string, SectRelation>>(initialData.relations)
  const tasks = ref<SectTask[]>(initialData.tasks)
  const activeWar = ref<SectWar | null>(initialData.activeWar)
  const activeEvent = ref<SectEvent | null>(initialData.activeEvent)
  const unlockedSects = ref<string[]>(initialData.unlockedSects)
  const facilityLevels = ref<Record<string, number>>(initialData.facilityLevels)
  const lastTaskRefresh = ref<number>(initialData.lastTaskRefresh)
  const lastSalaryClaim = ref<number>(initialData.lastSalaryClaim)

  // ====== 计算属性 ======

  // 当前宗门信息
  const currentSect = computed<SectDefinition | null>(() => {
    if (!joinedSectId.value) return null
    return getSectById(joinedSectId.value) ?? null
  })

  // 当前职位信息
  const currentPosition = computed<SectPosition | null>(() => {
    return SECT_POSITIONS.find(p => p.level === positionLevel.value) ?? null
  })

  // 职位名称
  const positionName = computed<string>(() => {
    return currentPosition.value?.name ?? '外门弟子'
  })

  // 下一个职位
  const nextPosition = computed<SectPosition | null>(() => {
    const nextLevel = positionLevel.value + 1
    if (nextLevel > SECT_POSITIONS.length) return null
    return SECT_POSITIONS.find(p => p.level === nextLevel) ?? null
  })

  // 是否可以晋升
  const canPromote = computed<boolean>(() => {
    if (!nextPosition.value) return false
    return contribution.value >= nextPosition.value.requiredContribution
  })

  // 宗门血量百分比
  const sectHpPercent = computed<number>(() => {
    if (sectMaxHp.value <= 0) return 100
    return (sectHp.value / sectMaxHp.value) * 100
  })

  // 已解锁的宗门列表
  const unlockedSectList = computed<SectDefinition[]>(() => {
    return unlockedSects.value
      .map(id => getSectById(id))
      .filter((s): s is SectDefinition => s !== undefined)
  })

  // 每日任务
  const dailyTasks = computed<SectTask[]>(() => {
    return tasks.value.filter(t => t.type === 'daily')
  })

  // 每周任务
  const weeklyTasks = computed<SectTask[]>(() => {
    return tasks.value.filter(t => t.type === 'weekly')
  })

  // 已完成待领取的任务
  const completedTasks = computed<SectTask[]>(() => {
    return tasks.value.filter(t => t.completed && !t.claimed)
  })

  // ====== 方法 ======

  // 保存到 localStorage
  function saveToStorage() {
    try {
      const data: SectState = {
        joinedSectId: joinedSectId.value,
        positionLevel: positionLevel.value,
        contribution: contribution.value,
        reputation: reputation.value,
        sectHp: sectHp.value,
        sectMaxHp: sectMaxHp.value,
        relations: toRaw(relations.value),
        tasks: toRaw(tasks.value),
        activeWar: toRaw(activeWar.value),
        activeEvent: toRaw(activeEvent.value),
        unlockedSects: toRaw(unlockedSects.value),
        facilityLevels: toRaw(facilityLevels.value),
        lastTaskRefresh: lastTaskRefresh.value,
        lastSalaryClaim: lastSalaryClaim.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save sect data to localStorage:', e)
    }
  }

  // 加入宗门
  function joinSect(sectId: string): boolean {
    const sect = getSectById(sectId)
    if (!sect) {
      return false
    }

    // 检查是否解锁
    if (!unlockedSects.value.includes(sectId)) {
      return false
    }

    // 检查是否已加入其他宗门
    if (joinedSectId.value) {
      return false
    }

    // 加入宗门
    joinedSectId.value = sectId
    positionLevel.value = 1
    contribution.value = 0
    reputation.value = 0
    sectHp.value = sect.maxHp
    sectMaxHp.value = sect.maxHp
    facilityLevels.value = {}

    // 初始化设施等级
    for (const facility of SECT_FACILITIES) {
      facilityLevels.value[facility.id] = 1
    }

    // 生成初始任务
    generateTasks('daily')
    generateTasks('weekly')

    return true
  }

  // 退出宗门
  function leaveSect(): boolean {
    if (!joinedSectId.value) return false
    joinedSectId.value = null
    positionLevel.value = 1
    contribution.value = 0
    reputation.value = 0
    tasks.value = []
    activeWar.value = null
    activeEvent.value = null
    return true
  }

  // 晋升职位
  function promotePosition(): boolean {
    if (!canPromote.value || !nextPosition.value) {
      return false
    }
    // 扣除贡献点
    contribution.value -= nextPosition.value.requiredContribution
    positionLevel.value++
    return true
  }

  // 添加贡献点
  function addContribution(amount: number) {
    contribution.value += amount
  }

  // 添加声望
  function addReputation(amount: number) {
    reputation.value += amount
  }

  // 完成任务进度
  function completeTask(taskId: string): boolean {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.completed) return false

    task.progress++
    if (task.progress >= task.requirements.count) {
      task.completed = true
    }
    return true
  }

  // 领取任务奖励
  function claimTaskReward(taskId: string): boolean {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || !task.completed || task.claimed) return false

    // 发放奖励
    task.claimed = true
    addContribution(task.rewards.contribution)
    addReputation(10)
    const playerStore = usePlayerStore()
    playerStore.addGold(task.rewards.gold)
    if (task.rewards.exp) {
      playerStore.addCultivation(task.rewards.exp)
    }
    return true
  }

  // 生成任务
  function generateTasks(type: SectTaskType) {
    if (!joinedSectId.value) return
    const count = type === 'daily' ? 3 : type === 'weekly' ? 2 : 1
    for (let i = 0; i < count; i++) {
      const task = generateRandomTask(type, joinedSectId.value)
      tasks.value.push(task)
    }
  }

  // 刷新任务
  function refreshTasks() {
    if (!joinedSectId.value) return
    const now = Date.now()
    const shouldRefreshDaily = now - lastTaskRefresh.value > 24 * 60 * 60 * 1000
    const shouldRefreshWeekly = now - lastTaskRefresh.value > 7 * 24 * 60 * 60 * 1000

    if (shouldRefreshDaily || shouldRefreshWeekly) {
      // 清除过期任务
      tasks.value = tasks.value.filter(t => t.type === 'special')
      lastTaskRefresh.value = now

      // 生成新任务
      generateTasks('daily')
      generateTasks('weekly')
    }
  }

  // 获取设施等级
  function getFacilityLevel(facilityId: string): number {
    return facilityLevels.value[facilityId] ?? 1
  }

  // 升级设施
  function upgradeFacility(facilityId: string): boolean {
    const facility = SECT_FACILITIES.find(f => f.id === facilityId)
    if (!facility || !joinedSectId.value) return false

    // 检查职位要求
    if (positionLevel.value < facility.unlockPosition) {
      return false
    }

    const currentLevel = getFacilityLevel(facilityId)
    if (currentLevel >= facility.maxLevel) {
      return false
    }

    // 检查资源
    const playerStore = usePlayerStore()
    if (playerStore.gold < facility.upgradeCost.gold) {
      return false
    }
    if (contribution.value < facility.upgradeCost.contribution) {
      return false
    }

    // 扣除资源
    playerStore.addGold(-facility.upgradeCost.gold)
    contribution.value -= facility.upgradeCost.contribution
    facilityLevels.value[facilityId] = currentLevel + 1
    return true
  }

  // 设置宗门关系
  function setRelation(sectId: string, relation: SectRelation) {
    if (!joinedSectId.value) return
    relations.value[sectId] = relation
  }

  // 发起战争
  function declareWar(targetSectId: string): boolean {
    if (!joinedSectId.value) return false
    if (positionLevel.value < 4) return false
    if (activeWar.value) return false

    const targetSect = getSectById(targetSectId)
    if (!targetSect) return false

    activeWar.value = {
      id: `war_${Date.now()}`,
      attackerSectId: joinedSectId.value,
      defenderSectId: targetSectId,
      startDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      },
      status: 'ongoing',
      attackerScore: 0,
      defenderScore: 0,
      winScore: 100
    }
    relations.value[targetSectId] = 'at_war'
    return true
  }

  // 推进战争
  function advanceWar(attackerWon: boolean): boolean {
    if (!activeWar.value) return false

    if (attackerWon) {
      activeWar.value.attackerScore += 10 + Math.floor(Math.random() * 5)
    } else {
      activeWar.value.defenderScore += 10 + Math.floor(Math.random() * 5)
    }

    // 检查是否结束
    if (activeWar.value.attackerScore >= activeWar.value.winScore) {
      activeWar.value.status = 'victory'
      handleWarEnd(true)
    } else if (activeWar.value.defenderScore >= activeWar.value.winScore) {
      activeWar.value.status = 'defeat'
      handleWarEnd(false)
    }
    return true
  }

  // 处理战争结束
  function handleWarEnd(attackerWon: boolean) {
    if (!activeWar.value) return

    const winner = attackerWon ? 'attacker' : 'defender'
    activeWar.value.result = {
      winner,
      rewards: winner === 'attacker' ? ['500贡献点', '1000灵石', '100声望'] : ['200贡献点', '500灵石'],
      penalties: winner === 'attacker' ? [] : ['100声望', '200贡献点']
    }

    if (winner === 'attacker') {
      addContribution(500)
      const playerStore = usePlayerStore()
      playerStore.addGold(1000)
      addReputation(100)
    } else {
      addContribution(200)
      const playerStore = usePlayerStore()
      playerStore.addGold(500)
      contribution.value = Math.max(0, contribution.value - 200)
      reputation.value = Math.max(0, reputation.value - 100)
    }

    if (activeWar.value) {
      relations.value[activeWar.value.defenderSectId] = attackerWon ? 'hostile' : 'neutral'
    }
    activeWar.value = null
  }

  // 处理随机事件
  function handleEventChoice(choiceId: string): boolean {
    if (!activeEvent.value) return false

    const choice = activeEvent.value.choices.find(c => c.id === choiceId)
    if (!choice) return false

    // 应用效果
    for (const effect of choice.outcome.effects) {
      switch (effect.type) {
        case 'gold':
          const playerStore = usePlayerStore()
          playerStore.addGold(effect.value as number)
          break
        case 'contribution':
          addContribution(effect.value as number)
          break
        case 'reputation':
          addReputation(effect.value as number)
          break
      }
    }

    activeEvent.value.handled = true
    activeEvent.value.selectedChoice = choiceId
    activeEvent.value = null
    return true
  }

  // 解锁宗门
  function unlockSect(sectId: string) {
    if (!unlockedSects.value.includes(sectId)) {
      unlockedSects.value.push(sectId)
    }
  }

  // 检查解锁的宗门
  function checkUnlockedSects() {
    const mapStore = useMapStore()
    const conqueredAreas = mapStore.conqueredAreas

    for (const sect of ALL_SECTS) {
      if (conqueredAreas.includes(sect.areaId) && !unlockedSects.value.includes(sect.id)) {
        unlockSect(sect.id)
      }
    }
  }

  // 领取每日俸禄
  function claimDailySalary(): { gold: number; contribution: number } | null {
    if (!joinedSectId.value || !currentPosition.value) {
      return null
    }

    const now = Date.now()
    // 24小时内只能领一次
    if (now - lastSalaryClaim.value < 24 * 60 * 60 * 1000) {
      return null
    }

    const salary = currentPosition.value.dailySalary
    const playerStore = usePlayerStore()
    playerStore.addGold(salary)
    addContribution(Math.floor(salary / 2))
    lastSalaryClaim.value = now

    return { gold: salary, contribution: Math.floor(salary / 2) }
  }

  // 检查是否可以领取俸禄
  const canClaimSalary = computed(() => {
    if (!joinedSectId.value || !currentPosition.value) return false
    const now = Date.now()
    return now - lastSalaryClaim.value >= 24 * 60 * 60 * 1000
  })

  // 监听变化自动保存
  watchEffect(() => {
    saveToStorage()
  })

  return {
    // 状态
    joinedSectId,
    positionLevel,
    contribution,
    reputation,
    sectHp,
    sectMaxHp,
    relations,
    tasks,
    activeWar,
    activeEvent,
    unlockedSects,
    facilityLevels,
    lastTaskRefresh,
    lastSalaryClaim,

    // 计算属性
    currentSect,
    currentPosition,
    positionName,
    nextPosition,
    canPromote,
    sectHpPercent,
    unlockedSectList,
    dailyTasks,
    weeklyTasks,
    completedTasks,
    canClaimSalary,

    // 方法
    joinSect,
    leaveSect,
    promotePosition,
    addContribution,
    addReputation,
    completeTask,
    claimTaskReward,
    generateTasks,
    refreshTasks,
    getFacilityLevel,
    upgradeFacility,
    setRelation,
    declareWar,
    advanceWar,
    handleWarEnd,
    handleEventChoice,
    unlockSect,
    checkUnlockedSects,
    claimDailySalary,
    saveToStorage
  }
})
