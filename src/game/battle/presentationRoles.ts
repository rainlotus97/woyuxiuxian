import type { Unit } from '@/types/unit'

export type BattleActorRole =
  | 'protagonist'
  | 'companion'
  | 'pet'
  | 'summon'
  | 'enemy'
  | 'elite'
  | 'boss'

export function isSummonedUnit(unit: Pick<Unit, 'id' | 'type'>): boolean {
  return unit.type === 'summon' || unit.id.startsWith('summon_')
}

export function getBattleActorRole(unit: Pick<Unit, 'id' | 'name' | 'type' | 'quality'>, side: 'ally' | 'enemy'): BattleActorRole {
  if (unit.type === 'protagonist') return 'protagonist'
  if (unit.type === 'companion') return 'companion'
  if (unit.type === 'pet') return 'pet'
  if (isSummonedUnit(unit)) return 'summon'

  if (side === 'enemy') {
    if (unit.name.includes('[BOSS]') || unit.quality === '仙品' || unit.quality === '神品') {
      return 'boss'
    }
    if (unit.name.includes('[精英]') || unit.quality === '玄品') {
      return 'elite'
    }
    return 'enemy'
  }

  return 'companion'
}

export function getBattleSpriteKey(role: BattleActorRole, side: 'ally' | 'enemy') {
  if (side === 'ally') return 'actor_ally'
  if (role === 'boss') return 'actor_boss'
  return 'actor_enemy'
}
