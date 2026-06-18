import type { PlantedCrop, SeedDefinition } from '@/types/garden'
import { getSectDirectiveEffects } from './sectDirectiveEffects'
import type { SectDirectiveId } from './sectPositionResolver'

export interface SectGardenHarvestResult {
  success: boolean
  message: string
  quantity?: number
  item?: {
    id: string
    definitionId: string
    name: string
    icon: string
    type: 'material'
    quality: string
    quantity: number
    description: string
  }
}

export function resolveGardenSlotCount(gardenLevel: number) {
  return Math.min(3, 1 + Math.floor(gardenLevel / 2))
}

export function resolveAvailableSeeds(seeds: SeedDefinition[], gardenLevel: number) {
  return seeds.filter(seed => seed.requiredGardenLevel <= gardenLevel)
}

export function resolveGardenAccelerateCost(input: {
  crop: PlantedCrop | null
  now: number
}) {
  if (!input.crop || input.now >= input.crop.readyAt) return 0
  return Math.ceil((input.crop.readyAt - input.now) / 60000) * 10
}

export function resolveGardenHarvest(input: {
  joinedSectId: string | null
  slotIndex: number
  slotCount: number
  crop: PlantedCrop | null
  seed: SeedDefinition | undefined
  gardenLevel: number
  directive: SectDirectiveId
  now: number
  random: number
}): SectGardenHarvestResult {
  if (!input.joinedSectId) {
    return { success: false, message: '未加入宗门' }
  }

  if (input.slotIndex < 0 || input.slotIndex >= input.slotCount) {
    return { success: false, message: '无效的槽位' }
  }

  if (!input.crop) {
    return { success: false, message: '该槽位没有作物' }
  }

  if (input.now < input.crop.readyAt) {
    const remainingMinutes = Math.ceil((input.crop.readyAt - input.now) / 60000)
    return { success: false, message: `作物尚未成熟，还需${remainingMinutes}分钟` }
  }

  if (!input.seed) {
    return { success: false, message: '种子数据异常' }
  }

  const baseQuantity = Math.floor(
    clamp01(input.random) * (input.seed.harvest.maxQuantity - input.seed.harvest.minQuantity + 1)
  ) + input.seed.harvest.minQuantity
  const directiveEffects = getSectDirectiveEffects(input.directive)
  const bonus = Math.floor(baseQuantity * input.gardenLevel * 0.1 * directiveEffects.herbYieldMultiplier)
  const totalQuantity = baseQuantity + bonus

  return {
    success: true,
    message: `收获成功，获得${input.seed.harvest.itemName}x${totalQuantity}`,
    quantity: totalQuantity,
    item: {
      id: `${input.seed.harvest.itemId}_${input.now}`,
      definitionId: input.seed.harvest.itemId,
      name: input.seed.harvest.itemName,
      icon: input.seed.harvest.icon,
      type: 'material',
      quality: input.seed.quality,
      quantity: totalQuantity,
      description: `从药园收获的${input.seed.harvest.itemName}`
    }
  }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(0.999999, value))
}
