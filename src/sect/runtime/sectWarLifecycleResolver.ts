import type { SectWar } from '@/types/sect'

export interface SectWarDeclarationResolution {
  canDeclare: boolean
  reason: 'ready' | 'not_joined' | 'no_authority' | 'already_at_war' | 'missing_target'
  war: SectWar | null
}

export interface SectWarAdvanceResolution {
  war: SectWar
  ended: boolean
  attackerWon: boolean | null
}

export function resolveSectWarDeclaration(input: {
  joinedSectId: string | null
  canDeclareWar: boolean
  hasActiveWar: boolean
  targetSectId: string
  targetExists: boolean
  now: number
}): SectWarDeclarationResolution {
  if (!input.joinedSectId) return createBlockedDeclaration('not_joined')
  if (!input.canDeclareWar) return createBlockedDeclaration('no_authority')
  if (input.hasActiveWar) return createBlockedDeclaration('already_at_war')
  if (!input.targetExists) return createBlockedDeclaration('missing_target')

  const startDate = new Date(input.now)
  return {
    canDeclare: true,
    reason: 'ready',
    war: {
      id: `war_${input.now}`,
      attackerSectId: input.joinedSectId,
      defenderSectId: input.targetSectId,
      startDate: {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate()
      },
      status: 'ongoing',
      attackerScore: 0,
      defenderScore: 0,
      winScore: 100
    }
  }
}

export function resolveSectWarAdvance(input: {
  war: SectWar
  attackerWon: boolean
  random: number
}): SectWarAdvanceResolution {
  const scoreGain = 10 + Math.floor(clamp01(input.random) * 5)
  const nextWar: SectWar = {
    ...input.war,
    attackerScore: input.war.attackerScore + (input.attackerWon ? scoreGain : 0),
    defenderScore: input.war.defenderScore + (input.attackerWon ? 0 : scoreGain)
  }

  if (nextWar.attackerScore >= nextWar.winScore) {
    return {
      war: {
        ...nextWar,
        status: 'victory'
      },
      ended: true,
      attackerWon: true
    }
  }

  if (nextWar.defenderScore >= nextWar.winScore) {
    return {
      war: {
        ...nextWar,
        status: 'defeat'
      },
      ended: true,
      attackerWon: false
    }
  }

  return {
    war: nextWar,
    ended: false,
    attackerWon: null
  }
}

function createBlockedDeclaration(reason: SectWarDeclarationResolution['reason']): SectWarDeclarationResolution {
  return {
    canDeclare: false,
    reason,
    war: null
  }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(0.999999, value))
}
