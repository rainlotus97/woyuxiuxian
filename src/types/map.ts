import type { Realm } from '@/types/unit'

export type { Realm } from '@/types/unit'

// ====== 四大界域 ======
export type WorldRealm = '人界' | '妖界' | '魔界' | '仙界'

export const WORLD_REALMS: WorldRealm[] = ['人界', '妖界', '魔界', '仙界']

// 界域配置
export interface WorldRealmConfig {
  name: WorldRealm
  icon: string
  color: string
  bgColor: string
  description: string
  requiredRealm: Realm
  requiredRealmLevel: number
}

export const WORLD_REALM_CONFIGS: Record<WorldRealm, WorldRealmConfig> = {
  '人界': {
    name: '人界',
    icon: '🌏',
    color: '#4ade80',
    bgColor: 'linear-gradient(135deg, #1a3a2a, #2d5a3f)',
    description: '凡人修行之地，灵气稀薄却生机盎然。修仙者在此起步，逐步踏入仙途。',
    requiredRealm: '炼气',
    requiredRealmLevel: 1
  },
  '妖界': {
    name: '妖界',
    icon: '🐺',
    color: '#f59e0b',
    bgColor: 'linear-gradient(135deg, #3d2a1a, #5a4020)',
    description: '万妖聚集之地，妖气弥漫。各种妖兽在此修炼，化形飞升。',
    requiredRealm: '筑基',
    requiredRealmLevel: 5
  },
  '魔界': {
    name: '魔界',
    icon: '😈',
    color: '#a855f7',
    bgColor: 'linear-gradient(135deg, #2a1a3a, #402050)',
    description: '魔修之地，魔气翻涌。修炼魔道者在此追求力量，不惜堕入黑暗。',
    requiredRealm: '金丹',
    requiredRealmLevel: 5
  },
  '仙界': {
    name: '仙界',
    icon: '☁️',
    color: '#67e8f9',
    bgColor: 'linear-gradient(135deg, #1a2a3a, #2a3a4a)',
    description: '仙人栖息之所，仙气飘渺。超脱凡尘，追求大道至理。',
    requiredRealm: '元婴',
    requiredRealmLevel: 5
  }
}

// ====== 游戏日期系统 ======
export type Season = '春' | '夏' | '秋' | '冬'

export interface GameDate {
  year: number      // 修仙纪年
  month: number     // 1-12
  day: number       // 1-30
  season: Season
}

// 月份对应季节
export const MONTH_SEASONS: Record<number, Season> = {
  1: '春', 2: '春', 3: '春',
  4: '夏', 5: '夏', 6: '夏',
  7: '秋', 8: '秋', 9: '秋',
  10: '冬', 11: '冬', 12: '冬'
}

// 季节效果
export interface SeasonEffect {
  season: Season
  cultivationBonus: number   // 修炼加成
  staminaRecoveryBonus: number // 体力恢复加成
  description: string
}

export const SEASON_EFFECTS: Record<Season, SeasonEffect> = {
  '春': { season: '春', cultivationBonus: 0.1, staminaRecoveryBonus: 0.1, description: '万物复苏，修炼效率提升10%' },
  '夏': { season: '夏', cultivationBonus: 0.05, staminaRecoveryBonus: 0.15, description: '阳气旺盛，体力恢复提升15%' },
  '秋': { season: '秋', cultivationBonus: 0.15, staminaRecoveryBonus: 0, description: '天高气爽，修炼效率提升15%' },
  '冬': { season: '冬', cultivationBonus: 0, staminaRecoveryBonus: 0.05, description: '冬藏时节，宜静心修炼' }
}

// ====== 地图区域 ======
export interface MapArea {
  id: string
  name: string
  realm: WorldRealm
  icon: string
  description: string
  // 境界要求
  requiredRealm: Realm
  requiredRealmLevel: number
  // 相邻区域
  adjacentAreas: string[]
  // 该区域的宗门ID列表
  sects: string[]
  // 特产资源
  resources: string[]
  // 区域状态
  isUnlocked: boolean
  isConquered: boolean
  // 背景故事
  background?: string
}

// 人界区域
export const HUMAN_REALM_AREAS: MapArea[] = [
  {
    id: 'qingyun_mountain',
    name: '青云山',
    realm: '人界',
    icon: '⛰️',
    description: '人界修仙的起点，灵气充沛的名山。',
    requiredRealm: '炼气',
    requiredRealmLevel: 1,
    adjacentAreas: ['azure_valley', 'cloud_peak'],
    sects: ['qingyun_sect', 'sword_mountain'],
    resources: ['灵草', '青云石'],
    isUnlocked: true,
    isConquered: false,
    background: '青云山终年云雾缭绕，传说曾有仙人在此飞升...'
  },
  {
    id: 'azure_valley',
    name: '碧水谷',
    realm: '人界',
    icon: '🌿',
    description: '灵药遍地的幽谷，炼丹师的天堂。',
    requiredRealm: '炼气',
    requiredRealmLevel: 3,
    adjacentAreas: ['qingyun_mountain', 'flame_city'],
    sects: ['medicine_valley'],
    resources: ['灵药', '清泉水'],
    isUnlocked: false,
    isConquered: false,
    background: '谷中遍地灵药，药香四溢，是炼丹师的圣地...'
  },
  {
    id: 'cloud_peak',
    name: '云霄峰',
    realm: '人界',
    icon: '🏔️',
    description: '人界最高峰，接近仙界的神秘之地。',
    requiredRealm: '筑基',
    requiredRealmLevel: 1,
    adjacentAreas: ['qingyun_mountain', 'sky_temple'],
    sects: ['cloud_palace'],
    resources: ['云晶', '天露'],
    isUnlocked: false,
    isConquered: false,
    background: '云霄峰直插云霄，据说峰顶可窥见仙界一角...'
  },
  {
    id: 'flame_city',
    name: '烈焰城',
    realm: '人界',
    icon: '🔥',
    description: '以锻造闻名的古城，名剑出产地。',
    requiredRealm: '炼气',
    requiredRealmLevel: 5,
    adjacentAreas: ['azure_valley', 'thunder_plains'],
    sects: ['forge_sect'],
    resources: ['火精', '玄铁'],
    isUnlocked: false,
    isConquered: false,
    background: '烈焰城的锻造技艺冠绝人界，无数名剑诞生于此...'
  },
  {
    id: 'thunder_plains',
    name: '雷霆平原',
    realm: '人界',
    icon: '⚡',
    description: '常有雷霆落下的广阔平原，雷修圣地。',
    requiredRealm: '筑基',
    requiredRealmLevel: 3,
    adjacentAreas: ['flame_city', 'sky_temple'],
    sects: ['thunder_sect'],
    resources: ['雷晶', '紫电石'],
    isUnlocked: false,
    isConquered: false,
    background: '雷霆平原常年雷光闪烁，是修炼雷法的绝佳之地...'
  },
  {
    id: 'sky_temple',
    name: '天机阁',
    realm: '人界',
    icon: '🏛️',
    description: '人界最神秘的宗门，精通卜算之术。',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    adjacentAreas: ['cloud_peak', 'thunder_plains'],
    sects: ['sky_temple_sect'],
    resources: ['天机石', '星尘'],
    isUnlocked: false,
    isConquered: false,
    background: '天机阁掌握人界命脉，据说能窥探天机...'
  }
]

// 妖界区域
export const DEMON_REALM_AREAS: MapArea[] = [
  {
    id: 'hundred_beast_forest',
    name: '百兽林',
    realm: '妖界',
    icon: '🌲',
    description: '万妖聚集的原始森林，危机四伏。',
    requiredRealm: '筑基',
    requiredRealmLevel: 5,
    adjacentAreas: ['fox_den'],
    sects: ['beast_king_mountain'],
    resources: ['妖丹', '兽血'],
    isUnlocked: false,
    isConquered: false,
    background: '百兽林中妖兽横行，弱肉强食是唯一的法则...'
  },
  {
    id: 'fox_den',
    name: '青丘狐域',
    realm: '妖界',
    icon: '🦊',
    description: '九尾狐族的领地，美丽而危险。',
    requiredRealm: '金丹',
    requiredRealmLevel: 1,
    adjacentAreas: ['hundred_beast_forest', 'dragon_pool'],
    sects: ['fox_clan'],
    resources: ['狐火', '魅惑之瞳'],
    isUnlocked: false,
    isConquered: false,
    background: '青丘狐域中的狐妖擅长魅惑之术，无数修士迷失于此...'
  },
  {
    id: 'dragon_pool',
    name: '龙渊',
    realm: '妖界',
    icon: '🐉',
    description: '龙族栖息的深渊，妖界最强大的势力。',
    requiredRealm: '金丹',
    requiredRealmLevel: 3,
    adjacentAreas: ['fox_den', 'phoenix_nest'],
    sects: ['dragon_palace'],
    resources: ['龙鳞', '龙血'],
    isUnlocked: false,
    isConquered: false,
    background: '龙渊深处，远古龙族在此沉睡...'
  },
  {
    id: 'phoenix_nest',
    name: '凤凰巢',
    realm: '妖界',
    icon: '🦅',
    description: '凤凰一族的圣地，火焰永不熄灭。',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    adjacentAreas: ['dragon_pool'],
    sects: ['phoenix_clan'],
    resources: ['凤羽', '涅槃火'],
    isUnlocked: false,
    isConquered: false,
    background: '凤凰巢中的火焰万年不灭，据说能焚烧一切...'
  }
]

// 魔界区域
export const DEVIL_REALM_AREAS: MapArea[] = [
  {
    id: 'blood_sea',
    name: '血海',
    realm: '魔界',
    icon: '🩸',
    description: '无尽的血色海洋，魔修的圣地。',
    requiredRealm: '金丹',
    requiredRealmLevel: 5,
    adjacentAreas: ['shadow_city'],
    sects: ['blood_sect'],
    resources: ['血精', '魔心'],
    isUnlocked: false,
    isConquered: false,
    background: '血海由无数生灵的鲜血凝聚而成，魔气滔天...'
  },
  {
    id: 'shadow_city',
    name: '影城',
    realm: '魔界',
    icon: '🌑',
    description: '永远笼罩在黑暗中的城池，刺客的天堂。',
    requiredRealm: '元婴',
    requiredRealmLevel: 1,
    adjacentAreas: ['blood_sea', 'chaos_abyss'],
    sects: ['shadow_guild'],
    resources: ['暗影石', '虚无之尘'],
    isUnlocked: false,
    isConquered: false,
    background: '影城中没有阳光，是暗杀者与魔修的乐园...'
  },
  {
    id: 'chaos_abyss',
    name: '混沌深渊',
    realm: '魔界',
    icon: '🌀',
    description: '魔界最深处的禁地，混沌魔神的沉睡之地。',
    requiredRealm: '元婴',
    requiredRealmLevel: 3,
    adjacentAreas: ['shadow_city'],
    sects: ['chaos_temple'],
    resources: ['混沌石', '魔神之泪'],
    isUnlocked: false,
    isConquered: false,
    background: '混沌深渊中封印着远古魔神，无人敢靠近...'
  }
]

// 仙界区域
export const IMMORTAL_REALM_AREAS: MapArea[] = [
  {
    id: 'jade_palace',
    name: '玉虚宫',
    realm: '仙界',
    icon: '🏛️',
    description: '仙界最古老的宫殿，天庭所在。',
    requiredRealm: '元婴',
    requiredRealmLevel: 5,
    adjacentAreas: ['star_sea'],
    sects: ['heavenly_court'],
    resources: ['仙玉', '天露'],
    isUnlocked: false,
    isConquered: false,
    background: '玉虚宫是天庭的所在，仙人朝拜的圣地...'
  },
  {
    id: 'star_sea',
    name: '星海',
    realm: '仙界',
    icon: '✨',
    description: '由无数星辰组成的海域，美丽而神秘。',
    requiredRealm: '化神',
    requiredRealmLevel: 1,
    adjacentAreas: ['jade_palace', 'void_temple'],
    sects: ['star_sect'],
    resources: ['星核', '星光'],
    isUnlocked: false,
    isConquered: false,
    background: '星海由亿万星辰组成，每一颗星都蕴含无穷力量...'
  },
  {
    id: 'void_temple',
    name: '虚空殿',
    realm: '仙界',
    icon: '🌀',
    description: '存在于虚与实之间的神秘殿堂，道的终点。',
    requiredRealm: '化神',
    requiredRealmLevel: 5,
    adjacentAreas: ['star_sea'],
    sects: ['void_sect'],
    resources: ['虚空石', '大道碎片'],
    isUnlocked: false,
    isConquered: false,
    background: '虚空殿传说是大道的尽头，只有最强者才能到达...'
  }
]

// 所有区域
export const ALL_AREAS: MapArea[] = [
  ...HUMAN_REALM_AREAS,
  ...DEMON_REALM_AREAS,
  ...DEVIL_REALM_AREAS,
  ...IMMORTAL_REALM_AREAS
]

// ====== 历史事件 ======
export type HistoryEventType = 'personal' | 'sect' | 'world'

export interface HistoryEvent {
  id: string
  date: GameDate
  title: string
  description: string
  type: HistoryEventType
  impact?: string
}

// ====== 工具函数 ======

/**
 * 创建初始游戏日期
 */
export function createInitialGameDate(): GameDate {
  return {
    year: 1,
    month: 1,
    day: 1,
    season: '春'
  }
}

/**
 * 推进日期
 */
export function advanceGameDate(date: GameDate): GameDate {
  let { year, month, day } = date

  day++
  if (day > 30) {
    day = 1
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return {
    year,
    month,
    day,
    season: MONTH_SEASONS[month]!
  }
}

/**
 * 获取日期显示文本
 */
export function formatDate(date: GameDate): string {
  return `第${date.year}年 ${date.month}月${date.day}日 ${date.season}`
}

/**
 * 获取界域的所有区域
 */
export function getAreasByRealm(realm: WorldRealm): MapArea[] {
  return ALL_AREAS.filter(area => area.realm === realm)
}

/**
 * 获取区域
 */
export function getAreaById(id: string): MapArea | undefined {
  return ALL_AREAS.find(area => area.id === id)
}

/**
 * 检查界域是否解锁
 */
export function isRealmUnlocked(
  realm: WorldRealm,
  playerRealm: Realm,
  playerRealmLevel: number
): boolean {
  const config = WORLD_REALM_CONFIGS[realm]

  // 人界默认解锁
  if (realm === '人界') return true

  const realmOrder = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']
  const playerRealmIndex = realmOrder.indexOf(playerRealm)
  const requiredRealmIndex = realmOrder.indexOf(config.requiredRealm)

  if (playerRealmIndex > requiredRealmIndex) return true
  if (playerRealmIndex === requiredRealmIndex && playerRealmLevel >= config.requiredRealmLevel) return true
  return false
}
