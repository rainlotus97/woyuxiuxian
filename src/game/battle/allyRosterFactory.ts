import { createUnit, type Unit, type UnitStats } from '@/types/unit'
import type { CompanionDefinition, OwnedCompanion } from '@/types/companion'
import type { OwnedPet, PetDefinition } from '@/types/pet'

interface BattleCompanionSource {
  owned: OwnedCompanion
  definition: CompanionDefinition
  stats: UnitStats
}

interface BattlePetSource {
  owned: OwnedPet
  definition: PetDefinition
  stats: UnitStats
}

function mapCompanionQualityToUnitQuality(definition: CompanionDefinition): Unit['quality'] {
  if (definition.quality === '凡品') return '凡品'
  if (definition.quality === '灵品') return '玄品'
  if (definition.quality === '仙品') return '仙品'
  return '神品'
}

export function buildCompanionBattleUnit(
  source: BattleCompanionSource,
  protagonistRealm: Unit['realm']
): Unit {
  const { owned, definition, stats } = source
  return createUnit({
    id: `companion_${owned.definitionId}`,
    name: definition.name,
    type: 'companion',
    element: definition.element,
    realm: protagonistRealm,
    realmLevel: owned.level,
    quality: mapCompanionQualityToUnitQuality(definition),
    level: owned.level,
    icon: definition.icon,
    stats: {
      maxHp: stats.maxHp,
      currentHp: stats.maxHp,
      maxMp: stats.maxMp,
      currentMp: stats.maxMp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      critRate: stats.critRate,
      critDamage: stats.critDamage
    },
    skills: definition.skills || []
  })
}

export function buildPetBattleUnit(source: BattlePetSource): Unit {
  const { owned, definition, stats } = source
  return createUnit({
    id: `pet_${owned.definitionId}`,
    name: definition.name,
    type: 'pet',
    element: definition.element,
    realm: definition.realm,
    realmLevel: definition.realmLevel,
    quality: definition.quality,
    level: owned.level,
    icon: definition.icon,
    stats: {
      maxHp: stats.maxHp,
      currentHp: stats.maxHp,
      maxMp: stats.maxMp,
      currentMp: stats.maxMp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      critRate: stats.critRate,
      critDamage: stats.critDamage
    },
    skills: [...definition.skills]
  })
}
