import type { RelationshipState, WorldAreaAnomaly, WorldLogEntry, WorldLogSeverity } from '@/types/world'

export function getSeverityTone(severity: WorldLogSeverity): 'jade' | 'gold' | 'rose' {
  if (severity === 'legendary') return 'rose'
  if (severity === 'major') return 'gold'
  return 'jade'
}

export function getBondTone(bond: RelationshipState['bond']) {
  if (bond === 'enemy' || bond === 'rival') return 'hostile'
  if (bond === 'companion' || bond === 'lover' || bond === 'mentor') return 'warm'
  return 'neutral'
}

export function getBondLabel(bond: RelationshipState['bond']) {
  const labels: Record<RelationshipState['bond'], string> = {
    stranger: '陌路',
    friend: '友善',
    rival: '争锋',
    enemy: '仇敌',
    mentor: '师承',
    companion: '同行',
    lover: '情愫'
  }
  return labels[bond]
}

export function getNpcHealthLabel(state: string) {
  const labels: Record<string, string> = {
    healthy: '安好',
    injured: '带伤',
    critical: '濒危',
    dead: '陨落',
    captured: '被俘'
  }
  return labels[state] ?? state
}

export function getNpcGoalLabel(goal: string) {
  const labels: Record<string, string> = {
    cultivate: '潜修',
    adventure: '游历',
    challenge: '寻战',
    recover: '疗伤',
    seekTreasure: '寻宝',
    sectDuty: '宗务'
  }
  return labels[goal] ?? goal
}

export function formatJourneyRewards(rewards?: Array<{ label: string; value: number | string }>) {
  if (!rewards?.length) return '无额外收益'
  return rewards.map(item => `${item.label} ${item.value}`).join(' · ')
}

export function getAnomalyIcon(type: WorldAreaAnomaly['type']) {
  const icons: Record<WorldAreaAnomaly['type'], string> = {
    flood: '🌊',
    fire: '🔥',
    beast_tide: '🐾',
    ruins: '🏛️',
    spiritual_vein: '✨',
    bandit: '🗡️'
  }
  return icons[type]
}

export function getWorldLogTone(log: WorldLogEntry) {
  return getSeverityTone(log.severity)
}
