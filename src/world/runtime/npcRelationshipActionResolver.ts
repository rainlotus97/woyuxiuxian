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

function resolveRetaliationAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, weather, playerGold, clock } = context
  if (playerRelationship.hatred < 35 || playerRelationship.fear > 62 || npcState.hpState !== 'healthy') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'relationship-retaliation')
  const weatherBonus = weather === 'mist' || weather === 'storm' ? 0.05 : 0
  const threshold = 0.93
    - Math.min(0.2, playerRelationship.hatred / 320)
    - npcDefinition.personality.cruelty / 900
    - npcDefinition.personality.ambition / 1500
    - weatherBonus

  if (roll <= threshold) return null

  const goldLoss = Math.min(playerGold, 6 + Math.floor(playerRelationship.hatred * 0.28))
  const successText = goldLoss > 0
    ? `${npcDefinition.name}趁你分神修炼时布下暗手，你损失了${goldLoss}枚灵石。`
    : `${npcDefinition.name}在暗处试探你的行踪，但这次没有占到便宜。`

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'challenge'
    },
    playerEffect: goldLoss > 0 ? { goldDelta: -goldLoss } : undefined,
    relationshipDeltas: [
      {
        npcId: npcState.id,
        hatredDelta: 2,
        fearDelta: -2
      }
    ],
    logs: [
      {
        scope: 'npc',
        severity: goldLoss > 0 ? 'major' : 'normal',
        title: `${npcDefinition.name}伺机报复`,
        text: successText,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'relationship', 'retaliation']
      }
    ]
  })
}

function resolveCompanionSupportAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, clock } = context
  const isCloseBond = playerRelationship.bond === 'companion' || playerRelationship.bond === 'lover'
  if ((!isCloseBond && playerRelationship.favor < 70) || npcState.hpState !== 'healthy') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'relationship-companion-support')
  const threshold = 0.92
    - Math.min(0.18, playerRelationship.favor / 380)
    - npcDefinition.personality.affection / 1200
    - npcDefinition.personality.loyalty / 1500

  if (roll <= threshold) return null

  const cultivationGain = 18 + Math.floor(playerRelationship.favor * 0.22)
  const npcGain = 10 + Math.floor(npcDefinition.aptitude.comprehension * 0.08)

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'adventure',
      cultivationDelta: npcGain
    },
    playerEffect: {
      cultivationDelta: cultivationGain
    },
    relationshipDeltas: [
      {
        npcId: npcState.id,
        favorDelta: 2,
        debtDelta: -2
      }
    ],
    logs: [
      {
        scope: 'npc',
        severity: 'major',
        title: `${npcDefinition.name}伴你同行`,
        text: `${npcDefinition.name}与你同行历练，沿途点破你的灵力运转关隘，你额外获得了${cultivationGain}点修为。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'relationship', 'companion-support']
      }
    ]
  })
}

function resolveDebtAidAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, clock } = context
  if ((playerRelationship.debt < 20 && playerRelationship.favor < 48) || npcState.hpState === 'captured') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'relationship-debt-aid')
  const threshold = 0.94
    - Math.min(0.16, playerRelationship.debt / 260)
    - npcDefinition.personality.affection / 1400
    - npcDefinition.personality.loyalty / 1400

  if (roll <= threshold) return null

  const goldGain = 10 + Math.floor(Math.max(playerRelationship.debt, playerRelationship.favor) * 0.18)
  const cultivationGain = 8 + Math.floor(npcDefinition.aptitude.luck * 0.1)

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: npcDefinition.sectId ? 'sectDuty' : 'adventure'
    },
    playerEffect: {
      goldDelta: goldGain,
      cultivationDelta: cultivationGain
    },
    relationshipDeltas: [
      {
        npcId: npcState.id,
        favorDelta: 1,
        debtDelta: -4
      }
    ],
    logs: [
      {
        scope: 'npc',
        severity: 'normal',
        title: `${npcDefinition.name}暗中相助`,
        text: `${npcDefinition.name}偿还旧情，为你送来${goldGain}枚灵石与一份机缘线索。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'relationship', 'aid']
      }
    ]
  })
}

function resolveFearTributeAction(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, playerRelationship, clock } = context
  if (playerRelationship.fear < 45 || npcState.hpState === 'injured') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'relationship-fear-tribute')
  const threshold = 0.95
    - Math.min(0.18, playerRelationship.fear / 300)
    - npcDefinition.personality.greed / 1800
    - npcDefinition.personality.caution / 1600

  if (roll <= threshold) return null

  const goldGain = 8 + Math.floor(playerRelationship.fear * 0.16)
  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      currentGoal: 'cultivate'
    },
    playerEffect: {
      goldDelta: goldGain
    },
    relationshipDeltas: [
      {
        npcId: npcState.id,
        debtDelta: 3,
        fearDelta: -2
      }
    ],
    logs: [
      {
        scope: 'npc',
        severity: 'normal',
        title: `${npcDefinition.name}避祸献礼`,
        text: `${npcDefinition.name}畏惧与你正面冲突，悄悄送来${goldGain}枚灵石，试图平息你的注意。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'relationship', 'tribute']
      }
    ]
  })
}

export function resolveRelationshipDrivenNpcAction(context: WorldRuntimeNpcContext) {
  const ticksSinceAction = context.clock.totalTicks - context.npcState.lastActionTick
  if (ticksSinceAction < 2) return null

  return resolveRetaliationAction(context)
    || resolveCompanionSupportAction(context)
    || resolveDebtAidAction(context)
    || resolveFearTributeAction(context)
}
