import type {
  NpcDefinition,
  NpcRuntimeState,
  RelationshipState
} from '@/types/world'
import {
  applyRelationshipDeltaToState,
  createDefaultRelationshipState
} from './relationshipState'
import { getNpcDestinyPressure } from './npcProfile'
import { seededWorldRoll } from './worldSeed'

function hasSharedTag(actor: NpcDefinition, target: NpcDefinition) {
  return actor.tags.some(tag => target.tags.includes(tag))
}

function getTalentPressure(target: NpcDefinition) {
  return getNpcDestinyPressure(target)
}

export function createSeededNpcRelationshipState(
  actorDefinition: NpcDefinition,
  targetDefinition: NpcDefinition
): RelationshipState {
  const state = createDefaultRelationshipState()

  if (actorDefinition.id === targetDefinition.id) {
    return state
  }

  if (actorDefinition.sectId && actorDefinition.sectId === targetDefinition.sectId) {
    applyRelationshipDeltaToState(state, {
      favorDelta: 12 + Math.floor((actorDefinition.personality.loyalty + actorDefinition.personality.affection) / 18),
      debtDelta: 4
    })
  }

  if (hasSharedTag(actorDefinition, targetDefinition)) {
    applyRelationshipDeltaToState(state, {
      favorDelta: 6
    })
  }

  if (actorDefinition.role === 'enemy' || targetDefinition.role === 'enemy') {
    applyRelationshipDeltaToState(state, {
      hatredDelta: 8 + Math.floor(actorDefinition.personality.cruelty / 16)
    })
  }

  if (actorDefinition.personality.ambition > 72) {
    applyRelationshipDeltaToState(state, {
      hatredDelta: Math.floor(getTalentPressure(targetDefinition) / 2),
      fearDelta: targetDefinition.aptitude.willpower > actorDefinition.aptitude.willpower ? 4 : 0
    })
  }

  if (actorDefinition.personality.affection > 68 && targetDefinition.role === 'main') {
    applyRelationshipDeltaToState(state, {
      favorDelta: 8
    })
  }

  if (actorDefinition.personality.caution > 78 && targetDefinition.personality.cruelty > 75) {
    applyRelationshipDeltaToState(state, {
      fearDelta: 10
    })
  }

  if (actorDefinition.personality.greed > 70 && targetDefinition.aptitude.luck > 75) {
    applyRelationshipDeltaToState(state, {
      debtDelta: 3,
      favorDelta: 2
    })
  }

  const variance = seededWorldRoll(actorDefinition.id, targetDefinition.id, 'npc-network-variance')
  if (variance > 0.84) {
    applyRelationshipDeltaToState(state, { favorDelta: 4 })
  } else if (variance < 0.14) {
    applyRelationshipDeltaToState(state, { hatredDelta: 4 })
  }

  return state
}

export function buildNpcRelationshipNetwork(definitions: NpcDefinition[]) {
  const relationshipsByNpcId: Record<string, Record<string, RelationshipState>> = {}

  for (const actorDefinition of definitions) {
    const relationships: Record<string, RelationshipState> = {}
    for (const targetDefinition of definitions) {
      if (targetDefinition.id === actorDefinition.id) continue
      relationships[targetDefinition.id] = createSeededNpcRelationshipState(actorDefinition, targetDefinition)
    }
    relationshipsByNpcId[actorDefinition.id] = relationships
  }

  return relationshipsByNpcId
}

export function mergeNpcRelationshipNetwork(
  definitions: NpcDefinition[],
  states: NpcRuntimeState[]
): NpcRuntimeState[] {
  const defaultNetwork = buildNpcRelationshipNetwork(definitions)
  const definitionById = new Map(definitions.map(definition => [definition.id, definition]))
  const normalizedById = new Map(states.map(state => {
    const definition = definitionById.get(state.id)
    const defaultRelationships = defaultNetwork[state.id] ?? {}
    const mergedRelationships: Record<string, RelationshipState> = {
      ...(state.relationships ?? {})
    }

    for (const [targetId, relationship] of Object.entries(defaultRelationships)) {
      if (!mergedRelationships[targetId]) {
        mergedRelationships[targetId] = relationship
      }
    }

    return [state.id, {
      ...state,
      realm: state.realm ?? '炼气',
      realmLevel: state.realmLevel ?? 1,
      cultivation: state.cultivation ?? 0,
      hpState: state.hpState ?? 'healthy',
      locationMapId: state.locationMapId ?? definition?.homeMapId ?? '',
      currentGoal: state.currentGoal ?? ((definition?.personality.ambition ?? 0) > 80 ? 'challenge' : (definition?.personality.caution ?? 0) > 80 ? 'cultivate' : 'adventure'),
      relationships: mergedRelationships,
      flags: state.flags ?? [],
      notoriety: state.notoriety ?? 0,
      lastActionTick: state.lastActionTick ?? 0
    }]
  }))

  return definitions.map(definition => {
    const normalized = normalizedById.get(definition.id)
    if (normalized) return normalized

    const created: NpcRuntimeState = {
      id: definition.id,
      realm: '炼气',
      realmLevel: 1 + Math.floor(definition.aptitude.comprehension / 25),
      cultivation: 0,
      hpState: 'healthy',
      locationMapId: definition.homeMapId,
      currentGoal: definition.personality.ambition > 80 ? 'challenge' : definition.personality.caution > 80 ? 'cultivate' : 'adventure',
      relationships: defaultNetwork[definition.id] ?? {},
      flags: [],
      notoriety: 0,
      lastActionTick: 0
    }
    return created
  })
}

function getInteractionUrgency(relationship: RelationshipState) {
  const bondWeight = {
    stranger: 0,
    friend: 12,
    rival: 16,
    enemy: 22,
    mentor: 10,
    companion: 18,
    lover: 14
  } as const

  return relationship.hatred * 1.35
    + relationship.favor * 0.72
    + relationship.debt * 0.84
    + relationship.fear * 0.9
    + bondWeight[relationship.bond]
}

export function pickNpcInteractionTarget(
  actorDefinition: NpcDefinition,
  actorState: NpcRuntimeState,
  actorRelationships: Record<string, RelationshipState>,
  npcDefinitions: Map<string, NpcDefinition>,
  npcStates: NpcRuntimeState[],
  totalTicks: number,
  engagedNpcIds: Set<string>
) {
  let chosen: NpcRuntimeState | null = null
  let bestScore = 0

  for (const targetState of npcStates) {
    if (targetState.id === actorState.id || engagedNpcIds.has(targetState.id)) continue
    if (targetState.hpState === 'dead' || targetState.hpState === 'captured') continue

    const targetDefinition = npcDefinitions.get(targetState.id)
    const relationship = actorRelationships[targetState.id]
    if (!targetDefinition || !relationship) continue

    let score = getInteractionUrgency(relationship)
    if (actorState.locationMapId === targetState.locationMapId) score += 14
    if (actorDefinition.sectId && actorDefinition.sectId === targetDefinition.sectId) score += 8
    score += seededWorldRoll(totalTicks, actorState.id, targetState.id, 'npc-network-target') * 3

    if (score > bestScore && score >= 20) {
      bestScore = score
      chosen = targetState
    }
  }

  return chosen
}
