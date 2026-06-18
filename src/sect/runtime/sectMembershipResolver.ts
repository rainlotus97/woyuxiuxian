import type { SectDefinition, SectWorldCondition } from '@/types/sect'
import type { PlantedCrop } from '@/types/garden'
import type { SectDirectiveId } from './sectPositionResolver'

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

export function resolveSectJoin(input: {
  sect: SectDefinition | undefined
  sectId: string
  unlockedSectIds: string[]
  currentJoinedSectId: string | null
  facilityLevels: Record<string, number>
}): SectMembershipJoinResolution {
  if (!input.sect) {
    return { canJoin: false, reason: 'missing_sect' }
  }
  if (!input.unlockedSectIds.includes(input.sectId)) {
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
