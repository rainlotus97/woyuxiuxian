import type { NpcDefinition, NpcRuntimeState, RelationshipState, WorldClock } from '@/types/world'
import { applyRelationshipDeltaToState } from './relationshipState'

export type NpcInteractionKind = 'greet' | 'invite'

export interface NpcCompanionCandidate {
  id: string
  name: string
  title: string
  role: NpcDefinition['role']
  realm: string
  locationName: string
  bond: RelationshipState['bond']
  favor: number
  canInvite: boolean
  actionLabel: string
  statusLabel: string
  summary: string
}

export interface NpcInteractionResolution {
  success: boolean
  npcId: string
  kind: NpcInteractionKind
  title: string
  text: string
  favorDelta: number
  nextBond: RelationshipState['bond']
  severity: 'normal' | 'major'
}

export function resolveNpcCompanionCandidates(input: {
  definitions: NpcDefinition[]
  states: NpcRuntimeState[]
  unlockedNpcIds: string[]
  getRelationship: (npcId: string) => RelationshipState
  getLocationName: (areaId?: string) => string
}): NpcCompanionCandidate[] {
  return input.definitions
    .filter(definition => input.unlockedNpcIds.includes(definition.id))
    .map(definition => {
      const state = input.states.find(item => item.id === definition.id)
      const relationship = input.getRelationship(definition.id)
      const canInvite = relationship.favor >= 45 || relationship.bond === 'friend' || relationship.bond === 'companion' || relationship.bond === 'lover'
      const isCompanion = relationship.bond === 'companion' || relationship.bond === 'lover'
      return {
        id: definition.id,
        name: definition.name,
        title: definition.profile.title,
        role: definition.role,
        realm: state ? `${state.realm}${state.realmLevel}层` : '境界未明',
        locationName: input.getLocationName(state?.locationMapId ?? definition.homeMapId),
        bond: relationship.bond,
        favor: relationship.favor,
        canInvite,
        actionLabel: isCompanion ? '并肩同行' : canInvite ? '邀约同行' : '结识问候',
        statusLabel: isCompanion ? '同行伙伴' : canInvite ? '可邀约' : '待结识',
        summary: definition.profile.identityHook
      }
    })
    .sort((a, b) => {
      const roleScore: Record<NpcDefinition['role'], number> = {
        main: 40,
        companion: 32,
        sect: 20,
        random: 8,
        enemy: 0
      }
      return (roleScore[b.role] + b.favor) - (roleScore[a.role] + a.favor)
    })
}

export function resolveNpcPlayerInteraction(input: {
  definition: NpcDefinition | undefined
  state: NpcRuntimeState | undefined
  relationship: RelationshipState
  clock: WorldClock
  kind?: NpcInteractionKind
}): NpcInteractionResolution | null {
  if (!input.definition || !input.state || input.state.hpState === 'dead' || input.state.hpState === 'captured') {
    return null
  }

  const kind = input.kind ?? (input.relationship.favor >= 45 ? 'invite' : 'greet')
  const baseDelta = kind === 'invite' ? 10 : 8
  const roleBonus = input.definition.role === 'companion' || input.definition.role === 'main' ? 2 : 0
  const favorDelta = Math.max(2, baseDelta + roleBonus - Math.floor(Math.max(0, input.relationship.favor) / 45))
  const nextRelationship = applyRelationshipDeltaToState(input.relationship, { favorDelta })
  const isCompanion = nextRelationship.bond === 'companion' || nextRelationship.bond === 'lover'
  const title = isCompanion ? `${input.definition.name}愿与你同行` : `${input.definition.name}与你结缘`
  const text = isCompanion
    ? `${input.definition.name}与你立下同行之约，后续历险与剧情中更容易被卷入你的命运线。`
    : `${input.definition.name}记下了这次交谈，对你的态度更近了一分。`

  return {
    success: true,
    npcId: input.definition.id,
    kind,
    title,
    text,
    favorDelta,
    nextBond: nextRelationship.bond,
    severity: isCompanion || favorDelta >= 10 ? 'major' : 'normal'
  }
}
