import type { Skill } from '@/types/skill'
import type { BattleRuntimeUnit } from './runtimeTypes'

export function createSkillCooldownState(skillIds: string[]) {
  return Object.fromEntries(skillIds.map(skillId => [skillId, 0]))
}

export function getSkillCurrentCooldown(unit: BattleRuntimeUnit, skillId: string) {
  return Math.max(0, unit.skillCooldowns[skillId] ?? 0)
}

export function applySkillCooldown(unit: BattleRuntimeUnit, skill: Skill | null) {
  if (!skill || skill.cooldown <= 0) return
  unit.skillCooldowns[skill.id] = skill.cooldown
}

export function reduceActorSkillCooldowns(unit: BattleRuntimeUnit) {
  for (const skillId of Object.keys(unit.skillCooldowns)) {
    unit.skillCooldowns[skillId] = Math.max(0, (unit.skillCooldowns[skillId] ?? 0) - 1)
  }
}

export function withRuntimeSkillCooldown(skill: Skill, unit: BattleRuntimeUnit): Skill {
  return {
    ...skill,
    currentCooldown: getSkillCurrentCooldown(unit, skill.id)
  }
}

export function canUseRuntimeSkill(skill: Skill, unit: BattleRuntimeUnit) {
  if (unit.statusEffects.some(effect => effect.type === 'spirit_seal' && effect.duration > 0)) {
    return false
  }
  return skill.currentCooldown <= 0 && skill.mpCost <= unit.stats.currentMp
}
