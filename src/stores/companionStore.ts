import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type {
  CompanionDefinition,
  OwnedCompanion,
  GachaResult
} from '@/types/companion'
import {
  GIFTS,
  GACHA_CONFIG,
  getCompanionById,
  rollCompanion,
  getExpForLevel,
  calculateCompanionStats,
  calculateBondBonus
} from '@/types/companion'
import { usePlayerStore } from './playerStore'

const STORAGE_KEY = 'woyu-xiuxian-companion'

// 伙伴状态接口
interface CompanionState {
  ownedCompanions: OwnedCompanion[]
  gachaPoints: number           // 抽卡积分（用于保底）
  totalGachaCount: number       // 总抽卡次数
  ownedGifts: { id: string; quantity: number }[]
  equippedCompanionIds: string[] // 上阵的伙伴ID列表（最多3个）
}

// 默认伙伴状态
function getDefaultCompanionState(): CompanionState {
  return {
    ownedCompanions: [],
    gachaPoints: 0,
    totalGachaCount: 0,
    ownedGifts: [],
    equippedCompanionIds: []
  }
}

export const useCompanionStore = defineStore('companion', () => {
  // 从 localStorage 加载或使用默认值
  let initialData: CompanionState
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData) as Partial<CompanionState>
      const defaults = getDefaultCompanionState()
      initialData = {
        ...defaults,
        ...parsed,
        ownedCompanions: parsed.ownedCompanions ?? defaults.ownedCompanions,
        ownedGifts: parsed.ownedGifts ?? defaults.ownedGifts,
        equippedCompanionIds: parsed.equippedCompanionIds ?? defaults.equippedCompanionIds
      }
    } else {
      initialData = getDefaultCompanionState()
    }
  } catch (e) {
    console.warn('Failed to load companion data from localStorage, using defaults:', e)
    initialData = getDefaultCompanionState()
  }

  // 状态
  const ownedCompanions = ref<OwnedCompanion[]>(initialData.ownedCompanions)
  const gachaPoints = ref<number>(initialData.gachaPoints)
  const totalGachaCount = ref<number>(initialData.totalGachaCount)
  const ownedGifts = ref<{ id: string; quantity: number }[]>(initialData.ownedGifts)
  const equippedCompanionIds = ref<string[]>(initialData.equippedCompanionIds)

  // ====== 计算属性 ======

  // 已拥有伙伴的详细信息
  const ownedCompanionDetails = computed(() => {
    return ownedCompanions.value.map(owned => ({
      owned,
      definition: getCompanionById(owned.definitionId)
    })).filter(item => item.definition !== undefined)
  })

  // 上阵的伙伴
  const equippedCompanions = computed(() => {
    return ownedCompanionDetails.value
      .filter(item => equippedCompanionIds.value.includes(item.owned.definitionId))
      .map(item => ({
        ...item,
        stats: calculateCompanionStats(item.definition!, item.owned)
      }))
  })

  // 是否可以进行单抽
  const canSingleGacha = computed(() => {
    const playerStore = usePlayerStore()
    return playerStore.gold >= GACHA_CONFIG.singleCost
  })

  // 是否可以进行十连
  const canTenGacha = computed(() => {
    const playerStore = usePlayerStore()
    return playerStore.gold >= GACHA_CONFIG.tenCost
  })

  // 距离下次保底还需要多少抽
  const pityCounter = computed(() => {
    const nextGuarantee = Math.ceil(gachaPoints.value / 80) * 80
    return nextGuarantee - gachaPoints.value
  })

  // ====== 方法 ======

  // 保存到 localStorage
  function saveToStorage() {
    try {
      const data: CompanionState = {
        ownedCompanions: toRaw(ownedCompanions.value),
        gachaPoints: gachaPoints.value,
        totalGachaCount: totalGachaCount.value,
        ownedGifts: toRaw(ownedGifts.value),
        equippedCompanionIds: toRaw(equippedCompanionIds.value)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save companion data to localStorage:', e)
    }
  }

  // 单抽
  function singleGacha(): GachaResult | null {
    const playerStore = usePlayerStore()
    if (playerStore.gold < GACHA_CONFIG.singleCost) {
      return null
    }

    playerStore.addGold(-GACHA_CONFIG.singleCost)
    gachaPoints.value++
    totalGachaCount.value++

    const rollResult = rollCompanion(gachaPoints.value)
    const isNew = addCompanion(rollResult.companion)

    // 如果抽到仙品或以上，重置保底
    if (rollResult.companion.quality === '仙品' || rollResult.companion.quality === '神品') {
      gachaPoints.value = 0
    }

    return {
      companion: rollResult.companion,
      isNew,
      fragments: isNew ? 0 : GACHA_CONFIG.fragmentsForStar / 2
    }
  }

  // 十连抽
  function tenGacha(): GachaResult[] {
    const playerStore = usePlayerStore()
    if (playerStore.gold < GACHA_CONFIG.tenCost) {
      return []
    }

    playerStore.addGold(-GACHA_CONFIG.tenCost)
    const results: GachaResult[] = []

    for (let i = 0; i < 10; i++) {
      gachaPoints.value++
      totalGachaCount.value++

      const rollResult = rollCompanion(gachaPoints.value)
      const isNew = addCompanion(rollResult.companion)

      results.push({
        companion: rollResult.companion,
        isNew,
        fragments: isNew ? 0 : GACHA_CONFIG.fragmentsForStar / 2
      })

      // 如果抽到仙品或以上，重置保底
      if (rollResult.companion.quality === '仙品' || rollResult.companion.quality === '神品') {
        gachaPoints.value = 0
      }
    }

    return results
  }

  // 添加伙伴
  function addCompanion(definition: CompanionDefinition): boolean {
    const existing = ownedCompanions.value.find(c => c.definitionId === definition.id)

    if (existing) {
      // 如果已拥有，转换为碎片
      existing.fragments += GACHA_CONFIG.fragmentsForStar / 2
      return false
    }

    // 添加新伙伴
    ownedCompanions.value.push({
      definitionId: definition.id,
      level: 1,
      exp: 0,
      maxExp: getExpForLevel(1),
      bond: 0,
      currentHp: definition.baseStats.maxHp,
      currentMp: definition.baseStats.maxMp,
      equipped: false,
      stars: 1,
      fragments: 0,
      learnedSkills: [],
      maxSkillSlots: 3
    })
    return true
  }

  // 升级伙伴
  function upgradeCompanion(definitionId: string, expAmount: number): boolean {
    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (!companion) return false

    companion.exp += expAmount

    // 检查升级
    while (companion.exp >= companion.maxExp && companion.level < 100) {
      companion.exp -= companion.maxExp
      companion.level++
      companion.maxExp = getExpForLevel(companion.level)

      // 恢复满血满蓝
      const definition = getCompanionById(definitionId)
      if (definition) {
        const stats = calculateCompanionStats(definition, companion)
        companion.currentHp = stats.maxHp
        companion.currentMp = stats.maxMp
      }
    }

    return true
  }

  // 升星伙伴
  function starUpCompanion(definitionId: string): boolean {
    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (!companion || companion.stars >= 5) return false

    if (companion.fragments < GACHA_CONFIG.fragmentsForStar) return false

    companion.fragments -= GACHA_CONFIG.fragmentsForStar
    companion.stars++
    return true
  }

  // 送礼
  function giveGift(companionDefinitionId: string, giftId: string): number {
    const companion = ownedCompanions.value.find(c => c.definitionId === companionDefinitionId)
    const giftIndex = ownedGifts.value.findIndex(g => g.id === giftId)

    if (!companion || giftIndex === -1) return 0

    const gift = GIFTS.find(g => g.id === giftId)
    const companionDef = getCompanionById(companionDefinitionId)

    if (!gift || !companionDef) return 0

    // 计算好感度加成
    const bondBonus = calculateBondBonus(gift, companionDef)
    companion.bond = Math.min(100, companion.bond + bondBonus)

    // 减少礼物数量
    const giftItem = ownedGifts.value[giftIndex]
    if (giftItem) {
      giftItem.quantity--
      if (giftItem.quantity <= 0) {
        ownedGifts.value.splice(giftIndex, 1)
      }
    }

    return bondBonus
  }

  // 上阵伙伴（最多4个，加上主角共5人）
  function equipCompanion(definitionId: string): boolean {
    if (equippedCompanionIds.value.includes(definitionId)) return false
    if (equippedCompanionIds.value.length >= 4) return false

    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (!companion) return false

    equippedCompanionIds.value.push(definitionId)
    companion.equipped = true
    return true
  }

  // 下阵伙伴
  function unequipCompanion(definitionId: string): boolean {
    const index = equippedCompanionIds.value.indexOf(definitionId)
    if (index === -1) return false

    equippedCompanionIds.value.splice(index, 1)
    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (companion) {
      companion.equipped = false
    }
    return true
  }

  // 添加礼物
  function addGift(giftId: string, quantity: number = 1) {
    const existing = ownedGifts.value.find(g => g.id === giftId)
    if (existing) {
      existing.quantity += quantity
    } else {
      ownedGifts.value.push({ id: giftId, quantity })
    }
  }

  // 获取伙伴的好感度等级
  function getBondLevel(definitionId: string): number {
    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (!companion) return 0
    return Math.floor(companion.bond / 20) // 0-5级
  }

  // 检查是否解锁好感度奖励
  function isBondRewardUnlocked(definitionId: string, level: number): boolean {
    return getBondLevel(definitionId) >= level
  }

  // 恢复伙伴生命和法力
  function restoreCompanion(definitionId: string, hpAmount: number, mpAmount: number) {
    const companion = ownedCompanions.value.find(c => c.definitionId === definitionId)
    if (!companion) return

    const definition = getCompanionById(definitionId)
    if (!definition) return

    const stats = calculateCompanionStats(definition, companion)
    companion.currentHp = Math.min(stats.maxHp, companion.currentHp + hpAmount)
    companion.currentMp = Math.min(stats.maxMp, companion.currentMp + mpAmount)
  }

  // 学习技能
  function learnSkill(companionId: string, skillId: string): { success: boolean; message: string } {
    const companion = ownedCompanions.value.find(c => c.definitionId === companionId)
    if (!companion) {
      return { success: false, message: '伙伴不存在' }
    }

    // 检查是否已学习该技能
    if (companion.learnedSkills.includes(skillId)) {
      return { success: false, message: '已学习该技能' }
    }

    // 检查技能槽是否已满
    const totalSkills = (companion.learnedSkills?.length || 0)
    if (totalSkills >= companion.maxSkillSlots) {
      return { success: false, message: `技能槽已满（${companion.maxSkillSlots}个）` }
    }

    // 学习技能
    if (!companion.learnedSkills) {
      companion.learnedSkills = []
    }
    companion.learnedSkills.push(skillId)
    return { success: true, message: '技能学习成功' }
  }

  // 遗忘技能
  function forgetSkill(companionId: string, skillId: string): boolean {
    const companion = ownedCompanions.value.find(c => c.definitionId === companionId)
    if (!companion || !companion.learnedSkills) return false

    const index = companion.learnedSkills.indexOf(skillId)
    if (index === -1) return false

    companion.learnedSkills.splice(index, 1)
    return true
  }

  // 获取伙伴的所有技能（原生 + 学习）
  function getCompanionAllSkills(companionId: string): string[] {
    const companion = ownedCompanions.value.find(c => c.definitionId === companionId)
    const definition = getCompanionById(companionId)
    if (!companion || !definition) return []

    // 合并原生技能和学习技能
    const nativeSkills = definition.skills || []
    const learnedSkills = companion.learnedSkills || []

    return [...new Set([...nativeSkills, ...learnedSkills])]
  }

  // 扩展技能槽（通过升星）
  function expandSkillSlots(companionId: string): boolean {
    const companion = ownedCompanions.value.find(c => c.definitionId === companionId)
    if (!companion) return false

    // 每升1星，技能槽+1，最多6个
    if (companion.maxSkillSlots >= 6) return false

    companion.maxSkillSlots++
    return true
  }

  // 监听变化自动保存
  watchEffect(() => {
    saveToStorage()
  })

  return {
    // 状态
    ownedCompanions,
    gachaPoints,
    totalGachaCount,
    ownedGifts,
    equippedCompanionIds,

    // 计算属性
    ownedCompanionDetails,
    equippedCompanions,
    canSingleGacha,
    canTenGacha,
    pityCounter,

    // 方法
    singleGacha,
    tenGacha,
    addCompanion,
    upgradeCompanion,
    starUpCompanion,
    giveGift,
    equipCompanion,
    unequipCompanion,
    addGift,
    getBondLevel,
    isBondRewardUnlocked,
    restoreCompanion,
    learnSkill,
    forgetSkill,
    getCompanionAllSkills,
    expandSkillSlots,
    saveToStorage
  }
})
