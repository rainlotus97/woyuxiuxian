import type { OwnedPet, PetDefinition, PetTrait } from '@/types/pet'
import type { StatusEffect, UnitStats } from '@/types/unit'

export interface PetBondJourneyEffects {
  petExpMultiplier: number
  petIntimacyBonus: number
}

export interface PetBondEffectResolution {
  intimacyRatio: number
  tier: number
  statBonuses: Partial<UnitStats>
  battleStatusEffects: StatusEffect[]
  journeyEffects: PetBondJourneyEffects
  labels: string[]
}

const LONG_PET_STATUS_DURATION = 9999

export function resolvePetBondEffects(definition: PetDefinition, owned: OwnedPet): PetBondEffectResolution {
  const intimacyRatio = clamp(owned.intimacy, 0, 100) / 100
  const tier = Math.floor(clamp(owned.intimacy, 0, 100) / 20)
  const traitBonuses = resolveTraitStatBonuses(definition.trait, intimacyRatio, tier)
  const battleStatusEffects = resolveTraitBattleStatuses(definition, owned, intimacyRatio)

  return {
    intimacyRatio,
    tier,
    statBonuses: traitBonuses,
    battleStatusEffects,
    journeyEffects: {
      petExpMultiplier: 1 + intimacyRatio * 0.18,
      petIntimacyBonus: owned.intimacy >= 60 ? 1 : 0
    },
    labels: resolveBondLabels(definition.trait, tier)
  }
}

export function applyPetBondStatBonuses(stats: UnitStats, bonuses: Partial<UnitStats>): UnitStats {
  const maxHp = Math.max(1, Math.floor(stats.maxHp + (bonuses.maxHp ?? 0)))
  const maxMp = Math.max(0, Math.floor(stats.maxMp + (bonuses.maxMp ?? 0)))

  return {
    maxHp,
    currentHp: Math.min(maxHp, Math.floor(stats.currentHp + (bonuses.currentHp ?? bonuses.maxHp ?? 0))),
    maxMp,
    currentMp: Math.min(maxMp, Math.floor(stats.currentMp + (bonuses.currentMp ?? bonuses.maxMp ?? 0))),
    attack: Math.max(1, Math.floor(stats.attack + (bonuses.attack ?? 0))),
    defense: Math.max(0, Math.floor(stats.defense + (bonuses.defense ?? 0))),
    speed: Math.max(1, Math.floor(stats.speed + (bonuses.speed ?? 0))),
    critRate: clamp(stats.critRate + (bonuses.critRate ?? 0), 0, 0.85),
    critDamage: Math.max(1, stats.critDamage + (bonuses.critDamage ?? 0))
  }
}

export function resolvePetJourneyRewards(input: {
  basePetExp: number
  basePetIntimacy: number
  bondEffects: PetBondJourneyEffects | null
}) {
  if (!input.bondEffects) {
    return {
      petExp: input.basePetExp,
      petIntimacy: input.basePetIntimacy
    }
  }

  return {
    petExp: Math.max(0, Math.floor(input.basePetExp * input.bondEffects.petExpMultiplier)),
    petIntimacy: Math.max(0, input.basePetIntimacy + input.bondEffects.petIntimacyBonus)
  }
}

function resolveTraitStatBonuses(trait: PetTrait, intimacyRatio: number, tier: number): Partial<UnitStats> {
  const tierBonus = Math.max(0, tier)
  if (trait === 'fighter') {
    return {
      attack: 4 + tierBonus * 3,
      critRate: 0.015 + intimacyRatio * 0.045
    }
  }
  if (trait === 'guardian') {
    return {
      maxHp: 18 + tierBonus * 18,
      defense: 3 + tierBonus * 3
    }
  }
  if (trait === 'swift') {
    return {
      speed: 3 + tierBonus * 2,
      critRate: 0.01 + intimacyRatio * 0.025
    }
  }
  if (trait === 'support') {
    return {
      maxMp: 10 + tierBonus * 10,
      defense: 2 + tierBonus * 2
    }
  }
  return {
    critRate: 0.01 + intimacyRatio * 0.035,
    speed: 1 + tierBonus
  }
}

function resolveTraitBattleStatuses(
  definition: PetDefinition,
  owned: OwnedPet,
  intimacyRatio: number
): StatusEffect[] {
  const sourceId = `${definition.name}羁绊`
  const common = {
    duration: LONG_PET_STATUS_DURATION,
    sourceId
  }

  if (definition.trait === 'fighter') {
    return [{
      ...common,
      type: 'lifesteal',
      value: 0.02 + intimacyRatio * 0.05,
      icon: '狩'
    }]
  }
  if (definition.trait === 'guardian') {
    return [{
      ...common,
      type: 'buff_def',
      value: 0.04 + intimacyRatio * 0.08,
      icon: '护'
    }]
  }
  if (definition.trait === 'swift') {
    return [{
      ...common,
      type: 'dodge',
      value: 0.02 + intimacyRatio * 0.06,
      icon: '迅'
    }]
  }
  if (definition.trait === 'support' && owned.intimacy >= 40) {
    return [{
      ...common,
      type: 'buff_spd',
      value: 0.03 + intimacyRatio * 0.05,
      icon: '援'
    }]
  }
  if (definition.trait === 'lucky') {
    return [{
      ...common,
      type: 'dodge',
      value: 0.015 + intimacyRatio * 0.045,
      icon: '缘'
    }]
  }
  return []
}

function resolveBondLabels(trait: PetTrait, tier: number) {
  const labels: Record<PetTrait, string> = {
    fighter: '凶性共鸣',
    guardian: '护主本能',
    swift: '踏风同游',
    support: '灵息相扶',
    lucky: '福缘牵引'
  }
  return tier > 0 ? [labels[trait], `羁绊 ${tier}阶`] : [labels[trait]]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
