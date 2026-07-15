/**
 * NPC好感度限制系统
 * 每日互动次数上限、每周送礼上限
 * 确保好感度不能无限制提升
 */
import { ref, computed } from 'vue'

export interface BondLimitState {
  /** 今日已互动NPC列表 (npcId -> 次数) */
  dailyInteractions: Record<string, number>
  /** 本周已送礼NPC列表 (npcId -> 次数) */
  weeklyGifts: Record<string, number>
  /** 上次重置日期戳 */
  lastDailyReset: number
  /** 上周重置周戳 */
  lastWeeklyReset: number
}

const STORAGE_KEY = 'woyu-xiuxian-bond-limits'

function getDefaultLimits(): BondLimitState {
  return {
    dailyInteractions: {},
    weeklyGifts: {},
    lastDailyReset: Date.now(),
    lastWeeklyReset: Date.now()
  }
}

function loadLimits(): BondLimitState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...getDefaultLimits(), ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return getDefaultLimits()
}

function saveLimits(limits: BondLimitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limits))
}

/** 每日最大互动次数 */
export const MAX_DAILY_INTERACTIONS = 5
/** 每周最大送礼次数 */
export const MAX_WEEKLY_GIFTS = 3
/** 单个NPC每日最大互动 */
export const MAX_DAILY_PER_NPC = 3
/** 单个NPC每周最大送礼 */
export const MAX_WEEKLY_GIFTS_PER_NPC = 1

export function useNpcBondLimits() {
  const limits = ref<BondLimitState>(loadLimits())
  /** 检查是否需要重置日/周计数器 */
  function checkReset() {
    const now = Date.now()
    const dayMs = 86400000
    const weekMs = 604800000

    if (now - limits.value.lastDailyReset > dayMs) {
      limits.value.dailyInteractions = {}
      limits.value.lastDailyReset = now
    }
    if (now - limits.value.lastWeeklyReset > weekMs) {
      limits.value.weeklyGifts = {}
      limits.value.lastWeeklyReset = now
    }
  }

  const todayInteractions = computed(() => {
    checkReset()
    return Object.values(limits.value.dailyInteractions).reduce((a, b) => a + b, 0)
  })

  const thisWeekGifts = computed(() => {
    checkReset()
    return Object.values(limits.value.weeklyGifts).reduce((a, b) => a + b, 0)
  })

  function canInteract(npcId: string): { allowed: boolean; reason?: string } {
    checkReset()
    const npcCount = limits.value.dailyInteractions[npcId] ?? 0
    const totalCount = todayInteractions.value
    if (npcCount >= MAX_DAILY_PER_NPC) {
      return { allowed: false, reason: `今日已与这位道友交谈${MAX_DAILY_PER_NPC}次，明日再来吧` }
    }
    if (totalCount >= MAX_DAILY_INTERACTIONS) {
      return { allowed: false, reason: `今日互动已达上限（${MAX_DAILY_INTERACTIONS}次），明日继续吧` }
    }
    return { allowed: true }
  }

  function canGiveGift(npcId: string): { allowed: boolean; reason?: string } {
    checkReset()
    const npcCount = limits.value.weeklyGifts[npcId] ?? 0
    const totalCount = thisWeekGifts.value
    if (npcCount >= MAX_WEEKLY_GIFTS_PER_NPC) {
      return { allowed: false, reason: `本周已给这位道友送过礼了` }
    }
    if (totalCount >= MAX_WEEKLY_GIFTS) {
      return { allowed: false, reason: `本周送礼已达上限（${MAX_WEEKLY_GIFTS}次）` }
    }
    return { allowed: true }
  }

  function recordInteraction(npcId: string) {
    checkReset()
    limits.value.dailyInteractions[npcId] = (limits.value.dailyInteractions[npcId] ?? 0) + 1
    saveLimits(limits.value)
  }

  function recordGift(npcId: string) {
    checkReset()
    limits.value.weeklyGifts[npcId] = (limits.value.weeklyGifts[npcId] ?? 0) + 1
    saveLimits(limits.value)
  }

  function resetLimits() {
    limits.value = getDefaultLimits()
    saveLimits(limits.value)
  }

  return {
    limits, todayInteractions, thisWeekGifts,
    canInteract, canGiveGift, recordInteraction, recordGift, resetLimits
  }
}
