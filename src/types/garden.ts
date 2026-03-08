/**
 * 药园系统类型定义
 */

// 种子品质
export type SeedQuality = 'common' | 'fine' | 'rare'

// 种子定义
export interface SeedDefinition {
  id: string
  name: string
  icon: string
  quality: SeedQuality
  description: string
  growTime: number              // 生长时间（分钟）
  requiredGardenLevel: number   // 需要的药园等级
  harvest: {
    itemId: string              // 产出物品ID
    itemName: string            // 产出物品名称
    icon: string                // 产出物品图标
    minQuantity: number         // 最小产量
    maxQuantity: number         // 最大产量
  }
  buyPrice: number              // 购买价格（灵石）
}

// 已种植的作物
export interface PlantedCrop {
  seedId: string
  plantedAt: number  // 种植时间戳
  readyAt: number    // 成熟时间戳
  slotIndex: number  // 槽位索引
}

// 预定义种子
export const SEEDS: SeedDefinition[] = [
  {
    id: 'seed_spirit_grass',
    name: '灵草种子',
    icon: '🌱',
    quality: 'common',
    description: '生长30分钟���可收获灵草',
    growTime: 30,
    requiredGardenLevel: 1,
    harvest: {
      itemId: 'herb_spirit_grass',
      itemName: '灵草',
      icon: '🌿',
      minQuantity: 2,
      maxQuantity: 5
    },
    buyPrice: 10
  },
  {
    id: 'seed_spirit_flower',
    name: '灵花种子',
    icon: '🌸',
    quality: 'fine',
    description: '生长2小时后可收获灵花',
    growTime: 120,
    requiredGardenLevel: 2,
    harvest: {
      itemId: 'herb_spirit_flower',
      itemName: '灵花',
      icon: '🌺',
      minQuantity: 1,
      maxQuantity: 3
    },
    buyPrice: 50
  },
  {
    id: 'seed_immortal_grass',
    name: '仙草种子',
    icon: '✨',
    quality: 'rare',
    description: '生长8小时后可收获仙草',
    growTime: 480,
    requiredGardenLevel: 4,
    harvest: {
      itemId: 'herb_immortal_grass',
      itemName: '仙草',
      icon: '🌟',
      minQuantity: 1,
      maxQuantity: 2
    },
    buyPrice: 200
  }
]

// 根据ID获取种子
export function getSeedById(id: string): SeedDefinition | undefined {
  return SEEDS.find(s => s.id === id)
}

// 根据品质获取种子列表
export function getSeedsByQuality(quality: SeedQuality): SeedDefinition[] {
  return SEEDS.filter(s => s.quality === quality)
}

// 根据药园等级获取可用种子
export function getAvailableSeeds(gardenLevel: number): SeedDefinition[] {
  return SEEDS.filter(s => s.requiredGardenLevel <= gardenLevel)
}
