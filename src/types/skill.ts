import type { Element, StatusEffectType } from './unit'
import { SKILL_DEFINITIONS } from '@/game/battle/config/skills'
import { SKILL_TREE } from '@/game/battle/config/skillTrees'

export type SkillCategory = 'attack' | 'defense' | 'support' | 'passive'

export type SkillTargetType =
  | 'single_enemy'
  | 'all_enemies'
  | 'single_ally'
  | 'all_allies'
  | 'self'

export type SkillEffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'special' | 'summon'

export interface SkillEffect {
  type: SkillEffectType
  targetType: SkillTargetType
  baseValue: number
  scaling: number
  element?: Element
  summon?: {
    definitionId: string
    count?: number
    maxActive?: number
  }
  statusEffect?: {
    type: StatusEffectType
    chance: number
    duration: number
    value?: number
  }
  levelScaling?: number
}

export type SkillBranch = 'attack' | 'defense' | 'cultivation' | 'special'

export interface SkillDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: SkillCategory
  branch: SkillBranch
  tier: number
  mpCost: number
  mpCostPerLevel?: number
  cooldown: number
  effects: SkillEffect[]
  prerequisites?: string[]
  unlockRealm?: string
  maxLevel: number
  passiveBonus?: {
    stat: 'attack' | 'defense' | 'maxHp' | 'maxMp' | 'critRate' | 'critDamage' | 'speed'
    valuePerLevel: number
  }
}

export interface LearnedSkill {
  id: string
  level: number
  exp: number
  maxExp: number
  currentCooldown: number
  enabled: boolean
}

export interface SkillTreeNode {
  skillId: string
  position: { x: number; y: number }
  connections: string[]
}

export { SKILL_DEFINITIONS, SKILL_TREE }

export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS[id]
}

export function getSkillDefinitions(ids: string[]): SkillDefinition[] {
  return ids.map(id => SKILL_DEFINITIONS[id]).filter((skill): skill is SkillDefinition => skill !== undefined)
}

export function calculateSkillExpRequired(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function calculateSkillEffectValue(effect: SkillEffect, skillLevel: number): number {
  const levelBonus = effect.levelScaling ? effect.levelScaling * (skillLevel - 1) : 0
  return effect.baseValue + levelBonus
}

export function calculateSkillMpCost(skill: SkillDefinition, level: number): number {
  const levelCost = skill.mpCostPerLevel ? skill.mpCostPerLevel * (level - 1) : 0
  return skill.mpCost + levelCost
}

export function isSkillDefinitionAvailable(skill: SkillDefinition, _playerRealm: string, playerMp: number, level: number): boolean {
  if (calculateSkillMpCost(skill, level) > playerMp) return false
  if (skill.cooldown > 0) return false
  return true
}

export function getSkillsByBranch(branch: SkillBranch): SkillDefinition[] {
  const nodeSkillIds = SKILL_TREE[branch].map(node => node.skillId)
  return nodeSkillIds.map(id => SKILL_DEFINITIONS[id]).filter((skill): skill is SkillDefinition => skill !== undefined)
}

export function getStarterSkills(): string[] {
  return ['basic_sword', 'basic_defense', 'gathering_qi', 'fireball']
}

export function createLearnedSkill(skillId: string): LearnedSkill | null {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return null

  return {
    id: skillId,
    level: 1,
    exp: 0,
    maxExp: calculateSkillExpRequired(1),
    currentCooldown: 0,
    enabled: true
  }
}

export interface Skill extends SkillDefinition {
  currentCooldown: number
}

export function getSkillById(skillId: string): Skill | undefined {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return undefined

  return {
    ...definition,
    currentCooldown: 0
  }
}

export function getSkillsByIds(skillIds: string[]): Skill[] {
  return skillIds
    .map(id => getSkillById(id))
    .filter((skill): skill is Skill => skill !== undefined)
}

export function isSkillAvailable(skill: Skill, unit: { stats: { currentMp: number } }): boolean {
  if (skill.currentCooldown > 0) return false
  if (skill.mpCost > unit.stats.currentMp) return false
  return true
}

export function getSkillMpCostAtLevel(skillId: string, level: number): number {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return 0
  return calculateSkillMpCost(definition, level)
}

export function getSkillEffectValueAtLevel(effect: SkillEffect, level: number): number {
  return calculateSkillEffectValue(effect, level)
}

export const BASIC_SKILLS: Skill[] = [
  {
    ...SKILL_DEFINITIONS.basic_sword,
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS.fireball,
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS.heal,
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS.shield,
    currentCooldown: 0
  } as Skill
].filter((skill): skill is Skill => skill !== undefined)
