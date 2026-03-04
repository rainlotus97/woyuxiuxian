// ====== 境界系统 ======
export type Realm = '炼气' | '筑基' | '金丹' | '元婴' | '化神' | '渡劫' | '大乘' | '仙人'

export const REALM_ORDER: Realm[] = [
  '炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人'
]

export const REALM_MULTIPLIER: Record<Realm, number> = {
  '炼气': 1.0,
  '筑基': 1.5,
  '金丹': 2.2,
  '元婴': 3.2,
  '化神': 4.5,
  '渡劫': 6.0,
  '大乘': 8.0,
  '仙人': 10.0
}

// ====== 品质系统 ======
export type Quality = '凡品' | '灵品' | '玄品' | '仙品' | '神品'

export const QUALITY_MULTIPLIER: Record<Quality, number> = {
  '凡品': 1.0,
  '灵品': 1.2,
  '玄品': 1.5,
  '仙品': 2.0,
  '神品': 3.0
}

export const QUALITY_COLORS: Record<Quality, string> = {
  '凡品': '#9ca3af',
  '灵品': '#7eb8da',
  '玄品': '#b794f6',
  '仙品': '#f59e0b',
  '神品': '#ffd700'
}

// ====== 五行系统 ======
export type Element = '金' | '木' | '水' | '火' | '土'

export const ELEMENT_COLORS: Record<Element, string> = {
  '金': '#d4af37',
  '木': '#4a9e5f',
  '水': '#4c8a9e',
  '火': '#c35050',
  '土': '#8b7355'
}

// 五行克制关系：key 克制 value
export const ELEMENT_COUNTER: Record<Element, Element> = {
  '金': '木',  // 金克木
  '木': '土',  // 木克土
  '水': '火',  // 水克火
  '火': '金',  // 火克金
  '土': '水'   // 土克水
}

// ====== 状态效果 ======
export type StatusEffectType =
  | 'poison'      // 中毒 - 持续伤害
  | 'burn'        // 燃烧 - 持续火焰伤害
  | 'freeze'      // 冰冻 - 跳过回合
  | 'stun'         // 眩晕 - 跳过回合
  | 'buff_atk'    // 攻击增益
  | 'buff_def'    // 防御增益
  | 'buff_spd'    // 速度增益
  | 'debuff_atk'  // 攻击减弱
  | 'debuff_def'  // 防御减弱
  | 'shield'      // 护盾
  | 'invincible'   // 无敌

export interface StatusEffect {
  type: StatusEffectType
  duration: number      // 剩余回合数
  value?: number        // 效果数值
  sourceId?: string    // 施加效果的单位 ID
  icon?: string        // 显示图标
}

// ====== 单位属性 ======
export interface UnitStats {
  maxHp: number
  currentHp: number
  maxMp: number
  currentMp: number
  attack: number
  defense: number
  speed: number
  critRate: number       // 暴击率 0-1
  critDamage: number     // 暴击伤害倍率
}

// ====== 单位类型 ======
export type UnitType = 'protagonist' | 'companion' | 'pet' | 'enemy'

export interface Unit {
  id: string
  name: string
  type: UnitType
  element: Element
  realm: Realm
  realmLevel: number       // 境界内等级 1-9
  quality: Quality
  level: number
  stats: UnitStats
  skills: string[]         // 技能 ID 列表
  statusEffects: StatusEffect[]
  isAlive: boolean
  icon: string             // 显示用的单字/图标
  avatarUrl?: string       // 可选头像 URL

  // AI 类型（仅敌人使用）
  aiType?: 'aggressive' | 'defensive' | 'support' | 'balanced'
}

// ====== 工具函数 ======

/**
 * 创建默认单位属性的工厂函数
 */
export function createUnit(partial: Partial<Unit> & { id: string; name: string }): Unit {
  return {
    type: 'enemy',
    element: '金',
    realm: '炼气',
    realmLevel: 1,
    quality: '凡品',
    level: 1,
    stats: {
      maxHp: 100,
      currentHp: 100,
      maxMp: 50,
      currentMp: 50,
      attack: 10,
      defense: 5,
      speed: 100,
      critRate: 0.05,
      critDamage: 1.5
    },
    skills: [],
    statusEffects: [],
    isAlive: true,
    icon: '?',
    ...partial
  }
}

/**
 * 根据境界和品质计算基础属性
 */
export function calculateBaseStats(
  realm: Realm,
  quality: Quality,
  level: number
): Omit<UnitStats, 'currentHp' | 'currentMp'> {
  const realmMult = REALM_MULTIPLIER[realm]
  const qualityMult = QUALITY_MULTIPLIER[quality]
  const levelMult = 1 + (level - 1) * 0.1

  const base = 100 * realmMult * qualityMult * levelMult

  return {
    maxHp: Math.floor(base * 1.5),
    maxMp: Math.floor(base * 0.5),
    attack: Math.floor(base * 0.15),
    defense: Math.floor(base * 0.08),
    speed: Math.floor(80 + realmMult * 10 + Math.random() * 20),
    critRate: 0.05 + qualityMult * 0.02,
    critDamage: 1.5 + qualityMult * 0.1
  }
}
