import type { SectPosition } from '@/types/sect'
import { getSectDirectiveEffects } from './sectDirectiveEffects'
import type { SectDirectiveId } from './sectPositionResolver'

export interface SectStipendContext {
  position: SectPosition | null
  directive: SectDirectiveId
  joinedSectId: string | null
  lastClaimAt: number
  now: number
}

export interface SectStipendResolution {
  canClaim: boolean
  gold: number
  contribution: number
  nextClaimAt: number
  remainingMs: number
  reason: 'no_sect' | 'cooldown' | 'ready'
}

const STIPEND_INTERVAL_MS = 24 * 60 * 60 * 1000

export function resolveSectStipend(context: SectStipendContext): SectStipendResolution {
  if (!context.joinedSectId || !context.position) {
    return {
      canClaim: false,
      gold: 0,
      contribution: 0,
      nextClaimAt: context.lastClaimAt + STIPEND_INTERVAL_MS,
      remainingMs: 0,
      reason: 'no_sect'
    }
  }

  const effects = getSectDirectiveEffects(context.directive)
  const gold = context.position.dailySalary
  const contribution = Math.max(1, Math.floor((gold / 2) * effects.taskContributionMultiplier))
  const nextClaimAt = context.lastClaimAt + STIPEND_INTERVAL_MS
  const remainingMs = Math.max(0, nextClaimAt - context.now)

  return {
    canClaim: remainingMs <= 0,
    gold,
    contribution,
    nextClaimAt,
    remainingMs,
    reason: remainingMs <= 0 ? 'ready' : 'cooldown'
  }
}
