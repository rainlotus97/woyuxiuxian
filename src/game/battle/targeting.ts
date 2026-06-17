import type { Skill, SkillTargetType } from '@/types/skill'
import type { BattleRuntimeCommand, BattleRuntimeUnit } from './runtimeTypes'

export interface SelectableBattleTarget {
  id: string
  name: string
  icon: string
  side: 'ally' | 'enemy'
}

function getAllies(actor: BattleRuntimeUnit, units: BattleRuntimeUnit[]) {
  return units.filter(unit => unit.side === actor.side && unit.isAlive)
}

function getEnemies(actor: BattleRuntimeUnit, units: BattleRuntimeUnit[]) {
  return units.filter(unit => unit.side !== actor.side && unit.isAlive)
}

export function isManualTargetType(targetType: SkillTargetType): boolean {
  return targetType === 'single_enemy' || targetType === 'single_ally'
}

export function getPrimaryTargetType(commandType: BattleRuntimeCommand['type'], skill: Skill | null): SkillTargetType {
  if (commandType === 'attack') return 'single_enemy'
  return skill?.effects[0]?.targetType ?? 'single_enemy'
}

export function getManualTargetType(commandType: BattleRuntimeCommand['type'], skill: Skill | null): SkillTargetType | null {
  const targetType = getPrimaryTargetType(commandType, skill)
  return isManualTargetType(targetType) ? targetType : null
}

export function getSelectableTargets(
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  commandType: BattleRuntimeCommand['type'],
  skill: Skill | null
): SelectableBattleTarget[] {
  const targetType = getManualTargetType(commandType, skill)
  const source = targetType === 'single_ally' ? getAllies(actor, units) : getEnemies(actor, units)
  return source.map(unit => ({
    id: unit.id,
    name: unit.name,
    icon: unit.icon,
    side: unit.side
  }))
}

export function resolveEffectTargetIds(
  targetType: SkillTargetType,
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  selectedTargetIds: string[]
): string[] {
  const allies = getAllies(actor, units)
  const enemies = getEnemies(actor, units)
  const selected = selectedTargetIds
    .map(targetId => units.find(unit => unit.id === targetId && unit.isAlive))
    .filter((unit): unit is BattleRuntimeUnit => unit !== undefined)

  switch (targetType) {
    case 'single_enemy':
      return [(selected.find(unit => unit.side !== actor.side) ?? enemies[0])?.id].filter((id): id is string => Boolean(id))
    case 'all_enemies':
      return enemies.map(unit => unit.id)
    case 'single_ally':
      return [(selected.find(unit => unit.side === actor.side) ?? actor)?.id].filter((id): id is string => Boolean(id))
    case 'all_allies':
      return allies.map(unit => unit.id)
    case 'self':
      return [actor.id]
  }
}

export function resolveCommandTargetIds(
  command: BattleRuntimeCommand,
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  skill: Skill | null
): string[] {
  if (command.type === 'attack' || !skill) {
    return resolveEffectTargetIds('single_enemy', actor, units, command.targetIds)
  }

  const ids = new Set<string>()
  for (const effect of skill.effects) {
    for (const targetId of resolveEffectTargetIds(effect.targetType, actor, units, command.targetIds)) {
      ids.add(targetId)
    }
  }
  return [...ids]
}

