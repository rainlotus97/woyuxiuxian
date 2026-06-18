import type { SkillEffect } from '@/types/skill'
import type { StatusEffect, StatusEffectType } from '@/types/unit'
import type {
  BattleRuntimeHit,
  BattleRuntimeUnit,
  BattleTurnStartResolution
} from './runtimeTypes'

const DAMAGE_OVER_TIME_DEFAULTS: Partial<Record<StatusEffectType, number>> = {
  poison: 8,
  burn: 10
}

export function cloneStatusEffect(status: StatusEffect): StatusEffect {
  return { ...status }
}

export function cloneRuntimeUnits(units: BattleRuntimeUnit[]): BattleRuntimeUnit[] {
  return units.map(unit => ({
    ...unit,
    stats: { ...unit.stats },
    skillCooldowns: { ...unit.skillCooldowns },
    statusEffects: unit.statusEffects.map(cloneStatusEffect)
  }))
}

export function hasStatusEffect(unit: BattleRuntimeUnit, type: StatusEffectType): boolean {
  return unit.statusEffects.some(effect => effect.type === type && effect.duration > 0)
}

export function resolveStatusEffectFromSkill(
  actor: BattleRuntimeUnit,
  effect: SkillEffect
): StatusEffect | null {
  const template = effect.statusEffect
  if (!template) return null
  if (Math.random() > template.chance) return null

  return {
    type: template.type,
    duration: template.duration,
    value: template.value,
    sourceId: actor.id
  }
}

export function applyStatusEffectToUnit(target: BattleRuntimeUnit, status: StatusEffect): StatusEffect {
  const existing = target.statusEffects.find(effect => effect.type === status.type)
  if (!existing) {
    const applied = cloneStatusEffect(status)
    target.statusEffects.push(applied)
    return cloneStatusEffect(applied)
  }

  existing.duration = Math.max(existing.duration, status.duration)
  if (status.type === 'shield') {
    existing.value = (existing.value ?? 0) + (status.value ?? 0)
  } else if (status.value !== undefined) {
    existing.value = Math.max(existing.value ?? status.value, status.value)
  }
  existing.sourceId = status.sourceId ?? existing.sourceId
  return cloneStatusEffect(existing)
}

export function hasInvincibleStatus(target: BattleRuntimeUnit) {
  return hasStatusEffect(target, 'invincible')
}

export function absorbShield(target: BattleRuntimeUnit, incomingDamage: number) {
  let remainingDamage = incomingDamage
  let absorbed = 0

  for (const shield of target.statusEffects.filter(effect => effect.type === 'shield' && (effect.value ?? 0) > 0)) {
    if (remainingDamage <= 0) break
    const currentShield = shield.value ?? 0
    const consumed = Math.min(currentShield, remainingDamage)
    shield.value = currentShield - consumed
    remainingDamage -= consumed
    absorbed += consumed
  }

  cleanupStatusEffects(target)
  return { remainingDamage, absorbed }
}

export function resolveIncomingDamage(target: BattleRuntimeUnit, incomingDamage: number) {
  const rawDamage = Math.max(0, incomingDamage)
  if (rawDamage <= 0) return { remainingDamage: 0, absorbed: 0, negated: 0 }

  if (hasInvincibleStatus(target)) {
    return {
      remainingDamage: 0,
      absorbed: 0,
      negated: rawDamage
    }
  }

  const { remainingDamage, absorbed } = absorbShield(target, rawDamage)
  return {
    remainingDamage,
    absorbed,
    negated: 0
  }
}

export function cleanupStatusEffects(unit: BattleRuntimeUnit) {
  unit.statusEffects = unit.statusEffects.filter(effect => {
    if (effect.type === 'shield') {
      return effect.duration > 0 && (effect.value ?? 0) > 0
    }
    return effect.duration > 0
  })
}

export function processTurnStartStatuses(actor: BattleRuntimeUnit): BattleTurnStartResolution {
  const hits: BattleRuntimeHit[] = []
  const logs: string[] = []
  let actionBlocked = false

  for (const status of actor.statusEffects) {
    if (!actor.isAlive) break

    if (status.type === 'poison' || status.type === 'burn') {
      const rawDamage = Math.max(1, Math.floor(status.value ?? DAMAGE_OVER_TIME_DEFAULTS[status.type] ?? 6))
      const { remainingDamage, negated } = resolveIncomingDamage(actor, rawDamage)
      const damage = Math.min(actor.stats.currentHp, remainingDamage)

      if (damage > 0) {
        actor.stats.currentHp = Math.max(0, actor.stats.currentHp - damage)
        hits.push({
          actorId: status.sourceId ?? actor.id,
          targetId: actor.id,
          amount: damage,
          isCrit: false
        })
        logs.push(`${actor.name}受到${status.type === 'poison' ? '毒伤' : '灼烧'}侵蚀，损失${damage}点气血。`)
      } else if (negated > 0) {
        logs.push(`${actor.name}处于无敌状态，抵消了${status.type === 'poison' ? '毒伤' : '灼烧'}侵蚀。`)
      }

      if (actor.stats.currentHp <= 0) {
        actor.isAlive = false
        logs.push(`${actor.name}倒在持续伤害之下。`)
      }
    }

    if (actor.isAlive && (status.type === 'stun' || status.type === 'freeze')) {
      actionBlocked = true
      logs.push(`${actor.name}${status.type === 'stun' ? '被眩晕，无法行动。' : '被冰封，无法行动。'}`)
    }

    status.duration -= 1
  }

  cleanupStatusEffects(actor)

  return {
    hits,
    logs,
    actionBlocked,
    actorDefeated: !actor.isAlive
  }
}
