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
  resolveSectDirectiveChange,
  resolveSectAuthority,
  resolveSectPromotion,
  type SectDirectiveId
} from '@/sect/runtime/sectPositionResolver'
import {
  resolveInventoryMaterialConsumption,
  resolveInventoryMaterialQuantity
} from '@/character/runtime/inventoryMaterialResolver'
import {
  resolveManualSectTaskProgress,
  resolveSectTaskGeneration,
  resolveSectTaskClaim,
  resolveSectTaskClaimAll,
  resolveSectTaskProgress,
  resolveSectTaskRefresh
} from '@/sect/runtime/sectTaskResolver'
import {
  resolveFacilityLevel,
  resolveFacilityUpgrade,
  resolveInitialFacilityLevels
} from '@/sect/runtime/sectFacilityResolver'
import {
  resolveSectJoin,
  resolveSectJoinCandidates,
  resolveSectLeave
} from '@/sect/runtime/sectMembershipResolver'
import { resolveSectEventChoice } from '@/sect/runtime/sectEventResolver'
import { resolveSectStipend } from '@/sect/runtime/sectStipendResolver'
import {
  getSectRecoveryOption,
  resolveSectRecoveryOutcome,
  resolveSectRecoveryState,
  type SectRecoveryActionId
} from '@/sect/runtime/sectRecoveryResolver'
import { resolveSectWorldTick } from '@/sect/runtime/sectWorldResolver'
import type { SectWarResolution } from '@/sect/runtime/sectWorldTypes'
import {
  resolveSectWarConclusion,
  type SectWarReport
} from '@/sect/runtime/sectWarRewardResolver'
import {
  resolveSectWarAdvance,
  resolveSectWarDeclaration
} from '@/sect/runtime/sectWarLifecycleResolver'
import {
  resolveAvailableSeeds,
  resolveGardenAcceleration,
  resolveGardenHarvest,
  resolveGardenPlanting,
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
import { ALL_AREAS } from '@/types/map'

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

  const joinCandidates = computed(() => {
    const playerStore = usePlayerStore()
    return resolveSectJoinCandidates({
      sects: ALL_SECTS,
      areas: ALL_AREAS,
      unlockedSectIds: unlockedSects.value,
      playerRealm: playerStore.realm,
      playerRealmLevel: playerStore.realmLevel
    })
  })

  const joinableSectIds = computed(() => {
    return joinCandidates.value
      .filter(candidate => candidate.canJoin)
      .map(candidate => candidate.sect.id)
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
    const resolution = resolveSectJoin({
      sect,
      sectId,
      unlockedSectIds: unlockedSects.value,
      candidateSectIds: joinableSectIds.value,
      currentJoinedSectId: joinedSectId.value,
      facilityLevels: resolveInitialFacilityLevels(SECT_FACILITIES)
    })
    if (!resolution.canJoin || !resolution.nextState) return false

    joinedSectId.value = resolution.nextState.joinedSectId
    positionLevel.value = resolution.nextState.positionLevel
    contribution.value = resolution.nextState.contribution
    reputation.value = resolution.nextState.reputation
    sectHp.value = resolution.nextState.sectHp
    sectMaxHp.value = resolution.nextState.sectMaxHp
    facilityLevels.value = resolution.nextState.facilityLevels
    unlockSect(sectId)

    // 生成初始任务
    generateTasks('daily')
    generateTasks('weekly')

    return true
  }

  // 退出宗门
  function leaveSect(): boolean {
    const resolution = resolveSectLeave({
      joinedSectId: joinedSectId.value,
      defaultGardenSlots: [null, null, null]
    })
    if (!resolution.canLeave || !resolution.nextState) return false

    joinedSectId.value = resolution.nextState.joinedSectId
    positionLevel.value = resolution.nextState.positionLevel
    contribution.value = resolution.nextState.contribution
    reputation.value = resolution.nextState.reputation
    tasks.value = resolution.nextState.tasks
    activeWar.value = resolution.nextState.activeWar
    activeEvent.value = resolution.nextState.activeEvent
    worldCondition.value = resolution.nextState.worldCondition
    recoveryProgress.value = resolution.nextState.recoveryProgress
    lastWarReport.value = resolution.nextState.lastWarReport
    activeDirective.value = resolution.nextState.activeDirective
    gardenSlots.value = resolution.nextState.gardenSlots
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
    const promotion = resolveSectPromotion({
      positionLevel: positionLevel.value,
      contribution: contribution.value
    })
    if (!promotion.canPromote) return false

    contribution.value = promotion.nextContribution
    positionLevel.value = promotion.nextPositionLevel
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
    const resolution = resolveManualSectTaskProgress(tasks.value, taskId)
    if (resolution.advancedTaskIds.length === 0) return false
    tasks.value = resolution.tasks
    return true
  }

  // 更新任务进度（根据游戏行为自动触发）
  // type: 任务类型 (battle, collect, craft, explore, contribution)
  // target: 可选的目标标识 (如 'monster', 'patrol', 特定区域ID等)
  function updateTaskProgress(
    type: SectTask['requirements']['type'],
    target?: string
  ): void {
    const resolution = resolveSectTaskProgress(tasks.value, {
      joinedSectId: joinedSectId.value,
      type,
      target
    })
    if (resolution.advancedTaskIds.length > 0) {
      tasks.value = resolution.tasks
    }
  }

  // 领取任务奖励
  function claimTaskReward(taskId: string): boolean {
    const task = tasks.value.find(t => t.id === taskId)
    const claim = resolveSectTaskClaim(task, activeDirective.value)
    if (!claim.canClaim || !claim.taskId) return false

    tasks.value = tasks.value.map(item => item.id === claim.taskId ? { ...item, claimed: true } : item)
    addContribution(claim.reward.contribution)
    addReputation(claim.reward.reputation)
    const playerStore = usePlayerStore()
    playerStore.addGold(claim.reward.gold)
    if (claim.reward.exp > 0) {
      playerStore.addCultivation(claim.reward.exp)
    }
    return true
  }

  function claimAllCompletedTaskRewards() {
    const claim = resolveSectTaskClaimAll(tasks.value, activeDirective.value)
    const claimedTaskIds = new Set(claim.taskIds)
    if (claimedTaskIds.size > 0) {
      tasks.value = tasks.value.map(task => claimedTaskIds.has(task.id) ? { ...task, claimed: true } : task)
      addContribution(claim.reward.contribution)
      addReputation(claim.reward.reputation)
      const playerStore = usePlayerStore()
      playerStore.addGold(claim.reward.gold)
      if (claim.reward.exp > 0) {
        playerStore.addCultivation(claim.reward.exp)
      }
    }

    return {
      claimedCount: claim.taskIds.length,
      totalContribution: claim.reward.contribution,
      totalGold: claim.reward.gold,
      totalExp: claim.reward.exp
    }
  }

  function getInventoryMaterialQuantity(materialId: string) {
    const playerStore = usePlayerStore()
    return resolveInventoryMaterialQuantity(playerStore.inventory, materialId)
  }

  function consumeInventoryMaterial(materialId: string, quantity: number) {
    const playerStore = usePlayerStore()
    const result = resolveInventoryMaterialConsumption(playerStore.inventory, materialId, quantity)
    playerStore.inventory = result.inventory
    return result.success
  }

  // 生成任务
  function generateTasks(type: SectTaskType) {
    const generation = resolveSectTaskGeneration({
      joinedSectId: joinedSectId.value,
      type,
      directive: activeDirective.value,
      generateTask: generateRandomTask
    })
    if (generation.generatedCount > 0) {
      tasks.value.push(...generation.tasks)
    }
  }

  // 刷新任务
  function refreshTasks() {
    const now = Date.now()
    const refresh = resolveSectTaskRefresh({
      joinedSectId: joinedSectId.value,
      tasks: tasks.value,
      lastRefreshAt: lastTaskRefresh.value,
      now
    })
    if (refresh.shouldRefresh) {
      tasks.value = refresh.retainedTasks
      lastTaskRefresh.value = refresh.nextRefreshAt
      for (const type of refresh.taskTypes) {
        generateTasks(type)
      }
    }
  }

  // 获取设施等级
  function getFacilityLevel(facilityId: string): number {
    return resolveFacilityLevel(facilityLevels.value, facilityId)
  }

  // 升级设施
  function upgradeFacility(facilityId: string): boolean {
    const facility = SECT_FACILITIES.find(f => f.id === facilityId)
    const playerStore = usePlayerStore()
    const upgrade = resolveFacilityUpgrade({
      facility,
      joinedSectId: joinedSectId.value,
      positionLevel: positionLevel.value,
      currentLevel: getFacilityLevel(facilityId),
      gold: playerStore.gold,
      contribution: contribution.value
    })
    if (!upgrade.canUpgrade) return false

    playerStore.addGold(-upgrade.goldCost)
    contribution.value -= upgrade.contributionCost
    facilityLevels.value[facilityId] = upgrade.nextLevel
    return true
  }

  // 设置宗门关系
  function setRelation(sectId: string, relation: SectRelation) {
    if (!joinedSectId.value) return
    relations.value[sectId] = relation
  }

  // 发起战争
  function declareWar(targetSectId: string): boolean {
    const targetSect = getSectById(targetSectId)
    const declaration = resolveSectWarDeclaration({
      joinedSectId: joinedSectId.value,
      canDeclareWar: authorityState.value.canDeclareWar,
      hasActiveWar: Boolean(activeWar.value),
      targetSectId,
      targetExists: Boolean(targetSect),
      now: Date.now()
    })
    if (!declaration.canDeclare || !declaration.war) return false

    activeWar.value = declaration.war
    relations.value[targetSectId] = 'at_war'
    return true
  }

  // 推进战争
  function advanceWar(attackerWon: boolean): SectWarResolution | null {
    if (!activeWar.value) return null

    const advance = resolveSectWarAdvance({
      war: activeWar.value,
      attackerWon,
      random: Math.random()
    })
    activeWar.value = advance.war

    if (advance.ended && advance.attackerWon !== null) {
      return handleWarEnd(advance.attackerWon)
    }
    return null
  }

  // 处理战争结束
  function handleWarEnd(attackerWon: boolean): SectWarResolution | null {
    const war = activeWar.value
    if (!war) return null

    const conclusion = resolveSectWarConclusion({
      war,
      attackerWon,
      directive: activeDirective.value,
      sectHp: sectHp.value,
      sectMaxHp: sectMaxHp.value,
      now: Date.now()
    })
    war.result = conclusion.result

    const playerStore = usePlayerStore()
    addContribution(conclusion.rewards.contribution)
    playerStore.addGold(conclusion.rewards.gold)
    addReputation(conclusion.rewards.reputation)
    contribution.value = Math.max(0, contribution.value - conclusion.penalties.contribution)
    reputation.value = Math.max(0, reputation.value - conclusion.penalties.reputation)

    relations.value[war.defenderSectId] = conclusion.nextDefenderRelation
    lastWarReport.value = conclusion.report
    activeWar.value = null
    sectHp.value = conclusion.nextSectHp
    return conclusion.resolution
  }

  // 处理随机事件
  function handleEventChoice(choiceId: string): boolean {
    const resolution = resolveSectEventChoice(activeEvent.value, choiceId)
    if (!resolution.success) return false

    const playerStore = usePlayerStore()
    playerStore.addGold(resolution.effects.gold)
    addContribution(resolution.effects.contribution)
    addReputation(resolution.effects.reputation)
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
    const now = Date.now()

    const worldTick = resolveSectWorldTick({
      totalTicks,
      now,
      state: {
        joinedSectId: joinedSectId.value,
        reputation: reputation.value,
        sectHp: sectHp.value,
        sectMaxHp: sectMaxHp.value,
        relations: relations.value,
        activeWar: activeWar.value
      },
      currentSect: current,
      defenderSect: defender,
      unlockedSectIds: unlockedSects.value
    })

    if (worldTick.warProgress) {
      warResolution = advanceWar(worldTick.warProgress.attackerWon)
    }

    if (worldTick.relationDrift) {
      relations.value[worldTick.relationDrift.shift.targetSectId] = worldTick.relationDrift.shift.relation
    }

    const latestEvent = worldTick.events[worldTick.events.length - 1]
    if (latestEvent) {
      activeEvent.value = {
        ...latestEvent,
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
    const gardenLevel = getFacilityLevel('medicine_garden')
    const seed = getSeedById(seedId)
    const playerStore = usePlayerStore()
    const now = Date.now()
    const result = resolveGardenPlanting({
      joinedSectId: joinedSectId.value,
      seedId,
      seed,
      slotIndex,
      slotCount: gardenSlotCount.value,
      occupiedCrop: gardenSlots.value[slotIndex] ?? null,
      gardenLevel,
      gold: playerStore.gold,
      now
    })
    if (!result.success || !result.crop) {
      return result
    }

    playerStore.addGold(-result.goldCost)
    gardenSlots.value[slotIndex] = result.crop
    return { success: true, message: result.message }
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
    const crop = gardenSlots.value[slotIndex]
    const playerStore = usePlayerStore()
    const result = resolveGardenAcceleration({
      joinedSectId: joinedSectId.value,
      crop: crop ?? null,
      gold: playerStore.gold,
      now: Date.now()
    })
    if (!result.success || result.readyAt === undefined || !crop) {
      return result
    }

    playerStore.addGold(-result.goldCost)
    crop.readyAt = result.readyAt

    return { success: true, message: result.message }
  }

  function setActiveDirective(directive: SectDirectiveId) {
    const change = resolveSectDirectiveChange({
      availableDirectives: authorityState.value.availableDirectives,
      directive
    })
    if (!change.canChange) return false

    activeDirective.value = change.directive
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
    joinCandidates,
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
