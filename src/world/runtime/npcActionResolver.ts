import type { WorldRuntimeNpcActionResult, WorldRuntimeNpcContext } from './worldRuntimeTypes'
import { resolveRelationshipDrivenNpcAction } from './npcRelationshipActionResolver'
import { resolvePlayerPressureNpcAction } from './npcPlayerPressureResolver'
import { resolveLineageDrivenNpcAction } from './npcLineageActionResolver'
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
  const recklessBias = npcDefinition.aptitude.growthFlaws?.includes('reckless_breakthrough') ? 0.08 : 0
  const bloodlineBias = npcDefinition.aptitude.bloodlineGrade === 'forbidden' ? 0.05 : 0
  if (roll <= 0.86 - recklessBias - bloodlineBias) return null

  const injuryThreshold = npcDefinition.aptitude.growthFlaws?.includes('unstable_meridian') ? 0.92 : 0.96
  const harmed = roll > injuryThreshold && !npcDefinition.tags.includes('主线保护')
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
  const hasExceptionalBody = npcDefinition.aptitude.constitution === 'star_meridian'
    || npcDefinition.aptitude.constitution === 'void_meridian'
    || npcDefinition.aptitude.constitution === 'thunder_body'
  if ((npcDefinition.aptitude.talent !== 'monster' && npcDefinition.aptitude.talent !== 'destined' && !hasExceptionalBody) || npcState.hpState === 'dead') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-breakthrough')
  const potentialBonus = getNpcPotentialScore(npcDefinition) / 1000
  const constitutionBonus = hasExceptionalBody ? 0.04 : 0
  const flawPenalty = npcDefinition.aptitude.growthFlaws?.includes('heart_demon') ? 0.03 : 0
  if (roll <= 0.9 - potentialBonus - constitutionBonus + flawPenalty) return null

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
  const vengefulBias = npcDefinition.aptitude.growthFlaws?.includes('vengeful') ? 8 : 0
  const demonicBias = npcDefinition.profile.factionStance === 'demonic' || npcDefinition.aptitude.constitution === 'demon_blood' ? 6 : 0
  if (npcDefinition.personality.cruelty + vengefulBias + demonicBias <= 75) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'npc-villain')
  const triggerChance = 0.08
    + (npcDefinition.aptitude.bloodlineGrade === 'forbidden' ? 0.035 : 0)
    + (npcDefinition.aptitude.growthFlaws?.includes('vengeful') ? 0.025 : 0)
  if (roll >= triggerChance) return null

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
    || resolvePlayerPressureNpcAction(context)
    || resolveLineageDrivenNpcAction(context)
    || resolveAmbitionAction(context)
    || resolveBreakthroughAction(context)
    || resolveCrueltyAction(context)
}
