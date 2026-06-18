import type { StatusEffect } from '@/types/unit'

export interface BattleStatusModifierInput {
  statusEffects: StatusEffect[]
}

export function resolveBattleAttackModifier(input: BattleStatusModifierInput) {
  let modifier = 1
  for (const effect of input.statusEffects) {
    if (effect.duration <= 0) continue
    if (effect.type === 'buff_atk') modifier *= 1 + (effect.value ?? 0.2)
    if (effect.type === 'debuff_atk') modifier *= 1 - (effect.value ?? 0.2)
  }
  return Math.max(0.05, modifier)
}

export function resolveBattleDefenseTakenModifier(input: BattleStatusModifierInput) {
  let modifier = 1
  for (const effect of input.statusEffects) {
    if (effect.duration <= 0) continue
    if (effect.type === 'buff_def') modifier *= 1 - (effect.value ?? 0.2)
    if (effect.type === 'debuff_def') modifier *= 1 + (effect.value ?? 0.2)
    if (effect.type === 'vulnerable') modifier *= 1 + (effect.value ?? 0.25)
  }
  return Math.max(0.05, modifier)
}

export function resolveBattleDamageModifier(input: {
  attackerStatuses: StatusEffect[]
  targetStatuses: StatusEffect[]
}) {
  return resolveBattleAttackModifier({ statusEffects: input.attackerStatuses })
    * resolveBattleDefenseTakenModifier({ statusEffects: input.targetStatuses })
}

export function resolveBattleSpeedModifier(input: BattleStatusModifierInput) {
  let modifier = 1
  for (const effect of input.statusEffects) {
    if (effect.duration <= 0) continue
    if (effect.type === 'buff_spd') modifier *= 1 + (effect.value ?? 0.2)
  }
  return Math.max(0.05, modifier)
}
