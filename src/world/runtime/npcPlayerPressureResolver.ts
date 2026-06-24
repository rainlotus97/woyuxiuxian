import type { WorldRuntimeNpcActionResult, WorldRuntimeNpcContext } from './worldRuntimeTypes'
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

function resolveHostilePursuit(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, playerFocusMapId, playerGold, weather, clock } = context
  if (!playerFocusMapId || npcState.hpState !== 'healthy') return null
  if (playerRelationship.fear > 76) return null
  if (playerRelationship.hatred < 46 && playerRelationship.bond !== 'enemy') return null

  const sameRegion = npcState.locationMapId === playerFocusMapId
  const weatherBonus = weather === 'mist' || weather === 'storm' ? 0.035 : 0
  const proximityBonus = sameRegion ? 0.045 : 0
  const roll = seededWorldRoll(clock.totalTicks, npcState.id, playerFocusMapId, 'player-hostile-pursuit')
  const threshold = 0.965
    - Math.min(0.18, playerRelationship.hatred / 360)
    - npcDefinition.personality.cruelty / 1800
    - npcDefinition.personality.ambition / 2200
    - weatherBonus
    - proximityBonus

  if (roll <= threshold) return null

  const goldLoss = sameRegion ? Math.min(playerGold, 4 + Math.floor(playerRelationship.hatred * 0.16)) : 0
  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'challenge',
      locationMapId: playerFocusMapId,
      notorietyDelta: 4
    },
    playerEffect: goldLoss > 0 ? { goldDelta: -goldLoss } : undefined,
    relationshipDeltas: [
      {
        npcId: npcState.id,
        hatredDelta: 3,
        fearDelta: sameRegion ? -1 : 1
      }
    ],
    logs: [
      {
        scope: 'npc',
        severity: sameRegion ? 'major' : 'normal',
        title: `${npcDefinition.name}追踪你的行踪`,
        text: goldLoss > 0
          ? `${npcDefinition.name}顺着你近期活动的痕迹逼近，并在暗处搅乱你的布置，你损失了${goldLoss}枚灵石。`
          : `${npcDefinition.name}离开原本所在之地，开始打探你最近出没的区域。`,
        actorIds: [npcState.id],
        mapId: playerFocusMapId,
        tags: ['npc', 'relationship', 'player-pressure', 'pursuit']
      }
    ]
  })
}

function resolveProtectiveEscort(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, playerFocusMapId, playerSectId, idleMode, clock } = context
  if (!playerFocusMapId || npcState.hpState !== 'healthy') return null
  if (playerRelationship.hatred > 24) return null

  const closeBond = playerRelationship.bond === 'friend'
    || playerRelationship.bond === 'companion'
    || playerRelationship.bond === 'lover'
  const sameSect = Boolean(playerSectId && npcDefinition.sectId === playerSectId)
  if (!closeBond && playerRelationship.favor < 58 && !sameSect) return null

  const sameRegion = npcState.locationMapId === playerFocusMapId
  const roll = seededWorldRoll(clock.totalTicks, npcState.id, playerFocusMapId, 'player-protective-escort')
  const threshold = 0.955
    - Math.min(0.16, playerRelationship.favor / 400)
    - npcDefinition.personality.affection / 1800
    - npcDefinition.personality.loyalty / 1800
    - (sameSect ? 0.025 : 0)
    - (sameRegion ? 0.025 : 0)

  if (roll <= threshold) return null

  const cultivationGain = 10 + Math.floor(Math.max(playerRelationship.favor, 30) * 0.16)
  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: idleMode === 'sectDuty' && sameSect ? 'sectDuty' : 'adventure',
      locationMapId: playerFocusMapId,
      cultivationDelta: 8 + Math.floor(npcDefinition.aptitude.comprehension * 0.06),
      notorietyDelta: closeBond ? 3 : 1
    },
    playerEffect: {
      cultivationDelta: cultivationGain
    },
    relationshipDeltas: [
      {
        npcId: npcState.id,
        favorDelta: closeBond ? 2 : 1,
        debtDelta: -1,
        fearDelta: -1
      }
    ],
    logs: [
      {
        scope: sameSect ? 'sect' : 'npc',
        severity: closeBond ? 'major' : 'normal',
        title: `${npcDefinition.name}护你一程`,
        text: `${npcDefinition.name}察觉你近期动向后赶来接应，替你化去一段险阻，你额外获得了${cultivationGain}点修为。`,
        actorIds: [npcState.id],
        mapId: playerFocusMapId,
        tags: ['npc', 'relationship', 'player-pressure', 'escort']
      }
    ]
  })
}

function resolveSectSurveillance(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, playerSectId, idleMode, clock } = context
  if (!playerSectId || npcDefinition.sectId !== playerSectId || npcState.hpState !== 'healthy') return null
  if (idleMode !== 'sectDuty' && idleMode !== 'cultivate' && idleMode !== 'trainSkill') return null
  if (playerRelationship.hatred < 28 || playerRelationship.fear > 70) return null

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, playerSectId, 'player-sect-surveillance')
  const threshold = 0.965
    - Math.min(0.14, playerRelationship.hatred / 420)
    - npcDefinition.personality.caution / 2200
    - npcDefinition.personality.ambition / 2200

  if (roll <= threshold) return null

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'sectDuty',
      notorietyDelta: 2
    },
    relationshipDeltas: [
      {
        npcId: npcState.id,
        hatredDelta: 2,
        fearDelta: 1
      }
    ],
    logs: [
      {
        scope: 'sect',
        severity: 'normal',
        title: `${npcDefinition.name}暗中盯梢`,
        text: `${npcDefinition.name}借宗门事务留意你的行踪，你能感觉到同门之间的气氛变得微妙。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'relationship', 'player-pressure', 'surveillance']
      }
    ]
  })
}

export function resolvePlayerPressureNpcAction(context: WorldRuntimeNpcContext) {
  const ticksSinceAction = context.clock.totalTicks - context.npcState.lastActionTick
  if (ticksSinceAction < 3) return null

  return resolveHostilePursuit(context)
    || resolveProtectiveEscort(context)
    || resolveSectSurveillance(context)
}
