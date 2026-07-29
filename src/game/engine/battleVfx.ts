import type { BattleEffectType } from '@/game/battle/battleEffectsConfig'

export interface BattleVfxCommand {
  id: string
  type: 'projectile' | 'burst' | 'beam' | 'impact' | 'shake' | 'flash' | 'status' | 'damage-number' | 'death' | 'heal'
  effect: BattleEffectType
  actorId?: string
  targetId?: string
  targetIds?: string[]
  value?: number
  duration?: number
  seed?: number
  statusType?: string
  phase?: number
  reason?: string
  label?: string
}

export function createBattleVfxCommand(
  type: BattleVfxCommand['type'],
  effect: BattleEffectType,
  input: Omit<BattleVfxCommand, 'id' | 'type' | 'effect'> = {}
): BattleVfxCommand {
  return {
    id: `vfx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    effect,
    duration: input.duration ?? 420,
    seed: input.seed ?? Math.floor(Math.random() * 100000),
    ...input
  }
}
