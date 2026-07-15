/**
 * 战斗特效配置 — 为不同元素类型、动作类型配置文本描述和视觉效果
 * 纯文本文字游戏风格，用文字描述代替动画
 */

import { resolveBattleEffectIcon } from '@/game/theme/gameTheme'

export type BattleEffectType =
  | 'slash'       // 斩击
  | 'fire'        // 火系
  | 'ice'         // 冰系
  | 'thunder'     // 雷系
  | 'wind'        // 风系
  | 'earth'       // 土系
  | 'water'       // 水系
  | 'wood'        // 木系
  | 'void_magic'  // 空系
  | 'heal'        // 回血
  | 'hit'         // 受击
  | 'knockdown'   // 倒地
  | 'defend'      // 防御
  | 'idle'        // 待机
  | 'attack'      // 普通攻击出手
  | 'critical'    // 暴击
  | 'block'       // 格挡
  | 'dodge'       // 闪避

/** 战斗特效 — 文字描述配置 */
export interface BattleEffectConfig {
  type: BattleEffectType
  element?: string
  /** 效果标签 */
  label: string
  /** 特效描述模板（可用{actor}、{target}等变量） */
  description: string
  /** CSS类名用于样式 */
  cssClass: string
  /** 提示图标 */
  icon: string
}

/** 按元素类型分组的特效配置 */
export const ELEMENT_EFFECTS = {
  slash: {
    type: 'slash', label: '斩击', icon: resolveBattleEffectIcon('slash'),
    description: '{actor}挥出一道凌厉的剑光，直劈{target}！剑气纵横，势不可挡！',
    cssClass: 'effect-slash'
  },
  fire: {
    type: 'fire', element: '火', label: '烈焰', icon: resolveBattleEffectIcon('fire'),
    description: '{actor}掌心涌出灼热的烈焰，化作一条火龙扑向{target}！热浪滚滚，焚尽八荒！',
    cssClass: 'effect-fire'
  },
  ice: {
    type: 'ice', element: '冰', label: '寒冰', icon: resolveBattleEffectIcon('ice'),
    description: '{actor}凝聚天地寒气，万千冰锥如暴雨般射向{target}！冰霜之力冻结一切！',
    cssClass: 'effect-ice'
  },
  thunder: {
    type: 'thunder', element: '雷', label: '雷霆', icon: resolveBattleEffectIcon('thunder'),
    description: '{actor}引动九天玄雷，紫电划破长空轰向{target}！雷威浩荡，万物震颤！',
    cssClass: 'effect-thunder'
  },
  wind: {
    type: 'wind', element: '风', label: '风刃', icon: resolveBattleEffectIcon('wind'),
    description: '{actor}袖袍一挥，无形风刃撕裂空气，从四面八方切割{target}！',
    cssClass: 'effect-wind'
  },
  earth: {
    type: 'earth', element: '土', label: '地裂', icon: resolveBattleEffectIcon('earth'),
    description: '{actor}脚踏大地，地面龟裂翻涌，无数巨石从地底冲起砸向{target}！',
    cssClass: 'effect-earth'
  },
  water: {
    type: 'water', element: '水', label: '水龙', icon: resolveBattleEffectIcon('water'),
    description: '{actor}凝聚水灵气为一条翻江倒海的巨龙，咆哮着冲向{target}！',
    cssClass: 'effect-water'
  },
  wood: {
    type: 'wood', element: '木', label: '缠绕', icon: resolveBattleEffectIcon('wood'),
    description: '{actor}催动木灵气，无数粗壮的藤蔓破土而出，疯狂缠绕{target}！',
    cssClass: 'effect-wood'
  },
  void_magic: {
    type: 'void_magic', element: '空', label: '虚空', icon: resolveBattleEffectIcon('void_magic'),
    description: '{actor}双手结印，身前虚空裂开一道缝隙，恐怖的空间之力席卷{target}！',
    cssClass: 'effect-void'
  },
  heal: {
    type: 'heal', label: '回春', icon: resolveBattleEffectIcon('heal'),
    description: '{actor}运转灵力，柔和的光辉笼罩全身，伤势以肉眼可见的速度愈合！',
    cssClass: 'effect-heal'
  },
  hit: {
    type: 'hit', label: '受击', icon: resolveBattleEffectIcon('hit'),
    description: '{target}被击中！一股巨力透体而入，{target}身形剧震！',
    cssClass: 'effect-hit'
  },
  knockdown: {
    type: 'knockdown', label: '击倒', icon: resolveBattleEffectIcon('knockdown'),
    description: '{target}承受不住这恐怖的力道，整个人被轰飞出去，重重摔在地上！',
    cssClass: 'effect-knockdown'
  },
  defend: {
    type: 'defend', label: '防御', icon: resolveBattleEffectIcon('defend'),
    description: '{actor}运转护体灵气，在身前凝聚出一道坚实的灵力屏障！',
    cssClass: 'effect-defend'
  },
  idle: {
    type: 'idle', label: '待机', icon: resolveBattleEffectIcon('idle'),
    description: '{actor}凝神静气，灵力在经脉中缓缓流转，蓄势待发。',
    cssClass: 'effect-idle'
  },
  attack: {
    type: 'attack', label: '出手', icon: resolveBattleEffectIcon('attack'),
    description: '{actor}身形一动！破空之声骤起，一道凌厉攻势直取{target}！',
    cssClass: 'effect-attack'
  },
  critical: {
    type: 'critical', label: '暴击', icon: resolveBattleEffectIcon('critical'),
    description: '暴击！{actor}的攻击打出了致命效果！{target}要害被击中，鲜血飞溅！',
    cssClass: 'effect-critical'
  },
  block: {
    type: 'block', label: '格挡', icon: resolveBattleEffectIcon('block'),
    description: '{target}及时架起防御，{actor}的攻击被堪堪挡下，发出金铁交击之声！',
    cssClass: 'effect-block'
  },
  dodge: {
    type: 'dodge', label: '闪避', icon: resolveBattleEffectIcon('dodge'),
    description: '{target}身形飘忽如鬼魅，{actor}的攻击擦着衣角掠过，竟未伤及分毫！',
    cssClass: 'effect-dodge'
  }
} satisfies Record<BattleEffectType, BattleEffectConfig>

export function getEffectForElement(element: string): BattleEffectConfig {
  const el = element.toLowerCase()
  if (el.includes('火') || el === 'fire') return ELEMENT_EFFECTS.fire
  if (el.includes('冰') || el === 'ice') return ELEMENT_EFFECTS.ice
  if (el.includes('雷') || el === 'thunder') return ELEMENT_EFFECTS.thunder
  if (el.includes('风') || el === 'wind') return ELEMENT_EFFECTS.wind
  if (el.includes('土') || el === 'earth') return ELEMENT_EFFECTS.earth
  if (el.includes('水') || el === 'water') return ELEMENT_EFFECTS.water
  if (el.includes('木') || el === 'wood') return ELEMENT_EFFECTS.wood
  if (el.includes('空') || el === 'void') return ELEMENT_EFFECTS.void_magic
  return ELEMENT_EFFECTS.slash
}

/** 生成战斗叙事文本 */
export function generateBattleNarrative(
  effectType: BattleEffectType,
  actorName: string,
  targetName?: string,
  element?: string
): string {
  let config: BattleEffectConfig
  if (effectType === 'attack' || effectType === 'slash') {
    config = element ? getEffectForElement(element) : ELEMENT_EFFECTS.attack
  } else {
    config = ELEMENT_EFFECTS[effectType]
  }
  if (!config) config = ELEMENT_EFFECTS.attack

  let text = config.description
  text = text.replace(/\{actor\}/g, actorName)
  if (targetName) text = text.replace(/\{target\}/g, targetName)
  return text
}

/** 生成受击文本 */
export function generateHitNarrative(
  targetName: string,
  damage: number,
  isCrit: boolean,
  isBlocked: boolean
): string {
  if (isCrit) {
    const crit = ELEMENT_EFFECTS.critical.description
    return crit.replace(/\{actor\}/g, '你').replace(/\{target\}/g, targetName) + `（-${damage}）`
  }
  if (isBlocked) {
    const block = ELEMENT_EFFECTS.block.description
    return block.replace(/\{actor\}/g, '攻击').replace(/\{target\}/g, targetName)
  }
  return `${targetName}承受了${damage}点伤害，身形微微一晃。`
}

/** 生成回血文本 */
export function generateHealNarrative(
  actorName: string,
  amount: number
): string {
  const heal = ELEMENT_EFFECTS.heal.description
  return heal.replace(/\{actor\}/g, actorName) + ` 恢复了${amount}点生命值。`
}

export default ELEMENT_EFFECTS
