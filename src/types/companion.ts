import type { WorldRealm } from '@/types/map'
import type { Element, StatusEffectType, UnitStats } from '@/types/unit'
import type { ContentDefinition, DefinitionSkillRefs } from './definition'


// ====== 伙伴品质 ======
export type CompanionQuality = '凡品' | '灵品' | '仙品' | '神品'

export const COMPANION_QUALITY_CONFIG: Record<CompanionQuality, { baseStatMult: number; label: string; color: string }> = {
  '凡品': { baseStatMult: 1.0, label: '凡品', color: '#9ca3af' },
  '灵品': { baseStatMult: 1.2, label: '灵品', color: '#7eb8da' },
  '仙品': { baseStatMult: 1.5, label: '仙品', color: '#f59e0b' },
  '神品': { baseStatMult: 2.0, label: '神品', color: '#ff4444' }
}


// 伙伴品质配置


// 伙伴专长
export type CompanionSpecialty = '战斗' | '炼丹' | '锻造' | '符箓' | '阵法' | '探索' | '辅助'

export type CompanionRelationshipSkillKind = 'heal' | 'shield' | 'control' | 'buff' | 'summon'

export interface CompanionRelationshipSkill {
  id: string
  name: string
  kind: CompanionRelationshipSkillKind
  icon: string
  bondRequired: number
  value: number
  duration?: number
  statusType?: Extract<StatusEffectType, 'buff_atk' | 'buff_def' | 'buff_spd'>
  description: string
}

// 伙伴定义
export interface CompanionDefinition extends ContentDefinition, DefinitionSkillRefs {
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
  relationshipSkills: CompanionRelationshipSkill[]
  // 背景故事
  backstory: string
  // 喜欢的礼物类型
  // 好感度解锁内容
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

// 技能书定义


// 预定义技能书


// 礼物类型

// 礼物定义


// 预定义礼物


// 抽卡配置


// 预定义伙伴数据
export interface GachaResult {
  companion: CompanionDefinition
  fragments: number
  isNew?: boolean
}

export interface CompanionGift {
  id: string
  name: string
  description: string
  bondValue: number
  price: number
}

export const GIFTS: CompanionGift[] = []

export const GACHA_CONFIG = {
  singleCost: 100,
  tenCost: 900,
  freeDaily: 1,
  pityCount: 80,
  fragmentsForStar: 60,
  rates: {
    rare: 0.5,
    epic: 0.35,
    legendary: 0.15
  }
} as const

function normalizeCompanionDefinition(definition: CompanionDefinition): CompanionDefinition {
  const skillIds = [...new Set(definition.skillIds ?? definition.skills ?? [])]
  return {
    ...definition,
    skillIds,
    skills: [...skillIds],
    relationshipSkills: [...(definition.relationshipSkills ?? [])],
    affiliation: definition.affiliation ?? { organizationKind: 'independent' }
  }
}

const RAW_COMPANIONS: CompanionDefinition[] = [
  {
    id: 'companion_bai_ruoli',
    name: '白若璃',
    icon: '药',
    quality: '仙品',
    realm: '人界',
    specialty: '炼丹',
    baseStats: {
      maxHp: 260,
      maxMp: 220,
      attack: 36,
      defense: 24,
      speed: 118,
      critRate: 0.08,
      critDamage: 1.55
    },
    element: '木',
    skills: ['heal'],
    relationshipSkills: [
      {
        id: 'bai_ruoli_healing_breath',
        name: '回春息',
        kind: 'heal',
        icon: 'heal',
        bondRequired: 0,
        value: 18,
        description: '以药息稳住主角气血，恢复最大气血的 18%。'
      },
      {
        id: 'bai_ruoli_jade_guard',
        name: '玉脉护身',
        kind: 'shield',
        icon: 'armor',
        bondRequired: 35,
        value: 14,
        duration: 3,
        description: '结成玉脉护持，获得相当于最大气血 14% 的护盾，持续 3 回合。'
      }
    ],
    affiliation: { organizationId: 'medicine_valley', organizationKind: 'sect' },
    backstory: '药王谷真传，擅药理、晓人心。她会先替你稳住伤势，再慢慢把宗门、药脉和人情债一并带进命里。'
  },
  {
    id: 'companion_lin_qinghan',
    name: '林清寒',
    icon: '霜',
    quality: '仙品',
    realm: '人界',
    specialty: '战斗',
    baseStats: {
      maxHp: 320,
      maxMp: 160,
      attack: 48,
      defense: 30,
      speed: 124,
      critRate: 0.12,
      critDamage: 1.68
    },
    element: '水',
    skills: ['basic_sword', 'sword_qi'],
    relationshipSkills: [
      {
        id: 'lin_qinghan_frost_lock',
        name: '霜意定势',
        kind: 'control',
        icon: 'ice',
        bondRequired: 0,
        value: 1,
        description: '压住眼前一处危险，使下一次世界推进更偏向可控结果。'
      },
      {
        id: 'lin_qinghan_sword_intent',
        name: '同锋剑意',
        kind: 'buff',
        icon: 'sword',
        bondRequired: 45,
        value: 0.12,
        duration: 3,
        statusType: 'buff_atk',
        description: '以同锋剑意提振攻势，攻击提高 12%，持续 3 回合。'
      }
    ],
    affiliation: { organizationId: 'qingyun_sect', organizationKind: 'sect' },
    backstory: '青云山剑阁真传，剑意清寒。若被她认作同路之人，她的剑会替你挡很多本该落在身上的杀机。'
  },
  {
    id: 'companion_ye_wuhen',
    name: '叶无痕',
    icon: '影',
    quality: '神品',
    realm: '人界',
    specialty: '探索',
    baseStats: {
      maxHp: 288,
      maxMp: 180,
      attack: 52,
      defense: 26,
      speed: 136,
      critRate: 0.16,
      critDamage: 1.8
    },
    element: '雷',
    skills: ['shadow_strike', 'critical_eye'],
    relationshipSkills: [
      {
        id: 'ye_wuhen_shadow_double',
        name: '影替',
        kind: 'summon',
        icon: 'beast',
        bondRequired: 0,
        value: 1,
        duration: 1,
        description: '召来一道影替同行，记录一次额外援手并降低下一次赶路的失手风险。'
      },
      {
        id: 'ye_wuhen_silent_step',
        name: '无声步',
        kind: 'buff',
        icon: 'wind',
        bondRequired: 40,
        value: 0.15,
        duration: 3,
        statusType: 'buff_spd',
        description: '借影遁提升身法，速度提高 15%，持续 3 回合。'
      }
    ],
    affiliation: { organizationKind: 'independent' },
    backstory: '影城来客，行踪极轻，话也极少。他更像一道会在关键时刻从暗处伸来的影子，先帮你过局，再慢慢谈代价。'
  }
]

export const COMPANIONS: CompanionDefinition[] = RAW_COMPANIONS.map(normalizeCompanionDefinition)

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


/**
 * 根据品质获取伙伴列表
 */


/**
 * 随机抽取伙伴
 */


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


/**
 * 计算送礼好感度加成
 */


export function rollCompanion(): GachaResult | null {
  if (COMPANIONS.length === 0) return null

  const pick = COMPANIONS[Math.floor(Math.random() * COMPANIONS.length)]
  if (!pick) return null

  return {
    companion: pick,
    fragments: 0
  }
}

export function calculateBondBonus(
  giftOrFavor: CompanionGift | number,
  _companion?: CompanionDefinition
): number {
  const favor = typeof giftOrFavor === 'number' ? giftOrFavor : giftOrFavor.bondValue
  return Math.max(1, Math.floor(favor / 10))
}
