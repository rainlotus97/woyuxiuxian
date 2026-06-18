import { createUnit, type Unit } from '@/types/unit'
import { getBattleActorRole, getBattleSpriteKey } from './presentationRoles'
import { getSummonDefinition } from './config/summons'
import type { BattleRuntimeUnit } from './runtimeTypes'
import { createSkillCooldownState } from './skillCooldownRuntime'

export function toBattleRuntimeUnit(
  unit: Unit,
  side: 'ally' | 'enemy',
  actionGauge = Math.random() * 18
): BattleRuntimeUnit {
  const battleRole = getBattleActorRole(unit, side)
  return {
    ...unit,
    side,
    battleRole,
    spriteKey: getBattleSpriteKey(battleRole, side),
    actionGauge,
    skillCooldowns: createSkillCooldownState(unit.skills)
  }
}

export function countActiveSummonsForOwner(
  units: BattleRuntimeUnit[],
  ownerId: string,
  summonId: string
) {
  return units.filter(unit =>
    unit.isAlive
    && unit.type === 'summon'
    && unit.summonOwnerId === ownerId
    && unit.summonDefinitionId === summonId
  ).length
}

export function createSummonRuntimeUnit(
  summonId: string,
  owner: BattleRuntimeUnit,
  serial: number
): BattleRuntimeUnit | null {
  const definition = getSummonDefinition(summonId)
  if (!definition) return null

  const summon = createUnit({
    id: `summon_${owner.id}_${definition.id}_${serial}`,
    name: definition.name,
    type: 'summon',
    element: definition.element,
    realm: definition.realm,
    realmLevel: definition.realmLevel,
    quality: definition.quality,
    level: definition.level,
    icon: definition.icon,
    aiType: definition.aiType,
    stats: { ...definition.stats },
    skills: [...definition.skills]
  })

  return {
    ...toBattleRuntimeUnit(summon, owner.side, 0),
    summonOwnerId: owner.id,
    summonDefinitionId: definition.id
  }
}
