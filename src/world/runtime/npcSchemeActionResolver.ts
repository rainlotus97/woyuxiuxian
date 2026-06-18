import type { NpcDefinition, NpcRuntimeState } from '@/types/world'
import type {
  WorldRuntimeNpcActionResult,
  WorldRuntimeNpcSocialContext,
  WorldRuntimeRelationshipDelta
} from './worldRuntimeTypes'
import { getNpcPowerScore } from './npcProfile'
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

function resolveSchemeChance(context: WorldRuntimeNpcSocialContext) {
  const { actorDefinition, actorRelationship, clock, weather } = context
  const weatherBonus = weather === 'mist' || weather === 'storm' ? 0.04 : 0
  const stanceBonus = actorDefinition.profile.factionStance === 'demonic' ? 0.035 : 0
  const hatredBonus = Math.min(0.18, actorRelationship.hatred / 360)
  const crueltyBonus = actorDefinition.personality.cruelty / 1800
  const ambitionBonus = actorDefinition.personality.ambition / 2200
  const roll = seededWorldRoll(clock.totalTicks, context.actorState.id, context.targetState.id, 'npc-scheme')
  return roll > 0.965 - weatherBonus - stanceBonus - hatredBonus - crueltyBonus - ambitionBonus
}

function resolveCaptorAdvantage(context: WorldRuntimeNpcSocialContext) {
  const actorPower = getNpcPowerScore(context.actorDefinition, context.actorState)
  const targetPower = getNpcPowerScore(context.targetDefinition, context.targetState)
  const relationshipEdge = context.actorRelationship.hatred * 0.24 + context.actorRelationship.fear * 0.1
  const weatherEdge = context.weather === 'mist' ? 8 : context.weather === 'storm' ? 5 : 0
  const seedEdge = seededWorldRoll(context.clock.totalTicks, context.actorState.id, context.targetState.id, 'scheme-edge') * 20 - 8
  return actorPower - targetPower + relationshipEdge + weatherEdge + seedEdge
}

function buildPropagationDeltas(
  context: WorldRuntimeNpcSocialContext,
  captured: boolean
): WorldRuntimeRelationshipDelta[] {
  const deltas: WorldRuntimeRelationshipDelta[] = [
    {
      npcId: context.actorState.id,
      subjectId: context.targetState.id,
      hatredDelta: captured ? 8 : 5,
      fearDelta: captured ? -2 : 2
    },
    {
      npcId: context.targetState.id,
      subjectId: context.actorState.id,
      hatredDelta: captured ? 10 : 6,
      fearDelta: captured ? 8 : 3
    }
  ]

  return deltas
}

function shouldSchemeAgainstTarget(actor: NpcDefinition, target: NpcDefinition, targetState: NpcRuntimeState) {
  if (target.tags.includes('主线保护')) return false
  if (targetState.hpState !== 'healthy' && targetState.hpState !== 'injured') return false
  if (actor.id === target.id) return false
  return true
}

export function resolveNpcSchemeAction(context: WorldRuntimeNpcSocialContext) {
  const { actorDefinition, actorState, actorRelationship, targetDefinition, targetState } = context
  if (!shouldSchemeAgainstTarget(actorDefinition, targetDefinition, targetState)) return null
  if (actorRelationship.hatred < 42 && actorDefinition.personality.cruelty < 78 && actorDefinition.profile.factionStance !== 'demonic') {
    return null
  }
  if (!resolveSchemeChance(context)) return null

  const advantage = resolveCaptorAdvantage(context)
  const captured = advantage >= 20 && targetState.hpState === 'healthy'
  const failedBadly = advantage < -18

  if (failedBadly) {
    return withInteractionStamp(context, {
      npcPatches: [
        {
          id: actorState.id,
          hpState: 'injured',
          currentGoal: 'recover',
          notorietyDelta: 3
        },
        {
          id: targetState.id,
          currentGoal: 'challenge',
          notorietyDelta: 4
        }
      ],
      relationshipDeltas: buildPropagationDeltas(context, false),
      logs: [
        {
          scope: 'world',
          severity: 'major',
          title: `${actorDefinition.name}设伏失败`,
          text: `${actorDefinition.name}试图伏击${targetDefinition.name}，却被对方反制，负伤退走。此事很快在附近修士间传开。`,
          actorIds: [actorState.id, targetState.id],
          mapId: targetState.locationMapId,
          tags: ['npc', 'scheme', 'ambush', 'failed']
        }
      ]
    })
  }

  return withInteractionStamp(context, {
    npcPatches: [
      {
        id: actorState.id,
        currentGoal: 'challenge',
        notorietyDelta: captured ? 10 : 6
      },
      {
        id: targetState.id,
        hpState: captured ? 'captured' : 'injured',
        currentGoal: 'recover',
        locationMapId: captured ? actorState.locationMapId : targetState.locationMapId,
        notorietyDelta: captured ? 2 : 3,
        addFlags: captured ? [`captured_by:${actorState.id}`] : ['ambushed']
      }
    ],
    relationshipDeltas: buildPropagationDeltas(context, captured),
    logs: [
      {
        scope: 'world',
        severity: captured ? 'legendary' : 'major',
        title: captured ? `${targetDefinition.name}被${actorDefinition.name}俘获` : `${targetDefinition.name}遭遇埋伏`,
        text: captured
          ? `${actorDefinition.name}趁夜设伏，将${targetDefinition.name}带离原本所在区域。消息扩散后，相关宗门与旧识都开始重新评估局势。`
          : `${actorDefinition.name}暗中伏击${targetDefinition.name}，虽未能将其擒下，却让后者带伤退避。`,
        actorIds: [actorState.id, targetState.id],
        mapId: captured ? actorState.locationMapId : targetState.locationMapId,
        tags: ['npc', 'scheme', 'ambush', captured ? 'captured' : 'injured']
      }
    ]
  })
}
