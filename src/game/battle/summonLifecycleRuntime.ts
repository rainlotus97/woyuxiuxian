import type { BattleRuntimeUnit } from './runtimeTypes'

export interface BattleSummonExitOutcome {
  unitId: string
  unitName: string
  ownerId: string | null
  summonId: string | null
  remainingTurns: number
}

export function resolveSummonActionLifecycle(
  units: BattleRuntimeUnit[],
  actorId: string
): BattleSummonExitOutcome | null {
  const actor = units.find(unit => unit.id === actorId)
  if (!actor || actor.type !== 'summon' || !actor.isAlive) return null

  const nextRemainingTurns = Math.max(0, (actor.summonRemainingTurns ?? 1) - 1)
  actor.summonRemainingTurns = nextRemainingTurns

  if (nextRemainingTurns > 0) return null

  actor.isAlive = false
  actor.stats.currentHp = 0
  actor.actionGauge = 0

  return {
    unitId: actor.id,
    unitName: actor.name,
    ownerId: actor.summonOwnerId ?? null,
    summonId: actor.summonDefinitionId ?? null,
    remainingTurns: nextRemainingTurns
  }
}
