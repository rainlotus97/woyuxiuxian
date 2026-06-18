import type { StatusEffect } from '@/types/unit'

export interface FoodProgressionEffect {
  cultivationMultiplierBonus: number
  sources: Array<{
    id: string
    label: string
    valueLabel: string
    description: string
  }>
}

export function resolveFoodProgressionEffects(statusEffects: StatusEffect[]): FoodProgressionEffect {
  const sources: FoodProgressionEffect['sources'] = []
  let cultivationMultiplierBonus = 0

  for (const effect of statusEffects) {
    if (effect.type !== 'food_cultivation') continue
    const value = Math.max(0, effect.value ?? 0)
    if (value <= 0) continue

    cultivationMultiplierBonus += value
    sources.push({
      id: `food:${effect.sourceId ?? effect.type}:${effect.duration}`,
      label: effect.sourceId ?? '灵食调息',
      valueLabel: `+${Math.round(value * 100)}%`,
      description: `${effect.duration}次结算内提升挂机修炼收益`
    })
  }

  return {
    cultivationMultiplierBonus,
    sources
  }
}

export function tickFoodProgressionEffects(statusEffects: StatusEffect[]) {
  return statusEffects
    .map(effect => {
      if (effect.type !== 'food_cultivation' && effect.type !== 'food_stamina') return effect
      return {
        ...effect,
        duration: effect.duration - 1
      }
    })
    .filter(effect => effect.duration > 0)
}
