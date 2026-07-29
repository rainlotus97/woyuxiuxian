import type { AreaDefinition, AreaDifficulty, AreaDifficultyConfig } from '@/types/adventure'
import { GENERATED_AREAS } from './generatedAreas'

export const DIFFICULTY_CONFIG: Record<AreaDifficulty, AreaDifficultyConfig> = {
  easy: { label: '简单', color: '#4ade80', multiplier: 0.8, waves: 1, enemyStatMult: 0.8, enemiesPerWave: [3] },
  normal: { label: '普通', color: '#7eb8da', multiplier: 1, waves: 3, enemyStatMult: 1, enemiesPerWave: [3, 3, 3] },
  hard: { label: '困难', color: '#fbbf24', multiplier: 1.5, waves: 4, enemyStatMult: 1.3, enemiesPerWave: [5, 3, 3, 1] },
  nightmare: { label: '噩梦', color: '#f472b6', multiplier: 2, waves: 1, enemyStatMult: 2, enemiesPerWave: [5], bossStatMult: 3 },
  extreme: { label: '超绝', color: '#ef4444', multiplier: 3, waves: 1, enemyStatMult: 1, enemiesPerWave: [1], bossStatMult: 10, isRaid: true }
}

export const AREAS: AreaDefinition[] = [
  ...GENERATED_AREAS,
  {
    id: 'misty_forest',
    name: '迷雾森林',
    icon: 'herb',
    description: '常年笼罩在迷雾中的古老森林，据说栖息着各种低阶妖兽。',
    requiredRealm: '炼气',
    requiredRealmLevel: 1,
    staminaCost: 6,
    difficulty: 'easy',
    recommendedPower: 100,
    enemies: ['slime', 'wild_wolf', 'forest_spider'],
    waves: 3,
    drops: [
      { id: 'herb_grass', name: '灵草', icon: 'herb', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 3, dropRate: 0.6, description: '常见的灵草，可用于炼丹' },
      { id: 'wolf_fang', name: '狼牙', icon: 'beast', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '野狼的牙齿，可用于锻造' },
      { id: 'spider_silk', name: '蛛丝', icon: 'beast', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '坚韧的蛛丝，制作装备的材料' },
      { id: 'wooden_sword', name: '新手木剑', icon: 'sword', type: 'equipment', quality: 'common', minQuantity: 1, maxQuantity: 1, dropRate: 0.1, description: '普通的木剑' }
    ],
    expReward: { min: 10, max: 20 },
    goldReward: { min: 5, max: 15 },
    background: '浓雾弥漫的森林中，不时传来野兽的低吼声...'
  },
  {
    id: 'dark_cave',
    name: '幽暗洞穴',
    icon: 'void',
    description: '深邃的地下洞穴系统，黑暗中潜伏着危险的生物。',
    requiredRealm: '炼气',
    requiredRealmLevel: 4,
    staminaCost: 8,
    difficulty: 'normal',
    recommendedPower: 300,
    enemies: ['cave_bat', 'rock_golem', 'shadow_snake'],
    waves: 3,
    drops: [
      { id: 'iron_ore', name: '铁矿石', icon: 'spirit-stone', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '普通的铁矿石' },
      { id: 'bat_wing', name: '蝙蝠翅膀', icon: 'beast', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '可用于炼制飞行丹药' },
      { id: 'golem_core', name: '魔像核心', icon: 'spirit-stone', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.2, description: '蕴含土属性能量的核心' },
      { id: 'shadow_essence', name: '暗影精华', icon: 'moon', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '稀有的暗属性材料' },
      { id: 'iron_sword', name: '铁剑', icon: 'sword', type: 'equipment', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.05, description: '精炼的铁剑' }
    ],
    expReward: { min: 25, max: 45 },
    goldReward: { min: 15, max: 30 },
    background: '洞壁上的磷光石散发着幽幽绿光，滴水声回荡在黑暗中...'
  },
  {
    id: 'barren_desert',
    name: '荒芜沙漠',
    icon: 'mountain',
    description: '无尽的黄沙之下，掩埋着古老的遗迹和可怕的沙兽。',
    requiredRealm: '筑基',
    requiredRealmLevel: 1,
    staminaCost: 10,
    difficulty: 'normal',
    recommendedPower: 600,
    enemies: ['sand_worm', 'desert_scorpion', 'mummy_warrior'],
    waves: 3,
    drops: [
      { id: 'sand_crystal', name: '沙晶', icon: 'spirit-stone', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.5, description: '沙漠中形成的晶体' },
      { id: 'scorpion_tail', name: '蝎尾', icon: 'beast', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '带有剧毒的蝎尾' },
      { id: 'ancient_relic', name: '古老遗物', icon: 'landmark', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.15, description: '沙漠遗迹中的古老物品' },
      { id: 'mummy_bandage', name: '绷带残片', icon: 'armor', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '古老的绷带，可用于制作' },
      { id: 'desert_boots', name: '沙漠靴', icon: 'armor', type: 'equipment', quality: 'fine', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '适合在沙漠中行走的靴子' }
    ],
    expReward: { min: 50, max: 80 },
    goldReward: { min: 30, max: 50 },
    background: '烈日炙烤着大地，远处的沙丘中似乎有什么在移动...'
  },
  {
    id: 'frozen_tundra',
    name: '冰封雪原',
    icon: 'cloud',
    description: '永恒的冰雪之地，只有最强大的修仙者才能在此生存。',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    staminaCost: 12,
    difficulty: 'hard',
    recommendedPower: 1000,
    enemies: ['ice_wolf', 'frost_giant', 'snow_demon'],
    waves: 3,
    drops: [
      { id: 'ice_crystal', name: '冰晶', icon: 'spirit-stone', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '纯净的冰晶' },
      { id: 'frost_essence', name: '寒霜精华', icon: 'cloud', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.25, description: '蕴含寒冰之力的精华' },
      { id: 'wolf_pelt', name: '冰狼皮', icon: 'beast', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '保暖的冰狼皮毛' },
      { id: 'frozen_heart', name: '冰封之心', icon: 'spirit-stone', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.05, description: '传说中的冰系至宝' },
      { id: 'frost_armor', name: '寒霜护甲', icon: 'armor', type: 'equipment', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.06, description: '蕴含寒冰之力的护甲' }
    ],
    expReward: { min: 80, max: 120 },
    goldReward: { min: 50, max: 80 },
    background: '刺骨的寒风呼啸而过，雪原深处传来阵阵狼嚎...'
  },
  {
    id: 'lava_volcano',
    name: '熔岩火山',
    icon: 'fire',
    description: '炽热的熔岩在火山口翻滚，火属性妖兽在此肆虐。',
    requiredRealm: '金丹',
    requiredRealmLevel: 1,
    staminaCost: 15,
    difficulty: 'hard',
    recommendedPower: 2000,
    enemies: ['fire_elemental', 'lava_golem', 'phoenix_chick'],
    waves: 3,
    drops: [
      { id: 'fire_stone', name: '火灵石', icon: 'fire', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 2, dropRate: 0.4, description: '蕴含火属性灵气的石头' },
      { id: 'lava_core', name: '熔岩核心', icon: 'fire', type: 'material', quality: 'rare', minQuantity: 1, maxQuantity: 1, dropRate: 0.3, description: '凝固的熔岩精华' },
      { id: 'phoenix_feather', name: '凤凰羽毛', icon: 'beast', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.1, description: '传说中的凤凰掉落的羽毛' },
      { id: 'volcanic_ash', name: '火山灰', icon: 'fire', type: 'material', quality: 'fine', minQuantity: 1, maxQuantity: 3, dropRate: 0.5, description: '可用于炼丹的火山灰' },
      { id: 'flame_sword', name: '烈焰剑', icon: 'fire', type: 'equipment', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.04, description: '蕴含烈焰之力的宝剑' }
    ],
    expReward: { min: 150, max: 220 },
    goldReward: { min: 80, max: 120 },
    background: '滚烫的岩浆在脚下流动，空气中弥漫着硫磺的气息...'
  },
  {
    id: 'immortal_ruins',
    name: '仙界遗迹',
    icon: 'landmark',
    description: '上古仙人留下的遗迹，藏有无尽宝藏，却也危机四伏。',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    staminaCost: 20,
    difficulty: 'nightmare',
    recommendedPower: 4000,
    enemies: ['ancient_guardian', 'spirit_wraith', 'celestial_beast'],
    waves: 3,
    drops: [
      { id: 'celestial_jade', name: '天界玉', icon: 'spirit-stone', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 2, dropRate: 0.3, description: '来自仙界的玉石' },
      { id: 'spirit_essence', name: '灵魄精华', icon: 'spark', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.25, description: '纯净的灵魄凝聚物' },
      { id: 'immortal_dust', name: '仙尘', icon: 'spark', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '仙人留下的神尘' },
      { id: 'ancient_scroll', name: '古老卷轴', icon: 'mission', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.15, description: '记载着古老功法的卷轴' },
      { id: 'celestial_blade', name: '天界之刃', icon: 'sword', type: 'equipment', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.02, description: '传说中天界遗落的神器' }
    ],
    expReward: { min: 300, max: 500 },
    goldReward: { min: 150, max: 250 },
    background: '残破的仙宫大殿中，古老的阵法依然在运转...'
  },
  {
    id: 'abyss_depths',
    name: '深渊之底',
    icon: 'void',
    description: '连接魔界的裂隙，最危险的禁地之一。',
    requiredRealm: '元婴',
    requiredRealmLevel: 1,
    staminaCost: 25,
    difficulty: 'nightmare',
    recommendedPower: 8000,
    enemies: ['demon_lord', 'void_walker', 'chaos_serpent'],
    waves: 3,
    drops: [
      { id: 'demon_blood', name: '魔血', icon: 'skull', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 2, dropRate: 0.35, description: '蕴含魔气的血液' },
      { id: 'void_crystal', name: '虚空晶', icon: 'void', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.12, description: '从虚空中凝聚的晶体' },
      { id: 'chaos_essence', name: '混沌精华', icon: 'void', type: 'material', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.08, description: '混沌之力凝聚的精华' },
      { id: 'demon_soul', name: '魔魂', icon: 'skull', type: 'material', quality: 'epic', minQuantity: 1, maxQuantity: 1, dropRate: 0.2, description: '被捕获的魔族灵魂' },
      { id: 'abyss_crown', name: '深渊之冠', icon: 'reputation', type: 'equipment', quality: 'legendary', minQuantity: 1, maxQuantity: 1, dropRate: 0.015, description: '魔界之王的遗物' }
    ],
    expReward: { min: 500, max: 800 },
    goldReward: { min: 300, max: 500 },
    background: '无尽的黑暗深渊中，魔气翻涌，传来阵阵恶魔的低语...'
  }
]
