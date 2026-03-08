import type { WorldRealm } from '@/types/map'
import type { Element, UnitStats } from '@/types/unit'

export type { WorldRealm } from '@/types/map'
export type { Element, UnitStats } from '@/types/unit'

// ====== 伙伴品质 ======
export type CompanionQuality = '凡品' | '灵品' | '仙品' | '神品'

// 伙伴品质配置
export const COMPANION_QUALITY_CONFIG: Record<CompanionQuality, { color: string; starRate: number; baseStatMult: number }> = {
  '凡品': { color: '#9ca3af', starRate: 0.60, baseStatMult: 0.8 },
  '灵品': { color: '#4ade80', starRate: 0.30, baseStatMult: 1.0 },
  '仙品': { color: '#f59e0b', starRate: 0.08, baseStatMult: 1.3 },
  '神品': { color: '#ffd700', starRate: 0.02, baseStatMult: 1.6 }
}

// 伙伴专长
export type CompanionSpecialty = '战斗' | '炼丹' | '锻造' | '符箓' | '阵法' | '探索' | '辅助'

// 伙伴定义
export interface CompanionDefinition {
  id: string
  name: string
  icon: string
  quality: CompanionQuality
  realm: WorldRealm         // 来源界域
  specialty: CompanionSpecialty
  // 基础属性
  baseStats: {
    maxHp: number
    maxMp: number
    attack: number
    defense: number
    speed: number
    critRate: number
    critDamage: number
  }
  element: Element
  // 技能
  skills: string[]
  // 背景故事
  backstory: string
  // 喜欢的礼物类型
  favoriteGiftTypes: string[]
  // 好感度解锁内容
  bondRewards: {
    level: number
    description: string
    type: 'skill' | 'item' | 'story' | 'buff'
    value: string
  }[]
}

// 已拥有伙伴
export interface OwnedCompanion {
  definitionId: string
  level: number
  exp: number
  maxExp: number
  bond: number              // 好感度 0-100
  currentHp: number
  currentMp: number
  equipped: boolean         // 是否上阵
  // 升星
  stars: number             // 1-5星
  fragments: number         // 碎片数量
  // 技能系统
  learnedSkills: string[]   // 已学习的技能ID列表（通过技能书学习）
  maxSkillSlots: number     // 技能槽上限（默认3，可通过升星增加）
}

// 技能书类型
export type SkillBookType = '攻击' | '防御' | '辅助' | '被动'

// 技能书定义
export interface SkillBook {
  id: string
  name: string
  icon: string
  type: SkillBookType
  quality: CompanionQuality
  skillId: string           // 教授的技能ID
  description: string
  requiredLevel: number     // 使用所需伙伴等级
}

// 预定义技能书
export const SKILL_BOOKS: SkillBook[] = [
  // 攻击类技能书
  { id: 'book_fireball', name: '火球术秘籍', icon: '📕', type: '攻击', quality: '凡品', skillId: 'fireball', description: '学习火球术，对敌人造成火属性伤害', requiredLevel: 1 },
  { id: 'book_thunder', name: '雷霆诀', icon: '📗', type: '攻击', quality: '灵品', skillId: 'thunder_strike', description: '学习雷霆一击，召唤雷电攻击敌人', requiredLevel: 5 },
  { id: 'book_sword_rain', name: '万剑归宗秘籍', icon: '📘', type: '攻击', quality: '仙品', skillId: 'sword_rain', description: '学习万剑归宗，对全体敌人造成伤害', requiredLevel: 15 },

  // 防御类技能书
  { id: 'book_shield', name: '护盾术秘籍', icon: '📙', type: '防御', quality: '凡品', skillId: 'shield', description: '学习灵力护盾，创建护盾吸收伤害', requiredLevel: 1 },
  { id: 'book_iron_skin', name: '金刚不坏诀', icon: '📔', type: '防御', quality: '灵品', skillId: 'iron_skin', description: '学习金刚不坏，短时间内大幅提升防御', requiredLevel: 10 },

  // 辅助类技能书
  { id: 'book_heal', name: '回春术秘籍', icon: '📒', type: '辅助', quality: '凡品', skillId: 'heal', description: '学习回春术，恢复友方生命值', requiredLevel: 1 },
  { id: 'book_team_heal', name: '群体治愈诀', icon: '📓', type: '辅助', quality: '仙品', skillId: 'team_heal', description: '学习群体治愈，恢复全体友方生命值', requiredLevel: 20 },

  // 被动类技能书
  { id: 'book_meditation', name: '静心诀秘籍', icon: '📕', type: '被动', quality: '灵品', skillId: 'meditation', description: '学习静心诀，永久提升灵力上限', requiredLevel: 5 },
  { id: 'book_critical', name: '灵眼诀', icon: '📗', type: '被动', quality: '仙品', skillId: 'critical_eye', description: '学习灵眼，永久提升暴击率', requiredLevel: 15 }
]

// 获取技能书
export function getSkillBookById(id: string): SkillBook | undefined {
  return SKILL_BOOKS.find(b => b.id === id)
}

// 礼物类型
export type GiftType = '丹药' | '灵石' | '材料' | '装备' | '宝物' | '食物'

// 礼物定义
export interface Gift {
  id: string
  name: string
  icon: string
  type: GiftType
  quality: CompanionQuality
  bondBonus: number         // 好感度加成
  description: string
}

// 预定义礼物
export const GIFTS: Gift[] = [
  { id: 'gift_herb', name: '灵草礼盒', icon: '🌿', type: '材料', quality: '凡品', bondBonus: 10, description: '一盒新鲜灵草' },
  { id: 'gift_pill', name: '聚气丹', icon: '💊', type: '丹药', quality: '凡品', bondBonus: 15, description: '可提升修为的丹药' },
  { id: 'gift_spirit_stone', name: '灵石', icon: '💎', type: '灵石', quality: '灵品', bondBonus: 20, description: '修仙界的通用货币' },
  { id: 'gift_sword', name: '精钢剑', icon: '⚔️', type: '装备', quality: '灵品', bondBonus: 25, description: '精炼的长剑' },
  { id: 'gift_treasure', name: '上古宝物', icon: '🏺', type: '宝物', quality: '仙品', bondBonus: 50, description: '上古遗留的宝物' },
  { id: 'gift_food', name: '灵果', icon: '🍎', type: '食物', quality: '凡品', bondBonus: 8, description: '蕴含灵气的果实' },
  { id: 'gift_rare_herb', name: '千年灵芝', icon: '🍄', type: '材料', quality: '仙品', bondBonus: 40, description: '生长千年的灵芝' },
  { id: 'gift_divine_item', name: '神品宝物', icon: '✨', type: '宝物', quality: '神品', bondBonus: 100, description: '传说中的神品' }
]

// 抽取结果
export interface GachaResult {
  companion: CompanionDefinition
  isNew: boolean            // 是否新获得
  fragments: number         // 如果不是新的，获得碎片数量
}

// 抽卡配置
export const GACHA_CONFIG = {
  singleCost: 100,          // 单抽消耗灵石
  tenCost: 900,             // 十连消耗灵石
  guaranteeTen: '灵品' as CompanionQuality,  // 10连保底品质
  guaranteeEighty: '仙品' as CompanionQuality, // 80抽保底品质
  fragmentsForStar: 50      // 升星所需碎片
}

// 预定义伙伴数据
export const COMPANIONS: CompanionDefinition[] = [
  // 人界伙伴
  {
    id: 'companion_swordsman',
    name: '剑客青云',
    icon: '🗡️',
    quality: '灵品',
    realm: '人界',
    specialty: '战斗',
    baseStats: { maxHp: 800, maxMp: 300, attack: 120, defense: 60, speed: 110, critRate: 0.15, critDamage: 1.5 },
    element: '金',
    skills: ['basic_slash', 'sword_qi'],
    backstory: '青云宗的天才弟子，剑法超群，性格冷峻。',
    favoriteGiftTypes: ['装备', '丹药'],
    bondRewards: [
      { level: 20, description: '解锁技能：剑气纵横', type: 'skill', value: 'sword_qi_wave' },
      { level: 50, description: '解锁故事：青云往事', type: 'story', value: 'qingyun_story' },
      { level: 80, description: '获得永久攻击+10%', type: 'buff', value: 'attack_10' }
    ]
  },
  {
    id: 'companion_alchemist',
    name: '药灵仙子',
    icon: '💊',
    quality: '仙品',
    realm: '人界',
    specialty: '炼丹',
    baseStats: { maxHp: 600, maxMp: 500, attack: 80, defense: 50, speed: 90, critRate: 0.1, critDamage: 1.3 },
    element: '木',
    skills: ['heal', 'poison'],
    backstory: '药王谷的传人，精通丹道，心地善良。',
    favoriteGiftTypes: ['材料', '丹药'],
    bondRewards: [
      { level: 20, description: '解锁技能：群体治疗', type: 'skill', value: 'group_heal' },
      { level: 50, description: '获得丹药：九转还魂丹', type: 'item', value: 'revival_pill' },
      { level: 80, description: '炼丹成功率+20%', type: 'buff', value: 'alchemy_20' }
    ]
  },
  {
    id: 'companion_thunder',
    name: '雷霆子',
    icon: '⚡',
    quality: '仙品',
    realm: '人界',
    specialty: '战斗',
    baseStats: { maxHp: 900, maxMp: 400, attack: 130, defense: 70, speed: 100, critRate: 0.2, critDamage: 1.6 },
    element: '雷',
    skills: ['thunder_strike', 'lightning_chain'],
    backstory: '雷音阁的年轻长老，雷法天赋惊人。',
    favoriteGiftTypes: ['宝物', '装备'],
    bondRewards: [
      { level: 20, description: '解锁技能：天雷破', type: 'skill', value: 'thunder_break' },
      { level: 50, description: '解锁故事：雷劫洗礼', type: 'story', value: 'thunder_story' },
      { level: 80, description: '雷系伤害+15%', type: 'buff', value: 'thunder_15' }
    ]
  },
  // 妖界伙伴
  {
    id: 'companion_fox',
    name: '九尾灵狐',
    icon: '🦊',
    quality: '仙品',
    realm: '妖界',
    specialty: '辅助',
    baseStats: { maxHp: 700, maxMp: 600, attack: 90, defense: 50, speed: 130, critRate: 0.12, critDamage: 1.4 },
    element: '火',
    skills: ['charm', 'fox_fire'],
    backstory: '青丘狐族的公主，擅长魅惑之术。',
    favoriteGiftTypes: ['宝物', '食物'],
    bondRewards: [
      { level: 20, description: '解锁技能：幻术', type: 'skill', value: 'illusion' },
      { level: 50, description: '解锁故事：青丘传说', type: 'story', value: 'fox_story' },
      { level: 80, description: '速度+20%', type: 'buff', value: 'speed_20' }
    ]
  },
  {
    id: 'companion_dragon',
    name: '龙族少主',
    icon: '🐉',
    quality: '神品',
    realm: '妖界',
    specialty: '战斗',
    baseStats: { maxHp: 1200, maxMp: 500, attack: 150, defense: 100, speed: 90, critRate: 0.18, critDamage: 1.8 },
    element: '水',
    skills: ['dragon_breath', 'water_shield'],
    backstory: '龙宫的继承人，拥有纯正龙族血脉。',
    favoriteGiftTypes: ['宝物', '装备'],
    bondRewards: [
      { level: 20, description: '解锁技能：龙威', type: 'skill', value: 'dragon_might' },
      { level: 50, description: '获得装备：龙鳞甲', type: 'item', value: 'dragon_armor' },
      { level: 80, description: '全属性+10%', type: 'buff', value: 'all_stats_10' }
    ]
  },
  // 魔界伙伴
  {
    id: 'companion_shadow',
    name: '影刃',
    icon: '🌑',
    quality: '仙品',
    realm: '魔界',
    specialty: '战斗',
    baseStats: { maxHp: 750, maxMp: 350, attack: 140, defense: 55, speed: 140, critRate: 0.25, critDamage: 2.0 },
    element: '金',
    skills: ['shadow_strike', 'vanish'],
    backstory: '影盟的王牌刺客，来无影去无踪。',
    favoriteGiftTypes: ['装备', '材料'],
    bondRewards: [
      { level: 20, description: '解锁技能：影分身', type: 'skill', value: 'shadow_clone' },
      { level: 50, description: '暴击率+5%', type: 'buff', value: 'crit_5' },
      { level: 80, description: '暴击伤害+30%', type: 'buff', value: 'crit_damage_30' }
    ]
  },
  {
    id: 'companion_demon',
    name: '血魔女',
    icon: '🩸',
    quality: '神品',
    realm: '魔界',
    specialty: '战斗',
    baseStats: { maxHp: 1000, maxMp: 600, attack: 160, defense: 80, speed: 100, critRate: 0.2, critDamage: 1.7 },
    element: '火',
    skills: ['blood_magic', 'life_drain'],
    backstory: '血魔宗的天才，修炼血道大成。',
    favoriteGiftTypes: ['丹药', '宝物'],
    bondRewards: [
      { level: 20, description: '解锁技能：血海滔天', type: 'skill', value: 'blood_sea' },
      { level: 50, description: '解锁故事：血魔往事', type: 'story', value: 'demon_story' },
      { level: 80, description: '吸血效果+30%', type: 'buff', value: 'lifesteal_30' }
    ]
  },
  // 仙界伙伴
  {
    id: 'companion_celestial',
    name: '天庭仙子',
    icon: '☁️',
    quality: '神品',
    realm: '仙界',
    specialty: '辅助',
    baseStats: { maxHp: 800, maxMp: 800, attack: 100, defense: 70, speed: 110, critRate: 0.15, critDamage: 1.5 },
    element: '雷',
    skills: ['celestial_blessing', 'divine_light'],
    backstory: '天庭的仙女，拥有净化之力。',
    favoriteGiftTypes: ['宝物', '食物'],
    bondRewards: [
      { level: 20, description: '解锁技能：天罚', type: 'skill', value: 'divine_punishment' },
      { level: 50, description: '获得神器：天羽扇', type: 'item', value: 'celestial_fan' },
      { level: 80, description: '治疗效果+50%', type: 'buff', value: 'heal_50' }
    ]
  }
]

// ====== 工具函数 ======

/**
 * 根据ID获取伙伴定义
 */
export function getCompanionById(id: string): CompanionDefinition | undefined {
  return COMPANIONS.find(c => c.id === id)
}

/**
 * 根据界域获取伙伴列表
 */
export function getCompanionsByRealm(realm: WorldRealm): CompanionDefinition[] {
  return COMPANIONS.filter(c => c.realm === realm)
}

/**
 * 根据品质获取伙伴列表
 */
export function getCompanionsByQuality(quality: CompanionQuality): CompanionDefinition[] {
  return COMPANIONS.filter(c => c.quality === quality)
}

/**
 * 随机抽取伙伴
 */
export function rollCompanion(gachaPoints: number): { companion: CompanionDefinition; isNew: boolean } {
  // 确定品质
  let quality: CompanionQuality

  // 80抽保底
  if (gachaPoints >= 80) {
    // 必出仙品或神品
    quality = Math.random() < 0.5 ? '仙品' : '神品'
  } else if (gachaPoints >= 10) {
    // 10抽保底灵品或以上
    const roll = Math.random()
    if (roll < 0.02) quality = '神品'
    else if (roll < 0.10) quality = '仙品'
    else quality = '灵品'
  } else {
    // 正常概率
    const roll = Math.random()
    if (roll < 0.02) quality = '神品'
    else if (roll < 0.10) quality = '仙品'
    else if (roll < 0.40) quality = '灵品'
    else quality = '凡品'
  }

  // 从对应品质中随机选择
  const pool = getCompanionsByQuality(quality)
  if (pool.length === 0) {
    // 如果没有对应品质的伙伴，降级选择
    const allCompanions = COMPANIONS
    return { companion: allCompanions[Math.floor(Math.random() * allCompanions.length)]!, isNew: true }
  }

  return { companion: pool[Math.floor(Math.random() * pool.length)]!, isNew: true }
}

/**
 * 计算伙伴升级所需经验
 */
export function getExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1))
}

/**
 * 计算伙伴当前属性
 */
export function calculateCompanionStats(
  definition: CompanionDefinition,
  owned: OwnedCompanion
): UnitStats {
  const base = definition.baseStats
  const levelMult = 1 + (owned.level - 1) * 0.1
  const starMult = 1 + (owned.stars - 1) * 0.15
  const qualityMult = COMPANION_QUALITY_CONFIG[definition.quality].baseStatMult

  const mult = levelMult * starMult * qualityMult

  return {
    maxHp: Math.floor(base.maxHp * mult),
    currentHp: owned.currentHp,
    maxMp: Math.floor(base.maxMp * mult),
    currentMp: owned.currentMp,
    attack: Math.floor(base.attack * mult),
    defense: Math.floor(base.defense * mult),
    speed: Math.floor(base.speed * mult),
    critRate: base.critRate + (owned.stars - 1) * 0.02,
    critDamage: base.critDamage + (owned.stars - 1) * 0.1
  }
}

/**
 * 获取礼物
 */
export function getGiftById(id: string): Gift | undefined {
  return GIFTS.find(g => g.id === id)
}

/**
 * 计算送礼好感度加成
 */
export function calculateBondBonus(gift: Gift, companion: CompanionDefinition): number {
  let bonus = gift.bondBonus

  // 如果是喜欢的礼物类型，加成50%
  if (companion.favoriteGiftTypes.includes(gift.type)) {
    bonus = Math.floor(bonus * 1.5)
  }

  return bonus
}
