import type { SectDefinition } from '@/types/sect'
import type {
  SectRelationShift,
  SectRuntimeLogEffect,
  SectRuntimeStateSnapshot,
  SectRuntimeWarProgress,
  SectWorldTickResolution
} from './sectWorldTypes'
import { seededWorldRoll } from '@/world/runtime/worldSeed'

export function resolveSectWarProgress(
  totalTicks: number,
  state: SectRuntimeStateSnapshot,
  currentSect: SectDefinition | null,
  defenderSect: SectDefinition | null
): SectRuntimeWarProgress | null {
  if (!state.activeWar || !currentSect || !defenderSect) return null

  const roll = seededWorldRoll(totalTicks, state.activeWar.id, 'sect-war-progress')
  if (roll <= 0.72) return null

  const attackerPower = state.reputation / 120 + currentSect.maxHp / 600
  const defenderPower = defenderSect.reputation / 120 + defenderSect.maxHp / 600
  const attackerWon = attackerPower + seededWorldRoll(totalTicks, currentSect.id, defenderSect.id, 'sect-war-attacker') * 8
    >= defenderPower + seededWorldRoll(totalTicks, defenderSect.id, currentSect.id, 'sect-war-defender') * 8

  return {
    attackerWon,
    log: {
      title: '宗门战局推进',
      description: attackerWon
        ? `${currentSect.name}在与${defenderSect.name}的交锋中暂时占据上风。`
        : `${defenderSect.name}反扑得手，战局重新陷入胶着。`
    }
  }
}

export function resolveSectRelationDrift(
  totalTicks: number,
  state: SectRuntimeStateSnapshot,
  currentSect: SectDefinition | null,
  knownSectIds: string[]
) {
  if (!currentSect || state.activeWar) return null

  const hostileCount = Object.values(state.relations).filter(relation => relation === 'hostile').length
  const neutralTargets = knownSectIds.filter(sectId => sectId !== currentSect.id && !state.relations[sectId])
  if (neutralTargets.length === 0) return null

  const roll = seededWorldRoll(totalTicks, currentSect.id, 'sect-relation-drift')
  if (roll <= 0.92 && hostileCount === 0) return null

  const targetSectId = neutralTargets[Math.floor(seededWorldRoll(totalTicks, currentSect.id, 'sect-relation-target') * neutralTargets.length)] ?? null
  if (!targetSectId) return null

  const relation = roll > 0.97 ? 'hostile' : 'friendly'
  return {
    shift: {
      targetSectId,
      relation
    } satisfies SectRelationShift,
    log: {
      title: relation === 'hostile' ? '宗门关系恶化' : '宗门关系缓和',
      description: relation === 'hostile'
        ? `${currentSect.name}与${targetSectId}之间摩擦渐起，双方气氛转为敌对。`
        : `${currentSect.name}与${targetSectId}开始互通往来，关系有所缓和。`
    } satisfies SectRuntimeLogEffect
  }
}

export function resolveSectWorldTick(input: {
  totalTicks: number
  now: number
  state: SectRuntimeStateSnapshot
  currentSect: SectDefinition | null
  defenderSect: SectDefinition | null
  unlockedSectIds: string[]
}): SectWorldTickResolution {
  const warProgress = resolveSectWarProgress(
    input.totalTicks,
    input.state,
    input.currentSect,
    input.defenderSect
  )
  const relationDrift = resolveSectRelationDrift(
    input.totalTicks,
    input.state,
    input.currentSect,
    input.unlockedSectIds
  )

  return {
    warProgress,
    relationDrift,
    events: [
      ...(warProgress?.log
        ? [{
            id: `sect_world_war_${input.now}`,
            type: 'sect_conflict' as const,
            title: warProgress.log.title,
            description: warProgress.log.description
          }]
        : []),
      ...(relationDrift
        ? [{
            id: `sect_relation_${input.now}`,
            type: relationDrift.shift.relation === 'hostile' ? 'sect_conflict' as const : 'alliance_offer' as const,
            title: relationDrift.log.title,
            description: relationDrift.log.description
          }]
        : [])
    ]
  }
}
