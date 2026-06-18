import type { LearnedSkill } from '@/types/skill'
import { getSkillDefinition } from '@/types/skill'

export interface SkillProgressSkillInput {
  id: string
  level: number
  enabled: boolean
}

export interface SkillExpDelta {
  skillId: string
  exp: number
  reason: 'idle_training' | 'battle_use' | 'battle_participation'
}

export interface SkillTrainingProgressionResult {
  skillExpDeltas: SkillExpDelta[]
  totalExp: number
  primarySkillId: string | null
}

export interface ResolveIdleSkillTrainingInput {
  learnedSkills: SkillProgressSkillInput[]
  baseCultivationGain: number
  seed: number
}

export interface ResolveBattleSkillProgressionInput {
  learnedSkills: SkillProgressSkillInput[]
  usedSkillIds: string[]
  victory: boolean
  cultivationReward: number
}

function normalizeSkills(skills: SkillProgressSkillInput[]) {
  return skills
    .filter(skill => Boolean(getSkillDefinition(skill.id)))
    .filter(skill => skill.level < (getSkillDefinition(skill.id)?.maxLevel ?? skill.level))
}

function enabledFirst(skills: SkillProgressSkillInput[]) {
  return [...skills].sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.level - b.level || a.id.localeCompare(b.id))
}

export function resolveIdleSkillTrainingProgression(input: ResolveIdleSkillTrainingInput): SkillTrainingProgressionResult {
  const eligible = enabledFirst(normalizeSkills(input.learnedSkills))
  if (eligible.length === 0) {
    return { skillExpDeltas: [], totalExp: 0, primarySkillId: null }
  }

  const primary = eligible[Math.abs(Math.floor(input.seed)) % eligible.length]
  if (!primary) {
    return { skillExpDeltas: [], totalExp: 0, primarySkillId: null }
  }
  const secondary = eligible.find(skill => skill.id !== primary.id && skill.enabled)
  const baseExp = Math.max(4, Math.floor(input.baseCultivationGain * 0.18))
  const skillExpDeltas: SkillExpDelta[] = [
    { skillId: primary.id, exp: baseExp, reason: 'idle_training' }
  ]

  if (secondary && baseExp >= 8) {
    skillExpDeltas.push({
      skillId: secondary.id,
      exp: Math.max(2, Math.floor(baseExp * 0.35)),
      reason: 'idle_training'
    })
  }

  return {
    skillExpDeltas,
    totalExp: skillExpDeltas.reduce((sum, item) => sum + item.exp, 0),
    primarySkillId: primary.id
  }
}

export function resolveBattleSkillProgression(input: ResolveBattleSkillProgressionInput): SkillTrainingProgressionResult {
  if (!input.victory) {
    return { skillExpDeltas: [], totalExp: 0, primarySkillId: null }
  }

  const eligible = normalizeSkills(input.learnedSkills)
  const eligibleById = new Map(eligible.map(skill => [skill.id, skill]))
  const usedSkillIds = [...new Set(input.usedSkillIds)].filter(skillId => eligibleById.has(skillId))
  const baseExp = Math.max(3, Math.floor(input.cultivationReward * 0.08))
  const skillExpDeltas: SkillExpDelta[] = []

  for (const skillId of usedSkillIds) {
    skillExpDeltas.push({
      skillId,
      exp: baseExp,
      reason: 'battle_use'
    })
  }

  if (skillExpDeltas.length === 0) {
    const fallback = enabledFirst(eligible).find(skill => skill.enabled) ?? eligible[0]
    if (fallback) {
      skillExpDeltas.push({
        skillId: fallback.id,
        exp: Math.max(2, Math.floor(baseExp * 0.6)),
        reason: 'battle_participation'
      })
    }
  }

  return {
    skillExpDeltas,
    totalExp: skillExpDeltas.reduce((sum, item) => sum + item.exp, 0),
    primarySkillId: skillExpDeltas[0]?.skillId ?? null
  }
}

export function toSkillProgressInput(skills: LearnedSkill[]): SkillProgressSkillInput[] {
  return skills.map(skill => ({
    id: skill.id,
    level: skill.level,
    enabled: skill.enabled
  }))
}
