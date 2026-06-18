import type { SkillDefinition } from '@/types/skill'

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  basic_sword: {
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
  sword_qi: {
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
  sword_rain: {
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
  thunder_strike: {
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
        scaling: 1,
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
  basic_defense: {
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
  iron_skin: {
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
          chance: 1,
          duration: 3,
          value: 0.3
        }
      }
    ],
    prerequisites: ['basic_defense'],
    unlockRealm: '筑基'
  },
  shield: {
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
          chance: 1,
          duration: 3,
          value: 50
        }
      }
    ],
    prerequisites: ['basic_defense'],
    unlockRealm: '炼气'
  },
  gathering_qi: {
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
    progressionBonus: {
      cultivationMultiplierPerLevel: 0.08,
      cultivationFlatPerLevel: 0.15
    },
    unlockRealm: '炼气'
  },
  meditation: {
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
    progressionBonus: {
      cultivationMultiplierPerLevel: 0.04
    },
    prerequisites: ['gathering_qi'],
    unlockRealm: '筑基'
  },
  heal: {
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
  team_heal: {
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
  fireball: {
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
  poison_fog: {
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
  hellfire: {
    id: 'hellfire',
    name: '狱炎',
    description: '魔焰席卷敌方，造成灼烧伤害',
    icon: '狱',
    category: 'attack',
    branch: 'special',
    tier: 3,
    mpCost: 32,
    mpCostPerLevel: 4,
    cooldown: 3,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'all_enemies',
        baseValue: 18,
        scaling: 0.85,
        element: '火',
        levelScaling: 5,
        statusEffect: {
          type: 'burn',
          chance: 0.45,
          duration: 2,
          value: 12
        }
      }
    ],
    prerequisites: ['poison_fog'],
    unlockRealm: '金丹'
  },
  shadow_strike: {
    id: 'shadow_strike',
    name: '影袭',
    description: '暗影系敌人的突袭，造成伤害并撕裂伤口。',
    icon: '影',
    category: 'attack',
    branch: 'special',
    tier: 2,
    mpCost: 16,
    cooldown: 2,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 28,
        scaling: 0.95,
        element: '雷',
        statusEffect: {
          type: 'bleed',
          chance: 0.45,
          duration: 2,
          value: 7
        }
      }
    ],
    unlockRealm: '炼气'
  },
  ancient_curse: {
    id: 'ancient_curse',
    name: '古咒',
    description: '古老咒文削弱目标护体，使其更易受伤。',
    icon: '咒',
    category: 'support',
    branch: 'special',
    tier: 2,
    mpCost: 18,
    cooldown: 3,
    maxLevel: 10,
    effects: [
      {
        type: 'special',
        targetType: 'single_enemy',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'vulnerable',
          chance: 1,
          duration: 2,
          value: 0.3
        }
      }
    ],
    unlockRealm: '筑基'
  },
  ancient_seal: {
    id: 'ancient_seal',
    name: '古印封灵',
    description: '上古守卫封住目标灵机，使其短时无法施展技能。',
    icon: '封',
    category: 'support',
    branch: 'special',
    tier: 3,
    mpCost: 26,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'special',
        targetType: 'single_enemy',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'spirit_seal',
          chance: 1,
          duration: 1
        }
      }
    ],
    unlockRealm: '金丹'
  },
  ice_prison: {
    id: 'ice_prison',
    name: '冰牢',
    description: '雪魔凝出冰牢，封住目标行动。',
    icon: '牢',
    category: 'support',
    branch: 'special',
    tier: 3,
    mpCost: 30,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'special',
        targetType: 'single_enemy',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'freeze',
          chance: 0.75,
          duration: 1
        }
      }
    ],
    unlockRealm: '筑基'
  },
  phase_shift: {
    id: 'phase_shift',
    name: '相位偏移',
    description: '虚空系敌人短暂遁入虚隙，抵消下一段伤害。',
    icon: '相',
    category: 'defense',
    branch: 'special',
    tier: 3,
    mpCost: 24,
    cooldown: 5,
    maxLevel: 10,
    effects: [
      {
        type: 'buff',
        targetType: 'self',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'invincible',
          chance: 1,
          duration: 1
        }
      }
    ],
    unlockRealm: '金丹'
  },
  dragon_roar: {
    id: 'dragon_roar',
    name: '龙威震魂',
    description: '龙威压制敌方灵机，削弱攻势并可能禁法。',
    icon: '吼',
    category: 'support',
    branch: 'special',
    tier: 4,
    mpCost: 38,
    cooldown: 5,
    maxLevel: 10,
    effects: [
      {
        type: 'debuff',
        targetType: 'all_enemies',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'debuff_atk',
          chance: 1,
          duration: 2,
          value: 0.22
        }
      },
      {
        type: 'special',
        targetType: 'all_enemies',
        baseValue: 0,
        scaling: 0,
        statusEffect: {
          type: 'spirit_seal',
          chance: 0.35,
          duration: 1
        }
      }
    ],
    unlockRealm: '元婴'
  },
  demon_summon: {
    id: 'demon_summon',
    name: '魔侍召来',
    description: '撕开深渊裂隙，召来魔侍加入战场',
    icon: '召',
    category: 'support',
    branch: 'special',
    tier: 3,
    mpCost: 28,
    mpCostPerLevel: 3,
    cooldown: 4,
    maxLevel: 10,
    effects: [
      {
        type: 'summon',
        targetType: 'self',
        baseValue: 0,
        scaling: 0,
        summon: {
          definitionId: 'abyss_guard',
          count: 2,
          maxActive: 2
        }
      }
    ],
    prerequisites: ['hellfire'],
    unlockRealm: '金丹'
  },
  abyss_claw: {
    id: 'abyss_claw',
    name: '魔侍裂爪',
    description: '深渊魔侍的本能撕裂，攻击单体并附加流血。',
    icon: '爪',
    category: 'attack',
    branch: 'special',
    tier: 3,
    mpCost: 8,
    cooldown: 1,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 18,
        scaling: 0.9,
        element: '火',
        statusEffect: {
          type: 'bleed',
          chance: 0.5,
          duration: 2,
          value: 8
        }
      }
    ],
    unlockRealm: '金丹'
  },
  spirit_sword_cut: {
    id: 'spirit_sword_cut',
    name: '灵剑穿心',
    description: '灵剑化身凝出剑芒，专斩气机薄弱处。',
    icon: '穿',
    category: 'attack',
    branch: 'attack',
    tier: 2,
    mpCost: 0,
    cooldown: 1,
    maxLevel: 10,
    effects: [
      {
        type: 'damage',
        targetType: 'single_enemy',
        baseValue: 16,
        scaling: 1,
        element: '金'
      }
    ],
    unlockRealm: '筑基'
  },
  critical_eye: {
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
