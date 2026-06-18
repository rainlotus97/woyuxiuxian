import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type {
  SectDefinition,
  SectPosition,
  SectTask,
  SectTaskType,
  SectRelation,
  SectWar,
  SectEvent,
  SectWorldCondition
} from '@/types/sect'
import {
  SECT_POSITIONS,
  SECT_FACILITIES,
  ALL_SECTS,
  getSectById,
  generateRandomTask
} from '@/types/sect'
import {
  resolveSectAuthority,
  type SectDirectiveId
} from '@/sect/runtime/sectPositionResolver'
import {
  applyDirectiveToTaskRewards,
  getSectDirectiveEffects
} from '@/sect/runtime/sectDirectiveEffects'
import { resolveSectStipend } from '@/sect/runtime/sectStipendResolver'
import {
  getSectRecoveryOption,
  resolveSectRecoveryOutcome,
  resolveSectRecoveryState,
  type SectRecoveryActionId
} from '@/sect/runtime/sectRecoveryResolver'
import { resolveSectRelationDrift, resolveSectWarProgress } from '@/sect/runtime/sectWorldResolver'
import type { SectWarResolution } from '@/sect/runtime/sectWorldTypes'
import {
  resolveAvailableSeeds,
  resolveGardenAccelerateCost,
  resolveGardenHarvest,
  resolveGardenSlotCount
} from '@/sect/runtime/sectGardenResolver'
import {
  resolveAlchemyCraft,
  resolveAvailableAlchemyRecipes
} from '@/sect/runtime/sectAlchemyResolver'
import { useMapStore } from './mapStore'
import { usePlayerStore } from './playerStore'
import { ALCHEMY_RECIPES, getAlchemyRecipeById } from '@/types/alchemy'
import { SEEDS, getSeedById, type PlantedCrop } from '@/types/garden'

const STORAGE_KEY = 'woyu-xiuxian-sect'

interface SectWarReport {
  warId: string
  title: string
  summary: string
  time: number
  winner: 'attacker' | 'defender'
  rewards: {
    contribution: number
    gold: number
    reputation: number
  }
  penalties: {
    contribution: number
    reputation: number
  }
}

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
  worldCondition: SectWorldCondition
  recoveryProgress: number
  unlockedSects: string[]
  facilityLevels: Record<string, number>
  lastTaskRefresh: number
  lastSalaryClaim: number
  gardenSlots: (PlantedCrop | null)[]  // 药园槽位
  lastWarReport: SectWarReport | null
  activeDirective: SectDirectiveId
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
    worldCondition: {
      status: 'stable',
      occupiedBySectId: null,
      lastUpdatedTick: null
    },
    recoveryProgress: 0,
    unlockedSects: [],
    facilityLevels: {},
    lastTaskRefresh: Date.now(),
    lastSalaryClaim: 0,
    gardenSlots: [null, null, null],  // 默认3个药园槽位
    lastWarReport: null,
    activeDirective: 'balanced'
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
        worldCondition: parsed.worldCondition ?? defaults.worldCondition,
        recoveryProgress: parsed.recoveryProgress ?? defaults.recoveryProgress,
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
  const worldCondition = ref<SectWorldCondition>(initialData.worldCondition)
  const recoveryProgress = ref<number>(initialData.recoveryProgress ?? 0)
  const unlockedSects = ref<string[]>(initialData.unlockedSects)
  const facilityLevels = ref<Record<string, number>>(initialData.facilityLevels)
  const lastTaskRefresh = ref<number>(initialData.lastTaskRefresh)
  const lastSalaryClaim = ref<number>(initialData.lastSalaryClaim)
  const gardenSlots = ref<(PlantedCrop | null)[]>(initialData.gardenSlots || [null, null, null])
  const lastWarReport = ref<SectWarReport | null>(initialData.lastWarReport ?? null)
  const activeDirective = ref<SectDirectiveId>(initialData.activeDirective ?? 'balanced')

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

  const stipendPreview = computed(() => resolveSectStipend({
    position: currentPosition.value,
    directive: activeDirective.value,
    joinedSectId: joinedSectId.value,
    lastClaimAt: lastSalaryClaim.value,
    now: Date.now()
  }))

  const authorityState = computed(() => resolveSectAuthority({
    positionLevel: positionLevel.value,
    contribution: contribution.value
  }))

  // 职位名称
  const positionName = computed<string>(() => {
    return currentPosition.value?.name ?? '外门弟子'
  })

  // 下一个职位
  const nextPosition = computed<SectPosition | null>(() => {
    return authorityState.value.nextPosition
  })

  // 是否可以晋升
  const canPromote = computed<boolean>(() => {
    return authorityState.value.canPromote
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

  const recoveryState = computed(() => {
    const playerStore = usePlayerStore()
    const captorName = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
      : null

    return resolveSectRecoveryState({
      worldCondition: worldCondition.value,
      sectHp: sectHp.value,
      sectMaxHp: sectMaxHp.value,
      recoveryProgress: recoveryProgress.value,
      isPlayerCaptured: playerStore.captivity.isCaptured,
      captorSectName: captorName
    })
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
        worldCondition: toRaw(worldCondition.value),
        recoveryProgress: recoveryProgress.value,
        unlockedSects: toRaw(unlockedSects.value),
        facilityLevels: toRaw(facilityLevels.value),
        lastTaskRefresh: lastTaskRefresh.value,
        lastSalaryClaim: lastSalaryClaim.value,
        gardenSlots: toRaw(gardenSlots.value),
        lastWarReport: toRaw(lastWarReport.value),
        activeDirective: activeDirective.value
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
    worldCondition.value = {
      status: 'stable',
      occupiedBySectId: null,
      lastUpdatedTick: null
    }
    recoveryProgress.value = 0
    lastWarReport.value = null
    activeDirective.value = 'balanced'
    return true
  }

  function applyWorldCondition(condition: Partial<SectWorldCondition>) {
    worldCondition.value = {
      ...worldCondition.value,
      ...condition
    }
    if (condition.status === 'stable') {
      recoveryProgress.value = 0
    }
  }

  function applyRecoveryAction(actionId: SectRecoveryActionId) {
    if (!joinedSectId.value || recoveryState.value.status === 'stable') {
      return { success: false, message: '当前无需宗门恢复行动' }
    }

    const playerStore = usePlayerStore()
    const option = getSectRecoveryOption(
      recoveryState.value.status,
      actionId,
      playerStore.captivity.isCaptured
    )
    if (!option) {
      return { success: false, message: '当前状态下无法执行该恢复行动' }
    }
    if (contribution.value < option.contributionCost) {
      return { success: false, message: `贡献不足，需要 ${option.contributionCost}` }
    }
    if (playerStore.gold < option.goldCost) {
      return { success: false, message: `灵石不足，需要 ${option.goldCost}` }
    }

    contribution.value -= option.contributionCost
    playerStore.addGold(-option.goldCost)

    const outcome = resolveSectRecoveryOutcome({
      worldCondition: worldCondition.value,
      sectHp: sectHp.value,
      sectMaxHp: sectMaxHp.value,
      recoveryProgress: recoveryProgress.value,
      isPlayerCaptured: playerStore.captivity.isCaptured,
      captorSectName: playerStore.captivity.captorSectId
        ? getSectById(playerStore.captivity.captorSectId)?.name ?? playerStore.captivity.captorSectId
        : null
    }, option)

    recoveryProgress.value = outcome.nextProgress
    sectHp.value = Math.min(sectMaxHp.value, sectHp.value + Math.max(0, outcome.hpRestore))
    worldCondition.value = {
      status: outcome.nextStatus,
      occupiedBySectId: outcome.nextOccupiedBySectId,
      lastUpdatedTick: Date.now()
    }

    if (outcome.clearsCaptivity && playerStore.captivity.isCaptured) {
      playerStore.clearCaptivity()
    }

    activeEvent.value = {
      id: `sect_recovery_${Date.now()}`,
      type: 'opportunity',
      title: outcome.title,
      description: outcome.summary,
      choices: [],
      handled: true
    }

    return {
      success: true,
      message: outcome.summary,
      title: outcome.title,
      progressGain: option.progressGain,
      hpRestore: Math.max(0, outcome.hpRestore),
      clearsCaptivity: outcome.clearsCaptivity,
      nextStatus: outcome.nextStatus
    }
  }

  // 晋升职位
  function promotePosition(): boolean {
    if (!authorityState.value.canPromote || !authorityState.value.nextPosition) {
      return false
    }
    // 扣除贡献点
    contribution.value -= authorityState.value.nextPosition.requiredContribution
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

  function applyStoryReputation(amount: number, reason?: string) {
    reputation.value += amount
    if (reason && joinedSectId.value) {
      activeEvent.value = {
        id: `story_reputation_${Date.now()}`,
        type: 'opportunity',
        title: '宗门回响',
        description: reason,
        choices: [],
        handled: true
      }
    }
  }

  // 完成任务进度（手动触发特定任务）
  function completeTask(taskId: string): boolean {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.completed) return false

    task.progress++
    if (task.progress >= task.requirements.count) {
      task.completed = true
    }
    return true
  }

  // 更新任务进度（根据游戏行为自动触发）
  // type: 任务类型 (battle, collect, craft, explore, contribution)
  // target: 可选的目标标识 (如 'monster', 'patrol', 特定区域ID等)
  function updateTaskProgress(
    type: SectTask['requirements']['type'],
    target?: string
  ): void {
    if (!joinedSectId.value) return

    for (const task of tasks.value) {
      // 跳过已完成或已领取的任务
      if (task.completed || task.claimed) continue
      // 检查任务类型是否匹配
      if (task.requirements.type !== type) continue
      // 如果指定了目标，检查目标是否匹配（'any' 表示任意目标）
      if (target && task.requirements.target !== target && task.requirements.target !== 'any') continue

      // 增加进度
      task.progress++
      // 检查是否完成
      if (task.progress >= task.requirements.count) {
        task.completed = true
      }
    }
  }

  // 领取任务奖励
  function claimTaskReward(taskId: string): boolean {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || !task.completed || task.claimed) return false

    // 发放奖励
    task.claimed = true
    addContribution(task.rewards.contribution)
    addReputation(activeDirective.value === 'warfare' ? 14 : 10)
    const playerStore = usePlayerStore()
    playerStore.addGold(task.rewards.gold)
    if (task.rewards.exp) {
      playerStore.addCultivation(task.rewards.exp)
    }
    return true
  }

  function claimAllCompletedTaskRewards() {
    const completedTaskIds = tasks.value
      .filter(task => task.completed && !task.claimed)
      .map(task => task.id)

    let claimedCount = 0
    let totalContribution = 0
    let totalGold = 0
    let totalExp = 0

    for (const taskId of completedTaskIds) {
      const task = tasks.value.find(item => item.id === taskId)
      if (!task) continue
      if (!claimTaskReward(taskId)) continue
      claimedCount++
      totalContribution += task.rewards.contribution
      totalGold += task.rewards.gold
      totalExp += task.rewards.exp ?? 0
    }

    return {
      claimedCount,
      totalContribution,
      totalGold,
      totalExp
    }
  }

  function getInventoryMaterialQuantity(materialId: string) {
    const playerStore = usePlayerStore()
    return playerStore.inventory
      .filter(item => item.type === 'material')
      .filter(item => item.definitionId === materialId || item.id === materialId || item.name === materialId)
      .reduce((total, item) => total + item.quantity, 0)
  }

  function consumeInventoryMaterial(materialId: string, quantity: number) {
    const playerStore = usePlayerStore()
    let remaining = quantity
    const matchedItems = playerStore.inventory
      .filter(item => item.type === 'material')
      .filter(item => item.definitionId === materialId || item.id === materialId || item.name === materialId)

    for (const item of matchedItems) {
      if (remaining <= 0) break
      const consumeCount = Math.min(item.quantity, remaining)
      remaining -= consumeCount
      item.quantity -= consumeCount
    }

    playerStore.inventory = playerStore.inventory.filter(item => item.quantity > 0)
    return remaining <= 0
  }

  // 生成任务
  function generateTasks(type: SectTaskType) {
    if (!joinedSectId.value) return
    const count = type === 'daily' ? 3 : type === 'weekly' ? 2 : 1
    for (let i = 0; i < count; i++) {
      const task = applyDirectiveToTaskRewards(generateRandomTask(type, joinedSectId.value), activeDirective.value)
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
    if (!authorityState.value.canDeclareWar) return false
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
  function advanceWar(attackerWon: boolean): SectWarResolution | null {
    if (!activeWar.value) return null

    if (attackerWon) {
      activeWar.value.attackerScore += 10 + Math.floor(Math.random() * 5)
    } else {
      activeWar.value.defenderScore += 10 + Math.floor(Math.random() * 5)
    }

    // 检查是否结束
    if (activeWar.value.attackerScore >= activeWar.value.winScore) {
      activeWar.value.status = 'victory'
      return handleWarEnd(true)
    } else if (activeWar.value.defenderScore >= activeWar.value.winScore) {
      activeWar.value.status = 'defeat'
      return handleWarEnd(false)
    }
    return null
  }

  // 处理战争结束
  function handleWarEnd(attackerWon: boolean): SectWarResolution | null {
    const war = activeWar.value
    if (!war) return null

    const directiveEffects = getSectDirectiveEffects(activeDirective.value)
    const winner = attackerWon ? 'attacker' : 'defender'
    const rewards = attackerWon
      ? {
          contribution: Math.max(1, Math.floor(500 * directiveEffects.taskContributionMultiplier * directiveEffects.warRewardMultiplier)),
          gold: Math.max(1, Math.floor(1000 * directiveEffects.taskGoldMultiplier * directiveEffects.warRewardMultiplier)),
          reputation: Math.max(0, Math.floor(100 * directiveEffects.warRewardMultiplier))
        }
      : {
          contribution: Math.max(1, Math.floor(200 * directiveEffects.taskContributionMultiplier)),
          gold: Math.max(1, Math.floor(500 * directiveEffects.taskGoldMultiplier)),
          reputation: 0
        }
    const penalties = attackerWon
      ? { contribution: 0, reputation: 0 }
      : { contribution: 200, reputation: 100 }
    war.result = {
      winner,
      rewards: winner === 'attacker' ? ['500贡献点', '1000灵石', '100声望'] : ['200贡献点', '500灵石'],
      penalties: winner === 'attacker' ? [] : ['100声望', '200贡献点']
    }

    if (winner === 'attacker') {
      addContribution(rewards.contribution)
      const playerStore = usePlayerStore()
      playerStore.addGold(rewards.gold)
      addReputation(rewards.reputation)
    } else {
      addContribution(rewards.contribution)
      const playerStore = usePlayerStore()
      playerStore.addGold(rewards.gold)
      contribution.value = Math.max(0, contribution.value - penalties.contribution)
      reputation.value = Math.max(0, reputation.value - penalties.reputation)
    }

    relations.value[war.defenderSectId] = attackerWon ? 'hostile' : 'neutral'
    lastWarReport.value = {
      warId: war.id,
      title: attackerWon ? '宗门凯旋' : '宗门失利',
      summary: attackerWon
        ? '前线告捷，山门获得新的声望与资源。'
        : '前线败退，宗门需要重新整饬人手与威望。',
      time: Date.now(),
      winner,
      rewards,
      penalties
    }
    const resolution: SectWarResolution = {
      warId: war.id,
      attackerSectId: war.attackerSectId,
      defenderSectId: war.defenderSectId,
      winner,
      status: attackerWon ? 'victory' : 'defeat',
      attackerScore: war.attackerScore,
      defenderScore: war.defenderScore,
      rewards,
      penalties
    }
    activeWar.value = null
    sectHp.value = Math.max(
      1,
      sectHp.value - Math.max(
        12,
        Math.floor(
          sectMaxHp.value * (
            attackerWon
              ? 0.12
              : 0.22
          )
        )
      )
    )
    return resolution
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

  function updateWorldState(totalTicks: number) {
    const current = currentSect.value
    const war = activeWar.value
    const defender = war ? getSectById(war.defenderSectId) ?? null : null
    let warResolution: SectWarResolution | null = null

    const warProgress = resolveSectWarProgress(totalTicks, {
      joinedSectId: joinedSectId.value,
      reputation: reputation.value,
      sectHp: sectHp.value,
      sectMaxHp: sectMaxHp.value,
      relations: relations.value,
      activeWar: activeWar.value
    }, current, defender)

    if (warProgress) {
      warResolution = advanceWar(warProgress.attackerWon)
      if (warProgress.log) {
        activeEvent.value = {
          id: `sect_world_war_${Date.now()}`,
          type: 'sect_conflict',
          title: warProgress.log.title,
          description: warProgress.log.description,
          choices: [],
          handled: true
        }
      }
    }

    const relationDrift = resolveSectRelationDrift(
      totalTicks,
      {
        joinedSectId: joinedSectId.value,
        reputation: reputation.value,
        sectHp: sectHp.value,
        sectMaxHp: sectMaxHp.value,
        relations: relations.value,
        activeWar: activeWar.value
      },
      current,
      unlockedSects.value
    )

    if (relationDrift) {
      relations.value[relationDrift.shift.targetSectId] = relationDrift.shift.relation
      activeEvent.value = {
        id: `sect_relation_${Date.now()}`,
        type: relationDrift.shift.relation === 'hostile' ? 'sect_conflict' : 'alliance_offer',
        title: relationDrift.log.title,
        description: relationDrift.log.description,
        choices: [],
        handled: true
      }
    }

    return {
      warResolution
    }
  }

  // 领取每日俸禄
  function claimDailySalary(): { gold: number; contribution: number } | null {
    const now = Date.now()
    const stipend = resolveSectStipend({
      position: currentPosition.value,
      directive: activeDirective.value,
      joinedSectId: joinedSectId.value,
      lastClaimAt: lastSalaryClaim.value,
      now
    })
    if (!stipend.canClaim) {
      return null
    }

    const playerStore = usePlayerStore()
    playerStore.addGold(stipend.gold)
    addContribution(stipend.contribution)
    lastSalaryClaim.value = now

    return {
      gold: stipend.gold,
      contribution: stipend.contribution
    }
  }

  // 检查是否可以领取俸禄
  const canClaimSalary = computed(() => {
    return stipendPreview.value.canClaim
  })

  // ====== 炼丹系统 ======

  // 获取可用的炼丹配方
  const availableAlchemyRecipes = computed(() => {
    const furnaceLevel = getFacilityLevel('alchemy_furnace')
    return resolveAvailableAlchemyRecipes(ALCHEMY_RECIPES, furnaceLevel)
  })

  // 炼丹
  function craftAlchemy(recipeId: string): { success: boolean; message: string; item?: { name: string; icon: string; effects: { type: string; value: number }[] } } {
    const recipe = getAlchemyRecipeById(recipeId)
    const furnaceLevel = getFacilityLevel('alchemy_furnace')
    const playerStore = usePlayerStore()
    const result = resolveAlchemyCraft({
      joinedSectId: joinedSectId.value,
      recipe,
      furnaceLevel,
      directive: activeDirective.value,
      gold: playerStore.gold,
      getMaterialQuantity: getInventoryMaterialQuantity,
      random: Math.random(),
      now: Date.now()
    })
    if (!result.consumesMaterials && !result.success) {
      return result
    }

    if (result.consumesMaterials && result.goldCost > 0) {
      playerStore.addGold(-result.goldCost)
    }
    if (result.consumesMaterials) {
      for (const material of result.materialCosts) {
        consumeInventoryMaterial(material.itemId, material.quantity)
      }
    }

    if (result.success && result.item) {
      playerStore.addToInventory(result.item)
      updateTaskProgress('craft', 'alchemy')
      return { success: true, message: result.message, item: result.item }
    }

    return { success: false, message: result.message }
  }

  // ====== 药园系统 ======

  // 获取药园槽位数量（基于药园等级）
  const gardenSlotCount = computed(() => {
    const gardenLevel = getFacilityLevel('medicine_garden')
    return resolveGardenSlotCount(gardenLevel)
  })

  // 获取可用的种子
  const availableSeeds = computed(() => {
    const gardenLevel = getFacilityLevel('medicine_garden')
    return resolveAvailableSeeds(SEEDS, gardenLevel)
  })

  // 种植
  function plantSeed(seedId: string, slotIndex: number): { success: boolean; message: string } {
    if (!joinedSectId.value) {
      return { success: false, message: '未加入宗门' }
    }

    const gardenLevel = getFacilityLevel('medicine_garden')
    const seed = getSeedById(seedId)
    if (!seed) {
      return { success: false, message: '种子不存在' }
    }

    if (gardenLevel < seed.requiredGardenLevel) {
      return { success: false, message: `药园等级不足，需要${seed.requiredGardenLevel}级` }
    }

    if (slotIndex < 0 || slotIndex >= gardenSlotCount.value) {
      return { success: false, message: '无效的槽位' }
    }

    if (gardenSlots.value[slotIndex]) {
      return { success: false, message: '该槽位已有作物' }
    }

    // 检查并消耗灵石
    const playerStore = usePlayerStore()
    if (playerStore.gold < seed.buyPrice) {
      return { success: false, message: `灵石不足，需要${seed.buyPrice}灵石` }
    }
    playerStore.addGold(-seed.buyPrice)

    // 种植
    const now = Date.now()
    gardenSlots.value[slotIndex] = {
      seedId,
      plantedAt: now,
      readyAt: now + seed.growTime * 60 * 1000,
      slotIndex
    }

    return { success: true, message: `种植成功，${seed.growTime}分钟后可收获` }
  }

  // 收获
  function harvestCrop(slotIndex: number): { success: boolean; message: string; quantity?: number; item?: { name: string; icon: string } } {
    const crop = gardenSlots.value[slotIndex] ?? null
    const now = Date.now()
    const result = resolveGardenHarvest({
      joinedSectId: joinedSectId.value,
      slotIndex,
      slotCount: gardenSlotCount.value,
      crop,
      seed: crop ? getSeedById(crop.seedId) : undefined,
      gardenLevel: getFacilityLevel('medicine_garden'),
      directive: activeDirective.value,
      now,
      random: Math.random()
    })
    if (!result.success || !result.item || !result.quantity) {
      return result
    }

    const playerStore = usePlayerStore()
    playerStore.addToInventory(result.item)

    // 清空槽位
    gardenSlots.value[slotIndex] = null

    // 更新任务进度
    updateTaskProgress('collect', 'herb')

    return {
      success: true,
      message: result.message,
      quantity: result.quantity,
      item: { name: result.item.name, icon: result.item.icon }
    }
  }

  // 加速成熟（消耗灵石）
  function accelerateCrop(slotIndex: number): { success: boolean; message: string } {
    if (!joinedSectId.value) {
      return { success: false, message: '未加入宗门' }
    }

    const crop = gardenSlots.value[slotIndex]
    if (!crop) {
      return { success: false, message: '该槽位没有作物' }
    }

    if (Date.now() >= crop.readyAt) {
      return { success: false, message: '作物已成熟，请直接收获' }
    }

    const cost = resolveGardenAccelerateCost({ crop, now: Date.now() })

    const playerStore = usePlayerStore()
    if (playerStore.gold < cost) {
      return { success: false, message: `灵石不足，需要${cost}灵石` }
    }

    playerStore.addGold(-cost)
    crop.readyAt = Date.now()

    return { success: true, message: '加速成功，作物已成熟' }
  }

  function setActiveDirective(directive: SectDirectiveId) {
    if (!authorityState.value.availableDirectives.includes(directive)) {
      return false
    }
    activeDirective.value = directive
    return true
  }

  const readyGardenSlots = computed(() => {
    const now = Date.now()
    return gardenSlots.value.filter((slot, index) => index < gardenSlotCount.value && slot && slot.readyAt <= now).length
  })

  const activeGardenSlots = computed(() => {
    return gardenSlots.value.filter((slot, index) => index < gardenSlotCount.value && Boolean(slot)).length
  })

  function harvestAllReadyCrops() {
    const readyIndices = gardenSlots.value
      .map((slot, index) => ({ slot, index }))
      .filter(entry => entry.index < gardenSlotCount.value && entry.slot && Date.now() >= entry.slot.readyAt)
      .map(entry => entry.index)

    let harvestedCount = 0
    const itemLabels: string[] = []

    for (const index of readyIndices) {
      const result = harvestCrop(index)
      if (!result.success || !result.item || !result.quantity) continue
      harvestedCount++
      itemLabels.push(`${result.item.icon}${result.item.name}x${result.quantity}`)
    }

    return {
      harvestedCount,
      items: itemLabels
    }
  }

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
    worldCondition,
    unlockedSects,
    facilityLevels,
    lastTaskRefresh,
    lastSalaryClaim,
    gardenSlots,
    lastWarReport,
    activeDirective,
    recoveryProgress,

    // 计算属性
    currentSect,
    currentPosition,
    authorityState,
    positionName,
    nextPosition,
    canPromote,
    sectHpPercent,
    unlockedSectList,
    dailyTasks,
    weeklyTasks,
    completedTasks,
    recoveryState,
    stipendPreview,
    canClaimSalary,
    availableAlchemyRecipes,
    gardenSlotCount,
    readyGardenSlots,
    activeGardenSlots,
    availableSeeds,

    // 方法
    joinSect,
    leaveSect,
    promotePosition,
    addContribution,
    addReputation,
    applyStoryReputation,
    completeTask,
    updateTaskProgress,
    claimTaskReward,
    claimAllCompletedTaskRewards,
    generateTasks,
    refreshTasks,
    getFacilityLevel,
    upgradeFacility,
    setRelation,
    applyWorldCondition,
    applyRecoveryAction,
    declareWar,
    advanceWar,
    handleWarEnd,
    handleEventChoice,
    unlockSect,
    checkUnlockedSects,
    updateWorldState,
    claimDailySalary,
    // 炼丹
    craftAlchemy,
    // 药园
    plantSeed,
    harvestCrop,
    harvestAllReadyCrops,
    accelerateCrop,
    setActiveDirective,
    saveToStorage
  }
})
