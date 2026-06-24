import { createUnit, type Unit } from '@/types/unit'
import { getBattleActorRole, getBattleBadgeIcon, getBattlePortraitKey, getBattleSpriteKey } from './presentationRoles'
import { getSummonDefinition } from './config/summons'
import type { BattleRuntimeUnit } from './runtimeTypes'
import { createSkillCooldownState } from './skillCooldownRuntime'

export function toBattleRuntimeUnit(
  unit: Unit,
  side: 'ally' | 'enemy',
  actionGauge = Math.random() * 18
): BattleRuntimeUnit {
  const battleRole = getBattleActorRole(unit, side)
  const badgeIcon = getBattleBadgeIcon(battleRole, side, unit.icon)
  const markerText = unit.icon || (
    battleRole === 'boss' ? '魁'
      : battleRole === 'elite' ? '锋'
      : battleRole === 'enemy' ? '敌'
      : battleRole === 'pet' ? '灵'
      : battleRole === 'summon' ? '召'
      : '剑'
  )
  return {
    ...unit,
    icon: badgeIcon,
    markerText,
    side,
    battleRole,
    spriteKey: getBattleSpriteKey(battleRole, side),
    portraitKey: getBattlePortraitKey(battleRole, side),
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
    summonDefinitionId: definition.id,
    summonRemainingTurns: definition.durationTurns
  }
}
