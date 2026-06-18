import { getPosition, type SectPosition, type SectTaskType } from '@/types/sect'

export type SectDirectiveId = 'balanced' | 'cultivation' | 'supply' | 'warfare'

export interface SectAuthoritySnapshot {
  positionLevel: number
  contribution: number
}

export interface SectAuthorityState {
  position: SectPosition | null
  nextPosition: SectPosition | null
  canPromote: boolean
  remainingContribution: number
  authorityLevel: 'disciple' | 'steward' | 'elder' | 'leader'
  canDeclareWar: boolean
  canIssueDirectives: boolean
  canLeadSect: boolean
  canUseFacilityTier: 1 | 2 | 3 | 4
  availableDirectives: SectDirectiveId[]
}

const POSITION_FACILITY_TIER: Record<number, 1 | 2 | 3 | 4> = {
  1: 1,
  2: 2,
  3: 3,
  4: 3,
  5: 3,
  6: 4,
  7: 4
}

export function resolveSectAuthority(input: SectAuthoritySnapshot): SectAuthorityState {
  const position = getPosition(input.positionLevel) ?? null
  const nextPosition = getPosition(input.positionLevel + 1) ?? null
  const remainingContribution = Math.max(0, (nextPosition?.requiredContribution ?? 0) - input.contribution)
  const canPromote = Boolean(nextPosition && input.contribution >= nextPosition.requiredContribution)

  let authorityLevel: SectAuthorityState['authorityLevel'] = 'disciple'
  if (input.positionLevel >= 6) authorityLevel = 'leader'
  else if (input.positionLevel >= 5) authorityLevel = 'elder'
  else if (input.positionLevel >= 4) authorityLevel = 'steward'

  const availableDirectives: SectDirectiveId[] = ['balanced']
  if (input.positionLevel >= 3) availableDirectives.push('cultivation')
  if (input.positionLevel >= 4) availableDirectives.push('supply')
  if (input.positionLevel >= 5) availableDirectives.push('warfare')

  return {
    position,
    nextPosition,
    canPromote,
    remainingContribution,
    authorityLevel,
    canDeclareWar: input.positionLevel >= 4,
    canIssueDirectives: input.positionLevel >= 3,
    canLeadSect: input.positionLevel >= 6,
    canUseFacilityTier: POSITION_FACILITY_TIER[input.positionLevel] ?? 1,
    availableDirectives
  }
}

export function getDirectiveLabel(directive: SectDirectiveId) {
  const labels: Record<SectDirectiveId, string> = {
    balanced: '均衡执掌',
    cultivation: '修炼优先',
    supply: '资材优先',
    warfare: '战备优先'
  }
  return labels[directive]
}

export function getDirectiveDescription(directive: SectDirectiveId) {
  const descriptions: Record<SectDirectiveId, string> = {
    balanced: '维持宗门常态运转，资源分配平均。',
    cultivation: '侧重炼丹、药园与修炼物资，适合稳步养成。',
    supply: '侧重采集、储备与后勤，适合加速经济链。',
    warfare: '侧重讨伐、战线与战功回收，适合战时推进。'
  }
  return descriptions[directive]
}

export function getTaskPoolWeight(taskType: SectTaskType, directive: SectDirectiveId) {
  const weights: Record<SectDirectiveId, Record<SectTaskType, number>> = {
    balanced: { daily: 1, weekly: 1, monthly: 1, special: 1 },
    cultivation: { daily: 1.15, weekly: 1, monthly: 1.1, special: 0.95 },
    supply: { daily: 1.2, weekly: 1.05, monthly: 0.95, special: 0.9 },
    warfare: { daily: 0.95, weekly: 1.15, monthly: 1.1, special: 1.2 }
  }
  return weights[directive][taskType] ?? 1
}

export function getAuthorityLevelLabel(level: SectAuthorityState['authorityLevel']) {
  const labels: Record<SectAuthorityState['authorityLevel'], string> = {
    disciple: '弟子层级',
    steward: '执事层级',
    elder: '长老层级',
    leader: '掌权层级'
  }
  return labels[level]
}

export function getFacilityAuthorityTier(unlockPosition: number): 1 | 2 | 3 | 4 {
  if (unlockPosition <= 1) return 1
  if (unlockPosition <= 2) return 2
  if (unlockPosition <= 4) return 3
  return 4
}

export function canAuthorityAccessFacility(
  authorityTier: 1 | 2 | 3 | 4,
  unlockPosition: number
) {
  return authorityTier >= getFacilityAuthorityTier(unlockPosition)
}
