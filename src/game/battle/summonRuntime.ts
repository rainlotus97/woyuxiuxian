import type { Skill } from '@/types/skill'
import { getSummonDefinition } from './config/summons'
import { countActiveSummonsForOwner, createSummonRuntimeUnit } from './runtimeUnitFactory'
import type { BattlePreparedSummon, BattleRuntimeUnit, BattleSummonOutcome } from './runtimeTypes'

export function prepareSummons(
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  skill: Skill | null
): BattlePreparedSummon[] {
  if (!skill) return []

  const prepared: BattlePreparedSummon[] = []
  for (const effect of skill.effects) {
    if (effect.type !== 'summon' || !effect.summon) continue

    const definition = getSummonDefinition(effect.summon.definitionId)
    const requestedCount = Math.max(1, effect.summon.count ?? 1)
    const maxActive = effect.summon.maxActive ?? definition?.maxActivePerOwner ?? requestedCount
    const activeCount = countActiveSummonsForOwner(units, actor.id, effect.summon.definitionId)
    const spawnCount = Math.max(0, Math.min(requestedCount, maxActive - activeCount))

    for (let index = 0; index < spawnCount; index++) {
      prepared.push({
        actorId: actor.id,
        summonId: effect.summon.definitionId,
        side: actor.side
      })
    }
  }

  return prepared
}

export function hasSummonCapacity(
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  skill: Skill | null
) {
  return prepareSummons(actor, units, skill).length > 0
}

export function applyPreparedSummons(
  units: BattleRuntimeUnit[],
  preparedSummons: BattlePreparedSummon[],
  nextSerial: () => number
): BattleSummonOutcome[] {
  const outcomes: BattleSummonOutcome[] = []

  for (const prepared of preparedSummons) {
    const owner = units.find(unit => unit.id === prepared.actorId)
    const definition = getSummonDefinition(prepared.summonId)
    if (!owner || !definition) {
      outcomes.push({
        actorId: prepared.actorId,
        summonId: prepared.summonId,
        summonName: definition?.name ?? prepared.summonId,
        success: false,
        reason: definition ? 'missing-owner' : 'missing-definition'
      })
      continue
    }

    const activeCount = countActiveSummonsForOwner(units, owner.id, prepared.summonId)
    if (activeCount >= definition.maxActivePerOwner) {
      outcomes.push({
        actorId: prepared.actorId,
        summonId: prepared.summonId,
        summonName: definition.name,
        success: false,
        reason: 'limit'
      })
      continue
    }

    const summon = createSummonRuntimeUnit(prepared.summonId, owner, nextSerial())
    if (!summon) {
      outcomes.push({
        actorId: prepared.actorId,
        summonId: prepared.summonId,
        summonName: definition.name,
        success: false,
        reason: 'missing-definition'
      })
      continue
    }

    units.push(summon)
    outcomes.push({
      actorId: prepared.actorId,
      summonId: prepared.summonId,
      summonName: summon.name,
      unitId: summon.id,
      success: true
    })
  }

  return outcomes
}
