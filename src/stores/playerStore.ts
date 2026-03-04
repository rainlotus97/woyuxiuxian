import { defineStore } from 'pinia'
import { ref, computed, watchEffect, toRaw } from 'vue'
import type { Unit, Realm, Quality, Element, UnitStats, StatusEffect } from '@/types/unit'
import { REALM_ORDER, REALM_MULTIPLIER, calculateBaseStats } from '@/types/unit'
import type { Equipment } from '@/types/equipment'

// 背包物品接口
export interface InventoryItem {
  id: string
  equipmentId?: string  // 如果是装备，指向装备ID
  equipmentData?: Equipment  // 完整的装备数据（用于卸下的装备）
  name: string
  icon: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  quantity: number
  description?: string
  // 消耗品效果
  effects?: {
    type: string
    value: number
  }[]
}

// 玩家状态接口
interface PlayerState {
  // 基础信息
  id: string
  name: string
  icon: string
  element: Element
  quality: Quality

  // 修炼
  realm: Realm
  realmLevel: number  // 1-9
  cultivation: number // 当���修为
  maxCultivation: number // 突破所需修为

  // 等级
  level: number

  // 资源
  gold: number

  // 属性
  baseStats: UnitStats  // 基础属性（不含装备）
  equipmentBonuses: Partial<UnitStats>  // 装备加成

  // 装备槽位
  equippedWeapon?: Equipment
  equippedArmor?: Equipment
  equippedAccessory1?: Equipment
  equippedAccessory2?: Equipment

  // 背包
  inventory: InventoryItem[]
  maxInventorySlots: number

  // 技能
  skills: string[]

  // 临时buff
  temporaryBuffs: StatusEffect[]

  // 挂机相关
  idleStartTime: number | null  // 挂机开始时间戳
  isIdling: boolean
}

// 默认玩家数据
function getDefaultPlayer(): PlayerState {
  return {
    id: 'protagonist',
    name: '云逸',
    icon: '剑',
    element: '金',
    quality: '灵品',

    realm: '炼气',
    realmLevel: 3,
    cultivation: 0,
    maxCultivation: 100,

    level: 5,

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
    ],
    maxInventorySlots: 20,

    skills: ['fireball', 'heal', 'thunder_strike', 'shield'],

    temporaryBuffs: [],

    idleStartTime: null,
    isIdling: false
  }
}

// LocalStorage key
const STORAGE_KEY = 'woyu-xiuxian-player'

export const usePlayerStore = defineStore('player', () => {
  // ====== 状态 ======

  // 从 localStorage 加载或使用默认值
  let initialData: PlayerState
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    initialData = savedData ? JSON.parse(savedData) as PlayerState : getDefaultPlayer()
  } catch (e) {
    console.warn('Failed to load player data from localStorage, using defaults:', e)
    initialData = getDefaultPlayer()
  }

  const id = ref(initialData.id)
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
  const inventory = ref<InventoryItem[]>([...initialData.inventory])
  const maxInventorySlots = ref(initialData.maxInventorySlots)

  const skills = ref<string[]>([...initialData.skills])

  const temporaryBuffs = ref<StatusEffect[]>([...initialData.temporaryBuffs])

  const idleStartTime = ref<number | null>(initialData.idleStartTime)
  const isIdling = ref(initialData.isIdling)

  // ====== 计算属性 ======

  // 所有已装备的装备
  const allEquipped = computed(() => {
    const equipped: Equipment[] = []
    if (equippedWeapon.value) equipped.push(equippedWeapon.value)
    if (equippedArmor.value) equipped.push(equippedArmor.value)
    if (equippedAccessory1.value) equipped.push(equippedAccessory1.value)
    if (equippedAccessory2.value) equipped.push(equippedAccessory2.value)
    return equipped
  })

  // 总属性 = 基础 + 装备加成
  const totalStats = computed<UnitStats>(() => {
    const base = baseStats.value
    const bonus = equipmentBonuses.value

    return {
      maxHp: (base.maxHp || 0) + (bonus.maxHp || 0),
      currentHp: Math.min(
        base.currentHp + (bonus.maxHp || 0),
        (base.maxHp || 0) + (bonus.maxHp || 0)
      ),
      maxMp: (base.maxMp || 0) + (bonus.maxMp || 0),
      currentMp: Math.min(
        base.currentMp + (bonus.maxMp || 0),
        (base.maxMp || 0) + (bonus.maxMp || 0)
      ),
      attack: (base.attack || 0) + (bonus.attack || 0),
      defense: (base.defense || 0) + (bonus.defense || 0),
      speed: (base.speed || 0) + (bonus.speed || 0),
      critRate: (base.critRate || 0) + (bonus.critRate || 0),
      critDamage: (base.critDamage || 0) + (bonus.critDamage || 0)
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
    realmLevel.value === 9 && cultivation.value >= maxCultivation.value
  )

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

  // ====== 方法 ======

  // 保存到 localStorage
  function saveToStorage() {
    try {
      const data: PlayerState = {
        id: id.value,
        name: name.value,
        icon: icon.value,
        element: element.value,
        quality: quality.value,
        realm: realm.value,
        realmLevel: realmLevel.value,
        cultivation: cultivation.value,
        maxCultivation: maxCultivation.value,
        level: level.value,
        gold: gold.value,
        baseStats: toRaw(baseStats.value),
        equipmentBonuses: toRaw(equipmentBonuses.value),
        equippedWeapon: toRaw(equippedWeapon.value),
        equippedArmor: toRaw(equippedArmor.value),
        equippedAccessory1: toRaw(equippedAccessory1.value),
        equippedAccessory2: toRaw(equippedAccessory2.value),
        inventory: toRaw(inventory.value),
        maxInventorySlots: maxInventorySlots.value,
        skills: toRaw(skills.value),
        temporaryBuffs: toRaw(temporaryBuffs.value),
        idleStartTime: idleStartTime.value,
        isIdling: isIdling.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save player data to localStorage:', e)
    }
  }

  // 增加修为
  function addCultivation(amount: number) {
    cultivation.value = Math.min(cultivation.value + amount, maxCultivation.value)

    // 炼气1-8层自动升级
    if (realm.value === '炼气' && realmLevel.value < 9) {
      if (cultivation.value >= maxCultivation.value) {
        levelUp()
      }
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
    }
  }

  // 突破境界（炼气9层 -> 筑基1层）
  function breakthrough(): boolean {
    if (!canBreakthrough.value) return false

    const next = nextRealm.value
    if (!next) return false // 已是最高境界

    realm.value = next
    realmLevel.value = 1
    cultivation.value = 0
    maxCultivation.value = Math.floor(maxCultivation.value * 1.5)

    recalculateStats()
    return true
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
    const bonuses: Partial<UnitStats> = {}

    for (const eq of allEquipped.value) {
      for (const [key, value] of Object.entries(eq.bonuses)) {
        bonuses[key as keyof UnitStats] = (bonuses[key as keyof UnitStats] || 0) + (value as number)
      }
    }

    equipmentBonuses.value = bonuses
  }

  // 添加物品到背包
  function addToInventory(item: InventoryItem): boolean {
    if (isInventoryFull.value) return false

    // 如果是可堆叠物品，检查是否已存在
    if (item.type !== 'equipment') {
      const existing = inventory.value.find(i => i.name === item.name && i.type === item.type)
      if (existing) {
        existing.quantity += item.quantity
        return true
      }
    }

    inventory.value.push(item)
    return true
  }

  // 从背包移除物品
  function removeFromInventory(itemId: string): boolean {
    const index = inventory.value.findIndex(i => i.id === itemId)
    if (index === -1) return false

    const item = inventory.value[index]
    if (item.quantity > 1) {
      item.quantity--
    } else {
      inventory.value.splice(index, 1)
    }
    return true
  }

  // 使用消耗品
  function useConsumable(itemId: string): { success: boolean; message?: string; buffType?: string } {
    const item = inventory.value.find(i => i.id === itemId)
    if (!item || item.type !== 'consumable') {
      return { success: false, message: '物品不存在或不是消耗品' }
    }

    // 应用效果
    if (item.effects) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'cultivation':
            addCultivation(effect.value)
            break
          case 'mp':
            baseStats.value.currentMp = Math.min(
              baseStats.value.currentMp + effect.value,
              totalStats.value.maxMp
            )
            break
          case 'hp':
            baseStats.value.currentHp = Math.min(
              baseStats.value.currentHp + effect.value,
              totalStats.value.maxHp
            )
            break
          case 'buff_atk':
          case 'buff_def':
          case 'buff_spd':
            // 战斗buff，添加到临时buff列表
            addBuff({
              type: effect.type,
              value: effect.value,
              duration: (effect as { duration?: number }).duration || 3,
              icon: effect.type === 'buff_atk' ? '攻' : effect.type === 'buff_def' ? '防' : '速'
            })
            break
        }
      }
    }

    // 减少数量
    removeFromInventory(itemId)
    return { success: true, message: `使用了 ${item.name}` }
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

  // 计算离线收益
  function calculateOfflineGains(): number {
    if (!idleStartTime.value) return 0

    const now = Date.now()
    const elapsed = now - idleStartTime.value
    const seconds = Math.floor(elapsed / 1000)

    // 每秒获得5点修为
    const gains = seconds * 5

    idleStartTime.value = now
    return gains
  }

  // 增加金币
  function addGold(amount: number) {
    gold.value += amount
  }

  // 转换为战斗单位
  function toBattleUnit(): Unit {
    return {
      id: id.value,
      name: name.value,
      type: 'protagonist',
      element: element.value,
      realm: realm.value,
      realmLevel: realmLevel.value,
      quality: quality.value,
      level: level.value,
      stats: { ...totalStats.value },
      skills: [...skills.value],
      statusEffects: [...temporaryBuffs.value],
      isAlive: true,
      icon: icon.value
    }
  }

  // 监听变化自动保存
  watchEffect(() => {
    saveToStorage()
  })

  return {
    // 状态
    id, name, icon, element, quality,
    realm, realmLevel, cultivation, maxCultivation,
    level, gold,
    baseStats, equipmentBonuses, totalStats,
    equippedWeapon, equippedArmor, equippedAccessory1, equippedAccessory2,
    allEquipped,
    inventory, maxInventorySlots, isInventoryFull,
    skills, temporaryBuffs,
    idleStartTime, isIdling,

    // 计算属性
    realmInfo, cultivationProgress, canBreakthrough, nextRealm,

    // 方法
    addCultivation, levelUp, breakthrough,
    equip, unequip, recalculateEquipmentBonuses,
    addToInventory, removeFromInventory, useConsumable,
    addBuff, removeBuff, clearBuffs,
    startIdle, stopIdle, calculateOfflineGains,
    addGold,
    toBattleUnit, saveToStorage
  }
})
