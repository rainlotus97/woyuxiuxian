import type { WorldRuntimeNpcActionResult, WorldRuntimeNpcContext } from './worldRuntimeTypes'
import { resolveRelationshipDrivenNpcAction } from './npcRelationshipActionResolver'
import { getNpcPotentialScore } from './npcProfile'
import { seededWorldRoll } from './worldSeed'

function withActionStamp(
  context: WorldRuntimeNpcContext,
  result: WorldRuntimeNpcActionResult
): WorldRuntimeNpcActionResult {
  return {
    ...result,
    npcPatch: {
      ...(result.npcPatch ?? { id: context.npcState.id }),
      id: context.npcState.id,
      lastActionTick: context.clock.totalTicks
    }
  }
}

function resolveRecoveryAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if (npcState.hpState !== 'injured' || npcDefinition.personality.caution <= 45) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-recover')
  if (roll > 0.82) {
    return withActionStamp(context, {
      npcPatch: {
        id: npcState.id,
        hpState: 'healthy',
        currentGoal: 'cultivate'
      },
      logs: [
        {
          scope: 'npc',
          severity: 'normal',
          title: `${npcDefinition.name}疗伤`,
          text: `${npcDefinition.name}闭门调息，伤势已经稳定。`,
          actorIds: [npcState.id],
          mapId: npcState.locationMapId,
          tags: ['npc', 'recover']
        }
      ]
    })
  }

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'recover'
    }
  })
}

function resolveAmbitionAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if (npcDefinition.personality.ambition <= 80 || npcState.hpState !== 'healthy') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-challenge')
  if (roll <= 0.86) return null

  const harmed = roll > 0.96 && !npcDefinition.tags.includes('主线保护')
  if (harmed) {
    return withActionStamp(context, {
      npcPatch: {
        id: npcState.id,
        hpState: 'injured',
        currentGoal: 'recover'
      },
      logs: [
        {
          scope: 'npc',
          severity: 'major',
          title: `${npcDefinition.name}遭遇强敌`,
          text: `${npcDefinition.name}强闯秘地失败，被一道禁制斩伤，道基险些崩裂。`,
          actorIds: [npcState.id],
          mapId: npcState.locationMapId,
          tags: ['npc', 'injured', 'challenge']
        }
      ]
    })
  }

  return withActionStamp(context, {
      npcPatch: {
        id: npcState.id,
        cultivationDelta: 80,
        currentGoal: 'challenge',
        notorietyDelta: 6
      },
    logs: [
      {
        scope: 'npc',
        severity: 'major',
        title: `${npcDefinition.name}声名鹊起`,
        text: `${npcDefinition.name}击败同阶修士，凶名在青阳城暗处传开。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'challenge']
      }
    ]
  })
}

function resolveBreakthroughAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if ((npcDefinition.aptitude.talent !== 'monster' && npcDefinition.aptitude.talent !== 'destined') || npcState.hpState === 'dead') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-breakthrough')
  const potentialBonus = getNpcPotentialScore(npcDefinition) / 1000
  if (roll <= 0.9 - potentialBonus) return null

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      realmLevelDelta: 1,
      currentGoal: 'cultivate',
      notorietyDelta: 10
    },
    logs: [
      {
        scope: 'npc',
        severity: 'legendary',
        title: `${npcDefinition.name}破境`,
        text: `${npcDefinition.name}一夜悟道，境界踏入${npcState.realm}${Math.min(9, npcState.realmLevel + 1)}层。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'breakthrough']
      }
    ]
  })
}

function resolveCrueltyAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if (npcDefinition.personality.cruelty <= 75) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-villain')
  if (roll >= 0.08) return null

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'adventure',
      notorietyDelta: 5
    },
    logs: [
      {
        scope: 'npc',
        severity: 'major',
        title: `${npcDefinition.name}暗中出手`,
        text: `有人在城外失踪，现场残留的火煞气息与${npcDefinition.name}极像。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'villain']
      }
    ]
  })
}

export function resolveNpcAction(context: WorldRuntimeNpcContext) {
  return resolveRecoveryAction(context)
    || resolveRelationshipDrivenNpcAction(context)
    || resolveAmbitionAction(context)
    || resolveBreakthroughAction(context)
    || resolveCrueltyAction(context)
}
