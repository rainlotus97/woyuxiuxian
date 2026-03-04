import {
  REALM_MULTIPLIER,
  QUALITY_MULTIPLIER,
  ELEMENT_COUNTER,
  type Unit,
  type Element
} from '@/types/unit'
import type { Skill } from '@/types/skill'
import type { DamageResult } from '@/types/battle'

/**
 * 伤害计算 composable
 */
export function useDamageCalculator() {
  /**
   * 计算伤害
   */
  function calculateDamage(
    attacker: Unit,
    target: Unit,
    skill?: Skill
  ): DamageResult {
    // 基础攻击力
    let baseAttack = attacker.stats.attack

    // 应用境界倍率
    baseAttack *= REALM_MULTIPLIER[attacker.realm]

    // 应用品质倍率
    baseAttack *= QUALITY_MULTIPLIER[attacker.quality]

    // 技能伤害计算
    let skillMultiplier = 1.0
    let skillElement: Element = attacker.element

    if (skill && skill.effects.length > 0) {
      const effect = skill.effects[0]
      if (effect) {
        skillMultiplier = effect.scaling
        baseAttack += effect.baseValue
        if (effect.element) {
          skillElement = effect.element
        }
      }
    }

    // 计算原始伤害
    let rawDamage = baseAttack * skillMultiplier

    // 防御减免
    let defense = target.stats.defense
    defense *= REALM_MULTIPLIER[target.realm]
    defense *= QUALITY_MULTIPLIER[target.quality]

    // 防御公式：伤害 = 攻击 * (100 / (100 + 防御))
    const defenseReduction = 100 / (100 + defense)
    rawDamage *= defenseReduction

    // 暴击检测
    const isCrit = Math.random() < attacker.stats.critRate
    if (isCrit) {
      rawDamage *= attacker.stats.critDamage
    }

    // 元素克制计算
    const { isEffective, isWeak, multiplier } = calculateElementAffinity(
      skillElement,
      target.element
    )
    rawDamage *= multiplier

    // 应用状态效果修正
    rawDamage = applyStatusEffectModifiers(rawDamage, attacker, target)

    // 随机波动 (90% - 110%)
    const variance = 0.9 + Math.random() * 0.2
    rawDamage *= variance

    // 最终伤害（最小 1）
    const finalDamage = Math.max(1, Math.floor(rawDamage))

    return {
      attackerId: attacker.id,
      targetId: target.id,
      damage: finalDamage,
      isCrit,
      isBlocked: false,
      elementType: skillElement,
      isEffective,
      isWeak
    }
  }

  /**
   * 计算元素克制关系
   */
  function calculateElementAffinity(
    attackElement: Element,
    targetElement: Element
  ): { isEffective: boolean; isWeak: boolean; multiplier: number } {
    // 检查攻击元素是否克制目标元素
    if (ELEMENT_COUNTER[attackElement] === targetElement) {
      return { isEffective: true, isWeak: false, multiplier: 1.5 }
    }

    // 检查目标元素是否克制攻击元素
    if (ELEMENT_COUNTER[targetElement] === attackElement) {
      return { isEffective: false, isWeak: true, multiplier: 0.75 }
    }

    return { isEffective: false, isWeak: false, multiplier: 1.0 }
  }

  /**
   * 应用状态效果修正
   */
  function applyStatusEffectModifiers(
    damage: number,
    attacker: Unit,
    target: Unit
  ): number {
    let modifier = 1.0

    // 攻击者增益
    attacker.statusEffects.forEach(effect => {
      if (effect.type === 'buff_atk') {
        modifier *= 1 + (effect.value || 0.2)
      } else if (effect.type === 'debuff_atk') {
        modifier *= 1 - (effect.value || 0.2)
      }
    })

    // 目标增益/减益
    target.statusEffects.forEach(effect => {
      if (effect.type === 'buff_def') {
        modifier *= 1 - (effect.value || 0.2)
      } else if (effect.type === 'debuff_def') {
        modifier *= 1 + (effect.value || 0.2)
      } else if (effect.type === 'invincible') {
        modifier = 0
      }
    })

    return damage * modifier
  }

  /**
   * 计算治疗量
   */
  function calculateHealing(
    healer: Unit,
    target: Unit,
    skill: Skill
  ): number {
    const effect = skill.effects.find((e: { type: string }) => e.type === 'heal')
    if (!effect) return 0

    let healAmount = effect.baseValue + (healer.stats.attack * effect.scaling)

    // 应用境界和品质倍率
    healAmount *= REALM_MULTIPLIER[healer.realm]
    healAmount *= QUALITY_MULTIPLIER[healer.quality]

    // 不能超过最大 HP
    return Math.min(
      Math.floor(healAmount),
      target.stats.maxHp - target.stats.currentHp
    )
  }

  /**
   * 计算速度条进度增量
   */
  function calculateSpeedProgress(unit: Unit, deltaTime: number): number {
    // 基础速度公式：速度 * deltaTime / 基准值
    const baseThreshold = 100
    return (unit.stats.speed * deltaTime) / baseThreshold
  }

  return {
    calculateDamage,
    calculateElementAffinity,
    calculateHealing,
    calculateSpeedProgress
  }
}
