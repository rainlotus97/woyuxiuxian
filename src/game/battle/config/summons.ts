import type { Element, Quality, Realm, UnitStats } from '@/types/unit'

export interface SummonDefinition {
  id: string
  name: string
  icon: string
  element: Element
  realm: Realm
  realmLevel: number
  quality: Quality
  level: number
  aiType: 'aggressive' | 'defensive' | 'support' | 'balanced'
  maxActivePerOwner: number
  durationTurns: number
  stats: UnitStats
  skills: string[]
}

export const SUMMON_DEFINITIONS: Record<string, SummonDefinition> = {
  abyss_guard: {
    id: 'abyss_guard',
    name: '深渊魔侍',
    icon: 'skull',
    element: '火',
    realm: '金丹',
    realmLevel: 3,
    quality: '玄品',
    level: 24,
    aiType: 'aggressive',
    maxActivePerOwner: 2,
    durationTurns: 2,
    stats: {
      maxHp: 180,
      currentHp: 180,
      maxMp: 40,
      currentMp: 40,
      attack: 42,
      defense: 12,
      speed: 96,
      critRate: 0.08,
      critDamage: 1.45
    },
    skills: ['abyss_claw']
  },
  spirit_sword: {
    id: 'spirit_sword',
    name: '灵剑化身',
    icon: 'sword',
    element: '金',
    realm: '筑基',
    realmLevel: 5,
    quality: '玄品',
    level: 18,
    aiType: 'aggressive',
    maxActivePerOwner: 3,
    durationTurns: 3,
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 0,
      currentMp: 0,
      attack: 38,
      defense: 8,
      speed: 112,
      critRate: 0.1,
      critDamage: 1.5
    },
    skills: ['spirit_sword_cut']
  }
}

export function getSummonDefinition(id: string): SummonDefinition | undefined {
  return SUMMON_DEFINITIONS[id]
}
