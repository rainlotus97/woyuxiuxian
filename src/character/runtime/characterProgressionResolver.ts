import type { Equipment } from '@/types/equipment'
import type { LearnedSkill } from '@/types/skill'
import { getSkillDefinition } from '@/types/skill'
import type { UnitStats } from '@/types/unit'

export type CharacterProgressionSourceKind = 'equipment' | 'skill'
export type CharacterProgressionTarget = 'stat' | 'cultivation'

export interface CharacterProgressionSource {
  id: string
  kind: CharacterProgressionSourceKind
  target: CharacterProgressionTarget
  label: string
  valueLabel: string
  description: string
}

export interface CharacterProgressionResult {
  equipmentStatBonuses: Partial<UnitStats>
  skillStatBonuses: Partial<UnitStats>
  statBonuses: Partial<UnitStats>
  cultivationMultiplierBonus: number
  cultivationMultiplier: number
  cultivationFlatBonus: number
  sources: CharacterProgressionSource[]
}

const STAT_KEYS: Array<keyof UnitStats> = [
  'maxHp',
  'currentHp',
  'maxMp',
  'currentMp',
  'attack',
  'defense',
  'speed',
  'critRate',
  'critDamage'
]

export function resolveCharacterProgression(
  equipment: Equipment[],
  learnedSkills: LearnedSkill[]
): CharacterProgressionResult {
  const equipmentStatBonuses: Partial<UnitStats> = {}
  const skillStatBonuses: Partial<UnitStats> = {}
  const sources: CharacterProgressionSource[] = []
  let cultivationMultiplierBonus = 0
  let cultivationFlatBonus = 0

  for (const item of equipment) {
    addStatBonuses(equipmentStatBonuses, item.bonuses)
    const equipmentCultivationBonus = resolveEquipmentCultivationBonus(item)
    if (equipmentCultivationBonus > 0) {
      cultivationMultiplierBonus += equipmentCultivationBonus
      sources.push({
        id: `equipment:${item.id}`,
        kind: 'equipment',
        target: 'cultivation',
        label: item.name,
        valueLabel: `+${formatPercent(equipmentCultivationBonus)}`,
        description: '灵力与身法转化为吐纳效率'
      })
    }
  }

  for (const learned of learnedSkills) {
    if (!learned.enabled) continue
    const definition = getSkillDefinition(learned.id)
    if (!definition) continue

    if (definition.passiveBonus) {
      const bonusValue = definition.passiveBonus.valuePerLevel * learned.level
      const stat = definition.passiveBonus.stat
      skillStatBonuses[stat] = (skillStatBonuses[stat] || 0) + bonusValue
      sources.push({
        id: `skill-stat:${learned.id}`,
        kind: 'skill',
        target: 'stat',
        label: definition.name,
        valueLabel: `+${formatStatValue(stat, bonusValue)}`,
        description: '功法被动属性'
      })
    }

    if (definition.progressionBonus?.cultivationMultiplierPerLevel) {
      const bonus = definition.progressionBonus.cultivationMultiplierPerLevel * learned.level
      cultivationMultiplierBonus += bonus
      sources.push({
        id: `skill-cultivation-mult:${learned.id}`,
        kind: 'skill',
        target: 'cultivation',
        label: definition.name,
        valueLabel: `+${formatPercent(bonus)}`,
        description: '功法提升周天运转效率'
      })
    }

    if (definition.progressionBonus?.cultivationFlatPerLevel) {
      const bonus = definition.progressionBonus.cultivationFlatPerLevel * learned.level
      cultivationFlatBonus += bonus
      sources.push({
        id: `skill-cultivation-flat:${learned.id}`,
        kind: 'skill',
        target: 'cultivation',
        label: definition.name,
        valueLabel: `+${formatNumber(bonus)}/秒`,
        description: '功法提供稳定修为收益'
      })
    }
  }

  return {
    equipmentStatBonuses,
    skillStatBonuses,
    statBonuses: mergeStatBonuses(equipmentStatBonuses, skillStatBonuses),
    cultivationMultiplierBonus,
    cultivationMultiplier: 1 + cultivationMultiplierBonus,
    cultivationFlatBonus,
    sources
  }
}

function addStatBonuses(target: Partial<UnitStats>, bonuses: Partial<UnitStats>) {
  for (const key of STAT_KEYS) {
    const value = bonuses[key]
    if (typeof value !== 'number' || value === 0) continue
    target[key] = (target[key] || 0) + value
  }
}

function mergeStatBonuses(...sources: Array<Partial<UnitStats>>) {
  const result: Partial<UnitStats> = {}
  for (const source of sources) {
    addStatBonuses(result, source)
  }
  return result
}

function resolveEquipmentCultivationBonus(equipment: Equipment) {
  const maxMpBonus = equipment.bonuses.maxMp ?? 0
  const speedBonus = equipment.bonuses.speed ?? 0
  const rawBonus = maxMpBonus * 0.0008 + speedBonus * 0.0015
  return Math.min(0.08, Math.max(0, rawBonus))
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) return String(value)
  if (Math.abs(value) < 1) return value.toFixed(2)
  return value.toFixed(1)
}

function formatStatValue(stat: keyof UnitStats, value: number) {
  if (stat === 'critRate') return formatPercent(value)
  if (stat === 'critDamage') return `${value.toFixed(1)}x`
  return formatNumber(value)
}
