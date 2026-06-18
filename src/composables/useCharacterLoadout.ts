import { computed, ref } from 'vue'
import { usePlayerStore, type InventoryItem } from '@/stores/playerStore'
import { useToast } from '@/composables/useToast'
import { sfxItem, sfxSkillUp } from '@/composables/useAudio'
import type { Equipment, EquipmentSlot } from '@/types/equipment'
import { getEquipmentById } from '@/types/equipment'
import type { SkillBranch, SkillTreeNode } from '@/types/skill'
import {
  SKILL_TREE,
  calculateSkillMpCost,
  getSkillDefinition
} from '@/types/skill'
import type { Realm, UnitStats } from '@/types/unit'
import { ELEMENT_COLORS, QUALITY_COLORS, REALM_ORDER } from '@/types/unit'
import type { CharacterProgressionSource } from '@/character/runtime/characterProgressionResolver'
import { resolveInventorySchemaSummary } from '@/character/runtime/inventorySchemaSummaryResolver'

export type CharacterPanelTab = 'overview' | 'inventory' | 'skills'
export type InventoryFilter = 'all' | InventoryItem['type']

export interface CharacterStatItem {
  key: keyof UnitStats
  label: string
  base: number
  bonus: number
  total: number
  display: string
}

export interface EquipmentSlotState {
  slot: EquipmentSlot
  label: string
  equipment?: Equipment
  candidates: InventoryItem[]
}

export interface LoadoutProgressSummary {
  equippedCount: number
  totalSlots: number
  candidateCount: number
  completionPercent: number
}

export interface SkillProgressSummary {
  learnedCount: number
  totalCount: number
  enabledCount: number
  availableCount: number
  lockedCount: number
}

const INVENTORY_FILTER_LABELS: Record<InventoryFilter, string> = {
  all: '全部',
  equipment: '装备',
  consumable: '丹食',
  material: '材料'
}

const SKILL_BRANCH_LABELS: Record<SkillBranch, string> = {
  attack: '剑诀',
  defense: '护身',
  cultivation: '修炼',
  special: '秘术'
}

const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: '武器',
  armor: '防具',
  accessory1: '饰品一',
  accessory2: '饰品二'
}

export function useCharacterLoadout(initialTab: CharacterPanelTab = 'overview') {
  const playerStore = usePlayerStore()
  const { success, warning, info } = useToast()

  const activeTab = ref<CharacterPanelTab>(initialTab)
  const inventoryFilter = ref<InventoryFilter>('all')
  const selectedInventoryItem = ref<InventoryItem | null>(null)
  const selectedSlot = ref<EquipmentSlot | null>(null)
  const activeSkillBranch = ref<SkillBranch>('attack')

  const inventoryFilterOptions = computed(() => {
    return (Object.keys(INVENTORY_FILTER_LABELS) as InventoryFilter[]).map(id => ({
      id,
      label: INVENTORY_FILTER_LABELS[id],
      count: id === 'all'
        ? playerStore.inventory.length
        : playerStore.inventory.filter(item => item.type === id).length
    }))
  })

  const skillBranchOptions = computed(() => {
    return (Object.keys(SKILL_BRANCH_LABELS) as SkillBranch[]).map(id => ({
      id,
      label: SKILL_BRANCH_LABELS[id],
      learnedCount: SKILL_TREE[id].filter(node => playerStore.hasLearnedSkill(node.skillId)).length,
      totalCount: SKILL_TREE[id].length
    }))
  })

  const statList = computed<CharacterStatItem[]>(() => {
    const base = playerStore.baseStats

    return [
      makeStat('maxHp', '气血', base.maxHp, getTotalStatBonus('maxHp')),
      makeStat('maxMp', '灵力', base.maxMp, getTotalStatBonus('maxMp')),
      makeStat('attack', '攻击', base.attack, getTotalStatBonus('attack')),
      makeStat('defense', '防御', base.defense, getTotalStatBonus('defense')),
      makeStat('speed', '身法', base.speed, getTotalStatBonus('speed')),
      makeStat('critRate', '会心', base.critRate, getTotalStatBonus('critRate')),
      makeStat('critDamage', '会伤', base.critDamage, getTotalStatBonus('critDamage'))
    ]
  })

  const equipmentSlots = computed<EquipmentSlotState[]>(() => {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory1', 'accessory2']
    return slots.map(slot => ({
      slot,
      label: EQUIPMENT_SLOT_LABELS[slot],
      equipment: getEquippedBySlot(slot),
      candidates: getCandidateItems(slot)
    }))
  })

  const loadoutProgressSummary = computed<LoadoutProgressSummary>(() => {
    const slots = equipmentSlots.value
    const equippedCount = slots.filter(slot => Boolean(slot.equipment)).length
    const candidateCount = slots.reduce((sum, slot) => sum + slot.candidates.length, 0)
    return {
      equippedCount,
      totalSlots: slots.length,
      candidateCount,
      completionPercent: slots.length ? Math.round((equippedCount / slots.length) * 100) : 0
    }
  })

  const selectedEquipmentSlot = computed(() => {
    if (!selectedSlot.value) return null
    return equipmentSlots.value.find(slot => slot.slot === selectedSlot.value) ?? null
  })

  const filteredInventory = computed(() => {
    if (inventoryFilter.value === 'all') return playerStore.inventory
    return playerStore.inventory.filter(item => item.type === inventoryFilter.value)
  })

  const emptyInventorySlots = computed(() => {
    return Math.max(0, playerStore.maxInventorySlots - playerStore.inventory.length)
  })

  const selectedEquipment = computed(() => {
    if (!selectedInventoryItem.value) return undefined
    return getEquipmentFromItem(selectedInventoryItem.value)
  })

  const currentSkillNodes = computed<SkillTreeNode[]>(() => {
    return SKILL_TREE[activeSkillBranch.value] ?? []
  })

  const learnedSkillCards = computed(() => {
    return playerStore.learnedSkills.map(learned => {
      const definition = getSkillDefinition(learned.id)
      return {
        learned,
        definition,
        name: definition?.name ?? learned.id,
        icon: definition?.icon ?? '?',
        cost: definition ? calculateSkillMpCost(definition, learned.level) : 0,
        expPercent: learned.maxExp > 0 ? Math.min(100, (learned.exp / learned.maxExp) * 100) : 0
      }
    })
  })

  const skillProgressSummary = computed<SkillProgressSummary>(() => {
    const skillIds = Object.values(SKILL_TREE).flat().map(node => node.skillId)
    const learnedCount = skillIds.filter(skillId => playerStore.hasLearnedSkill(skillId)).length
    const enabledCount = playerStore.learnedSkills.filter(skill => skill.enabled).length
    const availableCount = skillIds.filter(skillId => {
      const learned = playerStore.hasLearnedSkill(skillId)
      return !learned && playerStore.canLearnSkill(skillId)
    }).length
    return {
      learnedCount,
      totalCount: skillIds.length,
      enabledCount,
      availableCount,
      lockedCount: Math.max(0, skillIds.length - learnedCount - availableCount)
    }
  })

  const passiveBonusRows = computed(() => {
    return Object.entries(playerStore.skillBonuses)
      .filter(([, value]) => Boolean(value))
      .map(([stat, value]) => ({
        stat: stat as keyof UnitStats,
        label: getStatLabel(stat as keyof UnitStats),
        value: formatStatValue(stat, value ?? 0, true)
      }))
  })

  const cultivationSourceRows = computed<CharacterProgressionSource[]>(() => {
    return playerStore.characterProgression.sources
      .filter(source => source.target === 'cultivation')
      .slice(0, 6)
  })

  const inventorySchemaSummary = computed(() => {
    return resolveInventorySchemaSummary(playerStore.inventory)
  })

  const characterSummary = computed(() => ({
    name: playerStore.name,
    icon: playerStore.icon,
    realm: playerStore.realmInfo.fullName,
    quality: playerStore.quality,
    element: playerStore.element,
    cultivation: playerStore.cultivation,
    maxCultivation: playerStore.maxCultivation,
    cultivationPercent: playerStore.cultivationProgress,
    skillPoints: playerStore.skillPoints,
    inventoryCount: playerStore.inventory.length,
    maxInventorySlots: playerStore.maxInventorySlots,
    cultivationPerSecond: playerStore.cultivationPerSecond,
    cultivationMultiplier: playerStore.characterProgression.cultivationMultiplier,
    cultivationFlatBonus: playerStore.characterProgression.cultivationFlatBonus
  }))

  function getTotalStatBonus(stat: keyof UnitStats) {
    return (playerStore.equipmentBonuses[stat] ?? 0) + (playerStore.skillBonuses[stat] ?? 0)
  }

  function makeStat(key: keyof UnitStats, label: string, base: number, bonus: number): CharacterStatItem {
    const total = base + bonus
    return {
      key,
      label,
      base,
      bonus,
      total,
      display: formatStatValue(key, total, key === 'critRate' || key === 'critDamage')
    }
  }

  function getEquippedBySlot(slot: EquipmentSlot) {
    switch (slot) {
      case 'weapon':
        return playerStore.equippedWeapon
      case 'armor':
        return playerStore.equippedArmor
      case 'accessory1':
        return playerStore.equippedAccessory1
      case 'accessory2':
        return playerStore.equippedAccessory2
    }
  }

  function getRequiredEquipmentType(slot: EquipmentSlot) {
    if (slot === 'weapon') return 'weapon'
    if (slot === 'armor') return 'armor'
    return 'accessory'
  }

  function getCandidateItems(slot: EquipmentSlot) {
    const requiredType = getRequiredEquipmentType(slot)
    return playerStore.inventory.filter(item => {
      if (item.type !== 'equipment') return false
      return getEquipmentFromItem(item)?.type === requiredType
    })
  }

  function getEquipmentFromItem(item: InventoryItem): Equipment | undefined {
    if (item.equipmentData) return item.equipmentData
    if (item.equipmentId) return getEquipmentById(item.equipmentId)
    return undefined
  }

  function selectInventoryItem(item: InventoryItem | null) {
    if (item) sfxItem()
    selectedInventoryItem.value = item
  }

  function selectEquipmentSlot(slot: EquipmentSlot | null) {
    selectedSlot.value = slot
  }

  function equipItem(item: InventoryItem) {
    const equipment = getEquipmentFromItem(item)
    if (!equipment) return false

    const equipped = playerStore.equip(equipment, item.id)
    if (equipped) {
      success(`装备了 ${equipment.name}`)
      selectedInventoryItem.value = null
      selectedSlot.value = null
    }
    return equipped
  }

  function equipItemToSelectedSlot(item: InventoryItem) {
    const equipment = getEquipmentFromItem(item)
    if (!equipment || !selectedSlot.value) return false
    if (equipment.type !== getRequiredEquipmentType(selectedSlot.value)) return false
    return equipItem(item)
  }

  function unequipSlot(slot: EquipmentSlot) {
    const equipment = getEquippedBySlot(slot)
    if (!equipment) return false

    const unequipped = playerStore.unequip(slot)
    if (unequipped) {
      success(`卸下了 ${equipment.name}`)
      selectedSlot.value = null
    }
    return unequipped
  }

  function useSelectedConsumable() {
    if (!selectedInventoryItem.value) return
    const result = playerStore.useConsumable(selectedInventoryItem.value.id)
    if (result.success) {
      success(result.message ?? `使用了 ${selectedInventoryItem.value.name}`)
      selectedInventoryItem.value = null
    } else {
      info(result.message ?? '无法使用')
    }
  }

  function learnSkill(skillId: string) {
    if (playerStore.learnSkill(skillId)) {
      const skill = getSkillDefinition(skillId)
      success(`学会了 ${skill?.name ?? skillId}`)
      sfxSkillUp()
    } else {
      warning('无法学习该功法')
    }
  }

  function upgradeSkill(skillId: string) {
    if (playerStore.upgradeSkill(skillId)) {
      const skill = getSkillDefinition(skillId)
      const learned = playerStore.getLearnedSkill(skillId)
      success(`${skill?.name ?? skillId} 升至 Lv.${learned?.level ?? 1}`)
      sfxSkillUp()
    } else {
      warning('无法升级该功法')
    }
  }

  function toggleSkill(skillId: string) {
    if (!playerStore.toggleSkillEnabled(skillId)) return
    const skill = getSkillDefinition(skillId)
    const enabled = playerStore.getLearnedSkill(skillId)?.enabled ?? false
    info(`${skill?.name ?? skillId}${enabled ? '已启用' : '已禁用'}`)
  }

  function getSkillNodeState(skillId: string) {
    const learned = playerStore.getLearnedSkill(skillId)
    const definition = getSkillDefinition(skillId)
    const mpCost = definition ? calculateSkillMpCost(definition, learned?.level ?? 1) : 0
    const effects = getSkillEffectLabels(skillId)
    return {
      definition,
      learned,
      learnedLevel: learned?.level ?? 0,
      isLearned: Boolean(learned),
      canLearn: playerStore.canLearnSkill(skillId),
      canUpgrade: Boolean(
        learned
        && definition
        && learned.level < definition.maxLevel
        && playerStore.skillPoints > 0
      ),
      enabled: learned?.enabled ?? false,
      expPercent: learned && learned.maxExp > 0 ? Math.min(100, (learned.exp / learned.maxExp) * 100) : 0,
      lockReason: getSkillLockReason(skillId),
      mpCost,
      effects
    }
  }

  function getSkillLockReason(skillId: string): string {
    const definition = getSkillDefinition(skillId)
    if (!definition) return '未知功法'

    if (definition.prerequisites) {
      const missing = definition.prerequisites.find(prereq => !playerStore.hasLearnedSkill(prereq))
      if (missing) return `需先学 ${getSkillDefinition(missing)?.name ?? missing}`
    }

    if (definition.unlockRealm) {
      const currentRealmIndex = REALM_ORDER.indexOf(playerStore.realm)
      const requiredRealmIndex = REALM_ORDER.indexOf(definition.unlockRealm as Realm)
      if (currentRealmIndex < requiredRealmIndex) return `需达 ${definition.unlockRealm}`
    }

    if (playerStore.skillPoints < 1) return '技能点不足'
    return '条件未满足'
  }

  function getSkillEffectLabels(skillId: string): string[] {
    const definition = getSkillDefinition(skillId)
    if (!definition) return []
    const labels: string[] = []

    if (definition.mpCost > 0) labels.push(`灵力 ${calculateSkillMpCost(definition, playerStore.getLearnedSkill(skillId)?.level ?? 1)}`)
    if (definition.cooldown > 0) labels.push(`冷却 ${definition.cooldown}手`)
    if (definition.passiveBonus) labels.push(`${getStatLabel(definition.passiveBonus.stat)}被动`)
    if (definition.progressionBonus) labels.push('修炼加速')

    for (const effect of definition.effects) {
      if (effect.type === 'damage') labels.push('伤害')
      if (effect.type === 'heal') labels.push('治疗')
      if (effect.type === 'buff') labels.push('增益')
      if (effect.type === 'debuff') labels.push('减益')
      if (effect.type === 'summon') labels.push('召唤')
    }

    return [...new Set(labels)]
  }

  function getTypeLabel(type: InventoryItem['type']) {
    const labels: Record<InventoryItem['type'], string> = {
      equipment: '装备',
      consumable: '丹药',
      material: '材料'
    }
    return labels[type]
  }

  function getEffectLabel(effect: { type: string; value: number; duration?: number }) {
    const labels: Record<string, string> = {
      cultivation: '修为',
      hp: '气血',
      mp: '灵力',
      buff_atk: '攻击增益',
      buff_def: '防御增益',
      buff_spd: '身法增益',
      food_cultivation: '挂机修炼',
      stamina: '体力',
      breakthrough_success: '破境成功率'
    }
    const value = effect.type.startsWith('buff_') || effect.type === 'breakthrough_success' || effect.type === 'food_cultivation'
      ? `+${(effect.value * 100).toFixed(0)}%`
      : `+${effect.value}`
    const durationUnit = effect.type === 'food_cultivation' ? '次结算' : '手'
    return `${labels[effect.type] ?? effect.type} ${value}${effect.duration ? ` / ${effect.duration}${durationUnit}` : ''}`
  }

  function getStatLabel(stat: keyof UnitStats) {
    const labels: Record<keyof UnitStats, string> = {
      maxHp: '气血',
      currentHp: '当前气血',
      maxMp: '灵力',
      currentMp: '当前灵力',
      attack: '攻击',
      defense: '防御',
      speed: '身法',
      critRate: '会心',
      critDamage: '会伤'
    }
    return labels[stat]
  }

  function formatStatValue(stat: string, value: number, compact = false) {
    if (stat === 'critRate') return `${(value * 100).toFixed(0)}%`
    if (stat === 'critDamage') return compact ? `${value.toFixed(1)}x` : `${value.toFixed(2)}x`
    return Math.round(value).toString()
  }

  function getElementColor(element: string) {
    return ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] ?? '#7a8f89'
  }

  function getQualityColor(quality: string) {
    return QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS] ?? '#7a8f89'
  }

  return {
    playerStore,
    activeTab,
    inventoryFilter,
    selectedInventoryItem,
    selectedEquipment,
    selectedSlot,
    selectedEquipmentSlot,
    activeSkillBranch,
    inventoryFilterOptions,
    skillBranchOptions,
    statList,
    equipmentSlots,
    loadoutProgressSummary,
    filteredInventory,
    emptyInventorySlots,
    currentSkillNodes,
    learnedSkillCards,
    skillProgressSummary,
    passiveBonusRows,
    cultivationSourceRows,
    inventorySchemaSummary,
    characterSummary,
    getEquipmentFromItem,
    selectInventoryItem,
    selectEquipmentSlot,
    equipItem,
    equipItemToSelectedSlot,
    unequipSlot,
    useSelectedConsumable,
    learnSkill,
    upgradeSkill,
    toggleSkill,
    getSkillNodeState,
    getTypeLabel,
    getEffectLabel,
    getStatLabel,
    formatStatValue,
    getElementColor,
    getQualityColor
  }
}
