import type { UnitStats } from './unit'

// 装备品质
export type EquipmentQuality = 'common' | 'fine' | 'excellent' | 'supreme' | 'legendary'

// 装备类型
export type EquipmentType = 'weapon' | 'armor' | 'accessory'

// 装备部位
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory1' | 'accessory2'

// 装备接口
export interface Equipment {
  id: string
  name: string
  icon: string
  type: EquipmentType
  quality: EquipmentQuality
  level: number  // 需求等级
  realm?: string // 需求境界
  description: string
  bonuses: Partial<UnitStats>
  // 特殊效果
  effects?: EquipmentEffect[]
}

// 装备特殊效果
export interface EquipmentEffect {
  type: 'lifesteal' | 'crit_bonus' | 'element_damage' | 'counter' | 'dodge'
  value: number
  description: string
}

// 品质颜色
export const QUALITY_COLORS: Record<EquipmentQuality, string> = {
  common: '#9ca3af',    // 灰色
  fine: '#d4976a',      // 橙色
  excellent: '#a8c4d4', // 蓝色
  supreme: '#ffd700',   // 金色
  legendary: '#ff69b4'  // 粉色
}

// 品质名称
export const QUALITY_NAMES: Record<EquipmentQuality, string> = {
  common: '普通',
  fine: '精良',
  excellent: '卓越',
  supreme: '极品',
  legendary: '传说'
}

// 装备类型名称
export const EQUIPMENT_TYPE_NAMES: Record<EquipmentType, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: '饰品'
}

// ==================== 装备数据库 ====================

export const EQUIPMENT_DATABASE: Equipment[] = [
  // ========== 武器 ==========
  {
    id: 'weapon_001',
    name: '新手木剑',
    icon: '木',
    type: 'weapon',
    quality: 'common',
    level: 1,
    description: '一把普通的木剑，适合初学者使用',
    bonuses: { attack: 5 }
  },
  {
    id: 'weapon_002',
    name: '玄铁剑',
    icon: '剑',
    type: 'weapon',
    quality: 'fine',
    level: 5,
    realm: '炼气',
    description: '由玄铁打造的长剑，锋利无比',
    bonuses: { attack: 15, critRate: 0.05 }
  },
  {
    id: 'weapon_003',
    name: '青锋剑',
    icon: '锋',
    type: 'weapon',
    quality: 'excellent',
    level: 10,
    realm: '筑基',
    description: '剑身泛着青光，蕴含灵气',
    bonuses: { attack: 30, critRate: 0.08, speed: 5 }
  },
  {
    id: 'weapon_004',
    name: '紫霄神剑',
    icon: '霄',
    type: 'weapon',
    quality: 'supreme',
    level: 20,
    realm: '金丹',
    description: '传说中紫霄宫的神剑，威力无穷',
    bonuses: { attack: 60, critRate: 0.12, critDamage: 0.3 }
  },
  {
    id: 'weapon_005',
    name: '混沌古剑',
    icon: '沌',
    type: 'weapon',
    quality: 'legendary',
    level: 35,
    realm: '元婴',
    description: '开天辟地时诞生的古剑，蕴含混沌之力',
    bonuses: { attack: 120, critRate: 0.15, critDamage: 0.5, speed: 10 },
    effects: [
      { type: 'lifesteal', value: 0.1, description: '攻击时吸取10%生命' }
    ]
  },

  // ========== 防具 ==========
  {
    id: 'armor_001',
    name: '布衣',
    icon: '布',
    type: 'armor',
    quality: 'common',
    level: 1,
    description: '普通的布衣，聊胜于无',
    bonuses: { maxHp: 20, defense: 2 }
  },
  {
    id: 'armor_002',
    name: '皮甲',
    icon: '甲',
    type: 'armor',
    quality: 'fine',
    level: 5,
    realm: '炼气',
    description: '由妖兽皮革制成的护甲',
    bonuses: { maxHp: 50, defense: 8 }
  },
  {
    id: 'armor_003',
    name: '玄铁甲',
    icon: '铁',
    type: 'armor',
    quality: 'excellent',
    level: 10,
    realm: '筑基',
    description: '玄铁打造的护甲，坚固耐用',
    bonuses: { maxHp: 100, defense: 20, maxMp: 30 }
  },
  {
    id: 'armor_004',
    name: '金丝软甲',
    icon: '金',
    type: 'armor',
    quality: 'supreme',
    level: 20,
    realm: '金丹',
    description: '由金丝织成的软甲，轻便而坚固',
    bonuses: { maxHp: 200, defense: 40, speed: 5 }
  },
  {
    id: 'armor_005',
    name: '九天玄甲',
    icon: '玄',
    type: 'armor',
    quality: 'legendary',
    level: 35,
    realm: '元婴',
    description: '九天玄铁打造的神甲，万法不侵',
    bonuses: { maxHp: 500, defense: 80, maxMp: 100, speed: 10 },
    effects: [
      { type: 'dodge', value: 0.1, description: '10%几率闪避攻击' }
    ]
  },

  // ========== 饰品 ==========
  {
    id: 'accessory_001',
    name: '铜戒指',
    icon: '戒',
    type: 'accessory',
    quality: 'common',
    level: 1,
    description: '普通的铜戒指',
    bonuses: { speed: 3 }
  },
  {
    id: 'accessory_002',
    name: '灵玉佩',
    icon: '玉',
    type: 'accessory',
    quality: 'fine',
    level: 5,
    realm: '炼气',
    description: '蕴含灵气的玉佩',
    bonuses: { maxMp: 30, speed: 5 }
  },
  {
    id: 'accessory_003',
    name: '暴击护符',
    icon: '符',
    type: 'accessory',
    quality: 'excellent',
    level: 10,
    realm: '筑基',
    description: '能够提升暴击率的护符',
    bonuses: { critRate: 0.1, critDamage: 0.2 }
  },
  {
    id: 'accessory_004',
    name: '凤血镯',
    icon: '镯',
    type: 'accessory',
    quality: 'supreme',
    level: 20,
    realm: '金丹',
    description: '以凤凰之血炼制的镯子',
    bonuses: { maxHp: 150, attack: 15, critRate: 0.05 }
  },
  {
    id: 'accessory_005',
    name: '龙魂珠',
    icon: '珠',
    type: 'accessory',
    quality: 'legendary',
    level: 35,
    realm: '元婴',
    description: '封印着龙魂的宝珠，力量无穷',
    bonuses: { attack: 40, maxHp: 200, maxMp: 100, critRate: 0.1, speed: 15 }
  }
]

// 根据ID获取装备
export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_DATABASE.find(e => e.id === id)
}

// 根据类型获取装备列表
export function getEquipmentsByType(type: EquipmentType): Equipment[] {
  return EQUIPMENT_DATABASE.filter(e => e.type === type)
}

// 根据品质获取装备列表
export function getEquipmentsByQuality(quality: EquipmentQuality): Equipment[] {
  return EQUIPMENT_DATABASE.filter(e => e.quality === quality)
}
