import type { Equipment } from '@/types/equipment'
import type { StatusEffect, UnitStats } from '@/types/unit'

export interface EquipmentEffectResolution {
  statBonuses: Partial<UnitStats>
  battleStatusEffects: StatusEffect[]
  ignoredEffects: Array<{
    equipmentId: string
    effectType: string
  }>
}

const LONG_EQUIPMENT_STATUS_DURATION = 9999

export function resolveEquipmentEffects(equipment: Equipment[]): EquipmentEffectResolution {
  const statBonuses: Partial<UnitStats> = {}
  const battleStatusEffects: StatusEffect[] = []
  const ignoredEffects: EquipmentEffectResolution['ignoredEffects'] = []

  for (const item of equipment) {
    for (const effect of item.effects ?? []) {
      if (effect.type === 'lifesteal') {
        battleStatusEffects.push({
          type: 'lifesteal',
          value: effect.value,
          duration: LONG_EQUIPMENT_STATUS_DURATION,
          sourceId: item.name,
          icon: '吸'
        })
        continue
      }

      if (effect.type === 'dodge') {
        battleStatusEffects.push({
          type: 'dodge',
          value: effect.value,
          duration: LONG_EQUIPMENT_STATUS_DURATION,
          sourceId: item.name,
          icon: '闪'
        })
        continue
      }

      if (effect.type === 'crit_bonus') {
        statBonuses.critRate = (statBonuses.critRate ?? 0) + effect.value
        continue
      }

      if (effect.type === 'counter') {
        battleStatusEffects.push({
          type: 'counter',
          value: effect.value,
          duration: LONG_EQUIPMENT_STATUS_DURATION,
          sourceId: item.name,
          icon: '反'
        })
        continue
      }

      if (effect.type === 'element_damage') {
        battleStatusEffects.push({
          type: 'element_damage',
          value: effect.value,
          duration: LONG_EQUIPMENT_STATUS_DURATION,
          sourceId: item.name,
          icon: '行'
        })
        continue
      }

      ignoredEffects.push({
        equipmentId: item.id,
        effectType: effect.type
      })
    }
  }

  return {
    statBonuses,
    battleStatusEffects,
    ignoredEffects
  }
}
