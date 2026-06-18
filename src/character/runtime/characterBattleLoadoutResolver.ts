import type { Element, Quality, Realm, StatusEffect, Unit, UnitStats } from '@/types/unit'

export interface CharacterBattleLoadoutInput {
  id: string
  name: string
  icon: string
  element: Element
  realm: Realm
  realmLevel: number
  quality: Quality
  level: number
  stats: UnitStats
  skillIds: string[]
  statusEffects: StatusEffect[]
}

export function resolveCharacterBattleUnit(input: CharacterBattleLoadoutInput): Unit {
  return {
    id: input.id,
    name: input.name,
    type: 'protagonist',
    element: input.element,
    realm: input.realm,
    realmLevel: input.realmLevel,
    quality: input.quality,
    level: input.level,
    stats: { ...input.stats },
    skills: [...input.skillIds],
    statusEffects: input.statusEffects.map(effect => ({ ...effect })),
    isAlive: input.stats.currentHp > 0,
    icon: input.icon
  }
}
