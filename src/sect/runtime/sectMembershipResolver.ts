import type { MapArea } from '@/types/map'
import type { Realm } from '@/types/unit'
import type { SectDefinition, SectWorldCondition } from '@/types/sect'
import type { PlantedCrop } from '@/types/garden'
import type { SectDirectiveId } from './sectPositionResolver'

const REALM_ORDER: Realm[] = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']

export type SectJoinAvailabilityReason =
  | 'unlocked'
  | 'open_area'
  | 'realm_locked'
  | 'area_locked'

export interface SectJoinCandidate {
  sect: SectDefinition
  canJoin: boolean
  reason: SectJoinAvailabilityReason
  reasonLabel: string
  areaName: string
}

export interface SectMembershipJoinResolution {
  canJoin: boolean
  reason: 'ready' | 'missing_sect' | 'locked' | 'already_joined'
  nextState?: {
    joinedSectId: string
    positionLevel: number
    contribution: number
    reputation: number
    sectHp: number
    sectMaxHp: number
    facilityLevels: Record<string, number>
  }
}

export interface SectMembershipLeaveResolution {
  canLeave: boolean
  reason: 'ready' | 'not_joined'
  nextState?: {
    joinedSectId: null
    positionLevel: number
    contribution: number
    reputation: number
    tasks: []
    activeWar: null
    activeEvent: null
    worldCondition: SectWorldCondition
    recoveryProgress: number
    lastWarReport: null
    activeDirective: SectDirectiveId
    gardenSlots: (PlantedCrop | null)[]
  }
}

function meetsRealmRequirement(input: {
  playerRealm: Realm
  playerRealmLevel: number
  requiredRealm: Realm
  requiredRealmLevel: number
}) {
  const playerRealmIndex = REALM_ORDER.indexOf(input.playerRealm)
  const requiredRealmIndex = REALM_ORDER.indexOf(input.requiredRealm)

  if (playerRealmIndex < 0 || requiredRealmIndex < 0) return false
  if (playerRealmIndex > requiredRealmIndex) return true
  return playerRealmIndex === requiredRealmIndex && input.playerRealmLevel >= input.requiredRealmLevel
}

export function resolveSectJoinCandidates(input: {
  sects: SectDefinition[]
  areas: MapArea[]
  unlockedSectIds: string[]
  playerRealm: Realm
  playerRealmLevel: number
}): SectJoinCandidate[] {
  const areasById = new Map(input.areas.map(area => [area.id, area]))

  return input.sects
    .map(sect => {
      const area = areasById.get(sect.areaId)
      const hasRealm = meetsRealmRequirement({
        playerRealm: input.playerRealm,
        playerRealmLevel: input.playerRealmLevel,
        requiredRealm: sect.requiredRealm,
        requiredRealmLevel: sect.requiredRealmLevel
      })
      const areaOpen = Boolean(area?.isUnlocked)
      const explicitlyUnlocked = input.unlockedSectIds.includes(sect.id)

      if (explicitlyUnlocked) {
        return {
          sect,
          canJoin: true,
          reason: 'unlocked' as const,
          reasonLabel: '已结缘',
          areaName: area?.name ?? sect.areaId
        }
      }

      if (!hasRealm) {
        return {
          sect,
          canJoin: false,
          reason: 'realm_locked' as const,
          reasonLabel: `需${sect.requiredRealm}${sect.requiredRealmLevel}层`,
          areaName: area?.name ?? sect.areaId
        }
      }

      if (!areaOpen) {
        return {
          sect,
          canJoin: false,
          reason: 'area_locked' as const,
          reasonLabel: '区域未开放',
          areaName: area?.name ?? sect.areaId
        }
      }

      return {
        sect,
        canJoin: true,
        reason: 'open_area' as const,
        reasonLabel: '可拜山',
        areaName: area?.name ?? sect.areaId
      }
    })
    .sort((a, b) => {
      if (a.canJoin !== b.canJoin) return a.canJoin ? -1 : 1
      const reasonRank: Record<SectJoinAvailabilityReason, number> = {
        unlocked: 0,
        open_area: 1,
        realm_locked: 2,
        area_locked: 3
      }
      return reasonRank[a.reason] - reasonRank[b.reason]
    })
}

export function resolveSectJoin(input: {
  sect: SectDefinition | undefined
  sectId: string
  unlockedSectIds: string[]
  candidateSectIds?: string[]
  currentJoinedSectId: string | null
  facilityLevels: Record<string, number>
}): SectMembershipJoinResolution {
  if (!input.sect) {
    return { canJoin: false, reason: 'missing_sect' }
  }
  const canAccess = input.unlockedSectIds.includes(input.sectId)
    || Boolean(input.candidateSectIds?.includes(input.sectId))

  if (!canAccess) {
    return { canJoin: false, reason: 'locked' }
  }
  if (input.currentJoinedSectId) {
    return { canJoin: false, reason: 'already_joined' }
  }

  return {
    canJoin: true,
    reason: 'ready',
    nextState: {
      joinedSectId: input.sectId,
      positionLevel: 1,
      contribution: 0,
      reputation: 0,
      sectHp: input.sect.maxHp,
      sectMaxHp: input.sect.maxHp,
      facilityLevels: input.facilityLevels
    }
  }
}

export function resolveSectLeave(input: {
  joinedSectId: string | null
  defaultGardenSlots: (PlantedCrop | null)[]
}): SectMembershipLeaveResolution {
  if (!input.joinedSectId) {
    return { canLeave: false, reason: 'not_joined' }
  }

  return {
    canLeave: true,
    reason: 'ready',
    nextState: {
      joinedSectId: null,
      positionLevel: 1,
      contribution: 0,
      reputation: 0,
      tasks: [],
      activeWar: null,
      activeEvent: null,
      worldCondition: {
        status: 'stable',
        occupiedBySectId: null,
        lastUpdatedTick: null
      },
      recoveryProgress: 0,
      lastWarReport: null,
      activeDirective: 'balanced',
      gardenSlots: input.defaultGardenSlots
    }
  }
}
