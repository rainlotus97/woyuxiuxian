import type { WorldRuntimeNpcActionResult, WorldRuntimeNpcContext } from './worldRuntimeTypes'
import { getConstitutionLabel, getGrowthFlawLabel } from './npcProfile'
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

function resolveBloodlineAwakening(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if (npcState.flags.includes('lineage_awakened')) return null
  if (npcDefinition.aptitude.bloodlineGrade !== 'awakened' && npcDefinition.aptitude.bloodlineGrade !== 'ancient') {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, npcDefinition.aptitude.bloodlineGrade, 'lineage-awaken')
  const threshold = npcDefinition.aptitude.bloodlineGrade === 'ancient' ? 0.935 : 0.958
  if (roll <= threshold) return null

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      cultivationDelta: npcDefinition.aptitude.bloodlineGrade === 'ancient' ? 96 : 62,
      notorietyDelta: npcDefinition.aptitude.bloodlineGrade === 'ancient' ? 9 : 5,
      currentGoal: 'cultivate',
      addFlags: ['lineage_awakened']
    },
    logs: [
      {
        scope: 'npc',
        severity: npcDefinition.aptitude.bloodlineGrade === 'ancient' ? 'legendary' : 'major',
        title: `${npcDefinition.name}血脉觉醒`,
        text: `${npcDefinition.name}体内${npcDefinition.profile.bloodline}，一夜之间气机暴涨，连同附近灵脉都起了微弱回响。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'lineage', 'awakening', npcDefinition.aptitude.bloodlineGrade]
      }
    ]
  })
}

function resolveForbiddenBloodBacklash(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock } = context
  if (npcDefinition.aptitude.bloodlineGrade !== 'forbidden' || npcState.hpState !== 'healthy') return null
  if (npcState.flags.includes('forbidden_blood_backlash') && seededWorldRoll(clock.totalTicks, npcState.id, 'backlash-repeat') < 0.72) {
    return null
  }

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, 'forbidden-backlash')
  if (roll <= 0.965) return null

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      hpState: 'injured',
      currentGoal: 'recover',
      notorietyDelta: 8,
      addFlags: ['forbidden_blood_backlash']
    },
    logs: [
      {
        scope: 'npc',
        severity: 'major',
        title: `${npcDefinition.name}禁血反噬`,
        text: `${npcDefinition.name}强行压制禁血失败，所在区域残留大片污浊灵焰，已有修士开始避开此地。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'lineage', 'backlash', 'forbidden']
      }
    ]
  })
}

function resolveConstitutionOpportunity(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock, weather } = context
  if (npcState.flags.includes(`constitution_${npcDefinition.aptitude.constitution}`)) return null

  const constitution = npcDefinition.aptitude.constitution
  const weatherMatch =
    (constitution === 'thunder_body' && weather === 'storm')
    || (constitution === 'ice_heart' && weather === 'mist')
    || (constitution === 'medicine_body' && weather === 'rain')
    || constitution === 'void_meridian'
    || constitution === 'star_meridian'
    || constitution === 'sword_bone'

  if (!weatherMatch) return null

  const roll = seededWorldRoll(clock.totalTicks, npcState.id, constitution, weather, 'constitution-opportunity')
  if (roll <= 0.94) return null

  const label = getConstitutionLabel(constitution)
  const cultivationGain = constitution === 'void_meridian' || constitution === 'star_meridian' ? 88 : 58

  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      cultivationDelta: cultivationGain,
      currentGoal: constitution === 'medicine_body' ? 'seekTreasure' : 'cultivate',
      notorietyDelta: 5,
      addFlags: [`constitution_${constitution}`]
    },
    logs: [
      {
        scope: 'npc',
        severity: constitution === 'void_meridian' || constitution === 'star_meridian' ? 'major' : 'normal',
        title: `${npcDefinition.name}体质感应`,
        text: `${npcDefinition.name}的${label}被天地气机牵动，借势参悟了一段新的修行关窍。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'constitution', constitution]
      }
    ]
  })
}

function resolveGrowthFlawRepair(context: WorldRuntimeNpcContext) {
  const { npcDefinition, npcState, clock, playerRelationship } = context
  const flaws = npcDefinition.aptitude.growthFlaws.filter(flaw => flaw !== 'none')
  if (!flaws.length || npcState.flags.includes('growth_flaw_tempered')) return null

  const supportBonus = playerRelationship.favor >= 60 || playerRelationship.debt >= 45 ? 0.025 : 0
  const roll = seededWorldRoll(clock.totalTicks, npcState.id, flaws.join(','), 'growth-flaw-repair')
  if (roll <= 0.962 - supportBonus) return null

  const label = flaws.map(getGrowthFlawLabel).join('、')
  return withActionStamp(context, {
    npcPatch: {
      id: npcState.id,
      cultivationDelta: 46,
      notorietyDelta: 4,
      currentGoal: 'cultivate',
      addFlags: ['growth_flaw_tempered']
    },
    relationshipDeltas: playerRelationship.favor >= 60
      ? [{ npcId: npcState.id, favorDelta: 4, debtDelta: -2 }]
      : undefined,
    logs: [
      {
        scope: 'npc',
        severity: 'normal',
        title: `${npcDefinition.name}磨砺缺陷`,
        text: `${npcDefinition.name}闭关数日，终于将${label}压下一线，心性与灵力都更稳了些。`,
        actorIds: [npcState.id],
        mapId: npcState.locationMapId,
        tags: ['npc', 'growth-flaw', 'tempered']
      }
    ]
  })
}

export function resolveLineageDrivenNpcAction(context: WorldRuntimeNpcContext) {
  return resolveForbiddenBloodBacklash(context)
    || resolveBloodlineAwakening(context)
    || resolveConstitutionOpportunity(context)
    || resolveGrowthFlawRepair(context)
}
