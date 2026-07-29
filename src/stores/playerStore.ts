import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type { Unit, Realm, Quality, Element, UnitStats, StatusEffect } from '@/types/unit'
import { REALM_ORDER, REALM_MULTIPLIER, REALM_COLORS, REALM_PRIMARY_COLOR, REALM_CULTIVATION_PER_SECOND, calculateBaseStats } from '@/types/unit'
import type { Equipment } from '@/types/equipment'
import type { CombatLoadout, LearnedSkill, SkillDefinition, SkillBranch } from '@/types/skill'
import {
  resolveBreakthroughAttempt,
  resolveBreakthroughPreview
} from '@/character/runtime/characterBreakthroughResolver'
import type {
  BreakthroughAttemptResolution,
  BreakthroughPreview
} from '@/character/runtime/characterBreakthroughResolver'
import { resolveCharacterBattleUnit } from '@/character/runtime/characterBattleLoadoutResolver'
import { resolveEquipmentEffects } from '@/character/runtime/characterEquipmentEffectResolver'
import { tickFoodProgressionEffects } from '@/character/runtime/characterFoodEffectResolver'
import { resolveCharacterProgression } from '@/character/runtime/characterProgressionResolver'
import { resolveConsumableUse } from '@/character/runtime/consumableEffectResolver'
import { normalizeInventoryItemSchema, normalizeInventoryItemsSchema } from '@/character/runtime/inventoryItemSchemaResolver'
import {
  SKILL_DEFINITIONS,
  SKILL_TREE,
  getSkillDefinition,
  calculateSkillExpRequired,
  createLearnedSkill,
  getStarterSkills
} from '@/types/skill'
import type { AreaProgress } from '@/types/adventure'
import type { Perspective } from '@/types/storyChapter'
import type { SpiritRoot } from '@/types/spiritRoot'
import type { Bloodline } from '@/types/bloodline'
import type { ChoiceState } from '@/types/choiceState'
import { EMPTY_CHOICE_STATE } from '@/types/choiceState'

// 背包物品接口
export interface InventoryItem {
  id: string
  definitionId?: string
  equipmentId?: string  // 如果是装备，指向装备ID
  equipmentData?: Equipment  // 完整的装备数据（用于卸下的装备）
  name: string
  icon: string
  artKey?: string
  iconKey?: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  quantity: number
  description?: string
  // 消耗品效果
  effects?: {
    type: string
    value: number
    duration?: number
  }[]
}

// 玩家状态接口
interface PlayerState {
  // 基础信息
  id: string
  created: boolean
  name: string
  icon: string
  element: Element
  quality: Quality

  // 修炼
  realm: Realm
  realmLevel: number  // 1-9
  cultivation: number // 当前修为
  maxCultivation: number // 突破所需修为

  // 等级
  level: number

  // 创建信息
  perspective?: Perspective
  spiritRoot?: SpiritRoot | null
  bloodline?: Bloodline | null
  choiceState?: ChoiceState

  // 资源
  gold: number
  skillPoints: number  // 技能点
  stamina: number      // 体力值
  maxStamina: number   // 最大体力值
  lastStaminaRecoverTime: number  // 上次体力恢复时间

  // 属性
  baseStats: UnitStats  // 基础属性（不含装备）
  equipmentBonuses: Partial<UnitStats>  // 装备加成
  skillBonuses: Partial<UnitStats>  // 技能被动加成

  // 装备槽位
  equippedWeapon?: Equipment
  equippedArmor?: Equipment
  equippedAccessory1?: Equipment
  equippedAccessory2?: Equipment

  // 背包
  inventory: InventoryItem[]
  pendingRewards: InventoryItem[]
  maxInventorySlots: number

  // 技能（已学习的技能及其等级）
  learnedSkills: LearnedSkill[]
  combatLoadouts: CombatLoadout[]
  activeCombatLoadoutId: string

  // 临时buff
  temporaryBuffs: StatusEffect[]

  // 挂机相关
  idleStartTime: number | null
  isIdling: boolean
  captivity: {
    isCaptured: boolean
    captorSectId: string | null
    sinceTick: number | null
  }

  // 历练区域进度
  areaProgress: AreaProgress[]
}

// 默认玩家数据
function normalizeCombatLoadouts(loadouts: CombatLoadout[] | undefined, learnedSkills: LearnedSkill[] | undefined): CombatLoadout[] {
  const learnedIds = new Set((learnedSkills ?? []).map(skill => skill.id))
  const source = Array.isArray(loadouts) && loadouts.length
    ? loadouts
    : [
        { id: 'balanced', name: '均衡应战', skillIds: getStarterSkills(), ultimateSkillId: null },
        { id: 'blade', name: '剑修突进', skillIds: ['basic_sword', 'sword_qi', 'thunder_strike', 'fireball'], ultimateSkillId: null },
        { id: 'guardian', name: '守御回春', skillIds: ['basic_sword', 'shield', 'heal', 'iron_skin'], ultimateSkillId: null }
      ]
  const normalized = source.map((loadout, index) => ({
    id: typeof loadout.id === 'string' && loadout.id ? loadout.id : `loadout-${index + 1}`,
    name: typeof loadout.name === 'string' && loadout.name ? loadout.name : `战斗配置 ${index + 1}`,
    skillIds: [...new Set((loadout.skillIds ?? []).filter(skillId => learnedIds.has(skillId)))].slice(0, 4),
    ultimateSkillId: loadout.ultimateSkillId && learnedIds.has(loadout.ultimateSkillId)
      ? loadout.ultimateSkillId
      : null
  }))
  return normalized.length ? normalized : [{ id: 'balanced', name: '均衡应战', skillIds: [], ultimateSkillId: null }]
}

function getDefaultPlayer(): PlayerState {
  return {
    id: 'protagonist',
    created: false,
    name: '云逸',
    icon: '剑',
    element: '金',
    quality: '灵品',

    realm: '炼气',
    realmLevel: 1,
    cultivation: 0,
    maxCultivation: 100,

    level: 1,

    gold: 100,

    baseStats: {
      maxHp: 200,
      currentHp: 200,
      maxMp: 100,
      currentMp: 100,
      attack: 30,
      defense: 15,
      speed: 120,
      critRate: 0.15,
      critDamage: 1.5
    },
    equipmentBonuses: {},

    equippedWeapon: undefined,
    equippedArmor: undefined,
    equippedAccessory1: undefined,
    equippedAccessory2: undefined,

    inventory: [
      // 装备
      { id: 'item_001', equipmentId: 'weapon_002', name: '玄铁剑', icon: '剑', type: 'equipment', quality: 'fine', quantity: 1, description: '由玄铁打造的长剑' },
      { id: 'item_002', equipmentId: 'armor_002', name: '皮甲', icon: '甲', type: 'equipment', quality: 'fine', quantity: 1, description: '由妖兽皮革制成的护甲' },
      { id: 'item_006', equipmentId: 'weapon_001', name: '新手木剑', icon: '木', type: 'equipment', quality: 'common', quantity: 1, description: '一把普通的木剑' },
      { id: 'item_007', equipmentId: 'armor_001', name: '布衣', icon: '布', type: 'equipment', quality: 'common', quantity: 1, description: '普通的布衣' },
      { id: 'item_008', equipmentId: 'accessory_001', name: '铜戒指', icon: '戒', type: 'equipment', quality: 'common', quantity: 1, description: '普通的铜戒指' },
      { id: 'item_009', equipmentId: 'accessory_002', name: '灵玉佩', icon: '玉', type: 'equipment', quality: 'fine', quantity: 1, description: '蕴含灵气的玉佩' },
      // 材料
      { id: 'item_003', name: '灵石', icon: '石', type: 'material', quality: 'common', quantity: 100, description: '修仙界的通用货币' },
      // 消耗品
      { id: 'item_004', name: '聚气丹', icon: '丹', type: 'consumable', quality: 'fine', quantity: 5, description: '服用后增加50修为', effects: [{ type: 'cultivation', value: 50 }] },
      { id: 'item_005', name: '回灵丹', icon: '灵', type: 'consumable', quality: 'common', quantity: 10, description: '服用后恢复30灵力', effects: [{ type: 'mp', value: 30 }] },
      { id: 'item_010', name: '大力丸', icon: '力', type: 'consumable', quality: 'fine', quantity: 3, description: '战斗中攻击+20%，持续3回合', effects: [{ type: 'buff_atk', value: 0.2, duration: 3 }] },
      { id: 'item_011', name: '铁甲丹', icon: '铁', type: 'consumable', quality: 'fine', quantity: 3, description: '战斗中防御+20%，持续3回合', effects: [{ type: 'buff_def', value: 0.2, duration: 3 }] },
      { id: 'item_012', definitionId: 'food_spirit_fruit', name: '灵果', icon: '果', type: 'consumable', quality: 'common', quantity: 3, description: '恢复10体力，并在3次挂机结算内修炼收益+12%。', effects: [{ type: 'stamina', value: 10 }, { type: 'food_cultivation', value: 0.12, duration: 3 }] },
    ],
    pendingRewards: [],
    maxInventorySlots: 20,

    // 初始技能（使用 createLearnedSkill 创建）
    learnedSkills: getStarterSkills().map(id => createLearnedSkill(id)).filter((s): s is LearnedSkill => s !== null),
    combatLoadouts: [
      { id: 'balanced', name: '均衡应战', skillIds: ['basic_sword', 'fireball', 'shield', 'heal'], ultimateSkillId: null },
      { id: 'blade', name: '剑修突进', skillIds: ['basic_sword', 'sword_qi', 'thunder_strike', 'fireball'], ultimateSkillId: null },
      { id: 'guardian', name: '守御回春', skillIds: ['basic_sword', 'shield', 'heal', 'iron_skin'], ultimateSkillId: null }
    ],
    activeCombatLoadoutId: 'balanced',
    skillPoints: 3, // 初始技能点
    skillBonuses: {},

    temporaryBuffs: [],

    idleStartTime: null,
    isIdling: false,
    captivity: {
      isCaptured: false,
      captorSectId: null,
      sinceTick: null
    },

    // 历练区域进度（初始为空，会在游戏运行时初始化）
    areaProgress: [],

    // 体力值系统
    stamina: 100,
    maxStamina: 100,
    lastStaminaRecoverTime: Date.now()
  }
}

// LocalStorage key
const STORAGE_KEY = 'woyu-xiuxian-player'
const OFFLINE_GAIN_CAP_SECONDS = 60 * 25
const OFFLINE_GAIN_FULL_RATE_SECONDS = 60 * 6
const OFFLINE_GAIN_REDUCED_RATE = 0.18

export const usePlayerStore = defineStore('player', () => {
  // ====== 状态 ======

  // 从 localStorage 加载或使用默认值
  let initialData: PlayerState
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData) as Partial<PlayerState>
      // 合并默认值，确保所有新属性都有默认值
      const defaults = getDefaultPlayer()
      initialData = {
        ...defaults,
        ...parsed,
        created: parsed.created ?? Boolean(
          parsed.name
          || parsed.cultivation
          || parsed.realmLevel && parsed.realmLevel > 1
          || parsed.gold && parsed.gold !== defaults.gold
        ),
        // 确保技能系统的新属性有默认值
        learnedSkills: parsed.learnedSkills ?? defaults.learnedSkills,
        combatLoadouts: parsed.combatLoadouts ?? defaults.combatLoadouts,
        activeCombatLoadoutId: parsed.activeCombatLoadoutId ?? defaults.activeCombatLoadoutId,
        skillPoints: parsed.skillPoints ?? defaults.skillPoints,
        skillBonuses: parsed.skillBonuses ?? defaults.skillBonuses,
        pendingRewards: normalizeInventoryItemsSchema(parsed.pendingRewards ?? defaults.pendingRewards),
      }
    } else {
      initialData = getDefaultPlayer()
    }
  } catch (e) {
    console.warn('Failed to load player data from localStorage, using defaults:', e)
    initialData = getDefaultPlayer()
  }

  const id = ref(initialData.id)
  const created = ref(initialData.created)
  const name = ref(initialData.name)
  const icon = ref(initialData.icon)
  const element = ref<Element>(initialData.element)
  const quality = ref<Quality>(initialData.quality)

  const realm = ref<Realm>(initialData.realm)
  const realmLevel = ref(initialData.realmLevel)
  const cultivation = ref(initialData.cultivation)
  const maxCultivation = ref(initialData.maxCultivation)

  const level = ref(initialData.level)

  const gold = ref(initialData.gold)

  const baseStats = ref<UnitStats>({ ...initialData.baseStats })
  const equipmentBonuses = ref<Partial<UnitStats>>({ ...initialData.equipmentBonuses })

  // 装备槽位
  const equippedWeapon = ref<Equipment | undefined>(initialData.equippedWeapon)
  const equippedArmor = ref<Equipment | undefined>(initialData.equippedArmor)
  const equippedAccessory1 = ref<Equipment | undefined>(initialData.equippedAccessory1)
  const equippedAccessory2 = ref<Equipment | undefined>(initialData.equippedAccessory2)

  // 背包
  const inventory = ref<InventoryItem[]>(normalizeInventoryItemsSchema(initialData.inventory))
  const pendingRewards = ref<InventoryItem[]>(normalizeInventoryItemsSchema(initialData.pendingRewards ?? []))
  const maxInventorySlots = ref(initialData.maxInventorySlots)

  // 技能系统（兼容旧数据）
  const learnedSkills = ref<LearnedSkill[]>(
    Array.isArray(initialData.learnedSkills)
      ? [...initialData.learnedSkills]
      : getStarterSkills().map(id => createLearnedSkill(id)).filter((s): s is LearnedSkill => s !== null)
  )
  const combatLoadouts = ref<CombatLoadout[]>(normalizeCombatLoadouts(initialData.combatLoadouts, initialData.learnedSkills))
  const activeCombatLoadoutId = ref(initialData.activeCombatLoadoutId || combatLoadouts.value[0]?.id || 'balanced')
  const skillPoints = ref(initialData.skillPoints ?? 3)
  const skillBonuses = ref<Partial<UnitStats>>(initialData.skillBonuses ?? {})

  const temporaryBuffs = ref<StatusEffect[]>([...initialData.temporaryBuffs])

  const idleStartTime = ref<number | null>(initialData.idleStartTime)
  const isIdling = ref(initialData.isIdling)
  const captivity = ref(initialData.captivity ?? {
    isCaptured: false,
    captorSectId: null,
    sinceTick: null
  })

  // 历练区域进度
  const areaProgress = ref<AreaProgress[]>(initialData.areaProgress ?? [])

  // 体力值系统
  const stamina = ref(initialData.stamina ?? 100)
  const maxStamina = ref(initialData.maxStamina ?? 100)
  const lastStaminaRecoverTime = ref(initialData.lastStaminaRecoverTime ?? Date.now())

  
  // 视角与选择系统
  const perspective = ref<Perspective>(initialData.perspective ?? 'male')
  const spiritRoot = ref<SpiritRoot | null>(initialData.spiritRoot ?? null)
  const bloodline = ref<Bloodline | null>(initialData.bloodline ?? null)
  const choiceState = ref<ChoiceState>(initialData.choiceState ?? { ...EMPTY_CHOICE_STATE })

  // ====== 计算属性 ======

  // 体力恢复速率（每分钟恢复点数）
  const staminaRecoverRate = 1

  // 体力恢复时间（秒）
  const staminaRecoverSeconds = computed(() => {
    if (stamina.value >= maxStamina.value) return Infinity
    return Math.ceil(60 / staminaRecoverRate) // 每点需要多少秒恢复
  })

  // 当前体力百分比
  const staminaPercent = computed(() => {
    return (stamina.value / maxStamina.value) * 100
  })

  // 下次恢复倒计时（秒）
  const nextRecoverCountdown = computed(() => {
    if (stamina.value >= maxStamina.value) return 0
    const now = Date.now()
    const elapsed = (now - lastStaminaRecoverTime.value) / 1000
    const remaining = staminaRecoverSeconds.value - (elapsed % staminaRecoverSeconds.value)
    return Math.ceil(remaining)
  })

  // 所有已装备的装备
  const allEquipped = computed(() => {
    const equipped: Equipment[] = []
    if (equippedWeapon.value) equipped.push(equippedWeapon.value)
    if (equippedArmor.value) equipped.push(equippedArmor.value)
    if (equippedAccessory1.value) equipped.push(equippedAccessory1.value)
    if (equippedAccessory2.value) equipped.push(equippedAccessory2.value)
    return equipped
  })

  const characterProgression = computed(() => {
    return resolveCharacterProgression(allEquipped.value, learnedSkills.value, temporaryBuffs.value)
  })

  // 总属性 = 基础 + 装备加成 + 技能被动加成 + 灵根/血脉加成
  const totalStats = computed<UnitStats>(() => {
    const base = baseStats.value
    const equipBonus = equipmentBonuses.value
    const skillBonus = skillBonuses.value
    const bl = bloodline.value

    // 血脉百分比加成
    const bloodlineHp = bl ? Math.floor((base.maxHp || 0) * (bl.statBonuses.hpPercent || 0)) : 0
    const bloodlineMp = bl ? Math.floor((base.maxMp || 0) * (bl.statBonuses.mpPercent || 0)) : 0
    const bloodlineAtk = bl ? Math.floor((base.attack || 0) * (bl.statBonuses.attackPercent || 0)) : 0
    const bloodlineDef = bl ? Math.floor((base.defense || 0) * (bl.statBonuses.defensePercent || 0)) : 0
    const bloodlineSpd = bl ? Math.floor((base.speed || 0) * (bl.statBonuses.speedPercent || 0)) : 0

    return {
      maxHp: (base.maxHp || 0) + (equipBonus.maxHp || 0) + (skillBonus.maxHp || 0) + bloodlineHp,
      currentHp: Math.min(
        base.currentHp + (equipBonus.maxHp || 0) + (skillBonus.maxHp || 0) + bloodlineHp,
        (base.maxHp || 0) + (equipBonus.maxHp || 0) + (skillBonus.maxHp || 0) + bloodlineHp
      ),
      maxMp: (base.maxMp || 0) + (equipBonus.maxMp || 0) + (skillBonus.maxMp || 0) + bloodlineMp,
      currentMp: Math.min(
        base.currentMp + (equipBonus.maxMp || 0) + (skillBonus.maxMp || 0) + bloodlineMp,
        (base.maxMp || 0) + (equipBonus.maxMp || 0) + (skillBonus.maxMp || 0) + bloodlineMp
      ),
      attack: (base.attack || 0) + (equipBonus.attack || 0) + (skillBonus.attack || 0) + bloodlineAtk,
      defense: (base.defense || 0) + (equipBonus.defense || 0) + (skillBonus.defense || 0) + bloodlineDef,
      speed: (base.speed || 0) + (equipBonus.speed || 0) + (skillBonus.speed || 0) + bloodlineSpd,
      critRate: (base.critRate || 0) + (equipBonus.critRate || 0) + (skillBonus.critRate || 0),
      critDamage: (base.critDamage || 0) + (equipBonus.critDamage || 0) + (skillBonus.critDamage || 0)
    }
  })

  // 境界信息
  const realmInfo = computed(() => ({
    name: realm.value,
    level: realmLevel.value,
    fullName: `${realm.value}${realmLevel.value}层`,
    multiplier: REALM_MULTIPLIER[realm.value]
  }))

  // 修炼进度百分比
  const cultivationProgress = computed(() =>
    Math.min(100, (cultivation.value / maxCultivation.value) * 100)
  )

  // 是否可以突破
  const canBreakthrough = computed(() =>
    realmLevel.value === 9 && cultivation.value >= maxCultivation.value && nextRealm.value !== null
  )

  const breakthroughPreview = computed<BreakthroughPreview>(() => resolveBreakthroughPreview({
    realm: realm.value,
    realmLevel: realmLevel.value,
    cultivation: cultivation.value,
    maxCultivation: maxCultivation.value,
    inventory: inventory.value
  }))

  // 是否已达到最高境界
  const isMaxRealm = computed(() => nextRealm.value === null)

  // 境界颜色（渐变）
  const realmColor = computed(() => REALM_COLORS[realm.value])

  // 境界主色调（用于文字）
  const realmPrimaryColor = computed(() => REALM_PRIMARY_COLOR[realm.value])

  // 每秒修为获取量（基础值 * 境界层级系数 * 灵根/血脉加成）
  const cultivationPerSecond = computed(() => {
    const baseValue = REALM_CULTIVATION_PER_SECOND[realm.value]
    const levelBonus = 1 + (realmLevel.value - 1) * 0.1 // 每层增加10%
    const progression = characterProgression.value
    
    // 灵根修炼速度加成
    const root = spiritRoot.value
    const rootBonus = root ? root.cultivationSpeedBonus : 0
    // 血脉修炼加成  
    const bl = bloodline.value
    const bloodlineBonus = bl ? bl.cultivationBonus : 0
    // 突破加成影响修炼效率（每10%突破加成 = 5%修炼速度）
    const breakthroughEffBonus = root ? root.breakthroughBonus * 0.5 : 0
    
    const totalMultiplier = progression.cultivationMultiplier + rootBonus + bloodlineBonus + breakthroughEffBonus
    const value = baseValue * levelBonus * totalMultiplier + progression.cultivationFlatBonus
    return Math.max(1, Math.round(value))
  })

  // 获取下一个境界
  const nextRealm = computed(() => {
    const currentIndex = REALM_ORDER.indexOf(realm.value)
    if (currentIndex < REALM_ORDER.length - 1) {
      return REALM_ORDER[currentIndex + 1]
    }
    return null
  })

  // 背包是否已满
  const isInventoryFull = computed(() => inventory.value.length >= maxInventorySlots.value)
  const pendingRewardCount = computed(() => pendingRewards.value.reduce((total, item) => total + item.quantity, 0))
  const pendingRewardAvailableSlots = computed(() => Math.max(0, maxInventorySlots.value - inventory.value.length))
  const pendingRewardNewSlotCount = computed(() => pendingRewards.value.reduce((total, item) => {
    if (item.type !== 'equipment' && inventory.value.some(current => isSameStack(current, item))) return total
    return total + 1
  }, 0))
  const pendingRewardClaimableCount = computed(() => {
    let availableSlots = pendingRewardAvailableSlots.value
    let claimable = 0
    const existing = [...inventory.value]

    for (const item of pendingRewards.value) {
      if (item.type !== 'equipment' && existing.some(current => isSameStack(current, item))) {
        claimable++
        continue
      }
      if (availableSlots <= 0) continue
      availableSlots--
      existing.push(item)
      claimable++
    }

    return claimable
  })

  // ====== 方法 ======

  function applyCreationProfile(profile: {
    name?: string
    icon?: string
    element?: Element
    quality?: Quality
    perspective?: Perspective
    spiritRoot?: SpiritRoot | null
    bloodline?: Bloodline | null
  }) {
    const nextName = profile.name?.trim()
    if (nextName) name.value = nextName.slice(0, 8)
    if (profile.icon) icon.value = profile.icon.slice(0, 2)
    if (profile.element) element.value = profile.element
    if (profile.quality) quality.value = profile.quality
    if (profile.perspective) perspective.value = profile.perspective
    if (profile.spiritRoot !== undefined) spiritRoot.value = profile.spiritRoot
    if (profile.bloodline !== undefined) bloodline.value = profile.bloodline
    created.value = true
  }

  // 保存到 localStorage
  function saveToStorage() {
    try {
      const data: PlayerState = {
        id: id.value,
        created: created.value,
        name: name.value,
        icon: icon.value,
        element: element.value,
        quality: quality.value,
        realm: realm.value,
        realmLevel: realmLevel.value,
        cultivation: cultivation.value,
        maxCultivation: maxCultivation.value,
        level: level.value,
        perspective: perspective.value,
        spiritRoot: toRaw(spiritRoot.value),
        bloodline: toRaw(bloodline.value),
        choiceState: toRaw(choiceState.value),
        gold: gold.value,
        baseStats: toRaw(baseStats.value),
        equipmentBonuses: toRaw(equipmentBonuses.value),
        equippedWeapon: toRaw(equippedWeapon.value),
        equippedArmor: toRaw(equippedArmor.value),
        equippedAccessory1: toRaw(equippedAccessory1.value),
        equippedAccessory2: toRaw(equippedAccessory2.value),
        inventory: toRaw(inventory.value),
        pendingRewards: toRaw(pendingRewards.value),
        maxInventorySlots: maxInventorySlots.value,
        learnedSkills: toRaw(learnedSkills.value),
        combatLoadouts: toRaw(combatLoadouts.value),
        activeCombatLoadoutId: activeCombatLoadoutId.value,
        skillPoints: skillPoints.value,
        skillBonuses: toRaw(skillBonuses.value),
        temporaryBuffs: toRaw(temporaryBuffs.value),
        idleStartTime: idleStartTime.value,
        isIdling: isIdling.value,
        captivity: toRaw(captivity.value),
        areaProgress: toRaw(areaProgress.value),
        stamina: stamina.value,
        maxStamina: maxStamina.value,
        lastStaminaRecoverTime: lastStaminaRecoverTime.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save player data to localStorage:', e)
    }
  }

  // 增加修为
  function addCultivation(amount: number) {
    cultivation.value += amount

    // 循环升级，支持一次性升多层
    while (realmLevel.value < 9 && cultivation.value >= maxCultivation.value) {
      const excess = cultivation.value - maxCultivation.value
      levelUp()
      cultivation.value = excess
    }

    // 9层时修为不能超过最大值
    if (realmLevel.value === 9 && cultivation.value > maxCultivation.value) {
      cultivation.value = maxCultivation.value
    }
  }

  // 升级境界层（炼气1层 -> 炼气2层）
  function levelUp() {
    if (realmLevel.value < 9) {
      realmLevel.value++
      cultivation.value = 0
      // 每层突破所需修为增加
      maxCultivation.value = Math.floor(maxCultivation.value * 1.2)
      recalculateStats()

      // 每3层获得1个技能点
      if (realmLevel.value % 3 === 0) {
        skillPoints.value++
      }
    }
  }

  function applyBreakthroughSuccess(result: BreakthroughAttemptResolution) {
    if (!result.nextRealm) return false

    realm.value = result.nextRealm
    realmLevel.value = 1
    cultivation.value = 0
    maxCultivation.value = result.nextMaxCultivation

    recalculateStats()

    skillPoints.value += result.skillPointsGained
    return true
  }

  function consumeBreakthroughAid(itemId: string | null) {
    if (!itemId) return
    removeFromInventory(itemId)
  }

  function attemptBreakthrough(seedParts: Array<number | string> = []): BreakthroughAttemptResolution {
    const result = resolveBreakthroughAttempt({
      realm: realm.value,
      realmLevel: realmLevel.value,
      cultivation: cultivation.value,
      maxCultivation: maxCultivation.value,
      inventory: inventory.value,
      selectedAidItemId: breakthroughPreview.value.selectedAid?.itemId ?? null,
      seedParts
    })

    if (!result.canAttempt) return result

    consumeBreakthroughAid(result.consumedItemId)

    if (result.success) {
      applyBreakthroughSuccess(result)
    } else {
      cultivation.value = Math.max(0, Math.min(maxCultivation.value, result.failureCultivation))
    }

    return result
  }

  // 突破境界（炼气9层 -> 筑基1层）
  function breakthrough(): boolean {
    return attemptBreakthrough().success
  }

  // 增加技能点
  function addSkillPoints(amount: number) {
    skillPoints.value += amount
  }

  // 重新计算属性
  function recalculateStats() {
    const newStats = calculateBaseStats(realm.value, quality.value, level.value)
    baseStats.value = {
      ...newStats,
      currentHp: baseStats.value.currentHp,
      currentMp: baseStats.value.currentMp
    }
  }

  // 装备物品
  function equip(equipment: Equipment, fromInventoryItemId?: string): boolean {
    let slot: 'weapon' | 'armor' | 'accessory1' | 'accessory2' | null = null
    let currentEquipped: Equipment | undefined

    switch (equipment.type) {
      case 'weapon':
        slot = 'weapon'
        currentEquipped = equippedWeapon.value
        break
      case 'armor':
        slot = 'armor'
        currentEquipped = equippedArmor.value
        break
      case 'accessory':
        if (!equippedAccessory1.value) {
          slot = 'accessory1'
        } else if (!equippedAccessory2.value) {
          slot = 'accessory2'
        } else {
          // 饰品槽已满，替换第一个
          slot = 'accessory1'
          currentEquipped = equippedAccessory1.value
        }
        break
    }

    if (!slot) return false

    // 如果当前槽位有装备，先卸下放入背包
    if (currentEquipped) {
      addToInventory({
        id: `item_${Date.now()}`,
        equipmentId: currentEquipped.id,
        equipmentData: { ...currentEquipped },
        name: currentEquipped.name,
        icon: currentEquipped.icon,
        type: 'equipment',
        quality: currentEquipped.quality,
        quantity: 1,
        description: currentEquipped.description
      })
    }

    // 装备新物品
    switch (slot) {
      case 'weapon':
        equippedWeapon.value = equipment
        break
      case 'armor':
        equippedArmor.value = equipment
        break
      case 'accessory1':
        equippedAccessory1.value = equipment
        break
      case 'accessory2':
        equippedAccessory2.value = equipment
        break
    }

    // 从背包移除
    if (fromInventoryItemId) {
      removeFromInventory(fromInventoryItemId)
    }

    recalculateEquipmentBonuses()
    return true
  }

  // 卸下装备
  function unequip(slot: 'weapon' | 'armor' | 'accessory1' | 'accessory2'): boolean {
    let equipment: Equipment | undefined

    switch (slot) {
      case 'weapon':
        equipment = equippedWeapon.value
        equippedWeapon.value = undefined
        break
      case 'armor':
        equipment = equippedArmor.value
        equippedArmor.value = undefined
        break
      case 'accessory1':
        equipment = equippedAccessory1.value
        equippedAccessory1.value = undefined
        break
      case 'accessory2':
        equipment = equippedAccessory2.value
        equippedAccessory2.value = undefined
        break
    }

    if (!equipment) return false

    // 放入背包，保存完整装备数据
    addToInventory({
      id: `item_${Date.now()}`,
      equipmentId: equipment.id,
      equipmentData: { ...equipment },
      name: equipment.name,
      icon: equipment.icon,
      type: 'equipment',
      quality: equipment.quality,
      quantity: 1,
      description: equipment.description
    })

    recalculateEquipmentBonuses()
    return true
  }

  // 重新计算装备加成
  function recalculateEquipmentBonuses() {
    equipmentBonuses.value = { ...characterProgression.value.equipmentStatBonuses }
  }

  // 添加物品到背包
  function addToInventory(item: InventoryItem): boolean {
    const normalizedItem = normalizeInventoryItemSchema(item)
    // 如果是可堆叠物品，检查是否已存在
    if (normalizedItem.type !== 'equipment') {
      const existing = inventory.value.find(i => {
        if (i.type !== normalizedItem.type) return false
        if (normalizedItem.definitionId && i.definitionId) {
          return i.definitionId === normalizedItem.definitionId
        }
        return i.name === normalizedItem.name
      })
      if (existing) {
        existing.quantity += normalizedItem.quantity
        if (!existing.definitionId && normalizedItem.definitionId) {
          existing.definitionId = normalizedItem.definitionId
        }
        // 更新宗门采集任务进度
        updateCollectTaskProgress(normalizedItem)
        return true
      }
    }

    if (isInventoryFull.value) return false

    inventory.value.push(normalizedItem)
    // 更新宗门采集任务进度
    updateCollectTaskProgress(normalizedItem)
    return true
  }

  function isSameStack(current: InventoryItem, incoming: InventoryItem) {
    if (current.type !== incoming.type) return false
    if (incoming.definitionId && current.definitionId) {
      return current.definitionId === incoming.definitionId
    }
    return current.name === incoming.name
  }

  function addPendingReward(item: InventoryItem) {
    const normalizedItem = normalizeInventoryItemSchema(item)
    if (normalizedItem.type !== 'equipment') {
      const existing = pendingRewards.value.find(current => (
        normalizedItem.definitionId && current.definitionId
          ? current.definitionId === normalizedItem.definitionId
          : current.name === normalizedItem.name
      ))
      if (existing) {
        existing.quantity += normalizedItem.quantity
        saveToStorage()
        return
      }
    }
    pendingRewards.value.push(normalizedItem)
    saveToStorage()
  }

  function claimPendingReward(itemId: string): boolean {
    const index = pendingRewards.value.findIndex(item => item.id === itemId)
    if (index < 0) return false
    const item = pendingRewards.value[index]
    if (!item || !addToInventory(item)) return false
    pendingRewards.value.splice(index, 1)
    saveToStorage()
    return true
  }

  function claimPendingRewards() {
    let claimed = 0
    for (const item of [...pendingRewards.value]) {
      if (!addToInventory(item)) continue
      const index = pendingRewards.value.findIndex(current => current.id === item.id)
      if (index >= 0) pendingRewards.value.splice(index, 1)
      claimed++
    }
    if (claimed > 0) saveToStorage()
    return {
      claimed,
      remaining: pendingRewards.value.length
    }
  }

  // 更新采集任务进度（避免循环依赖的辅助函数）
  function updateCollectTaskProgress(item: InventoryItem) {
    // 使用动态导入避免循环依赖
    import('@/stores/sectStore').then(({ useSectStore }) => {
      const sectStore = useSectStore()
      if (item.type === 'material') {
        sectStore.updateTaskProgress('collect', 'material')
      }
    }).catch(() => {
      // 忽略错误（可能未加入宗门）
    })
  }

  // 从背包移除物品
  function removeFromInventory(itemId: string): boolean {
    const index = inventory.value.findIndex(i => i.id === itemId)
    if (index === -1) return false

    const item = inventory.value[index]
    if (!item) return false

    if (item.quantity > 1) {
      item.quantity--
    } else {
      inventory.value.splice(index, 1)
    }
    return true
  }

  // 使用消耗品
  function useConsumable(itemId: string): { success: boolean; message?: string; buffType?: string } {
    const result = resolveConsumableUse({
      itemId,
      inventory: inventory.value,
      baseStats: baseStats.value,
      totalStats: totalStats.value
    })
    if (!result.success) return { success: false, message: result.message }

    if (result.delta.cultivation > 0) addCultivation(result.delta.cultivation)
    if (result.delta.hp > 0) {
      baseStats.value.currentHp = Math.min(baseStats.value.currentHp + result.delta.hp, totalStats.value.maxHp)
    }
    if (result.delta.mp > 0) {
      baseStats.value.currentMp = Math.min(baseStats.value.currentMp + result.delta.mp, totalStats.value.maxMp)
    }
    if (result.delta.stamina > 0) {
      stamina.value = Math.min(maxStamina.value, stamina.value + result.delta.stamina)
      lastStaminaRecoverTime.value = Date.now()
    }
    for (const buff of result.delta.buffs) addBuff(buff)

    // 减少数量
    removeFromInventory(itemId)
    return { success: true, message: result.message }
  }

  // 添加临时buff
  function addBuff(buff: StatusEffect) {
    temporaryBuffs.value.push(buff)
  }

  // 移除临时buff
  function removeBuff(type: string) {
    const index = temporaryBuffs.value.findIndex(b => b.type === type)
    if (index > -1) {
      temporaryBuffs.value.splice(index, 1)
    }
  }

  // 清除所有临时buff
  function clearBuffs() {
    temporaryBuffs.value = []
  }

  // 开始挂机
  function startIdle() {
    isIdling.value = true
    idleStartTime.value = Date.now()
  }

  // 停止挂机
  function stopIdle() {
    isIdling.value = false
    idleStartTime.value = null
  }

  function setCaptivity(captorSectId: string | null, sinceTick: number | null) {
    captivity.value = {
      isCaptured: Boolean(captorSectId),
      captorSectId,
      sinceTick
    }
    if (captivity.value.isCaptured) {
      stopIdle()
    }
  }

  function clearCaptivity() {
    captivity.value = {
      isCaptured: false,
      captorSectId: null,
      sinceTick: null
    }
  }

  // 计算离线收益
  function calculateOfflineGains(): number {
    if (!idleStartTime.value) return 0

    const now = Date.now()
    const elapsed = now - idleStartTime.value
    const seconds = Math.floor(elapsed / 1000)
    const effectiveSeconds = Math.min(seconds, OFFLINE_GAIN_CAP_SECONDS)
    const reducedSeconds = Math.max(0, effectiveSeconds - OFFLINE_GAIN_FULL_RATE_SECONDS)
    const fullRateSeconds = effectiveSeconds - reducedSeconds

    // 离线收益只保留短时全额，后续显著衰减，避免一挂就爆发式成长
    const gains = Math.round(fullRateSeconds * cultivationPerSecond.value + reducedSeconds * cultivationPerSecond.value * OFFLINE_GAIN_REDUCED_RATE)

    idleStartTime.value = now
    temporaryBuffs.value = tickFoodProgressionEffects(temporaryBuffs.value)
    return gains
  }

  // 增加金币
  function addGold(amount: number) {
    gold.value += amount
  }

  // ====== 技能系统方法 ======

  // 检查是否已学习某技能
  function hasLearnedSkill(skillId: string): boolean {
    return learnedSkills.value.some(ls => ls.id === skillId)
  }

  // 获得已学习的技能
  function getLearnedSkill(skillId: string): LearnedSkill | undefined {
    return learnedSkills.value.find(ls => ls.id === skillId)
  }

  // 检查是否可以学习某技能
  function canLearnSkill(skillId: string): boolean {
    const definition = getSkillDefinition(skillId)
    if (!definition) return false

    // 已学习则不能再次学习
    if (hasLearnedSkill(skillId)) return false

    // 检查技能点是否足够
    if (skillPoints.value < 1) return false

    // 检查前置技能
    if (definition.prerequisites) {
      for (const prereq of definition.prerequisites) {
        if (!hasLearnedSkill(prereq)) return false
      }
    }

    // 检查境界要求
    if (definition.unlockRealm) {
      const currentRealmIndex = REALM_ORDER.indexOf(realm.value)
      const requiredRealmIndex = REALM_ORDER.indexOf(definition.unlockRealm as Realm)
      if (currentRealmIndex < requiredRealmIndex) return false
    }

    return true
  }

  // 学习技能
  function learnSkill(skillId: string): boolean {
    if (!canLearnSkill(skillId)) return false

    const newSkill = createLearnedSkill(skillId)
    if (!newSkill) return false

    learnedSkills.value.push(newSkill)
    skillPoints.value--

    // 重新计算技能被动加成
    recalculateSkillBonuses()

    return true
  }

  // 升级技能
  function upgradeSkill(skillId: string): boolean {
    const learnedSkill = getLearnedSkill(skillId)
    const definition = getSkillDefinition(skillId)

    if (!learnedSkill || !definition) return false

    // 检查是否达到最大等级
    if (learnedSkill.level >= definition.maxLevel) return false

    // 检查技能点是否足够
    if (skillPoints.value < 1) return false

    learnedSkill.level++
    learnedSkill.maxExp = calculateSkillExpRequired(learnedSkill.level)
    learnedSkill.exp = 0
    skillPoints.value--

    // 重新计算技能被动加成
    recalculateSkillBonuses()

    return true
  }

  // 增加技能经验
  function addSkillExp(skillId: string, exp: number): boolean {
    const learnedSkill = getLearnedSkill(skillId)
    if (!learnedSkill) return false

    learnedSkill.exp += exp

    // 检查是否可以自动升级
    const definition = getSkillDefinition(skillId)
    if (definition && learnedSkill.exp >= learnedSkill.maxExp && learnedSkill.level < definition.maxLevel) {
      learnedSkill.level++
      learnedSkill.exp = 0
      learnedSkill.maxExp = calculateSkillExpRequired(learnedSkill.level)

      // 重新计算技能被动加成
      recalculateSkillBonuses()

      return true
    }

    return false
  }

  // 重新计算技能被动加成
  function recalculateSkillBonuses() {
    skillBonuses.value = { ...characterProgression.value.skillStatBonuses }
  }

  // 切换技能启用状态
  function toggleSkillEnabled(skillId: string): boolean {
    const learnedSkill = getLearnedSkill(skillId)
    if (!learnedSkill) return false

    learnedSkill.enabled = !learnedSkill.enabled

    // 重新计算技能被动加成
    recalculateSkillBonuses()

    return true
  }

  function getActiveCombatLoadout() {
    return combatLoadouts.value.find(loadout => loadout.id === activeCombatLoadoutId.value)
      ?? combatLoadouts.value[0]
      ?? null
  }

  function getActiveCombatSkillIds() {
    const loadout = getActiveCombatLoadout()
    if (!loadout) return learnedSkills.value.filter(skill => skill.enabled).map(skill => skill.id).slice(0, 4)
    const learnedIds = new Set(learnedSkills.value.map(skill => skill.id))
    const activeIds = loadout.skillIds.filter(skillId => learnedIds.has(skillId)).slice(0, 4)
    if (loadout.ultimateSkillId && learnedIds.has(loadout.ultimateSkillId)) activeIds.push(loadout.ultimateSkillId)
    return [...new Set(activeIds)]
  }

  function setActiveCombatLoadout(loadoutId: string) {
    if (!combatLoadouts.value.some(loadout => loadout.id === loadoutId)) return false
    activeCombatLoadoutId.value = loadoutId
    return true
  }

  function updateCombatLoadout(loadoutId: string, skillIds: string[], ultimateSkillId?: string | null) {
    const loadout = combatLoadouts.value.find(item => item.id === loadoutId)
    if (!loadout) return false
    const learnedIds = new Set(learnedSkills.value.map(skill => skill.id))
    loadout.skillIds = [...new Set(skillIds.filter(skillId => learnedIds.has(skillId)))].slice(0, 4)
    loadout.ultimateSkillId = ultimateSkillId && learnedIds.has(ultimateSkillId) && !loadout.skillIds.includes(ultimateSkillId)
      ? ultimateSkillId
      : null
    return true
  }

  // 获取技能定义列表
  function getAvailableSkills(): SkillDefinition[] {
    return Object.values(SKILL_DEFINITIONS)
  }

  // 获取技能树某分支的技能
  function getSkillTreeBranch(branch: SkillBranch): SkillDefinition[] {
    const nodeSkillIds = SKILL_TREE[branch].map(node => node.skillId)
    return nodeSkillIds
      .map(id => SKILL_DEFINITIONS[id])
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
  }

  // 转换为战斗单位
  function toBattleUnit(): Unit {
    return resolveCharacterBattleUnit({
      id: id.value,
      name: name.value,
      icon: icon.value,
      element: element.value,
      realm: realm.value,
      realmLevel: realmLevel.value,
      quality: quality.value,
      level: level.value,
      stats: { ...totalStats.value },
        skillIds: getActiveCombatSkillIds(),
      statusEffects: [
        ...temporaryBuffs.value,
        ...resolveEquipmentEffects(allEquipped.value).battleStatusEffects
      ]
    })
  }

  // ====== 体力值系统方法 ======

  // 恢复体力（基于时间）
  function recoverStamina() {
    const now = Date.now()
    const elapsed = (now - lastStaminaRecoverTime.value) / 1000 // 秒
    const pointsToRecover = Math.floor(elapsed / staminaRecoverSeconds.value)

    if (pointsToRecover > 0 && stamina.value < maxStamina.value) {
      const newStamina = Math.min(maxStamina.value, stamina.value + pointsToRecover)
      const actualRecovered = newStamina - stamina.value
      stamina.value = newStamina
      // 更新恢复时间，保留不足恢复一点的时间
      lastStaminaRecoverTime.value = now - ((pointsToRecover - actualRecovered) * staminaRecoverSeconds.value * 1000)
      if (stamina.value >= maxStamina.value) {
        lastStaminaRecoverTime.value = now
      }
    }
  }

  // 消耗体力
  function consumeStamina(amount: number): boolean {
    recoverStamina() // 先尝试恢复
    if (stamina.value < amount) return false
    stamina.value -= amount
    return true
  }

  // 购买体力（消耗灵石）
  function buyStamina(cost: number, amount: number): { success: boolean; message: string } {
    if (gold.value < cost) {
      return { success: false, message: '灵石不足' }
    }
    if (stamina.value >= maxStamina.value) {
      return { success: false, message: '体力已满' }
    }
    gold.value -= cost
    stamina.value = Math.min(maxStamina.value, stamina.value + amount)
    lastStaminaRecoverTime.value = Date.now()
    return { success: true, message: `恢复了${amount}点体力` }
  }

  // ====== 历练区域进度方法 ======

  // 获取区域进度
  function getAreaProgress(areaId: string): AreaProgress | undefined {
    return areaProgress.value.find(p => p.areaId === areaId)
  }

  // 更新区域进度
  function updateAreaProgress(areaId: string, updates: Partial<AreaProgress>): void {
    const index = areaProgress.value.findIndex(p => p.areaId === areaId)
    if (index >= 0) {
      const existing = areaProgress.value[index]
      if (existing) {
        areaProgress.value[index] = { ...existing, ...updates }
      }
    } else {
      areaProgress.value.push({
        areaId: areaId,
        cleared: updates.cleared ?? false,
        clearCount: updates.clearCount ?? 0,
        stars: updates.stars ?? 0,
        unlocked: updates.unlocked ?? false,
        fastestTime: updates.fastestTime
      })
    }
  }

  // 标记区域通关
  function clearArea(areaId: string, timeUsed: number, stars: number): void {
    const progress = getAreaProgress(areaId)
    if (progress) {
      progress.cleared = true
      progress.clearCount++
      if (!progress.fastestTime || timeUsed < progress.fastestTime) {
        progress.fastestTime = timeUsed
      }
      if (stars > progress.stars) {
        progress.stars = stars
      }
    } else {
      updateAreaProgress(areaId, {
        cleared: true,
        clearCount: 1,
        fastestTime: timeUsed,
        stars,
        unlocked: true
      })
    }
  }

  // 解锁区域
  function unlockArea(areaId: string): void {
    updateAreaProgress(areaId, { unlocked: true })
  }

  // 检查区域是否解锁
  function isAreaUnlockedByPlayer(areaId: string): boolean {
    const progress = getAreaProgress(areaId)
    return progress?.unlocked ?? false
  }

  recalculateEquipmentBonuses()
  recalculateSkillBonuses()

  // 监听变化自动保存
  watchEffect(() => {
    saveToStorage()
  })

  return {
    // 状态
    id, created, name, icon, element, quality,
    realm, realmLevel, cultivation, maxCultivation,
    level, gold,
    perspective, spiritRoot, bloodline, choiceState,
    baseStats, equipmentBonuses, skillBonuses, totalStats,
    characterProgression,
    equippedWeapon, equippedArmor, equippedAccessory1, equippedAccessory2,
    allEquipped,
    inventory,
    pendingRewards,
    pendingRewardCount,
    pendingRewardAvailableSlots,
    pendingRewardNewSlotCount,
    pendingRewardClaimableCount,
    maxInventorySlots,
    isInventoryFull,
    learnedSkills, skillPoints, combatLoadouts, activeCombatLoadoutId,
    temporaryBuffs,
    idleStartTime, isIdling,
    captivity,
    areaProgress,

    // 体力值系统
    stamina, maxStamina, lastStaminaRecoverTime,
    staminaRecoverRate, staminaRecoverSeconds, staminaPercent, nextRecoverCountdown,

    // 计算属性
    realmInfo, cultivationProgress, canBreakthrough, breakthroughPreview, nextRealm, isMaxRealm, realmColor, realmPrimaryColor, cultivationPerSecond,

    // 技能系统方法
    hasLearnedSkill, getLearnedSkill, canLearnSkill, learnSkill, upgradeSkill, addSkillExp,
    toggleSkillEnabled, getAvailableSkills, getSkillTreeBranch, recalculateSkillBonuses,
    getActiveCombatLoadout, getActiveCombatSkillIds, setActiveCombatLoadout, updateCombatLoadout,
    addSkillPoints,

    // 方法
    applyCreationProfile,
    addCultivation, levelUp, breakthrough, attemptBreakthrough,
    equip, unequip, recalculateEquipmentBonuses,
    addToInventory,
    addPendingReward,
    claimPendingReward,
    claimPendingRewards,
    removeFromInventory,
    useConsumable,
    addBuff, removeBuff, clearBuffs,
    startIdle, stopIdle, calculateOfflineGains,
    setCaptivity, clearCaptivity,
    addGold,
    toBattleUnit, saveToStorage,

    // 体力值系统方法
    recoverStamina, consumeStamina, buyStamina,

    // 历练区域方法
    getAreaProgress, updateAreaProgress, clearArea, unlockArea, isAreaUnlockedByPlayer
  }
})
