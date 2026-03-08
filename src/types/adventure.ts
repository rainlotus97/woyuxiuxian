import type { Realm, Quality, Element } from '@/types/unit'

export type { Realm, Quality, Element } from '@/types/unit'

// 境界主色调
export const REALM_PRIMARY_COLOR: Record<Realm, string> = {
  '炼气': '#7eb8da',
  '筑基': '#4ade80',
  '金丹': '#fbbf24',
  '元婴': '#a78bfa',
  '化神': '#f472b6',
  '渡劫': '#67e8f9',
  '大乘': '#fcd34d',
  '仙人': '#fef08a'
}

// 境界等级映射
export const REALM_LEVELS: Record<Realm, number> = {
  '炼气': 1,
  '筑基': 2,
  '金丹': 3,
  '元婴': 4,
  '化神': 5,
  '渡劫': 6,
  '大乘': 7,
  '仙人': 8
}

// 获取境界对应的等级
export function getRealmLevel(realm: Realm): number {
  return REALM_LEVELS[realm] || 1
}

// 境界要求显示文本
export type RealmRequirement = {
  realm: Realm
  level: number  // 境界层数要求 1-9
}

// 掉落物品类型
export type DropType = 'material' | 'equipment' | 'consumable' | 'gold' | 'exp'

// 掉落物品定义
export interface DropItem {
  id: string
  name: string
  icon: string
  type: DropType
  quality: 'common' | 'fine' | 'rare' | 'epic' | 'legendary'
  minQuantity: number
  maxQuantity: number
  dropRate: number  // 0-1 掉落概率
  description?: string
}

// 敌人定义
export interface EnemyDefinition {
  id: string
  name: string
  icon: string
  realm: Realm
  realmLevel: number
  baseStats: {
    maxHp: number
    attack: number
    defense: number
    speed: number
  }
  skills: string[]
  drops: string[]  // 掉落物品ID列表
  expReward: number
  goldReward: { min: number; max: number }
}

// 敌人定义（包含更多属性的版本）
export interface FullEnemyDefinition extends EnemyDefinition {
  element?: Element
  quality?: Quality
}

// 区域难度
export type AreaDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare' | 'extreme'

// 区域定义
export interface AreaDefinition {
  id: string
  name: string
  icon: string
  description: string
  // 境界要求
  requiredRealm: Realm
  requiredRealmLevel: number
  // 体力消耗
  staminaCost: number
  // 难度
  difficulty: AreaDifficulty
  // 推荐战力
  recommendedPower: number
  // 敌人列表
  enemies: string[]
  // 战斗波次数量
  waves: number
  // 可能的掉落
  drops: DropItem[]
  // 经验奖励范围
  expReward: { min: number; max: number }
  // 灵石奖励范围
  goldReward: { min: number; max: number }
  // 背景描述
  background?: string
}

// 玩家在该区域的进度
export interface AreaProgress {
  areaId: string
  cleared: boolean        // 是否通关
  clearCount: number      // 通关次数
  fastestTime?: number    // 最快通关时间（秒）
  stars: number           // 星级评价 0-3
  unlocked: boolean       // 是否解锁
}

// 体力值系统
export interface StaminaState {
  current: number
  max: number
  lastRecoverTime: number  // 上次恢复时间戳
  recoverRate: number      // 每分钟恢复量
}

// 历练结果
export interface AdventureResult {
  success: boolean
  areaId: string
  timeUsed: number         // 使用时间（秒）
  expGained: number
  goldGained: number
  drops: DropItem[]
  stars: number
}

// 扫荡结果
export interface SweepResult {
  areaId: string
  sweepCount: number       // 扫荡次数
  totalExp: number
  totalGold: number
  totalDrops: Map<string, { item: DropItem; quantity: number }>
}

// 难度显示配置
export const DIFFICULTY_CONFIG: Record<AreaDifficulty, {
  label: string
  color: string
  multiplier: number
  waves: number           // 该难度的波次数
  enemyStatMult: number   // 敌人属性倍率
  enemiesPerWave: number[] // 每波的敌人数量配置
  bossStatMult?: number   // Boss额外属性倍率（仅噩梦和超绝）
  isRaid?: boolean        // 是否是全服挑战模式
}> = {
  'easy': { label: '简单', color: '#4ade80', multiplier: 0.8, waves: 1, enemyStatMult: 0.8, enemiesPerWave: [3] },
  'normal': { label: '普通', color: '#7eb8da', multiplier: 1.0, waves: 3, enemyStatMult: 1.0, enemiesPerWave: [3, 3, 3] },
  'hard': { label: '困难', color: '#fbbf24', multiplier: 1.5, waves: 4, enemyStatMult: 1.3, enemiesPerWave: [5, 3, 3, 1] },
  'nightmare': { label: '噩梦', color: '#f472b6', multiplier: 2.0, waves: 1, enemyStatMult: 2.0, enemiesPerWave: [5], bossStatMult: 3.0 },
  'extreme': { label: '超绝', color: '#ef4444', multiplier: 3.0, waves: 1, enemyStatMult: 1.0, enemiesPerWave: [1], bossStatMult: 10.0, isRaid: true }
}

// 区域定义数据
export const AREAS: AreaDefinition[] = [
  {
    id: 'misty_forest',
    name: '迷雾森林',
    icon: '🌲',
    description: '常年笼罩在迷雾中的古老森林，据说栖息着各种低阶妖兽。',
    requiredRealm: '炼气',
    requiredRealmLevel: 1,
    staminaCost: 6,
    difficulty: 'easy',
    recommendedPower: 100,
    enemies: ['slime', 'wild_wolf', 'forest_spider'],
    waves: 3,
    drops: [
      { id: 'herb_grass', name: '灵草', icon: '🌿', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 3, dropRate: 0.6, description: '常见的灵草，可用于炼丹' },
      { id: 'wolf_fang', name: '狼牙', icon: '🦷', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '野狼的牙齿，可用于锻造' },
      { id: 'spider_silk', name: '蛛丝', icon: '🕸️', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '坚韧的蛛丝，制作装备的材料' },
      { id: 'wooden_sword', name: '新手木剑', icon: '🗡️', type: 'equipment', quality: 'common', minQuantity: 1, maxQuantity: 1, dropRate: 0.1, description: '普通的木剑' }
    ],
    expReward: { min: 10, max: 20 },
    goldReward: { min: 5, max: 15 },
    background: '浓雾弥漫的森林中，不时传来野兽的低吼声...'
  },
  {
    id: 'dark_cave',
    name: '幽暗洞穴',
    icon: '🕳️',
    description: '深邃的地下洞穴系统，黑暗中潜伏着危险的生物。',
    requiredRealm: '炼气',
    requiredRealmLevel: 4,
    staminaCost: 8,
    difficulty: 'normal',
    recommendedPower: 300,
    enemies: ['cave_bat', 'rock_golem', 'shadow_snake'],
    waves: 3,
    drops: [
      { id: 'iron_ore', name: '铁矿石', icon: '🪨', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '普通的铁矿石' },
      { id: 'bat_wing', name: '蝙蝠翅膀', icon: '🦇', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '可用于炼制飞行丹药' },
      { id: 'golem_core', name: '魔像核心', icon: '💎', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.2, description: '蕴含土属性能量的核心' },
      { id: 'shadow_essence', name: '暗影精华', icon: '🌑', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '稀有的暗属性材料' },
      { id: 'iron_sword', name: '铁剑', icon: '⚔️', type: 'equipment', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.05, description: '精炼的铁剑' }
    ],
    expReward: { min: 25, max: 45 },
    goldReward: { min: 15, max: 30 },
    background: '洞壁上的磷光石散发着幽幽绿光，滴水声回荡在黑暗中...'
  },
  {
    id: 'barren_desert',
    name: '荒芜沙漠',
    icon: '🏜️',
    description: '无尽的黄沙之下，掩埋着古老的遗迹和可怕的沙兽。',
    requiredRealm: '筑基',
    requiredRealmLevel: 1,
    staminaCost: 10,
    difficulty: 'normal',
    recommendedPower: 600,
    enemies: ['sand_worm', 'desert_scorpion', 'mummy_warrior'],
    waves: 3,
    drops: [
      { id: 'sand_crystal', name: '沙晶', icon: '🔶', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.5, description: '沙漠中形成的晶体' },
      { id: 'scorpion_tail', name: '蝎尾', icon: '🦂', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '带有剧毒的蝎尾' },
      { id: 'ancient_relic', name: '古老遗物', icon: '🏺', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.15, description: '沙漠遗迹中的古老物品' },
      { id: 'mummy_bandage', name: '绷带残片', icon: '🩹', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '古老的绷带，可用于制作' },
      { id: 'desert_boots', name: '沙漠靴', icon: '👢', type: 'equipment', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '适合在沙漠中行走的靴子' }
    ],
    expReward: { min: 50, max: 80 },
    goldReward: { min: 30, max: 50 },
    background: '烈日炙烤着大地，远处的沙丘中似乎有什么在移动...'
  },
  {
    id: 'frozen_tundra',
    name: '冰封雪原',
    icon: '❄️',
    description: '永恒的冰雪之地，只有最强大的修仙者才能在此生存。',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    staminaCost: 12,
    difficulty: 'hard',
    recommendedPower: 1000,
    enemies: ['ice_wolf', 'frost_giant', 'snow_demon'],
    waves: 3,
    drops: [
      { id: 'ice_crystal', name: '冰晶', icon: '💠', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '纯净的冰晶' },
      { id: 'frost_essence', name: '寒霜精华', icon: '🧊', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.25, description: '蕴含寒冰之力的精华' },
      { id: 'wolf_pelt', name: '冰狼皮', icon: '🐺', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '保暖的冰狼皮毛' },
      { id: 'frozen_heart', name: '冰封之心', icon: '💙', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.05, description: '传说中的冰系至宝' },
      { id: 'frost_armor', name: '寒霜护甲', icon: '🛡️', type: 'equipment', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.06, description: '蕴含寒冰之力的护甲' }
    ],
    expReward: { min: 80, max: 120 },
    goldReward: { min: 50, max: 80 },
    background: '刺骨的寒风呼啸而过，雪原深处传来阵阵狼嚎...'
  },
  {
    id: 'lava_volcano',
    name: '熔岩火山',
    icon: '🌋',
    description: '炽热的熔岩在火山口翻滚，火属性妖兽在此肆虐。',
    requiredRealm: '金丹',
    requiredRealmLevel: 1,
    staminaCost: 15,
    difficulty: 'hard',
    recommendedPower: 2000,
    enemies: ['fire_elemental', 'lava_golem', 'phoenix_chick'],
    waves: 3,
    drops: [
      { id: 'fire_stone', name: '火灵石', icon: '🔴', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '蕴含火属性灵气的石头' },
      { id: 'lava_core', name: '熔岩核心', icon: '🟠', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '凝固的熔岩精华' },
      { id: 'phoenix_feather', name: '凤凰羽毛', icon: '🪶', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.1, description: '传说中的凤凰掉落的羽毛' },
      { id: 'volcanic_ash', name: '火山灰', icon: '⚫', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '可用于炼丹的火山灰' },
      { id: 'flame_sword', name: '烈焰剑', icon: '🔥', type: 'equipment', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.04, description: '蕴含烈焰之力的宝剑' }
    ],
    expReward: { min: 150, max: 220 },
    goldReward: { min: 80, max: 120 },
    background: '滚烫的岩浆在脚下流动，空气中弥漫着硫磺的气息...'
  },
  {
    id: 'immortal_ruins',
    name: '仙界遗迹',
    icon: '🏛️',
    description: '上古仙人留下的遗迹，藏有无尽宝藏，却也危机四伏。',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    staminaCost: 20,
    difficulty: 'nightmare',
    recommendedPower: 4000,
    enemies: ['ancient_guardian', 'spirit_wraith', 'celestial_beast'],
    waves: 3,
    drops: [
      { id: 'celestial_jade', name: '天界玉', icon: '💚', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 2, dropRate: 0.3, description: '来自仙界的玉石' },
      { id: 'spirit_essence', name: '灵魄精华', icon: '👻', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.25, description: '纯净的灵魄凝聚物' },
      { id: 'immortal_dust', name: '仙尘', icon: '✨', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '仙人留下的神尘' },
      { id: 'ancient_scroll', name: '古老卷轴', icon: '📜', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.15, description: '记载着古老功法的卷轴' },
      { id: 'celestial_blade', name: '天界之刃', icon: '⚔️', type: 'equipment', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.02, description: '传说中天界遗落的神器' }
    ],
    expReward: { min: 300, max: 500 },
    goldReward: { min: 150, max: 250 },
    background: '残破的仙宫大殿中，古老的阵法依然在运转...'
  },
  {
    id: 'abyss_depths',
    name: '深渊之底',
    icon: '🌀',
    description: '连接魔界的裂隙，最危险的禁地之一。',
    requiredRealm: '元婴',
    requiredRealmLevel: 1,
    staminaCost: 25,
    difficulty: 'nightmare',
    recommendedPower: 8000,
    enemies: ['demon_lord', 'void_walker', 'chaos_serpent'],
    waves: 3,
    drops: [
      { id: 'demon_blood', name: '魔血', icon: '🩸', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 2, dropRate: 0.35, description: '蕴含魔气的血液' },
      { id: 'void_crystal', name: '虚空晶', icon: '💜', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.12, description: '从虚空中凝聚的晶体' },
      { id: 'chaos_essence', name: '混沌精华', icon: '🔮', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '混沌之力凝聚的精华' },
      { id: 'demon_soul', name: '魔魂', icon: '😈', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.2, description: '被捕获的魔族灵魂' },
      { id: 'abyss_crown', name: '深渊之冠', icon: '👑', type: 'equipment', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.015, description: '魔界之王的遗物' }
    ],
    expReward: { min: 500, max: 800 },
    goldReward: { min: 300, max: 500 },
    background: '无尽的黑暗深渊中，魔气翻涌，传来阵阵恶魔的低语...'
  }
]

// 敌人定义数据
export const ENEMIES: Record<string, EnemyDefinition> = {
  // 迷雾森林
  slime: {
    id: 'slime',
    name: '史莱姆',
    icon: '🟢',
    realm: '炼气',
    realmLevel: 1,
    baseStats: { maxHp: 50, attack: 8, defense: 3, speed: 80 },
    skills: ['tackle'],
    drops: ['herb_grass'],
    expReward: 5,
    goldReward: { min: 2, max: 5 }
  },
  wild_wolf: {
    id: 'wild_wolf',
    name: '野狼',
    icon: '🐺',
    realm: '炼气',
    realmLevel: 2,
    baseStats: { maxHp: 80, attack: 15, defense: 5, speed: 110 },
    skills: ['bite', 'swift_strike'],
    drops: ['wolf_fang'],
    expReward: 8,
    goldReward: { min: 3, max: 8 }
  },
  forest_spider: {
    id: 'forest_spider',
    name: '林中蛛',
    icon: '🕷️',
    realm: '炼气',
    realmLevel: 3,
    baseStats: { maxHp: 60, attack: 12, defense: 4, speed: 95 },
    skills: ['poison_bite', 'web'],
    drops: ['spider_silk'],
    expReward: 10,
    goldReward: { min: 5, max: 10 }
  },
  // 幽暗洞穴
  cave_bat: {
    id: 'cave_bat',
    name: '洞穴蝙蝠',
    icon: '🦇',
    realm: '炼气',
    realmLevel: 4,
    baseStats: { maxHp: 70, attack: 14, defense: 4, speed: 130 },
    skills: ['sonic_wave', 'drain'],
    drops: ['bat_wing'],
    expReward: 12,
    goldReward: { min: 5, max: 12 }
  },
  rock_golem: {
    id: 'rock_golem',
    name: '岩石魔像',
    icon: '🗿',
    realm: '炼气',
    realmLevel: 5,
    baseStats: { maxHp: 200, attack: 20, defense: 25, speed: 60 },
    skills: ['rock_throw', 'earth_shield'],
    drops: ['iron_ore', 'golem_core'],
    expReward: 20,
    goldReward: { min: 10, max: 20 }
  },
  shadow_snake: {
    id: 'shadow_snake',
    name: '暗影蛇',
    icon: '🐍',
    realm: '炼气',
    realmLevel: 6,
    baseStats: { maxHp: 90, attack: 25, defense: 6, speed: 120 },
    skills: ['shadow_strike', 'venom'],
    drops: ['shadow_essence'],
    expReward: 18,
    goldReward: { min: 8, max: 18 }
  },
  // 荒芜沙漠敌人
  sand_worm: {
    id: 'sand_worm',
    name: '沙虫',
    icon: '🐛',
    realm: '筑基',
    realmLevel: 2,
    baseStats: { maxHp: 120, attack: 22, defense: 8, speed: 85 },
    skills: ['sand_blast', 'burrow'],
    drops: ['sand_crystal'],
    expReward: 25,
    goldReward: { min: 15, max: 25 }
  },
  desert_scorpion: {
    id: 'desert_scorpion',
    name: '沙漠巨蝎',
    icon: '🦂',
    realm: '筑基',
    realmLevel: 3,
    baseStats: { maxHp: 100, attack: 28, defense: 12, speed: 95 },
    skills: ['poison_sting', 'pincer_attack'],
    drops: ['scorpion_tail'],
    expReward: 30,
    goldReward: { min: 18, max: 30 }
  },
  mummy_warrior: {
    id: 'mummy_warrior',
    name: '木乃伊战士',
    icon: '🧟',
    realm: '筑基',
    realmLevel: 5,
    baseStats: { maxHp: 180, attack: 32, defense: 15, speed: 70 },
    skills: ['wrap', 'ancient_curse'],
    drops: ['mummy_bandage', 'ancient_relic'],
    expReward: 45,
    goldReward: { min: 25, max: 40 }
  },
  // 冰封雪原敌人
  ice_wolf: {
    id: 'ice_wolf',
    name: '冰狼',
    icon: '🐺',
    realm: '筑基',
    realmLevel: 5,
    baseStats: { maxHp: 150, attack: 30, defense: 10, speed: 110 },
    skills: ['frost_bite', 'howling_blizzard'],
    drops: ['wolf_pelt', 'ice_crystal'],
    expReward: 40,
    goldReward: { min: 22, max: 35 }
  },
  frost_giant: {
    id: 'frost_giant',
    name: '霜巨人',
    icon: '🧊',
    realm: '筑基',
    realmLevel: 7,
    baseStats: { maxHp: 250, attack: 40, defense: 20, speed: 60 },
    skills: ['ice_crush', 'frozen_armor'],
    drops: ['frost_essence'],
    expReward: 60,
    goldReward: { min: 35, max: 50 }
  },
  snow_demon: {
    id: 'snow_demon',
    name: '雪魔',
    icon: '👹',
    realm: '金丹',
    realmLevel: 1,
    baseStats: { maxHp: 300, attack: 50, defense: 18, speed: 90 },
    skills: ['blizzard', 'ice_prison'],
    drops: ['frozen_heart'],
    expReward: 80,
    goldReward: { min: 50, max: 70 }
  },
  // 深渊之座敌人
  void_walker: {
    id: 'void_walker',
    name: '虚空行者',
    icon: '👁️',
    realm: '金丹',
    realmLevel: 3,
    baseStats: { maxHp: 350, attack: 55, defense: 22, speed: 100 },
    skills: ['void_strike', 'phase_shift'],
    drops: ['void_essence'],
    expReward: 100,
    goldReward: { min: 60, max: 90 }
  },
  demon_lord: {
    id: 'demon_lord',
    name: '恶魔领主',
    icon: '👿',
    realm: '金丹',
    realmLevel: 5,
    baseStats: { maxHp: 500, attack: 70, defense: 30, speed: 85 },
    skills: ['hellfire', 'demon_summon'],
    drops: ['demon_heart'],
    expReward: 150,
    goldReward: { min: 100, max: 150 }
  },
  abyss_dragon: {
    id: 'abyss_dragon',
    name: '深渊魔龙',
    icon: '🐉',
    realm: '元婴',
    realmLevel: 1,
    baseStats: { maxHp: 800, attack: 100, defense: 45, speed: 95 },
    skills: ['abyss_breath', 'dragon_roar', 'shadow_slash'],
    drops: ['dragon_scale', 'abyss_essence'],
    expReward: 300,
    goldReward: { min: 200, max: 300 }
  },
  // 熔岩火山敌人
  fire_elemental: {
    id: 'fire_elemental',
    name: '火焰元素',
    icon: '🔥',
    realm: '金丹',
    realmLevel: 3,
    baseStats: { maxHp: 280, attack: 60, defense: 15, speed: 105 },
    skills: ['fireball', 'flame_burst'],
    drops: ['fire_essence'],
    expReward: 90,
    goldReward: { min: 55, max: 80 }
  },
  lava_golem: {
    id: 'lava_golem',
    name: '熔岩魔像',
    icon: '🗿',
    realm: '金丹',
    realmLevel: 5,
    baseStats: { maxHp: 400, attack: 55, defense: 35, speed: 65 },
    skills: ['lava_throw', 'molten_armor'],
    drops: ['lava_core'],
    expReward: 120,
    goldReward: { min: 70, max: 100 }
  },
  phoenix_chick: {
    id: 'phoenix_chick',
    name: '幼凤',
    icon: '🕊️',
    realm: '金丹',
    realmLevel: 7,
    baseStats: { maxHp: 350, attack: 75, defense: 20, speed: 120 },
    skills: ['phoenix_flame', 'rebirth'],
    drops: ['phoenix_feather'],
    expReward: 150,
    goldReward: { min: 90, max: 130 }
  },
  // 仙界遗迹敌人
  ancient_guardian: {
    id: 'ancient_guardian',
    name: '上古守卫',
    icon: '🗿',
    realm: '元婴',
    realmLevel: 2,
    baseStats: { maxHp: 600, attack: 80, defense: 40, speed: 75 },
    skills: ['stone_fist', 'ancient_seal'],
    drops: ['ancient_core'],
    expReward: 200,
    goldReward: { min: 120, max: 180 }
  },
  spirit_wraith: {
    id: 'spirit_wraith',
    name: '灵体幽魂',
    icon: '👻',
    realm: '元婴',
    realmLevel: 4,
    baseStats: { maxHp: 450, attack: 95, defense: 25, speed: 110 },
    skills: ['spirit_attack', 'soul_drain'],
    drops: ['spirit_essence'],
    expReward: 250,
    goldReward: { min: 150, max: 220 }
  },
  celestial_beast: {
    id: 'celestial_beast',
    name: '天界神兽',
    icon: '🦁',
    realm: '元婴',
    realmLevel: 6,
    baseStats: { maxHp: 700, attack: 110, defense: 35, speed: 90 },
    skills: ['divine_roar', 'celestial_strike'],
    drops: ['celestial_gem'],
    expReward: 350,
    goldReward: { min: 200, max: 300 }
  },
  // 深渊之座额外敌人
  chaos_serpent: {
    id: 'chaos_serpent',
    name: '混沌巨蛇',
    icon: '🐍',
    realm: '元婴',
    realmLevel: 8,
    baseStats: { maxHp: 900, attack: 120, defense: 50, speed: 100 },
    skills: ['chaos_bite', 'void_poison'],
    drops: ['chaos_venom'],
    expReward: 400,
    goldReward: { min: 250, max: 350 }
  }
}

// 获取区域
export function getAreaById(id: string): AreaDefinition | undefined {
  return AREAS.find(a => a.id === id)
}

// 检查区域是否解锁
export function isAreaUnlocked(area: AreaDefinition, playerRealm: Realm, playerRealmLevel: number): boolean {
  const requiredLevel = REALM_LEVELS[area.requiredRealm]
  const playerLevel = REALM_LEVELS[playerRealm]

  if (playerLevel > requiredLevel) return true
  if (playerLevel === requiredLevel && playerRealmLevel >= area.requiredRealmLevel) return true
  return false
}

// 获取境界要求文本
export function getRealmRequirementText(realm: Realm, level: number): string {
  return `${realm}${level}层`
}

// 计算战力
export function calculatePower(stats: { maxHp: number; attack: number; defense: number; speed: number }): number {
  return Math.floor(stats.maxHp * 0.5 + stats.attack * 3 + stats.defense * 2 + stats.speed * 0.5)
}

// 随机掉落
export function rollDrops(drops: DropItem[]): { item: DropItem; quantity: number }[] {
  const result: { item: DropItem; quantity: number }[] = []

  for (const drop of drops) {
    if (Math.random() < drop.dropRate) {
      const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
      result.push({ item: drop, quantity })
    }
  }

  return result
}

// 随机奖励
export function rollReward(range: { min: number; max: number }): number {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}
