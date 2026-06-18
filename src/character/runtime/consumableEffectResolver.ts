import type { InventoryItem } from '@/stores/playerStore'
import type { StatusEffect, StatusEffectType, UnitStats } from '@/types/unit'

export interface ConsumableEffectDelta {
  cultivation: number
  hp: number
  mp: number
  buffs: StatusEffect[]
  ignoredEffects: string[]
}

export interface ConsumableUseResolution {
  success: boolean
  reason: 'ready' | 'missing_item' | 'not_consumable' | 'no_effect'
  message: string
  item?: InventoryItem
  delta: ConsumableEffectDelta
}

const EMPTY_DELTA: ConsumableEffectDelta = {
  cultivation: 0,
  hp: 0,
  mp: 0,
  buffs: [],
  ignoredEffects: []
}

const BUFF_ICONS: Record<string, string> = {
  buff_atk: '攻',
  buff_def: '防',
  buff_spd: '速'
}

const NORMALIZED_EFFECT_TYPES: Record<string, string> = {
  add_cultivation: 'cultivation',
  restore_hp: 'hp',
  restore_mp: 'mp',
  buff_attack: 'buff_atk',
  buff_defense: 'buff_def',
  buff_speed: 'buff_spd'
}

const CONSUMABLE_BUFF_TYPES = new Set<StatusEffectType>(['buff_atk', 'buff_def', 'buff_spd'])

export function resolveConsumableUse(input: {
  itemId: string
  inventory: InventoryItem[]
  baseStats: Pick<UnitStats, 'currentHp' | 'currentMp'>
  totalStats: Pick<UnitStats, 'maxHp' | 'maxMp'>
}): ConsumableUseResolution {
  const item = input.inventory.find(entry => entry.id === input.itemId)
  if (!item) return createConsumableFailure('missing_item', '物品不存在')
  if (item.type !== 'consumable') return createConsumableFailure('not_consumable', '物品不是消耗品', item)

  const delta = resolveConsumableEffectDelta({
    item,
    baseStats: input.baseStats,
    totalStats: input.totalStats
  })

  if (!hasConsumableDelta(delta)) {
    return {
      success: false,
      reason: 'no_effect',
      message: '此物暂未接入可用效果',
      item,
      delta
    }
  }

  return {
    success: true,
    reason: 'ready',
    message: `使用了 ${item.name}`,
    item,
    delta
  }
}

export function resolveConsumableEffectDelta(input: {
  item: InventoryItem
  baseStats: Pick<UnitStats, 'currentHp' | 'currentMp'>
  totalStats: Pick<UnitStats, 'maxHp' | 'maxMp'>
}): ConsumableEffectDelta {
  const delta: ConsumableEffectDelta = {
    cultivation: 0,
    hp: 0,
    mp: 0,
    buffs: [],
    ignoredEffects: []
  }

  for (const effect of input.item.effects ?? []) {
    const type = NORMALIZED_EFFECT_TYPES[effect.type] ?? effect.type
    if (type === 'cultivation') {
      delta.cultivation += Math.max(0, effect.value)
      continue
    }
    if (type === 'hp') {
      const missingHp = Math.max(0, input.totalStats.maxHp - input.baseStats.currentHp)
      delta.hp += Math.min(missingHp, Math.max(0, effect.value))
      continue
    }
    if (type === 'mp') {
      const missingMp = Math.max(0, input.totalStats.maxMp - input.baseStats.currentMp)
      delta.mp += Math.min(missingMp, Math.max(0, effect.value))
      continue
    }
    if (isConsumableBuffType(type)) {
      delta.buffs.push({
        type,
        value: effect.value,
        duration: effect.duration ?? 3,
        icon: BUFF_ICONS[type] ?? '益'
      })
      continue
    }
    delta.ignoredEffects.push(effect.type)
  }

  return delta
}

export function hasConsumableDelta(delta: ConsumableEffectDelta) {
  return delta.cultivation > 0 || delta.hp > 0 || delta.mp > 0 || delta.buffs.length > 0
}

function isConsumableBuffType(type: string): type is StatusEffectType {
  return CONSUMABLE_BUFF_TYPES.has(type as StatusEffectType)
}

function createConsumableFailure(
  reason: Exclude<ConsumableUseResolution['reason'], 'ready'>,
  message: string,
  item?: InventoryItem
): ConsumableUseResolution {
  return {
    success: false,
    reason,
    message,
    item,
    delta: {
      ...EMPTY_DELTA,
      buffs: [],
      ignoredEffects: []
    }
  }
}
