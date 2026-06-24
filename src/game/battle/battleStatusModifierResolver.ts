import { ELEMENT_COUNTER, type Element, type StatusEffect } from '@/types/unit'

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
  attackerElement?: Element
  targetElement?: Element
}) {
  return resolveBattleAttackModifier({ statusEffects: input.attackerStatuses })
    * resolveBattleDefenseTakenModifier({ statusEffects: input.targetStatuses })
    * resolveBattleElementDamageModifier({
      attackerElement: input.attackerElement,
      targetElement: input.targetElement,
      attackerStatuses: input.attackerStatuses
    })
}

export function resolveBattleSpeedModifier(input: BattleStatusModifierInput) {
  let modifier = 1
  for (const effect of input.statusEffects) {
    if (effect.duration <= 0) continue
    if (effect.type === 'buff_spd') modifier *= 1 + (effect.value ?? 0.2)
  }
  return Math.max(0.05, modifier)
}

export function resolveBattleLifestealAmount(input: {
  damage: number
  attackerStatuses: StatusEffect[]
  missingHp: number
}) {
  if (input.damage <= 0 || input.missingHp <= 0) return 0
  let rate = 0
  for (const effect of input.attackerStatuses) {
    if (effect.duration <= 0) continue
    if (effect.type === 'lifesteal') rate += Math.max(0, effect.value ?? 0)
  }
  return Math.min(input.missingHp, Math.floor(input.damage * rate))
}

export function resolveBattleDodgeChance(input: BattleStatusModifierInput) {
  let chance = 0
  for (const effect of input.statusEffects) {
    if (effect.duration <= 0) continue
    if (effect.type === 'dodge') chance += Math.max(0, effect.value ?? 0)
  }
  return Math.min(0.65, chance)
}

export function resolveBattleElementDamageModifier(input: {
  attackerStatuses: StatusEffect[]
  attackerElement?: Element
  targetElement?: Element
}) {
  if (!input.attackerElement || !input.targetElement) return 1
  if (ELEMENT_COUNTER[input.attackerElement] !== input.targetElement) return 1

  let bonus = 0
  for (const effect of input.attackerStatuses) {
    if (effect.duration <= 0) continue
    if (effect.type === 'element_damage') bonus += Math.max(0, effect.value ?? 0.1)
  }
  return 1 + Math.min(0.8, bonus)
}

export function resolveBattleCounterDamage(input: {
  incomingDamage: number
  defenderAttack: number
  defenderStatuses: StatusEffect[]
}) {
  if (input.incomingDamage <= 0) return 0

  let rate = 0
  for (const effect of input.defenderStatuses) {
    if (effect.duration <= 0) continue
    if (effect.type === 'counter') rate += Math.max(0, effect.value ?? 0)
  }
  if (rate <= 0) return 0

  const damageFromHit = input.incomingDamage * rate
  const damageFromAttack = input.defenderAttack * rate * 0.45
  return Math.max(1, Math.floor(Math.max(damageFromHit, damageFromAttack)))
}
