import type { Element, StatusEffectType, Unit } from './unit'

// ====== 技能目标类型 ======
export type SkillTargetType =
  | 'single_enemy'     // 单体敌人
  | 'all_enemies'      // 全体敌人
  | 'single_ally'      // 单体友方
  | 'all_allies'       // 全体友方
  | 'self'             // 自身

// ====== 技能效果类型 ======
export type SkillEffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'special'

// ====== 技能效果 ======
export interface SkillEffect {
  type: SkillEffectType
  targetType: SkillTargetType
  baseValue: number           // 基础数值（伤害/治疗量）
  scaling: number             // 攻击力加成倍率
  element?: Element           // 元素类型（默认使用单位自身元素）
  statusEffect?: {
    type: StatusEffectType
    chance: number            // 触发概率 0-1
    duration: number          // 持续回合数
    value?: number            // 效果数值
  }
}

// ====== 技能定义 ======
export interface Skill {
  id: string
  name: string
  description: string
  icon: string               // 显示用的单字/图标
  mpCost: number             // 灵力消耗
  cooldown: number           // 冷却回合数
  currentCooldown: number    // 当前剩余冷却
  effects: SkillEffect[]
  unlockRealm?: string       // 解锁所需境界
}

// ====== 预定义技能 ======

export const BASIC_SKILLS: Skill[] = [
  // 基础攻击
  {
    id: 'basic_attack',
    name: '普通攻击',
    description: '对单个敌人造成基础伤害',
    icon: '攻',
    mpCost: 0,
    cooldown: 0,
    currentCooldown: 0,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 0,
        scaling: 1.0
      }
    ]
  },
  // 防御
  {
    id: 'defend',
    name: '防御',
    description: '进入防御姿态，本回合受到的伤害减少50%',
    icon: '防',
    mpCost: 0,
    cooldown: 0,
    currentCooldown: 0,
    effects: [
      {
        type: 'buff',
        targetType: 'self',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'buff_def',
          chance: 1.0,
          duration: 1,
          value: 0.5
        }
      }
    ]
  },
  // 火球术
  {
    id: 'fireball',
    name: '火球术',
    description: '对单个敌人造成火属性伤害，有几率附加燃烧效果',
    icon: '火',
    mpCost: 15,
    cooldown: 0,
    currentCooldown: 0,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 20,
        scaling: 1.5,
        element: '火',
        statusEffect: {
          type: 'burn',
          chance: 0.3,
          duration: 2,
          value: 5
        }
      }
    ]
  },
  // 冰锥术
  {
    id: 'ice_spike',
    name: '冰锥术',
    description: '对单个敌人造成水属性伤害，有几率冰冻目标',
    icon: '冰',
    mpCost: 20,
    cooldown: 0,
    currentCooldown: 0,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 15,
        scaling: 1.3,
        element: '水',
        statusEffect: {
          type: 'freeze',
          chance: 0.2,
          duration: 1
        }
      }
    ]
  },
  // 雷霆万钧
  {
    id: 'thunder_strike',
    name: '雷霆万钧',
    description: '对全体敌人造成金属性伤害',
    icon: '雷',
    mpCost: 30,
    cooldown: 2,
    currentCooldown: 0,
    effects: [
      {
        type: 'damage',
        targetType: 'all_enemies',
        baseValue: 10,
        scaling: 1.2,
        element: '金'
      }
    ]
  },
  // 治疗术
  {
    id: 'heal',
    name: '回春术',
    description: '恢复单个友方单位的生命值',
    icon: '愈',
    mpCost: 25,
    cooldown: 1,
    currentCooldown: 0,
    effects: [
      {
        type: 'heal',
        targetType: 'single_ally',
        baseValue: 30,
        scaling: 0.5
      }
    ]
  },
  // 群体治疗
  {
    id: 'group_heal',
    name: '普渡众生',
    description: '恢复全体友方单位的生命值',
    icon: '渡',
    mpCost: 50,
    cooldown: 3,
    currentCooldown: 0,
    effects: [
      {
        type: 'heal',
        targetType: 'all_allies',
        baseValue: 20,
        scaling: 0.3
      }
    ]
  },
  // 毒雾
  {
    id: 'poison_fog',
    name: '毒雾',
    description: '对全体敌人造成木属性伤害并附加中毒效果',
    icon: '毒',
    mpCost: 35,
    cooldown: 2,
    currentCooldown: 0,
    effects: [
      {
        type: 'damage',
        targetType: 'all_enemies',
        baseValue: 8,
        scaling: 0.8,
        element: '木',
        statusEffect: {
          type: 'poison',
          chance: 0.5,
          duration: 3,
          value: 5
        }
      }
    ]
  },
  // 护盾术
  {
    id: 'shield',
    name: '金刚护体',
    description: '为自身添加护盾，吸收一定伤害',
    icon: '盾',
    mpCost: 20,
    cooldown: 2,
    currentCooldown: 0,
    effects: [
      {
        type: 'buff',
        targetType: 'self',
        baseValue: 50,
        scaling: 0.5,
        statusEffect: {
          type: 'shield',
          chance: 1.0,
          duration: 3
        }
      }
    ]
  },
  // 破甲术
  {
    id: 'armor_break',
    name: '破甲术',
    description: '降低单个敌人的防御力',
    icon: '破',
    mpCost: 15,
    cooldown: 1,
    currentCooldown: 0,
    effects: [
      {
        type: 'debuff',
        targetType: 'single_enemy',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'debuff_def',
          chance: 0.8,
          duration: 2,
          value: 0.3
        }
      }
    ]
  }
]

// ====== 技能工具函数 ======

/**
 * 根据 ID 获取技能
 */
export function getSkillById(id: string): Skill | undefined {
  return BASIC_SKILLS.find(s => s.id === id)
}

/**
 * 根据 ID 列表获取技能列表
 */
export function getSkillsByIds(ids: string[]): Skill[] {
  return ids.map(getSkillById).filter((s): s is Skill => s !== undefined)
}

/**
 * 检查技能是否可用
 */
export function isSkillAvailable(skill: Skill, unit: Unit): boolean {
  // 检查 MP 是否足够
  if (unit.stats.currentMp < skill.mpCost) {
    return false
  }
  // 检查冷却是否完成
  if (skill.currentCooldown > 0) {
    return false
  }
  return true
}
