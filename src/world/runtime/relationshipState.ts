import type { RelationshipState } from '@/types/world'

export interface RelationshipDeltaInput {
  favorDelta?: number
  hatredDelta?: number
  fearDelta?: number
  debtDelta?: number
}

export function createDefaultRelationshipState(): RelationshipState {
  return {
    favor: 0,
    hatred: 0,
    fear: 0,
    debt: 0,
    bond: 'stranger'
  }
}

export function resolveBondFromFavor(favor: number): RelationshipState['bond'] {
  if (favor >= 90) return 'lover'
  if (favor >= 70) return 'companion'
  if (favor >= 45) return 'friend'
  if (favor <= -60) return 'enemy'
  if (favor <= -25) return 'rival'
  return 'stranger'
}

export function applyRelationshipDeltaToState(
  relationship: RelationshipState,
  input: RelationshipDeltaInput
) {
  relationship.favor += input.favorDelta || 0
  relationship.hatred = Math.max(0, relationship.hatred + (input.hatredDelta || 0))
  relationship.fear = Math.max(0, relationship.fear + (input.fearDelta || 0))
  relationship.debt = Math.max(0, relationship.debt + (input.debtDelta || 0))
  relationship.bond = resolveBondFromFavor(relationship.favor)
  return relationship
}
