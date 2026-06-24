import type { Skill, SkillEffect } from '@/types/skill'
import type { BattleRuntimeUnit } from './runtimeTypes'
import type {
  BattleAppliedEffect,
  BattlePreparedEffect,
  BattleResolvedCommand,
  BattleRuntimeCommand
} from './runtimeTypes'
import { resolveCommandTargetIds, resolveEffectTargetIds } from './targeting'
import {
  applyStatusEffectToUnit,
  cloneRuntimeUnits,
  resolveIncomingDamage,
  resolveStatusEffectFromSkill
} from './statusRuntime'
import {
  resolveBattleCounterDamage,
  resolveBattleDamageModifier,
  resolveBattleDodgeChance,
  resolveBattleLifestealAmount
} from './battleStatusModifierResolver'

const BASIC_ATTACK_EFFECT: SkillEffect = {
  type: 'damage',
  targetType: 'single_enemy',
  baseValue: 5,
  scaling: 1.05
}

function calculateDamageAmount(
  attacker: BattleRuntimeUnit,
  target: BattleRuntimeUnit,
  effect: SkillEffect
) {
  const rawBase = attacker.stats.attack * effect.scaling + effect.baseValue - target.stats.defense * 0.55
  const variance = 0.92 + Math.random() * 0.16
  const isCrit = Math.random() < attacker.stats.critRate
  const critMultiplier = isCrit ? attacker.stats.critDamage : 1
  const statusModifier = resolveBattleDamageModifier({
    attackerStatuses: attacker.statusEffects,
    targetStatuses: target.statusEffects,
    attackerElement: attacker.element,
    targetElement: target.element
  })
  const modified = rawBase * statusModifier * variance * critMultiplier
  return {
    amount: Math.max(1, Math.floor(modified)),
    isCrit
  }
}

function calculateHealingAmount(
  healer: BattleRuntimeUnit,
  target: BattleRuntimeUnit,
  effect: SkillEffect
) {
  const rawHeal = effect.baseValue + healer.stats.attack * effect.scaling
  return Math.min(Math.max(0, Math.floor(rawHeal)), Math.max(0, target.stats.maxHp - target.stats.currentHp))
}

function buildPreparedEffects(
  command: BattleRuntimeCommand,
  actor: BattleRuntimeUnit,
  units: BattleRuntimeUnit[],
  skill: Skill | null
) {
  const preparedEffects: BattlePreparedEffect[] = []
  const effects = skill?.effects.length ? skill.effects : [BASIC_ATTACK_EFFECT]

  for (const effect of effects) {
    const targetIds = resolveEffectTargetIds(effect.targetType, actor, units, command.targetIds)
    for (const targetId of targetIds) {
      const target = units.find(unit => unit.id === targetId)
      if (!target || !target.isAlive) continue

      if (effect.type === 'damage') {
        const { amount, isCrit } = calculateDamageAmount(actor, target, effect)
        preparedEffects.push({
          actorId: actor.id,
          targetId,
          effectType: 'damage',
          rawAmount: amount,
          isCrit,
          isHeal: false
        })
      }

      if (effect.type === 'heal') {
        preparedEffects.push({
          actorId: actor.id,
          targetId,
          effectType: 'heal',
          rawAmount: calculateHealingAmount(actor, target, effect),
          isCrit: false,
          isHeal: true
        })
      }

      if (effect.type === 'buff' || effect.type === 'debuff') {
        const statusEffect = resolveStatusEffectFromSkill(actor, effect)
        if (statusEffect) {
          preparedEffects.push({
            actorId: actor.id,
            targetId,
            effectType: 'status',
            rawAmount: 0,
            isCrit: false,
            isHeal: false,
            statusEffect
          })
        }
      }

      if ((effect.type === 'damage' || effect.type === 'special') && effect.statusEffect) {
        const statusEffect = resolveStatusEffectFromSkill(actor, effect)
        if (statusEffect) {
          preparedEffects.push({
            actorId: actor.id,
            targetId,
            effectType: 'status',
            rawAmount: 0,
            isCrit: false,
            isHeal: false,
            statusEffect
          })
        }
      }
    }
  }

  return preparedEffects
}

export function applyPreparedEffects(
  units: BattleRuntimeUnit[],
  preparedEffects: BattlePreparedEffect[]
): BattleAppliedEffect[] {
  const appliedEffects: BattleAppliedEffect[] = []

  for (const preparedEffect of preparedEffects) {
    const target = units.find(unit => unit.id === preparedEffect.targetId)
    if (!target) continue

    if (!target.isAlive && preparedEffect.effectType !== 'heal') continue

    if (preparedEffect.effectType === 'damage') {
      const dodgeChance = resolveBattleDodgeChance({ statusEffects: target.statusEffects })
      if (dodgeChance > 0 && Math.random() < dodgeChance) {
        appliedEffects.push({
          actorId: preparedEffect.actorId,
          targetId: preparedEffect.targetId,
          effectType: 'damage',
          amount: 0,
          absorbed: preparedEffect.rawAmount,
          isCrit: preparedEffect.isCrit,
          isHeal: false,
          targetDefeated: false
        })
        continue
      }

      const { remainingDamage, absorbed, negated } = resolveIncomingDamage(target, preparedEffect.rawAmount)
      const damage = Math.min(target.stats.currentHp, remainingDamage)
      target.stats.currentHp = Math.max(0, target.stats.currentHp - damage)
      if (target.stats.currentHp <= 0) {
        target.isAlive = false
      }

      appliedEffects.push({
        actorId: preparedEffect.actorId,
        targetId: preparedEffect.targetId,
        effectType: 'damage',
        amount: damage,
        absorbed: absorbed + negated,
        isCrit: preparedEffect.isCrit,
        isHeal: false,
        targetDefeated: !target.isAlive
      })

      const attacker = units.find(unit => unit.id === preparedEffect.actorId)
      if (attacker && attacker.isAlive && damage > 0) {
        const lifesteal = resolveBattleLifestealAmount({
          damage,
          attackerStatuses: attacker.statusEffects,
          missingHp: Math.max(0, attacker.stats.maxHp - attacker.stats.currentHp)
        })
        if (lifesteal > 0) {
          attacker.stats.currentHp = Math.min(attacker.stats.maxHp, attacker.stats.currentHp + lifesteal)
          appliedEffects.push({
            actorId: preparedEffect.actorId,
            targetId: preparedEffect.actorId,
            effectType: 'heal',
            amount: lifesteal,
            absorbed: 0,
            isCrit: false,
            isHeal: true,
            targetDefeated: false
          })
        }

        if (target.isAlive && target.id !== attacker.id) {
          const counterRawDamage = resolveBattleCounterDamage({
            incomingDamage: damage,
            defenderAttack: target.stats.attack,
            defenderStatuses: target.statusEffects
          })
          if (counterRawDamage > 0) {
            const counterResolution = resolveIncomingDamage(attacker, counterRawDamage)
            const counterDamage = Math.min(attacker.stats.currentHp, counterResolution.remainingDamage)
            attacker.stats.currentHp = Math.max(0, attacker.stats.currentHp - counterDamage)
            if (attacker.stats.currentHp <= 0) {
              attacker.isAlive = false
            }
            appliedEffects.push({
              actorId: target.id,
              targetId: attacker.id,
              effectType: 'damage',
              amount: counterDamage,
              absorbed: counterResolution.absorbed + counterResolution.negated,
              isCrit: false,
              isHeal: false,
              targetDefeated: !attacker.isAlive
            })
          }
        }
      }
      continue
    }

    if (preparedEffect.effectType === 'heal') {
      const heal = Math.min(
        Math.max(0, preparedEffect.rawAmount),
        Math.max(0, target.stats.maxHp - target.stats.currentHp)
      )
      target.stats.currentHp = Math.min(target.stats.maxHp, target.stats.currentHp + heal)

      appliedEffects.push({
        actorId: preparedEffect.actorId,
        targetId: preparedEffect.targetId,
        effectType: 'heal',
        amount: heal,
        absorbed: 0,
        isCrit: false,
        isHeal: true,
        targetDefeated: false
      })
      continue
    }

    if (preparedEffect.effectType === 'status' && preparedEffect.statusEffect && target.isAlive) {
      const appliedStatus = applyStatusEffectToUnit(target, preparedEffect.statusEffect)
      appliedEffects.push({
        actorId: preparedEffect.actorId,
        targetId: preparedEffect.targetId,
        effectType: 'status',
        amount: 0,
        absorbed: 0,
        isCrit: false,
        isHeal: false,
        appliedStatus,
        targetDefeated: false
      })
    }
  }

  return appliedEffects
}

export function resolveBattleCommand(
  command: BattleRuntimeCommand,
  units: BattleRuntimeUnit[],
  actor: BattleRuntimeUnit,
  skill: Skill | null
): BattleResolvedCommand {
  const targetIds = resolveCommandTargetIds(command, actor, units, skill)
  const preparedEffects = buildPreparedEffects(
    {
      ...command,
      targetIds
    },
    actor,
    units,
    skill
  )
  const previewUnits = cloneRuntimeUnits(units)
  const previewEffects = applyPreparedEffects(previewUnits, preparedEffects)
  
  const displayHits = previewEffects
    .filter(effect => (effect.effectType === 'damage' || effect.effectType === 'heal') && effect.amount > 0)
    .map(effect => ({
      actorId: effect.actorId,
      targetId: effect.targetId,
      amount: effect.amount,
      isCrit: effect.isCrit,
      isHeal: effect.isHeal
    }))

  return {
    command: {
      ...command,
      targetIds
    },
    actorId: actor.id,
    actionName: skill?.name ?? '普通攻击',
    skill,
    targetIds,
    preparedEffects,
    
    previewEffects,
    displayHits
  }
}


/** 召唤效果处理（存根） - 原 summonLifecycleRuntime 已移除 */
export function applyPreparedSummons(
  units: unknown[],
  summons: unknown[],
  nextSerial: () => number
): unknown[] {
  return []
}


/** 召唤行动生命周期（存根） */
export function resolveSummonActionLifecycle(units: unknown[], actorId: string): unknown {
  return null
}
