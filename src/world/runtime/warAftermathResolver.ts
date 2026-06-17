import { getSectById, type SectDefinition } from '@/types/sect'
import type { NpcDefinition, NpcRuntimeState } from '@/types/world'
import type { SectWarResolution } from '@/sect/runtime/sectWorldTypes'
import { seededWorldRoll } from './worldSeed'
import type { WorldRuntimeAftermathResult, WorldRuntimeNpcPatch, WorldRuntimeRelationshipDelta } from './worldRuntimeTypes'

interface WarAftermathContext {
  totalTicks: number
  warResolution: SectWarResolution
  npcDefinitions: NpcDefinition[]
  npcStates: NpcRuntimeState[]
}

function getWinningSectId(warResolution: SectWarResolution) {
  return warResolution.winner === 'attacker'
    ? warResolution.attackerSectId
    : warResolution.defenderSectId
}

function getLosingSectId(warResolution: SectWarResolution) {
  return warResolution.winner === 'attacker'
    ? warResolution.defenderSectId
    : warResolution.attackerSectId
}

function pickAffectedNpc(
  definitions: NpcDefinition[],
  states: NpcRuntimeState[],
  sectId: string,
  excludeCaptured = true
) {
  return definitions
    .map(definition => ({
      definition,
      state: states.find(state => state.id === definition.id)
    }))
    .filter((item): item is { definition: NpcDefinition; state: NpcRuntimeState } => Boolean(item.state))
    .filter(item => item.definition.sectId === sectId)
    .filter(item => item.state.hpState !== 'dead')
    .filter(item => !excludeCaptured || item.state.hpState !== 'captured')
    .sort((a, b) => {
      if (b.state.realmLevel !== a.state.realmLevel) return b.state.realmLevel - a.state.realmLevel
      return b.definition.aptitude.talent.localeCompare(a.definition.aptitude.talent)
    })[0] ?? null
}

function resolveSectAftershock(
  losingSect: SectDefinition | undefined,
  winningSect: SectDefinition | undefined
) {
  if (!losingSect || !winningSect) return null
  return {
    scope: 'sect' as const,
    severity: 'major' as const,
    title: `${losingSect.name}元气受创`,
    text: `${losingSect.name}在与${winningSect.name}的战后大伤元气，门下弟子开始收缩防线。`,
    actorIds: [winningSect.id, losingSect.id],
    tags: ['sect', 'war', 'aftershock'],
    mapId: losingSect.areaId
  }
}

function resolveCaptureOutcome(
  totalTicks: number,
  losingNpc: { definition: NpcDefinition; state: NpcRuntimeState } | null,
  winningSectId: string
) {
  if (!losingNpc) return null
  if (losingNpc.definition.tags.includes('主线保护')) return null

  const captureRoll = seededWorldRoll(totalTicks, losingNpc.definition.id, winningSectId, 'war-aftermath-capture')
  if (captureRoll <= 0.82) return null

  const npcPatch: WorldRuntimeNpcPatch = {
    id: losingNpc.definition.id,
    hpState: 'captured',
    currentGoal: 'recover',
    addFlags: [`captured_by:${winningSectId}`]
  }

  return {
    npcPatches: [npcPatch],
    logs: [
      {
        scope: 'world' as const,
        severity: 'major' as const,
        title: `${losingNpc.definition.name}被俘`,
        text: `${losingNpc.definition.name}在宗门败退中失手被擒，生死未卜。`,
        actorIds: [losingNpc.definition.id],
        tags: ['npc', 'war', 'captured'],
        mapId: losingNpc.state.locationMapId
      }
    ]
  }
}

function resolveNpcResentment(
  losingNpc: { definition: NpcDefinition; state: NpcRuntimeState } | null,
  winningSectId: string
) {
  if (!losingNpc) return null

  const relationshipDeltas: WorldRuntimeRelationshipDelta[] = [
    {
      npcId: losingNpc.definition.id,
      subjectId: 'player',
      fearDelta: 4
    }
  ]

  if (losingNpc.definition.sectId === winningSectId) {
    relationshipDeltas[0]!.favorDelta = -3
  } else {
    relationshipDeltas[0]!.hatredDelta = 5
  }

  return relationshipDeltas
}

export function resolveWarAftermath(context: WarAftermathContext): WorldRuntimeAftermathResult | null {
  const { totalTicks, warResolution, npcDefinitions, npcStates } = context
  const winningSectId = getWinningSectId(warResolution)
  const losingSectId = getLosingSectId(warResolution)
  const winningSect = getSectById(winningSectId)
  const losingSect = getSectById(losingSectId)
  const losingNpc = pickAffectedNpc(npcDefinitions, npcStates, losingSectId)

  const npcPatches: WorldRuntimeNpcPatch[] = []
  const relationshipDeltas: WorldRuntimeRelationshipDelta[] = []
  const logs = []

  const captureResult = resolveCaptureOutcome(totalTicks, losingNpc, winningSectId)
  if (captureResult?.npcPatches?.length) {
    npcPatches.push(...captureResult.npcPatches)
  }
  if (captureResult?.logs?.length) {
    logs.push(...captureResult.logs)
  }

  const resentment = resolveNpcResentment(losingNpc, winningSectId)
  if (resentment?.length) {
    relationshipDeltas.push(...resentment)
  }

  const sectAftershock = resolveSectAftershock(losingSect, winningSect)
  if (sectAftershock) {
    logs.push(sectAftershock)
  }

  if (!npcPatches.length && !relationshipDeltas.length && !logs.length) {
    return null
  }

  return {
    npcPatches: npcPatches.length ? npcPatches : undefined,
    relationshipDeltas: relationshipDeltas.length ? relationshipDeltas : undefined,
    logs: logs.length ? logs : undefined
  }
}
