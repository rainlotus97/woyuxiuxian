import type { AlchemyRecipe } from '@/types/alchemy'
import { getSectDirectiveEffects } from './sectDirectiveEffects'
import type { SectDirectiveId } from './sectPositionResolver'

export interface SectAlchemyInventoryItem {
  id: string
  definitionId: string
  name: string
  icon: string
  type: 'consumable'
  quality: string
  quantity: number
  description: string
  effects: AlchemyRecipe['output']['effects']
}

export interface SectAlchemyCraftResolution {
  success: boolean
  craftSucceeded: boolean
  consumesMaterials: boolean
  message: string
  successRate: number
  goldCost: number
  materialCosts: Array<{ itemId: string; quantity: number }>
  item?: SectAlchemyInventoryItem
}

export function resolveAvailableAlchemyRecipes(recipes: AlchemyRecipe[], furnaceLevel: number) {
  return recipes.filter(recipe => recipe.requiredFacilityLevel <= furnaceLevel)
}

export function resolveAlchemySuccessRate(input: {
  recipe: AlchemyRecipe
  furnaceLevel: number
  directive: SectDirectiveId
}) {
  const directiveEffects = getSectDirectiveEffects(input.directive)
  return Math.max(
    0.05,
    Math.min(0.98, input.recipe.baseSuccessRate + input.furnaceLevel * 0.05 + directiveEffects.alchemySuccessBonus)
  )
}

export function resolveAlchemyCraft(input: {
  joinedSectId: string | null
  recipe: AlchemyRecipe | undefined
  furnaceLevel: number
  directive: SectDirectiveId
  gold: number
  getMaterialQuantity: (materialId: string) => number
  random: number
  now: number
}): SectAlchemyCraftResolution {
  if (!input.joinedSectId) {
    return createFailedResolution('未加入宗门')
  }

  if (!input.recipe) {
    return createFailedResolution('配方不存在')
  }

  if (input.furnaceLevel < input.recipe.requiredFacilityLevel) {
    return createFailedResolution(`炼丹炉等级不足，需要${input.recipe.requiredFacilityLevel}级`)
  }

  const goldCost = input.recipe.materials
    .filter(material => material.itemId === 'gold')
    .reduce((total, material) => total + material.quantity, 0)
  if (input.gold < goldCost) {
    return createFailedResolution(`灵石不足，需要${goldCost}灵石`, { goldCost })
  }

  const materialCosts = input.recipe.materials.filter(material => material.itemId !== 'gold')
  for (const material of materialCosts) {
    if (input.getMaterialQuantity(material.itemId) < material.quantity) {
      return createFailedResolution(`材料不足：${material.itemId}`, { goldCost, materialCosts })
    }
  }

  const successRate = resolveAlchemySuccessRate({
    recipe: input.recipe,
    furnaceLevel: input.furnaceLevel,
    directive: input.directive
  })
  const craftSucceeded = clamp01(input.random) < successRate
  if (!craftSucceeded) {
    return {
      success: false,
      craftSucceeded: false,
      consumesMaterials: true,
      message: '炼制失败，材料已消耗',
      successRate,
      goldCost,
      materialCosts
    }
  }

  return {
    success: true,
    craftSucceeded: true,
    consumesMaterials: true,
    message: '炼制成功！',
    successRate,
    goldCost,
    materialCosts,
    item: {
      id: `pill_${input.now}_${Math.floor(clamp01(input.random) * 100000)}`,
      definitionId: input.recipe.id,
      name: input.recipe.output.name,
      icon: input.recipe.output.icon,
      type: 'consumable',
      quality: input.recipe.quality,
      quantity: 1,
      description: input.recipe.description,
      effects: input.recipe.output.effects
    }
  }
}

function createFailedResolution(
  message: string,
  partial: Partial<Pick<SectAlchemyCraftResolution, 'goldCost' | 'materialCosts'>> = {}
): SectAlchemyCraftResolution {
  return {
    success: false,
    craftSucceeded: false,
    consumesMaterials: false,
    message,
    successRate: 0,
    goldCost: partial.goldCost ?? 0,
    materialCosts: partial.materialCosts ?? []
  }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(0.999999, value))
}
