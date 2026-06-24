/**
 * 炼丹系统类型定义
 */

// 丹药品质
export type PillQuality = 'common' | 'fine' | 'rare' | 'epic' | 'legendary'

// 丹药效果类型
export interface PillEffect {
  type: 'restore_hp' | 'restore_mp' | 'add_cultivation' | 'buff_attack' | 'buff_defense' | 'buff_speed'
  value: number
  duration?: number  // 持续时间（秒），用于buff类效果
}

// 炼丹配方
export interface AlchemyRecipe {
  id: string
  name: string
  icon: string
  quality: PillQuality
  description: string
  materials: { itemId: string; quantity: number }[]
  baseSuccessRate: number       // 基础成功率 (0-1)
  requiredFacilityLevel: number // 需要的炼丹炉等级
  output: {
    name: string
    icon: string
    effects: PillEffect[]
  }
  craftTime: number  // 炼制时间（秒）
}

// 预定义配方
export const ALCHEMY_RECIPES: AlchemyRecipe[] = [
  {
    id: 'pill_hp_small',
    name: '回春丹',
    icon: '💊',
    quality: 'common',
    description: '恢复50点生命值',
    materials: [
      { itemId: 'herb_spirit_grass', quantity: 3 }
    ],
    baseSuccessRate: 0.8,
    requiredFacilityLevel: 1,
    output: {
      name: '回春丹',
      icon: '💊',
      effects: [{ type: 'restore_hp', value: 50 }]
    },
    craftTime: 30
  },
  {
    id: 'pill_mp_small',
    name: '聚气丹',
    icon: '💊',
    quality: 'fine',
    description: '恢复30点灵力',
    materials: [
      { itemId: 'herb_spirit_grass', quantity: 5 }
    ],
    baseSuccessRate: 0.7,
    requiredFacilityLevel: 2,
    output: {
      name: '聚气丹',
      icon: '💊',
      effects: [{ type: 'restore_mp', value: 30 }]
    },
    craftTime: 45
  },
  {
    id: 'pill_cultivation',
    name: '筑基丹',
    icon: '💊',
    quality: 'rare',
    description: '增加100点修为',
    materials: [
      { itemId: 'herb_spirit_grass', quantity: 10 },
      { itemId: 'gold', quantity: 100 }
    ],
    baseSuccessRate: 0.5,
    requiredFacilityLevel: 3,
    output: {
      name: '筑基丹',
      icon: '💊',
      effects: [{ type: 'add_cultivation', value: 100 }]
    },
    craftTime: 60
  },
  {
    id: 'pill_hp_large',
    name: '大还丹',
    icon: '💊',
    quality: 'epic',
    description: '恢复200点生命值',
    materials: [
      { itemId: 'herb_spirit_flower', quantity: 5 },
      { itemId: 'herb_spirit_grass', quantity: 10 }
    ],
    baseSuccessRate: 0.4,
    requiredFacilityLevel: 4,
    output: {
      name: '大还丹',
      icon: '💊',
      effects: [{ type: 'restore_hp', value: 200 }]
    },
    craftTime: 90
  },
  {
    id: 'pill_cultivation_large',
    name: '金元丹',
    icon: '💊',
    quality: 'legendary',
    description: '增加500点修为',
    materials: [
      { itemId: 'herb_immortal_grass', quantity: 2 },
      { itemId: 'herb_spirit_flower', quantity: 5 },
      { itemId: 'gold', quantity: 500 }
    ],
    baseSuccessRate: 0.3,
    requiredFacilityLevel: 5,
    output: {
      name: '金元丹',
      icon: '💊',
      effects: [{ type: 'add_cultivation', value: 500 }]
    },
    craftTime: 120
  }
]

// 根据ID获取配方
export function getAlchemyRecipeById(id: string): AlchemyRecipe | undefined {
  return ALCHEMY_RECIPES.find(r => r.id === id)
}

// 根据品质获取配方列表
export function getAlchemyRecipesByQuality(quality: PillQuality): AlchemyRecipe[] {
  return ALCHEMY_RECIPES.filter(r => r.quality === quality)
}
