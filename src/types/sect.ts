import type { WorldRealm } from '@/types/map'
import type { Realm } from '@/types/unit'

export type { WorldRealm } from '@/types/map'
export type { Realm } from '@/types/unit'

// ====== 宗门定义 ======

// 宗门特色类型
export type SectSpecialty = '炼丹' | '锻造' | '符箓' | '阵法' | '御兽' | '剑修' | '体修' | '魔修'

// 职位等级
export interface SectPosition {
  level: number           // 职位等级 1-7
  name: string            // 职位名称
  requiredContribution: number  // 晋升所需贡献
  privileges: string[]    // 职位特权
  dailySalary: number     // 每日俸禄（灵石）
}

// 职位等级配置
export const SECT_POSITIONS: SectPosition[] = [
  { level: 1, name: '外门弟子', requiredContribution: 0, privileges: ['基础设施使用'], dailySalary: 10 },
  { level: 2, name: '内门弟子', requiredContribution: 100, privileges: ['基础设施使用', '中级设施使用'], dailySalary: 30 },
  { level: 3, name: '亲传弟子', requiredContribution: 500, privileges: ['基础设施使用', '中级设施使用', '高级设施使用'], dailySalary: 80 },
  { level: 4, name: '执事', requiredContribution: 1500, privileges: ['基础设施使用', '中级设施使用', '高级设施使用', '宗门决策参与'], dailySalary: 150 },
  { level: 5, name: '长老', requiredContribution: 5000, privileges: ['基础设施使用', '中级设施使用', '高级设施使用', '宗门决策参与', '外交投票权'], dailySalary: 300 },
  { level: 6, name: '副掌门', requiredContribution: 15000, privileges: ['全部设施', '宗门决策主导', '外交决策权', '宣战权'], dailySalary: 500 },
  { level: 7, name: '掌门', requiredContribution: 50000, privileges: ['宗门最高权力'], dailySalary: 1000 }
]

// 宗门设施
export interface SectFacility {
  id: string
  name: string
  icon: string
  type: 'alchemy' | 'forge' | 'library' | 'medicine_garden' | 'training' | 'treasury'
  level: number           // 设施等级
  maxLevel: number        // 最大等级
  description: string
  unlockPosition: number  // 需要的职位等级
  // 升级消耗
  upgradeCost: { gold: number; contribution: number; materials?: string[] }
  // 设施效果
  effects: {
    type: string
    value: number
    description: string
  }[]
}

// 预定义设施
export const SECT_FACILITIES: SectFacility[] = [
  {
    id: 'alchemy_furnace',
    name: '炼丹炉',
    icon: '🔥',
    type: 'alchemy',
    level: 1,
    maxLevel: 5,
    description: '用于炼制各种丹药的炉鼎。',
    unlockPosition: 1,
    upgradeCost: { gold: 500, contribution: 50 },
    effects: [
      { type: 'alchemy_success_rate', value: 5, description: '炼丹成功率+5%' },
      { type: 'alchemy_quality_bonus', value: 0.1, description: '丹药品质提升' }
    ]
  },
  {
    id: 'weapon_forge',
    name: '锻造坊',
    icon: '⚒️',
    type: 'forge',
    level: 1,
    maxLevel: 5,
    description: '打造和强化装备的工坊。',
    unlockPosition: 1,
    upgradeCost: { gold: 500, contribution: 50 },
    effects: [
      { type: 'forge_success_rate', value: 5, description: '锻造成功率+5%' },
      { type: 'forge_quality_bonus', value: 0.1, description: '装备品质提升' }
    ]
  },
  {
    id: 'medicine_garden',
    name: '药园',
    icon: '🌿',
    type: 'medicine_garden',
    level: 1,
    maxLevel: 5,
    description: '种植各种灵草的园地。',
    unlockPosition: 2,
    upgradeCost: { gold: 800, contribution: 100 },
    effects: [
      { type: 'herb_yield', value: 10, description: '灵草产量+10%' },
      { type: 'herb_quality', value: 0.1, description: '灵草品质提升' }
    ]
  },
  {
    id: 'library',
    name: '藏经阁',
    icon: '📚',
    type: 'library',
    level: 1,
    maxLevel: 5,
    description: '收藏各种功法秘籍的阁楼。',
    unlockPosition: 2,
    upgradeCost: { gold: 1000, contribution: 150 },
    effects: [
      { type: 'skill_exp_bonus', value: 0.1, description: '技能经验+10%' },
      { type: 'new_skills', value: 1, description: '解锁更多功法' }
    ]
  },
  {
    id: 'training_ground',
    name: '演武场',
    icon: '⚔️',
    type: 'training',
    level: 1,
    maxLevel: 5,
    description: '提升战斗技巧的修炼场。',
    unlockPosition: 3,
    upgradeCost: { gold: 1500, contribution: 200 },
    effects: [
      { type: 'combat_exp_bonus', value: 0.1, description: '战斗经验+10%' },
      { type: 'sparring_partners', value: 1, description: '更多切磋对手' }
    ]
  },
  {
    id: 'treasury',
    name: '宝库',
    icon: '💎',
    type: 'treasury',
    level: 1,
    maxLevel: 5,
    description: '存放宗门宝物和资源的宝库。',
    unlockPosition: 4,
    upgradeCost: { gold: 3000, contribution: 500 },
    effects: [
      { type: 'resource_bonus', value: 0.1, description: '资源获取+10%' },
      { type: 'rare_items', value: 1, description: '稀有物品概率提升' }
    ]
  }
]

// 宗门任务类型
export type SectTaskType = 'daily' | 'weekly' | 'monthly' | 'special'

// 宗门任务
export interface SectTask {
  id: string
  name: string
  description: string
  type: SectTaskType
  // 任务要求
  requirements: {
    type: 'battle' | 'collect' | 'craft' | 'explore' | 'contribution'
    target: string
    count: number
  }
  // 任务奖励
  rewards: {
    contribution: number
    gold: number
    exp?: number
    items?: { id: string; name: string; quantity: number }[]
  }
  // 任务状态
  progress: number
  completed: boolean
  claimed: boolean    // 是否已领取奖励
  resetTime?: number  // 重置时间戳
}

// 宗门关系
export type SectRelation = 'neutral' | 'friendly' | 'allied' | 'hostile' | 'at_war'

// 宗门关系配置
export const RELATION_CONFIG: Record<SectRelation, { label: string; color: string; description: string }> = {
  'neutral': { label: '中立', color: '#9ca3af', description: '互不干涉' },
  'friendly': { label: '友好', color: '#4ade80', description: '可以进行贸易往来' },
  'allied': { label: '联盟', color: '#3b82f6', description: '共同作战，资源共享' },
  'hostile': { label: '敌对', color: '#f59e0b', description: '随时可能爆发冲突' },
  'at_war': { label: '交战', color: '#ef4444', description: '正在交战中' }
}

// 宗门战争
export interface SectWar {
  id: string
  attackerSectId: string   // 发起方宗门ID
  defenderSectId: string   // 防守方宗门ID
  startDate: { year: number; month: number; day: number }
  status: 'preparing' | 'ongoing' | 'victory' | 'defeat' | 'truce'
  // 战争进度
  attackerScore: number
  defenderScore: number
  winScore: number         // 达到此分数获胜
  // 战争结果
  result?: {
    winner: 'attacker' | 'defender'
    rewards?: string[]
    penalties?: string[]
  }
}

// 宗门事件类型
export type SectEventType =
  | 'invasion'          // 外敌入侵
  | 'alliance_offer'    // 联盟邀请
  | 'resource_discovery' // 资源发现
  | 'traitor'           // 叛徒出现
  | 'treasure_found'    // 发现宝物
  | 'master_visit'      // 高人拜访
  | 'sect_conflict'     // 宗门冲突
  | 'opportunity'       // 机缘

// 宗门事件
export interface SectEvent {
  id: string
  type: SectEventType
  title: string
  description: string
  // 选项
  choices: {
    id: string
    text: string
    outcome: {
      description: string
      effects: {
        type: 'gold' | 'contribution' | 'reputation' | 'relation' | 'item'
        value: number | string
      }[]
    }
  }[]
  // 事件是否已处理
  handled: boolean
  selectedChoice?: string
}

// 宗门定义
export interface SectDefinition {
  id: string
  name: string
  icon: string
  realm: WorldRealm         // 所属界域
  areaId: string            // 所在区域ID
  description: string
  specialty: SectSpecialty  // 宗门特色
  // 境界要求
  requiredRealm: Realm
  requiredRealmLevel: number
  // 宗门属性
  reputation: number        // 声望 0-10000
  maxMembers: number        // 最大成员数
  // 宗门血量（战争相关）
  maxHp: number
  currentHp: number
  // 宗门设施
  facilities: SectFacility[]
  // 宗门特产
  specialties: string[]
  // 背景故事
  background: string
}

// 人界宗门
export const HUMAN_SECTS: SectDefinition[] = [
  {
    id: 'qingyun_sect',
    name: '青云宗',
    icon: '🏔️',
    realm: '人界',
    areaId: 'qingyun_mountain',
    description: '人界第一正道宗门，以剑道闻名天下。',
    specialty: '剑修',
    requiredRealm: '炼气',
    requiredRealmLevel: 1,
    reputation: 8500,
    maxMembers: 1000,
    maxHp: 10000,
    currentHp: 10000,
    facilities: SECT_FACILITIES.slice(0, 4),
    specialties: ['青云剑法', '御剑术', '青云剑'],
    background: '青云宗立派三千年，以剑道独步天下。传说开派祖师曾一剑斩断山河，威震四海...'
  },
  {
    id: 'medicine_valley',
    name: '药王谷',
    icon: '💊',
    realm: '人界',
    areaId: 'azure_valley',
    description: '以炼丹术著称的宗门，天下丹药半出药王谷。',
    specialty: '炼丹',
    requiredRealm: '炼气',
    requiredRealmLevel: 3,
    reputation: 7000,
    maxMembers: 500,
    maxHp: 6000,
    currentHp: 6000,
    facilities: SECT_FACILITIES.slice(0, 3),
    specialties: ['药王心经', '百草诀', '回春丹'],
    background: '药王谷世代研究丹道，谷中灵药遍地，丹香四溢...'
  },
  {
    id: 'forge_sect',
    name: '铸剑门',
    icon: '⚒️',
    realm: '人界',
    areaId: 'flame_city',
    description: '锻造圣地，无数名剑诞生于此。',
    specialty: '锻造',
    requiredRealm: '炼气',
    requiredRealmLevel: 5,
    reputation: 6500,
    maxMembers: 300,
    maxHp: 8000,
    currentHp: 8000,
    facilities: SECT_FACILITIES.slice(0, 4),
    specialties: ['铸剑心法', '烈焰诀', '玄铁剑'],
    background: '铸剑门世代研究锻造之术，门中弟子皆能打造出锋利无比的兵器...'
  },
  {
    id: 'cloud_palace',
    name: '云霄宫',
    icon: '☁️',
    realm: '人界',
    areaId: 'cloud_peak',
    description: '坐落于云霄峰上的神秘宗门，精通法术。',
    specialty: '符箓',
    requiredRealm: '筑基',
    requiredRealmLevel: 1,
    reputation: 9000,
    maxMembers: 200,
    maxHp: 12000,
    currentHp: 12000,
    facilities: SECT_FACILITIES,
    specialties: ['云霄法典', '天雷符', '云遁术'],
    background: '云霄宫建于云霄峰顶，常年云雾缭绕，传说宫主已踏足化神之境...'
  },
  {
    id: 'thunder_sect',
    name: '雷音阁',
    icon: '⚡',
    realm: '人界',
    areaId: 'thunder_plains',
    description: '雷修圣地，掌控雷霆之力。',
    specialty: '剑修',
    requiredRealm: '筑基',
    requiredRealmLevel: 3,
    reputation: 7500,
    maxMembers: 400,
    maxHp: 9000,
    currentHp: 9000,
    facilities: SECT_FACILITIES.slice(0, 5),
    specialties: ['九天雷法', '雷音剑诀', '雷神珠'],
    background: '雷音阁建于雷霆平原，门中弟子皆修雷法，战力惊人...'
  },
  {
    id: 'sky_temple_sect',
    name: '天机阁',
    icon: '🔮',
    realm: '人界',
    areaId: 'sky_temple',
    description: '精通卜算之术的神秘宗门，能窥探天机。',
    specialty: '阵法',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    reputation: 9500,
    maxMembers: 100,
    maxHp: 15000,
    currentHp: 15000,
    facilities: SECT_FACILITIES,
    specialties: ['天机心法', '卜卦术', '天机盘'],
    background: '天机阁掌握人界命脉，据说能预知未来，无人敢轻易得罪...'
  }
]

// 妖界宗门
export const DEMON_SECTS: SectDefinition[] = [
  {
    id: 'beast_king_mountain',
    name: '兽王山',
    icon: '🦁',
    realm: '妖界',
    areaId: 'hundred_beast_forest',
    description: '万妖之王建立的势力，妖界最强势力之一。',
    specialty: '御兽',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    reputation: 8000,
    maxMembers: 2000,
    maxHp: 20000,
    currentHp: 20000,
    facilities: SECT_FACILITIES.slice(0, 4),
    specialties: ['万兽心法', '妖化术', '兽魂珠'],
    background: '兽王山由兽王建立，统御万妖，是妖界最强大的势力...'
  },
  {
    id: 'fox_clan',
    name: '青丘狐族',
    icon: '🦊',
    realm: '妖界',
    areaId: 'fox_den',
    description: '九尾狐族的领地，美丽而神秘。',
    specialty: '符箓',
    requiredRealm: '金丹',
    requiredRealmLevel: 1,
    reputation: 7000,
    maxMembers: 300,
    maxHp: 12000,
    currentHp: 12000,
    facilities: SECT_FACILITIES.slice(0, 5),
    specialties: ['狐族秘术', '魅惑之瞳', '九尾天狐'],
    background: '青丘狐族是妖界最古老的种族之一，擅长魅惑之术...'
  },
  {
    id: 'dragon_palace',
    name: '龙宫',
    icon: '🐉',
    realm: '妖界',
    areaId: 'dragon_pool',
    description: '龙族的领地，妖界最强种族。',
    specialty: '体修',
    requiredRealm: '金丹',
    requiredRealmLevel: 3,
    reputation: 10000,
    maxMembers: 500,
    maxHp: 30000,
    currentHp: 30000,
    facilities: SECT_FACILITIES,
    specialties: ['龙族心法', '龙化术', '龙珠'],
    background: '龙宫是龙族的栖息地，龙族是妖界最强大的种族...'
  },
  {
    id: 'phoenix_clan',
    name: '凤凰一族',
    icon: '🦅',
    realm: '妖界',
    areaId: 'phoenix_nest',
    description: '凤凰一族的圣地，火焰永不熄灭。',
    specialty: '炼丹',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    reputation: 9500,
    maxMembers: 200,
    maxHp: 25000,
    currentHp: 25000,
    facilities: SECT_FACILITIES,
    specialties: ['凤凰心经', '涅槃术', '凤羽'],
    background: '凤凰一族是妖界最神秘的种族，拥有涅槃重生之能...'
  }
]

// 魔界宗门
export const DEVIL_SECTS: SectDefinition[] = [
  {
    id: 'blood_sect',
    name: '血魔宗',
    icon: '🩸',
    realm: '魔界',
    areaId: 'blood_sea',
    description: '修炼血道的魔宗，以血为力。',
    specialty: '魔修',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    reputation: 6000,
    maxMembers: 800,
    maxHp: 25000,
    currentHp: 25000,
    facilities: SECT_FACILITIES.slice(0, 4),
    specialties: ['血魔心法', '血遁术', '血魂珠'],
    background: '血魔宗修炼血道，以血液为力量源泉，是魔界最危险的宗门...'
  },
  {
    id: 'shadow_guild',
    name: '影盟',
    icon: '🌑',
    realm: '魔界',
    areaId: 'shadow_city',
    description: '暗杀者的组织，潜伏于黑暗之中。',
    specialty: '符箓',
    requiredRealm: '元婴',
    requiredRealmLevel: 1,
    reputation: 5000,
    maxMembers: 200,
    maxHp: 15000,
    currentHp: 15000,
    facilities: SECT_FACILITIES.slice(0, 5),
    specialties: ['影遁术', '暗杀术', '影刃'],
    background: '影盟是魔界最神秘的暗杀组织，无人知道其真正实力...'
  },
  {
    id: 'chaos_temple',
    name: '混沌殿',
    icon: '🌀',
    realm: '魔界',
    areaId: 'chaos_abyss',
    description: '修炼混沌之道的宗门，追求混沌大道。',
    specialty: '阵法',
    requiredRealm: '元婴',
    requiredRealmLevel: 3,
    reputation: 8000,
    maxMembers: 100,
    maxHp: 40000,
    currentHp: 40000,
    facilities: SECT_FACILITIES,
    specialties: ['混沌心法', '混沌阵', '混沌石'],
    background: '混沌殿建于混沌深渊之侧，传说与远古魔神有关...'
  }
]

// 仙界宗门
export const IMMORTAL_SECTS: SectDefinition[] = [
  {
    id: 'heavenly_court',
    name: '天庭',
    icon: '🏛️',
    realm: '仙界',
    areaId: 'jade_palace',
    description: '仙界最高权力机构，统御三界。',
    specialty: '剑修',
    requiredRealm: '元婴',
    requiredRealmLevel: 5,
    reputation: 10000,
    maxMembers: 500,
    maxHp: 100000,
    currentHp: 100000,
    facilities: SECT_FACILITIES,
    specialties: ['天庭心法', '天罚剑', '仙帝令'],
    background: '天庭是仙界最高权力机构，由仙帝统御，威震三界...'
  },
  {
    id: 'star_sect',
    name: '星辰宗',
    icon: '✨',
    realm: '仙界',
    areaId: 'star_sea',
    description: '修炼星辰之力的宗门，掌控星辰之力。',
    specialty: '阵法',
    requiredRealm: '化神',
    requiredRealmLevel: 1,
    reputation: 9000,
    maxMembers: 300,
    maxHp: 60000,
    currentHp: 60000,
    facilities: SECT_FACILITIES,
    specialties: ['星辰心法', '星阵术', '星核'],
    background: '星辰宗建于星海之中，门中弟子皆修炼星辰之力...'
  },
  {
    id: 'void_sect',
    name: '虚空宗',
    icon: '🌀',
    realm: '仙界',
    areaId: 'void_temple',
    description: '修炼虚空之道的宗门，追求大道至理。',
    specialty: '符箓',
    requiredRealm: '化神',
    requiredRealmLevel: 5,
    reputation: 9500,
    maxMembers: 50,
    maxHp: 80000,
    currentHp: 80000,
    facilities: SECT_FACILITIES,
    specialties: ['虚空心法', '虚空步', '虚空石'],
    background: '虚空宗是最接近大道的宗门，传说其宗主已踏足仙人境界...'
  }
]

// 所有宗门
export const ALL_SECTS: SectDefinition[] = [
  ...HUMAN_SECTS,
  ...DEMON_SECTS,
  ...DEVIL_SECTS,
  ...IMMORTAL_SECTS
]

// ====== 工具函数 ======

/**
 * 根据ID获取宗门
 */
export function getSectById(id: string): SectDefinition | undefined {
  return ALL_SECTS.find(s => s.id === id)
}

/**
 * 根据区域获取宗门
 */
export function getSectsByArea(areaId: string): SectDefinition[] {
  return ALL_SECTS.filter(s => s.areaId === areaId)
}

/**
 * 根据界域获取宗门
 */
export function getSectsByRealm(realm: WorldRealm): SectDefinition[] {
  return ALL_SECTS.filter(s => s.realm === realm)
}

/**
 * 获取职位名称
 */
export function getPositionName(level: number): string {
  const position = SECT_POSITIONS.find(p => p.level === level)
  return position?.name ?? '外门弟子'
}

/**
 * 获取职位信息
 */
export function getPosition(level: number): SectPosition | undefined {
  return SECT_POSITIONS.find(p => p.level === level)
}

/**
 * 生成随机宗门任务
 */
export function generateRandomTask(type: SectTaskType, sectId: string): SectTask {
  const taskTemplates = {
    daily: [
      { name: '清扫山门', description: '清扫宗门山门区域', reqType: 'contribution', target: 'cleaning', count: 1, contribution: 10, gold: 50 },
      { name: '采集灵草', description: '在药园采集灵草', reqType: 'collect', target: 'herb', count: 5, contribution: 20, gold: 100 },
      { name: '巡逻任务', description: '巡视宗门周边区域', reqType: 'battle', target: 'patrol', count: 3, contribution: 30, gold: 150 },
      { name: '炼丹辅助', description: '协助炼丹师炼制丹药', reqType: 'craft', target: 'alchemy', count: 2, contribution: 25, gold: 120 }
    ],
    weekly: [
      { name: '斩杀妖兽', description: '前往指定区域斩杀妖兽', reqType: 'battle', target: 'monster', count: 10, contribution: 100, gold: 500 },
      { name: '收集材料', description: '收集宗门所需的稀有材料', reqType: 'collect', target: 'material', count: 20, contribution: 150, gold: 800 },
      { name: '护送任务', description: '护送商队前往目的地', reqType: 'explore', target: 'escort', count: 1, contribution: 200, gold: 1000 }
    ],
    monthly: [
      { name: '宗门大比', description: '参加宗门内部比试', reqType: 'battle', target: 'tournament', count: 5, contribution: 500, gold: 2000 },
      { name: '秘境探索', description: '探索宗门秘境', reqType: 'explore', target: 'secret_realm', count: 1, contribution: 800, gold: 3000 }
    ],
    special: [
      { name: '宗门危机', description: '抵御外敌入侵', reqType: 'battle', target: 'invasion', count: 1, contribution: 1000, gold: 5000 },
      { name: '寻宝任务', description: '寻找失落的上古宝物', reqType: 'explore', target: 'treasure', count: 1, contribution: 2000, gold: 10000 }
    ]
  }

  const templates = taskTemplates[type]
  const template = templates[Math.floor(Math.random() * templates.length)]!

  return {
    id: `task_${sectId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    description: template.description,
    type,
    requirements: {
      type: template.reqType as SectTask['requirements']['type'],
      target: template.target,
      count: template.count
    },
    rewards: {
      contribution: template.contribution,
      gold: template.gold
    },
    progress: 0,
    completed: false,
    claimed: false
  }
}

/**
 * 生成随机宗门事件
 */
export function generateRandomSectEvent(sectId: string): SectEvent {
  const eventTemplates: { type: SectEventType; title: string; description: string; choices: SectEvent['choices'] }[] = [
    {
      type: 'invasion',
      title: '外敌入侵',
      description: '有外敌正在入侵宗门领地！',
      choices: [
        { id: 'fight', text: '组织弟子迎敌', outcome: { description: '成功击退敌人', effects: [{ type: 'contribution', value: 100 }, { type: 'reputation', value: 50 }] } },
        { id: 'defend', text: '固守山门', outcome: { description: '守住了宗门', effects: [{ type: 'contribution', value: 50 }] } }
      ]
    },
    {
      type: 'alliance_offer',
      title: '联盟邀请',
      description: '有宗门发来联盟邀请。',
      choices: [
        { id: 'accept', text: '接受联盟', outcome: { description: '建立了联盟关系', effects: [{ type: 'relation', value: 'allied' }] } },
        { id: 'decline', text: '婉拒邀请', outcome: { description: '保持现状', effects: [] } }
      ]
    },
    {
      type: 'resource_discovery',
      title: '发现资源',
      description: '在宗门领地内发现了新的资源！',
      choices: [
        { id: 'exploit', text: '立即开采', outcome: { description: '获得了大量资源', effects: [{ type: 'gold', value: 500 }] } },
        { id: 'preserve', text: '保护起来', outcome: { description: '资源得到保护', effects: [{ type: 'reputation', value: 30 }] } }
      ]
    },
    {
      type: 'treasure_found',
      title: '发现宝物',
      description: '弟子在后山发现了上古宝物！',
      choices: [
        { id: 'take', text: '收入宝库', outcome: { description: '宝物已收入宗门宝库', effects: [{ type: 'item', value: 'treasure' }] } },
        { id: 'reward', text: '赏赐给发现者', outcome: { description: '弟子感恩戴德', effects: [{ type: 'reputation', value: 50 }] } }
      ]
    },
    {
      type: 'master_visit',
      title: '高人拜访',
      description: '有位神秘高人前来拜访宗门。',
      choices: [
        { id: 'welcome', text: '隆重接待', outcome: { description: '高人传授了秘法', effects: [{ type: 'contribution', value: 200 }] } },
        { id: 'observe', text: '静观其变', outcome: { description: '高人悄然离去', effects: [] } }
      ]
    }
  ]

  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]!

  return {
    id: `event_${sectId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: template.type,
    title: template.title,
    description: template.description,
    choices: template.choices,
    handled: false
  }
}
