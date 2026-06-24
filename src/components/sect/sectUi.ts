import { RELATION_CONFIG, type SectRelation, type SectTask, type SectWorldCondition } from '@/types/sect'

export type SectTone = 'jade' | 'gold' | 'mist'

export interface SectDiplomacyRow {
  sectId: string
  name: string
  icon: string
  realm: string
  relation: SectRelation
  description: string
  canDeclareWar: boolean
}

export function getSectSurfaceTone(input: {
  isCaptured: boolean
  worldCondition: SectWorldCondition
  hasActiveWar: boolean
}): SectTone {
  if (input.isCaptured || input.worldCondition.status === 'collapsed') {
    return 'mist'
  }
  if (input.hasActiveWar || input.worldCondition.status === 'rebuilding') {
    return 'gold'
  }
  return 'jade'
}

export function getSectWorldStatusLabel(status: SectWorldCondition['status']) {
  const labels: Record<SectWorldCondition['status'], string> = {
    stable: '山门安稳',
    rebuilding: '宗门重建',
    collapsed: '宗门沦陷'
  }
  return labels[status]
}

export function getSectRelationTone(relation: SectRelation): 'jade' | 'gold' | 'rose' {
  if (relation === 'hostile' || relation === 'at_war') return 'rose'
  if (relation === 'friendly' || relation === 'allied') return 'jade'
  return 'gold'
}

export function getSectRelationLabel(relation: SectRelation) {
  return RELATION_CONFIG[relation]?.label ?? relation
}

export function getSectRelationDescription(relation: SectRelation) {
  return RELATION_CONFIG[relation]?.description ?? ''
}

export function getTaskRequirementLabel(task: SectTask) {
  const typeLabels: Record<SectTask['requirements']['type'], string> = {
    battle: '讨伐',
    collect: '采集',
    craft: '炼制',
    explore: '探查',
    contribution: '贡献'
  }

  const target = task.requirements.target === 'any' ? '任意目标' : task.requirements.target
  return `${typeLabels[task.requirements.type]} · ${target}`
}

export function getTaskRewardLabel(task: SectTask) {
  const parts = [`贡献 ${task.rewards.contribution}`, `灵石 ${task.rewards.gold}`]
  if (task.rewards.exp) {
    parts.push(`修为 ${task.rewards.exp}`)
  }
  return parts.join(' · ')
}

export function getTaskProgressPercent(task: SectTask) {
  if (task.requirements.count <= 0) return 0
  return Math.max(0, Math.min(100, (task.progress / task.requirements.count) * 100))
}

export function getWarScorePercent(score: number, winScore: number) {
  if (winScore <= 0) return 0
  return Math.max(0, Math.min(100, (score / winScore) * 100))
}
