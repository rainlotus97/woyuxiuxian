import type { AreaDefinition, DropItem, FullEnemyDefinition } from '@/types/adventure'
import { ENEMIES } from '@/game/battle/config'
import type { Quality } from '@/types/unit'
import type { MapAreaEncounterContext } from './mapAreaEncounterResolver'

type EncounterSlotType = 'normal' | 'elite' | 'boss'

interface EncounterDropQualityBias {
  common: number
  fine: number
  rare: number
  epic: number
  legendary: number
}

interface EncounterRiskCompositionConfig {
  eliteChance: number
  bossChance: number
  rewardDropMultiplier: number
  qualityBias: EncounterDropQualityBias
}

interface EncounterEnemyCandidate {
  id: string
  definition: FullEnemyDefinition
}

export interface EncounterEnemySelection {
  enemyId: string
  definition: FullEnemyDefinition
  slotType: EncounterSlotType
  namePrefix: string
  quality: Quality
  statMultiplier: number
  critRateBonus: number
  critDamageBonus: number
}

const ENCOUNTER_RISK_COMPOSITION: Record<NonNullable<MapAreaEncounterContext['riskLevel']>, EncounterRiskCompositionConfig> = {
  safe: {
    eliteChance: 0.05,
    bossChance: 0,
    rewardDropMultiplier: 0.94,
    qualityBias: { common: 1.08, fine: 0.95, rare: 0.88, epic: 0.8, legendary: 0.7 }
  },
  watch: {
    eliteChance: 0.18,
    bossChance: 0.02,
    rewardDropMultiplier: 1,
    qualityBias: { common: 1, fine: 1, rare: 1, epic: 1, legendary: 1 }
  },
  danger: {
    eliteChance: 0.4,
    bossChance: 0.08,
    rewardDropMultiplier: 1.12,
    qualityBias: { common: 0.92, fine: 1.02, rare: 1.14, epic: 1.22, legendary: 1.3 }
  },
  chaos: {
    eliteChance: 0.58,
    bossChance: 0.18,
    rewardDropMultiplier: 1.24,
    qualityBias: { common: 0.85, fine: 1.02, rare: 1.24, epic: 1.42, legendary: 1.55 }
  }
}

const QUALITY_ORDER: DropItem['quality'][] = ['common', 'fine', 'rare', 'epic', 'legendary']

function resolveEncounterCompositionConfig(encounter: MapAreaEncounterContext | null) {
  const base = !encounter
    ? ENCOUNTER_RISK_COMPOSITION.watch
    : ENCOUNTER_RISK_COMPOSITION[encounter.riskLevel]

  if (!encounter?.anomaly) return base

  const eliteBonus = encounter.anomaly.type === 'ruins' || encounter.anomaly.type === 'spiritual_vein' ? 0.08 : 0.04
  const bossBonus = encounter.anomaly.type === 'ruins' ? 0.06 : encounter.anomaly.type === 'beast_tide' ? 0.04 : 0.02
  const rewardDropMultiplier = encounter.anomaly.type === 'spiritual_vein' ? 1.16 : encounter.anomaly.type === 'bandit' ? 1.08 : 1.12

  return {
    ...base,
    eliteChance: Math.min(0.82, base.eliteChance + eliteBonus),
    bossChance: Math.min(0.32, base.bossChance + bossBonus),
    rewardDropMultiplier: Number((base.rewardDropMultiplier * rewardDropMultiplier).toFixed(3))
  }
}

function getEnemyCandidates(enemyIds: string[]) {
  return enemyIds
    .map(id => ({ id, definition: ENEMIES[id] }))
    .filter((candidate): candidate is EncounterEnemyCandidate => Boolean(candidate.definition))
}

function compareEnemyCandidates(a: EncounterEnemyCandidate, b: EncounterEnemyCandidate) {
  if (a.definition.realmLevel !== b.definition.realmLevel) {
    return a.definition.realmLevel - b.definition.realmLevel
  }
  return a.id.localeCompare(b.id)
}

function clampProbability(value: number) {
  return Math.max(0, Math.min(1, value))
}

function shouldPromoteSlot(slotIndex: number, chance: number) {
  const slotBias = slotIndex === 0 ? 0 : slotIndex === 1 ? 0.08 : 0.14
  return Math.random() < clampProbability(chance + slotBias)
}

export function resolveEncounterEnemySelections(
  area: AreaDefinition | null,
  count: number,
  encounter: MapAreaEncounterContext | null
): EncounterEnemySelection[] {
  const enemyIds = area?.enemies?.length ? area.enemies : ['wild_wolf', 'forest_spider']
  const candidates = getEnemyCandidates(enemyIds).sort(compareEnemyCandidates)
  const composition = resolveEncounterCompositionConfig(encounter)
  const defaultEnemy = ENEMIES.wild_wolf ?? ENEMIES.forest_spider

  if (!defaultEnemy) {
    throw new Error('Battle enemy registry is missing fallback encounter units.')
  }

  if (candidates.length === 0) {
    return Array.from({ length: count }, (_, index): EncounterEnemySelection => ({
      enemyId: defaultEnemy.id,
      definition: defaultEnemy,
      slotType: index === 1 ? 'elite' : 'normal',
      namePrefix: index === 1 ? '[精英]' : '',
      quality: index === 1 ? '玄品' : '凡品',
      statMultiplier: index === 1 ? 1.35 : 1,
      critRateBonus: index === 1 ? 0.05 : 0,
      critDamageBonus: index === 1 ? 0.18 : 0
    }))
  }

  const strongest = candidates[candidates.length - 1]!
  const mid = candidates[Math.min(candidates.length - 1, Math.max(0, candidates.length - 2))]!

  return Array.from({ length: count }, (_, index): EncounterEnemySelection => {
    const fallbackCandidate = candidates[index % candidates.length]!
    if (shouldPromoteSlot(index, composition.bossChance)) {
      return {
        enemyId: strongest.id,
        definition: strongest.definition,
        slotType: 'boss',
        namePrefix: '[BOSS]',
        quality: '仙品',
        statMultiplier: 2.15,
        critRateBonus: 0.12,
        critDamageBonus: 0.4
      }
    }

    if (shouldPromoteSlot(index, composition.eliteChance)) {
      return {
        enemyId: mid.id,
        definition: mid.definition,
        slotType: 'elite',
        namePrefix: '[精英]',
        quality: '玄品',
        statMultiplier: 1.38,
        critRateBonus: 0.06,
        critDamageBonus: 0.2
      }
    }

    return {
      enemyId: fallbackCandidate.id,
      definition: fallbackCandidate.definition,
      slotType: 'normal',
      namePrefix: '',
      quality: '凡品',
      statMultiplier: 1,
      critRateBonus: 0,
      critDamageBonus: 0
    }
  })
}

function resolveDropWeight(drop: DropItem, composition: EncounterRiskCompositionConfig) {
  const qualityWeight = composition.qualityBias[drop.quality] ?? 1
  return clampProbability(drop.dropRate * composition.rewardDropMultiplier * qualityWeight)
}

function isAtLeastRare(drop: DropItem) {
  return QUALITY_ORDER.indexOf(drop.quality) >= QUALITY_ORDER.indexOf('rare')
}

export function resolveEncounterDrops(
  drops: DropItem[],
  encounter: MapAreaEncounterContext | null
) {
  const composition = resolveEncounterCompositionConfig(encounter)
  const resolved = drops.flatMap(drop => {
    const chance = resolveDropWeight(drop, composition)
    if (Math.random() >= chance) return []

    let quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
    if (encounter?.contested && isAtLeastRare(drop)) {
      quantity += 1
    }

    return [{ item: drop, quantity }]
  })

  if (resolved.length > 0 || !encounter) return resolved

  const rescueRare = drops.find(drop => isAtLeastRare(drop))
  if (encounter.riskLevel === 'chaos' && rescueRare) {
    return [{ item: rescueRare, quantity: rescueRare.minQuantity }]
  }

  return resolved
}
