import type { WorldRuntimeNpcActionResult, WorldRuntimeNpcSocialContext } from './worldRuntimeTypes'
import { getNpcPowerScore } from './npcProfile'
import { resolveNpcSchemeAction } from './npcSchemeActionResolver'
import { seededWorldRoll } from './worldSeed'

function withInteractionStamp(
  context: WorldRuntimeNpcSocialContext,
  result: WorldRuntimeNpcActionResult
): WorldRuntimeNpcActionResult {
  const actorStamp = {
    id: context.actorState.id,
    lastActionTick: context.clock.totalTicks
  }
  const targetStamp = {
    id: context.targetState.id,
    lastActionTick: context.clock.totalTicks
  }

  return {
    ...result,
    npcPatches: [
      actorStamp,
      targetStamp,
      ...(result.npcPatches ?? [])
    ]
  }
}

function resolveNpcPowerScore(
  context: Pick<WorldRuntimeNpcSocialContext, 'actorDefinition' | 'actorState'> | Pick<WorldRuntimeNpcSocialContext, 'targetDefinition' | 'targetState'>
) {
  const definition = 'actorDefinition' in context ? context.actorDefinition : context.targetDefinition
  const state = 'actorState' in context ? context.actorState : context.targetState
  return getNpcPowerScore(definition, state)
}

function resolveNpcClash(context: WorldRuntimeNpcSocialContext) {
  const { actorDefinition, actorState, actorRelationship, targetDefinition, targetState, targetRelationship, clock, weather } = context
  const sameRegion = actorState.locationMapId === targetState.locationMapId
  const sameSect = actorDefinition.sectId && actorDefinition.sectId === targetDefinition.sectId
  if ((!sameRegion && !sameSect) || actorRelationship.hatred < 26 || actorRelationship.fear > 58) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, actorState.id, targetState.id, 'npc-social-clash')
  const weatherBonus = weather === 'storm' || weather === 'mist' ? 0.04 : 0
  const threshold = 0.94
    - Math.min(0.22, actorRelationship.hatred / 320)
    - actorDefinition.personality.cruelty / 1200
    - actorDefinition.personality.ambition / 1400
    - weatherBonus

  if (roll <= threshold) return null

  const actorPower = resolveNpcPowerScore({ actorDefinition, actorState })
  const targetPower = resolveNpcPowerScore({ targetDefinition, targetState })
  const edge = actorPower - targetPower + actorRelationship.hatred * 0.35 - targetRelationship.hatred * 0.2
  const actorWins = edge + seededWorldRoll(clock.totalTicks, actorState.id, targetState.id, 'npc-social-clash-edge') * 10 >= 0
  const victorDefinition = actorWins ? actorDefinition : targetDefinition
  const loserDefinition = actorWins ? targetDefinition : actorDefinition
  const victorId = actorWins ? actorState.id : targetState.id
  const loserId = actorWins ? targetState.id : actorState.id

  return withInteractionStamp(context, {
    npcPatches: [
      {
        id: victorId,
        currentGoal: 'challenge',
        cultivationDelta: 34,
        notorietyDelta: 8
      },
      {
        id: loserId,
        hpState: 'injured',
        currentGoal: 'recover',
        notorietyDelta: 3
      }
    ],
    relationshipDeltas: [
      {
        npcId: actorState.id,
        subjectId: targetState.id,
        hatredDelta: 5,
        fearDelta: actorWins ? -2 : 4
      },
      {
        npcId: targetState.id,
        subjectId: actorState.id,
        hatredDelta: 5,
        fearDelta: actorWins ? 4 : -2
      }
    ],
    logs: [
      {
        scope: 'world',
        severity: 'major',
        title: `${actorDefinition.name}与${targetDefinition.name}爆发冲突`,
        text: `${victorDefinition.name}在${sameSect ? '同门争执' : '暗地冲突'}中压过了${loserDefinition.name}，后者带伤退走。`,
        actorIds: [actorState.id, targetState.id],
        mapId: actorWins ? actorState.locationMapId : targetState.locationMapId,
        tags: ['npc', 'network', 'clash']
      }
    ]
  })
}

function resolveNpcSupport(context: WorldRuntimeNpcSocialContext) {
  const { actorDefinition, actorState, actorRelationship, targetDefinition, targetState, clock } = context
  const sameSect = actorDefinition.sectId && actorDefinition.sectId === targetDefinition.sectId
  const closeBond = actorRelationship.bond === 'friend' || actorRelationship.bond === 'companion' || actorRelationship.bond === 'lover'
  if ((!sameSect && !closeBond && actorRelationship.debt < 16) || actorRelationship.hatred > 18) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, actorState.id, targetState.id, 'npc-social-support')
  const threshold = 0.93
    - Math.min(0.18, actorRelationship.favor / 360)
    - Math.min(0.12, actorRelationship.debt / 220)
    - actorDefinition.personality.loyalty / 1500
    - actorDefinition.personality.affection / 1500

  if (roll <= threshold) return null

  const targetGain = 22 + Math.floor(targetDefinition.aptitude.comprehension * 0.12)
  const actorGain = 12 + Math.floor(actorDefinition.aptitude.luck * 0.08)

  return withInteractionStamp(context, {
    npcPatches: [
      {
        id: actorState.id,
        currentGoal: sameSect ? 'sectDuty' : 'adventure',
        cultivationDelta: actorGain,
        notorietyDelta: 2
      },
      {
        id: targetState.id,
        currentGoal: 'cultivate',
        cultivationDelta: targetGain,
        notorietyDelta: 4
      }
    ],
    relationshipDeltas: [
      {
        npcId: actorState.id,
        subjectId: targetState.id,
        favorDelta: 3,
        debtDelta: -3
      },
      {
        npcId: targetState.id,
        subjectId: actorState.id,
        favorDelta: 4,
        fearDelta: -2
      }
    ],
    logs: [
      {
        scope: 'sect',
        severity: 'normal',
        title: `${actorDefinition.name}提携${targetDefinition.name}`,
        text: `${actorDefinition.name}出手点拨${targetDefinition.name}的修行关窍，两人的关系更近了一步。`,
        actorIds: [actorState.id, targetState.id],
        mapId: actorState.locationMapId,
        tags: ['npc', 'network', 'support']
      }
    ]
  })
}

function resolveNpcExposure(context: WorldRuntimeNpcSocialContext) {
  const { actorDefinition, actorState, actorRelationship, targetDefinition, targetState, targetRelationship, clock } = context
  if (actorRelationship.fear < 30 || actorDefinition.personality.greed < 48 || targetRelationship.hatred < 14) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, actorState.id, targetState.id, 'npc-social-exposure')
  const threshold = 0.96
    - Math.min(0.18, actorRelationship.fear / 280)
    - actorDefinition.personality.caution / 1600
    - actorDefinition.personality.greed / 1800

  if (roll <= threshold) return null

  return withInteractionStamp(context, {
    npcPatches: [
      {
        id: actorState.id,
        currentGoal: 'sectDuty'
      },
      {
        id: targetState.id,
        hpState: targetDefinition.tags.includes('主线保护') ? targetState.hpState : 'injured',
        currentGoal: 'recover'
      }
    ],
    relationshipDeltas: [
      {
        npcId: actorState.id,
        subjectId: targetState.id,
        fearDelta: -3,
        debtDelta: 2
      },
      {
        npcId: targetState.id,
        subjectId: actorState.id,
        hatredDelta: 6,
        favorDelta: -4
      }
    ],
    logs: [
      {
        scope: 'world',
        severity: 'major',
        title: `${actorDefinition.name}出卖了${targetDefinition.name}的行踪`,
        text: `${actorDefinition.name}因畏惧与私心泄露了${targetDefinition.name}的动向，后者因此遭到伏击。`,
        actorIds: [actorState.id, targetState.id],
        mapId: targetState.locationMapId,
        tags: ['npc', 'network', 'betrayal']
      }
    ]
  })
}

export function resolveNpcSocialAction(context: WorldRuntimeNpcSocialContext) {
  return resolveNpcSchemeAction(context)
    || resolveNpcClash(context)
    || resolveNpcSupport(context)
    || resolveNpcExposure(context)
}
