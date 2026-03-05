import type { Element, StatusEffectType } from './unit'

// ====== 技能分类 ======
export type SkillCategory = 'attack' | 'defense' | 'support' | 'passive'

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
  // 等级加成（每级增加的百分比）
  levelScaling?: number
}

// ====== 技能树分支 ======
export type SkillBranch = 'attack' | 'defense' | 'cultivation' | 'special'

// ====== 技能定义（模板） ======
export interface SkillDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: SkillCategory
  branch: SkillBranch           // 技能树分支
  tier: number                  // 技能层级（1-5），需要前置技能
  mpCost: number
  mpCostPerLevel?: number       // 每级额外MP消耗
  cooldown: number
  effects: SkillEffect[]
  prerequisites?: string[]      // 前置技能ID
  unlockRealm?: string          // 解锁所需境界
  maxLevel: number              // 最大等级
  // 被动效果（永久加成）
  passiveBonus?: {
    stat: 'attack' | 'defense' | 'maxHp' | 'maxMp' | 'critRate' | 'critDamage' | 'speed'
    valuePerLevel: number       // 每级加成
  }
}

// ====== 玩家已学技能 ======
export interface LearnedSkill {
  id: string
  level: number
  exp: number
  maxExp: number
  currentCooldown: number
  enabled: boolean              // 是否启用（被动技能可开关）
}

// ====== 技能树节点 ======
export interface SkillTreeNode {
  skillId: string
  position: { x: number; y: number }
  connections: string[]         // 连接的下一技能ID
}

// ====== 预定义技能 ======
export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  // ====== 攻击分支 ======
  'basic_sword': {
    id: 'basic_sword',
    name: '基础剑法',
    description: '最基础的剑术，对单体敌人造成伤害',
    icon: '剑',
    category: 'attack',
    branch: 'attack',
    tier: 1,
    mpCost: 0,
    cooldown: 0,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 10,
        scaling: 0.8,
        levelScaling: 5
      }
    ],
    unlockRealm: '炼气'
  },
  'sword_qi': {
    id: 'sword_qi',
    name: '剑气斩',
    description: '释放剑气，对单体敌人造成较高伤害',
    icon: '气',
    category: 'attack',
    branch: 'attack',
    tier: 2,
    mpCost: 15,
    mpCostPerLevel: 2,
    cooldown: 2,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 30,
        scaling: 1.2,
        levelScaling: 8
      }
    ],
    prerequisites: ['basic_sword'],
    unlockRealm: '炼气'
  },
  'sword_rain': {
    id: 'sword_rain',
    name: '万剑归宗',
    description: '召唤无数剑气，对全体敌人造成伤害',
    icon: '万',
    category: 'attack',
    branch: 'attack',
    tier: 3,
    mpCost: 40,
    mpCostPerLevel: 5,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'all_enemies',
        baseValue: 25,
        scaling: 0.9,
        levelScaling: 6
      }
    ],
    prerequisites: ['sword_qi'],
    unlockRealm: '筑基'
  },
  'thunder_strike': {
    id: 'thunder_strike',
    name: '雷霆一击',
    description: '召唤雷霆之力，对单体敌人造成雷属性伤害',
    icon: '雷',
    category: 'attack',
    branch: 'attack',
    tier: 2,
    mpCost: 20,
    mpCostPerLevel: 3,
    cooldown: 3,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 45,
        scaling: 1.0,
        element: '雷',
        levelScaling: 10,
        statusEffect: {
          type: 'stun',
          chance: 0.15,
          duration: 1
        }
      }
    ],
    prerequisites: ['basic_sword'],
    unlockRealm: '炼气'
  },

  // ====== 防御分支 ======
  'basic_defense': {
    id: 'basic_defense',
    name: '护体诀',
    description: '基础防御心法，永久提升防御力',
    icon: '盾',
    category: 'defense',
    branch: 'defense',
    tier: 1,
    mpCost: 0,
    cooldown: 0,
    maxLevel: 10,
    effects: [],
    passiveBonus: {
      stat: 'defense',
      valuePerLevel: 5
    },
    unlockRealm: '炼气'
  },
  'iron_skin': {
    id: 'iron_skin',
    name: '金刚不坏',
    description: '短时间内大幅提升防御力',
    icon: '金',
    category: 'defense',
    branch: 'defense',
    tier: 2,
    mpCost: 25,
    mpCostPerLevel: 3,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'buff',
        targetType: 'self',
        baseValue: 0,
        scaling: 0,
        levelScaling: 5,
        statusEffect: {
          type: 'buff_def',
          chance: 1.0,
          duration: 3,
          value: 0.3
        }
      }
    ],
    prerequisites: ['basic_defense'],
    unlockRealm: '筑基'
  },
  'shield': {
    id: 'shield',
    name: '灵力护盾',
    description: '创建一个灵力护盾吸收伤害',
    icon: '罩',
    category: 'defense',
    branch: 'defense',
    tier: 2,
    mpCost: 30,
    mpCostPerLevel: 4,
    cooldown: 5,
    maxLevel: 10,
    effects: [
      {
        type: 'buff',
        targetType: 'self',
        baseValue: 0,
        scaling: 0,
        levelScaling: 10,
        statusEffect: {
          type: 'shield',
          chance: 1.0,
          duration: 3,
          value: 50
        }
      }
    ],
    prerequisites: ['basic_defense'],
    unlockRealm: '炼气'
  },

  // ====== 修炼分支 ======
  'gathering_qi': {
    id: 'gathering_qi',
    name: '聚气诀',
    description: '提升修炼速度的被动技能',
    icon: '聚',
    category: 'passive',
    branch: 'cultivation',
    tier: 1,
    mpCost: 0,
    cooldown: 0,
    maxLevel: 10,
    effects: [],
    unlockRealm: '炼气'
  },
  'meditation': {
    id: 'meditation',
    name: '静心诀',
    description: '永久提升灵力上限',
    icon: '静',
    category: 'passive',
    branch: 'cultivation',
    tier: 2,
    mpCost: 0,
    cooldown: 0,
    maxLevel: 10,
    effects: [],
    passiveBonus: {
      stat: 'maxMp',
      valuePerLevel: 15
    },
    prerequisites: ['gathering_qi'],
    unlockRealm: '筑基'
  },
  'heal': {
    id: 'heal',
    name: '回春术',
    description: '恢复单体友方生命值',
    icon: '愈',
    category: 'support',
    branch: 'cultivation',
    tier: 2,
    mpCost: 20,
    mpCostPerLevel: 2,
    cooldown: 3,
    maxLevel: 10,
    effects: [
      {
        type: 'heal',
        targetType: 'single_ally',
        baseValue: 50,
        scaling: 0,
        levelScaling: 15
      }
    ],
    prerequisites: ['gathering_qi'],
    unlockRealm: '炼气'
  },
  'team_heal': {
    id: 'team_heal',
    name: '群体治愈',
    description: '恢复全体友方生命值',
    icon: '治',
    category: 'support',
    branch: 'cultivation',
    tier: 3,
    mpCost: 50,
    mpCostPerLevel: 5,
    cooldown: 5,
    maxLevel: 10,
    effects: [
      {
        type: 'heal',
        targetType: 'all_allies',
        baseValue: 30,
        scaling: 0,
        levelScaling: 8
      }
    ],
    prerequisites: ['heal'],
    unlockRealm: '金丹'
  },

  // ====== 特殊分支 ======
  'fireball': {
    id: 'fireball',
    name: '火球术',
    description: '释放火球攻击敌人，有几率附加灼烧',
    icon: '火',
    category: 'attack',
    branch: 'special',
    tier: 1,
    mpCost: 12,
    mpCostPerLevel: 2,
    cooldown: 1,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 25,
        scaling: 0.9,
        element: '火',
        levelScaling: 6,
        statusEffect: {
          type: 'burn',
          chance: 0.2,
          duration: 2,
          value: 5
        }
      }
    ],
    unlockRealm: '炼气'
  },
  'poison_fog': {
    id: 'poison_fog',
    name: '毒雾术',
    description: '释放毒雾，对全体敌人造成伤害并附加中毒',
    icon: '毒',
    category: 'attack',
    branch: 'special',
    tier: 2,
    mpCost: 35,
    mpCostPerLevel: 4,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'all_enemies',
        baseValue: 15,
        scaling: 0.6,
        element: '木',
        levelScaling: 4,
        statusEffect: {
          type: 'poison',
          chance: 0.4,
          duration: 3,
          value: 8
        }
      }
    ],
    prerequisites: ['fireball'],
    unlockRealm: '筑基'
  },
  'critical_eye': {
    id: 'critical_eye',
    name: '灵眼',
    description: '永久提升暴击率',
    icon: '眼',
    category: 'passive',
    branch: 'special',
    tier: 2,
    mpCost: 0,
    cooldown: 0,
    maxLevel: 10,
    effects: [],
    passiveBonus: {
      stat: 'critRate',
      valuePerLevel: 0.02
    },
    prerequisites: ['fireball'],
    unlockRealm: '筑基'
  }
}

// ====== 技能树结构 ======
export const SKILL_TREE: Record<SkillBranch, SkillTreeNode[]> = {
  attack: [
    { skillId: 'basic_sword', position: { x: 0, y: 0 }, connections: ['sword_qi', 'thunder_strike'] },
    { skillId: 'sword_qi', position: { x: -1, y: 1 }, connections: ['sword_rain'] },
    { skillId: 'thunder_strike', position: { x: 1, y: 1 }, connections: [] },
    { skillId: 'sword_rain', position: { x: -1, y: 2 }, connections: [] }
  ],
  defense: [
    { skillId: 'basic_defense', position: { x: 0, y: 0 }, connections: ['iron_skin', 'shield'] },
    { skillId: 'iron_skin', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'shield', position: { x: 1, y: 1 }, connections: [] }
  ],
  cultivation: [
    { skillId: 'gathering_qi', position: { x: 0, y: 0 }, connections: ['meditation', 'heal'] },
    { skillId: 'meditation', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'heal', position: { x: 1, y: 1 }, connections: ['team_heal'] },
    { skillId: 'team_heal', position: { x: 1, y: 2 }, connections: [] }
  ],
  special: [
    { skillId: 'fireball', position: { x: 0, y: 0 }, connections: ['poison_fog', 'critical_eye'] },
    { skillId: 'poison_fog', position: { x: -1, y: 1 }, connections: [] },
    { skillId: 'critical_eye', position: { x: 1, y: 1 }, connections: [] }
  ]
}

// ====== 辅助函数 ======

// 获取技能定义
export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS[id]
}

// 批量获取技能定义
export function getSkillDefinitions(ids: string[]): SkillDefinition[] {
  return ids.map(id => SKILL_DEFINITIONS[id]).filter((s): s is SkillDefinition => s !== undefined)
}

// 计算技能升级所需经验
export function calculateSkillExpRequired(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// 计算技能效果（考虑等级）
export function calculateSkillEffectValue(effect: SkillEffect, skillLevel: number): number {
  const levelBonus = effect.levelScaling ? effect.levelScaling * (skillLevel - 1) : 0
  return effect.baseValue + levelBonus
}

// 计算技能MP消耗（考虑等级）
export function calculateSkillMpCost(skill: SkillDefinition, level: number): number {
  const levelCost = skill.mpCostPerLevel ? skill.mpCostPerLevel * (level - 1) : 0
  return skill.mpCost + levelCost

}

// 检查技能是否可用
export function isSkillDefinitionAvailable(skill: SkillDefinition, _playerRealm: string, playerMp: number, level: number): boolean {
  // 检查 MP
  if (calculateSkillMpCost(skill, level) > playerMp) return false
  // 检查冷却
  if (skill.cooldown > 0) return false
  return true
}

// 获取分支下所有技能
export function getSkillsByBranch(branch: SkillBranch): SkillDefinition[] {
  const nodeSkillIds = SKILL_TREE[branch].map(node => node.skillId)
  return nodeSkillIds.map(id => SKILL_DEFINITIONS[id]).filter((s): s is SkillDefinition => s !== undefined)
}

// 获取初始技能
export function getStarterSkills(): string[] {
  return ['basic_sword', 'basic_defense', 'gathering_qi', 'fireball']
}

// 创建已学技能
export function createLearnedSkill(skillId: string): LearnedSkill | null {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return null

  return {
    id: skillId,
    level: 1,
    exp: 0,
    maxExp: calculateSkillExpRequired(1),
    currentCooldown: 0,
    enabled: true
  }
}

// ====== 战斗系统兼容类型和函数 ======

// 战斗中使用的技能类型（包含运行时状态）
export interface Skill extends SkillDefinition {
  currentCooldown: number  // 当前冷却回合数
}

// 根据 ID 获取技能（用于战斗系统）
export function getSkillById(skillId: string): Skill | undefined {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return undefined

  return {
    ...definition,
    currentCooldown: 0
  }
}

// 根据 ID 列表批量获取技能
export function getSkillsByIds(skillIds: string[]): Skill[] {
  return skillIds
    .map(id => getSkillById(id))
    .filter((s): s is Skill => s !== undefined)
}

// 检查技能是否可用（MP 足够且冷却完成）
export function isSkillAvailable(skill: Skill, unit: { stats: { currentMp: number } }): boolean {
  if (skill.currentCooldown > 0) return false
  if (skill.mpCost > unit.stats.currentMp) return false
  return true
}

// 获取技能在特定等级时的 MP 消耗
export function getSkillMpCostAtLevel(skillId: string, level: number): number {
  const definition = SKILL_DEFINITIONS[skillId]
  if (!definition) return 0
  return calculateSkillMpCost(definition, level)
}

// 获取技能在特定等级时的效果值
export function getSkillEffectValueAtLevel(effect: SkillEffect, level: number): number {
  return calculateSkillEffectValue(effect, level)
}

// ====== 战斗系统基础技能 ======

// 基础战斗技能（用于自动战斗）
export const BASIC_SKILLS: Skill[] = [
  {
    ...SKILL_DEFINITIONS['basic_sword'],
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS['fireball'],
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS['heal'],
    currentCooldown: 0
  } as Skill,
  {
    ...SKILL_DEFINITIONS['shield'],
    currentCooldown: 0
  } as Skill
].filter((s): s is Skill => s !== undefined)
