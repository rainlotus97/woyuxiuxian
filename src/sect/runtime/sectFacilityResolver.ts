import type { SectFacility } from '@/types/sect'

export interface SectFacilityUpgradeResolution {
  canUpgrade: boolean
  reason: 'ready' | 'missing_facility' | 'not_joined' | 'position_locked' | 'max_level' | 'gold_shortage' | 'contribution_shortage'
  currentLevel: number
  nextLevel: number
  goldCost: number
  contributionCost: number
}

export function resolveInitialFacilityLevels(facilities: SectFacility[], initialLevel = 1): Record<string, number> {
  return facilities.reduce<Record<string, number>>((levels, facility) => {
    levels[facility.id] = initialLevel
    return levels
  }, {})
}

export function resolveFacilityLevel(facilityLevels: Record<string, number>, facilityId: string, fallbackLevel = 1) {
  return facilityLevels[facilityId] ?? fallbackLevel
}

export function resolveFacilityUpgrade(input: {
  facility: SectFacility | undefined
  joinedSectId: string | null
  positionLevel: number
  currentLevel: number
  gold: number
  contribution: number
}): SectFacilityUpgradeResolution {
  if (!input.facility) {
    return createBlockedUpgrade('missing_facility')
  }
  if (!input.joinedSectId) {
    return createBlockedUpgrade('not_joined', input.facility, input.currentLevel)
  }
  if (input.positionLevel < input.facility.unlockPosition) {
    return createBlockedUpgrade('position_locked', input.facility, input.currentLevel)
  }
  if (input.currentLevel >= input.facility.maxLevel) {
    return createBlockedUpgrade('max_level', input.facility, input.currentLevel)
  }
  if (input.gold < input.facility.upgradeCost.gold) {
    return createBlockedUpgrade('gold_shortage', input.facility, input.currentLevel)
  }
  if (input.contribution < input.facility.upgradeCost.contribution) {
    return createBlockedUpgrade('contribution_shortage', input.facility, input.currentLevel)
  }

  return {
    canUpgrade: true,
    reason: 'ready',
    currentLevel: input.currentLevel,
    nextLevel: input.currentLevel + 1,
    goldCost: input.facility.upgradeCost.gold,
    contributionCost: input.facility.upgradeCost.contribution
  }
}

function createBlockedUpgrade(
  reason: SectFacilityUpgradeResolution['reason'],
  facility?: SectFacility,
  currentLevel = 0
): SectFacilityUpgradeResolution {
  return {
    canUpgrade: false,
    reason,
    currentLevel,
    nextLevel: currentLevel,
    goldCost: facility?.upgradeCost.gold ?? 0,
    contributionCost: facility?.upgradeCost.contribution ?? 0
  }
}
