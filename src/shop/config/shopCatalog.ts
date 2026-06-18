import type { Realm } from '@/types/unit'
import type { InventoryItem } from '@/stores/playerStore'

export type ShopCategoryId = 'all' | 'equipment' | 'pill' | 'material' | 'breakthrough' | 'sect'
export type ShopItemType = InventoryItem['type']
export type ShopQuality = 'common' | 'fine' | 'excellent' | 'supreme' | 'legendary'

export interface ShopItemEffect {
  type: string
  value: number
  duration?: number
}

export interface ShopItemDefinition {
  id: string
  definitionId: string
  name: string
  icon: string
  category: Exclude<ShopCategoryId, 'all'>
  type: ShopItemType
  quality: ShopQuality
  basePrice: number
  description: string
  equipmentId?: string
  effects?: ShopItemEffect[]
  sectIds?: string[]
  minRealm?: Realm
  stockRange: [number, number]
  refreshWeight: number
}

export const SHOP_CATEGORY_OPTIONS: Array<{ id: ShopCategoryId; name: string }> = [
  { id: 'all', name: '全部' },
  { id: 'equipment', name: '法器' },
  { id: 'pill', name: '丹药' },
  { id: 'breakthrough', name: '破境' },
  { id: 'material', name: '材料' },
  { id: 'sect', name: '宗门' }
]

export const SHOP_QUALITY_OPTIONS: Array<{ id: 'all' | ShopQuality; name: string }> = [
  { id: 'all', name: '全部品质' },
  { id: 'common', name: '普通' },
  { id: 'fine', name: '精良' },
  { id: 'excellent', name: '卓越' },
  { id: 'supreme', name: '极品' },
  { id: 'legendary', name: '传说' }
]

export const SHOP_QUALITY_LABELS: Record<ShopQuality, string> = {
  common: '普通',
  fine: '精良',
  excellent: '卓越',
  supreme: '极品',
  legendary: '传说'
}

export const SHOP_CATALOG: ShopItemDefinition[] = [
  {
    id: 'shop_weapon_001',
    definitionId: 'weapon_001',
    name: '新手木剑',
    icon: '木',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    basePrice: 50,
    description: '攻击+5，适合初入仙途时防身。',
    equipmentId: 'weapon_001',
    stockRange: [1, 3],
    refreshWeight: 1
  },
  {
    id: 'shop_weapon_002',
    definitionId: 'weapon_002',
    name: '玄铁剑',
    icon: '剑',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    basePrice: 200,
    description: '攻击+15，暴击率+5%。',
    equipmentId: 'weapon_002',
    stockRange: [1, 2],
    refreshWeight: 0.85
  },
  {
    id: 'shop_armor_001',
    definitionId: 'armor_002',
    name: '皮甲',
    icon: '甲',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    basePrice: 180,
    description: '生命+50，防御+8。',
    equipmentId: 'armor_002',
    stockRange: [1, 2],
    refreshWeight: 0.8
  },
  {
    id: 'shop_armor_002',
    definitionId: 'armor_001',
    name: '布衣',
    icon: '布',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    basePrice: 30,
    description: '生命+20，防御+2。',
    equipmentId: 'armor_001',
    stockRange: [1, 3],
    refreshWeight: 1
  },
  {
    id: 'shop_accessory_001',
    definitionId: 'accessory_001',
    name: '铜戒指',
    icon: '戒',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    basePrice: 40,
    description: '速度+3。',
    equipmentId: 'accessory_001',
    stockRange: [1, 3],
    refreshWeight: 0.9
  },
  {
    id: 'shop_accessory_002',
    definitionId: 'accessory_002',
    name: '灵玉佩',
    icon: '玉',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    basePrice: 150,
    description: '灵力+30，速度+5。',
    equipmentId: 'accessory_002',
    stockRange: [1, 2],
    refreshWeight: 0.78
  },
  {
    id: 'shop_pill_001',
    definitionId: 'pill_qi_gathering',
    name: '聚气丹',
    icon: '丹',
    category: 'pill',
    type: 'consumable',
    quality: 'fine',
    basePrice: 50,
    description: '服用后增加50修为。',
    effects: [{ type: 'cultivation', value: 50 }],
    stockRange: [2, 8],
    refreshWeight: 1
  },
  {
    id: 'shop_pill_002',
    definitionId: 'pill_healing',
    name: '疗伤丹',
    icon: '药',
    category: 'pill',
    type: 'consumable',
    quality: 'common',
    basePrice: 30,
    description: '服用后恢复50生命。',
    effects: [{ type: 'hp', value: 50 }],
    stockRange: [3, 10],
    refreshWeight: 1
  },
  {
    id: 'shop_pill_003',
    definitionId: 'pill_spirit_recover',
    name: '回灵丹',
    icon: '灵',
    category: 'pill',
    type: 'consumable',
    quality: 'common',
    basePrice: 25,
    description: '服用后恢复30灵力。',
    effects: [{ type: 'mp', value: 30 }],
    stockRange: [3, 10],
    refreshWeight: 1
  },
  {
    id: 'shop_pill_004',
    definitionId: 'pill_mighty',
    name: '大力丸',
    icon: '力',
    category: 'pill',
    type: 'consumable',
    quality: 'fine',
    basePrice: 100,
    description: '战斗中攻击+20%，持续3回合。',
    effects: [{ type: 'buff_atk', value: 0.2, duration: 3 }],
    stockRange: [1, 5],
    refreshWeight: 0.85
  },
  {
    id: 'shop_pill_005',
    definitionId: 'pill_iron_shell',
    name: '铁甲丹',
    icon: '铁',
    category: 'pill',
    type: 'consumable',
    quality: 'fine',
    basePrice: 100,
    description: '战斗中防御+20%，持续3回合。',
    effects: [{ type: 'buff_def', value: 0.2, duration: 3 }],
    stockRange: [1, 5],
    refreshWeight: 0.85
  },
  {
    id: 'shop_breakthrough_001',
    definitionId: 'pill_foundation_guard',
    name: '护脉筑基丹',
    icon: '基',
    category: 'breakthrough',
    type: 'consumable',
    quality: 'excellent',
    basePrice: 360,
    description: '突破筑基时稳固经脉，提高破境成功率并降低失败损失。',
    effects: [{ type: 'breakthrough_success', value: 0.18 }],
    minRealm: '炼气',
    stockRange: [0, 2],
    refreshWeight: 0.55
  },
  {
    id: 'shop_breakthrough_002',
    definitionId: 'pill_gold_core',
    name: '凝金丹',
    icon: '金',
    category: 'breakthrough',
    type: 'consumable',
    quality: 'supreme',
    basePrice: 980,
    description: '为凝结金丹准备的珍贵丹药，提高破境成功率并降低失败损失。',
    effects: [{ type: 'breakthrough_success', value: 0.24 }],
    minRealm: '筑基',
    stockRange: [0, 1],
    refreshWeight: 0.26
  },
  {
    id: 'shop_material_001',
    definitionId: 'material_spirit_stone',
    name: '灵石',
    icon: '石',
    category: 'material',
    type: 'material',
    quality: 'common',
    basePrice: 10,
    description: '修仙界的通用货币，也可用于阵法与炼器。',
    stockRange: [8, 20],
    refreshWeight: 1
  },
  {
    id: 'shop_material_002',
    definitionId: 'material_spirit_grass',
    name: '灵草',
    icon: '草',
    category: 'material',
    type: 'material',
    quality: 'common',
    basePrice: 20,
    description: '炼丹的基础材料。',
    stockRange: [4, 14],
    refreshWeight: 1
  },
  {
    id: 'shop_material_003',
    definitionId: 'material_black_iron',
    name: '玄铁',
    icon: '铁',
    category: 'material',
    type: 'material',
    quality: 'fine',
    basePrice: 100,
    description: '锻造武器的上好材料。',
    stockRange: [1, 6],
    refreshWeight: 0.75
  },
  {
    id: 'shop_material_004',
    definitionId: 'material_talisman_paper',
    name: '符纸',
    icon: '纸',
    category: 'material',
    type: 'material',
    quality: 'common',
    basePrice: 10,
    description: '绘制符箓的基础材料。',
    stockRange: [5, 16],
    refreshWeight: 1
  },
  {
    id: 'shop_material_005',
    definitionId: 'material_array_flag',
    name: '阵旗',
    icon: '旗',
    category: 'material',
    type: 'material',
    quality: 'excellent',
    basePrice: 200,
    description: '布置阵法的核心材料。',
    stockRange: [0, 4],
    refreshWeight: 0.58
  },
  {
    id: 'shop_sect_001',
    definitionId: 'sect_cloud_order',
    name: '青云令',
    icon: '令',
    category: 'sect',
    type: 'material',
    quality: 'excellent',
    basePrice: 320,
    description: '青云宗外务堂流通的信物，可用于后续宗门任务与声望玩法。',
    sectIds: ['qingyun'],
    stockRange: [0, 3],
    refreshWeight: 0.7
  },
  {
    id: 'shop_sect_002',
    definitionId: 'sect_flame_sand',
    name: '赤炎砂',
    icon: '砂',
    category: 'sect',
    type: 'material',
    quality: 'excellent',
    basePrice: 340,
    description: '赤炎宗炼器房常用的火脉灵砂。',
    sectIds: ['chiyan'],
    stockRange: [0, 3],
    refreshWeight: 0.7
  },
  {
    id: 'shop_sect_003',
    definitionId: 'sect_mystic_ink',
    name: '玄水墨',
    icon: '墨',
    category: 'sect',
    type: 'material',
    quality: 'excellent',
    basePrice: 330,
    description: '玄水宗符阵师偏爱的清冽灵墨。',
    sectIds: ['xuanshui'],
    stockRange: [0, 3],
    refreshWeight: 0.7
  }
]
