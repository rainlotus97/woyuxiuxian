import type { Component } from 'vue'
import type { BgmType } from '@/composables/useAudio'
import type { BattleActorRole } from '@/game/battle/presentationRoles'
import type { Perspective } from '@/story/types'
import type { BattleEffectType } from '@/game/battle/battleEffectsConfig'
import {
  Activity,
  Apple,
  Atom,
  Backpack,
  BookOpen,
  Castle,
  Cherry,
  CircleDot,
  Clipboard,
  Coins,
  Compass,
  Crown,
  Crosshair,
  Diamond,
  Droplets,
  Flame,
  FolderOpen,
  Gift,
  Gem,
  Globe,
  Grid3X3,
  Hammer,
  Home,
  Landmark,
  Layers,
  Leaf,
  Lock,
  LogOut,
  Map,
  MapPin,
  Medal,
  Moon,
  Mountain,
  Orbit,
  Package,
  Pickaxe,
  Pill,
  Save,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Skull,
  Snowflake,
  Sparkles,
  Star,
  Store,
  Sun,
  Sword,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
  Volume2,
  VolumeX,
  Wind,
  Wrench,
  X,
  Zap
} from 'lucide-vue-next'

export interface GameThemeTokens {
  id: string
  name: string
  surfaceBackdrop: string
  battleBackdrop: string
  battleSweepEnabledDesktop: boolean
  battleSweepEnabledMobile: boolean
  routeBgm: {
    fallback: BgmType
    battle: BgmType
    story: BgmType
    adventure: BgmType
    shop: BgmType
    map: BgmType
    sect: BgmType
    cultivation: BgmType
    settings: BgmType
    companion: BgmType
  }
  story: {
    perspectiveIcons: Record<Perspective, string>
    eventTypeLabels: {
      idle: string
      sideQuest: string
      warning: string
      clue: string
      adventure: string
      cultivation: string
    }
  }
  battle: {
    roleBadges: Record<BattleActorRole, string>
    effectIcons: Record<BattleEffectType, string>
  }
}

export const GAME_THEME_TOKENS: GameThemeTokens = {
  id: 'jade-scroll',
  name: '玉简行旅',
  surfaceBackdrop: [
    'radial-gradient(circle at 12% 4%, rgba(255, 223, 138, 0.28), transparent 28%)',
    'radial-gradient(circle at 86% 0%, rgba(115, 212, 190, 0.18), transparent 32%)',
    'repeating-linear-gradient(90deg, rgba(87, 137, 125, 0.035) 0 1px, transparent 1px 72px)',
    'repeating-linear-gradient(0deg, rgba(188, 141, 58, 0.03) 0 1px, transparent 1px 72px)',
    'linear-gradient(180deg, #f8fff5 0%, #eef8f1 52%, #e7f1eb 100%)'
  ].join(','),
  battleBackdrop: [
    'radial-gradient(circle at 50% 56%, rgba(255, 230, 167, 0.42), transparent 26%)',
    'radial-gradient(circle at 50% 2%, rgba(236, 252, 245, 0.72), transparent 34%)',
    'linear-gradient(180deg, #edf8fb 0%, #dbecef 38%, #c9dfdb 100%)'
  ].join(','),
  battleSweepEnabledDesktop: false,
  battleSweepEnabledMobile: false,
  routeBgm: {
    fallback: 'river_qin',
    battle: 'duel_blade',
    story: 'story',
    adventure: 'adventure',
    shop: 'festival_lantern',
    map: 'bamboo_flute',
    sect: 'jade_hall',
    cultivation: 'river_qin',
    settings: 'moonlit_bamboo',
    companion: 'warm_hearth'
  },
  story: {
    perspectiveIcons: {
      male: '剑',
      female: '镜',
      both: '影'
    },
    eventTypeLabels: {
      idle: '异动未起',
      sideQuest: '人已经到了',
      warning: '局面拐了个弯',
      clue: '线头露了半截',
      adventure: '路上有了动静',
      cultivation: '眼前这口气动了'
    }
  },
  battle: {
    roleBadges: {
      protagonist: 'Sword',
      companion: 'UsersRound',
      pet: 'Leaf',
      summon: 'Sparkles',
      enemy: 'Skull',
      elite: 'Crosshair',
      boss: 'Crown'
    },
    effectIcons: {
      slash: '⚔',
      fire: '焰',
      ice: '霜',
      thunder: '雷',
      wind: '岚',
      earth: '岳',
      water: '潮',
      wood: '藤',
      void_magic: '虚',
      heal: '愈',
      hit: '裂',
      knockdown: '坠',
      defend: '御',
      idle: '息',
      attack: '出',
      critical: '绝',
      block: '格',
      dodge: '闪'
    }
  }
}

export const GAME_ICON_MAP: Record<string, Component> = {
  '': CircleDot,
  '·': CircleDot,
  '剑': Sword,
  '木': Leaf,
  '锋': Swords,
  '霄': Swords,
  '沌': Swords,
  '玄': Sword,
  '铁': Hammer,
  '金': Gem,
  '神': Star,
  '仙': Star,
  '甲': Shield,
  '布': Shield,
  '玉': Gem,
  '符': ScrollText,
  '镯': Diamond,
  '珠': CircleDot,
  '丹': Pill,
  '药': Pill,
  '灵': Sparkles,
  '力': Activity,
  '果': Apple,
  '羹': Cherry,
  '基': Package,
  '婴': Atom,
  '劫': Skull,
  '乘': Layers,
  '火': Flame,
  '冰': Snowflake,
  '雷': Zap,
  '风': Wind,
  '土': Mountain,
  '水': Droplets,
  '空': Orbit,
  '人': UserRound,
  '妖': Skull,
  '魔': Skull,
  '石': Coins,
  '修': BookOpen,
  '闻': Globe,
  '戒': Diamond,
  '物': Backpack,
  '险': Crosshair,
  '换': Wrench,
  '续': BookOpen,
  '启': Sparkles,
  '重': Activity,
  '破': Zap,
  '装': Backpack,
  '坐': Sun,
  '止': Moon,
  '点': CircleDot,
  '得': Gift,
  '行': Compass,
  '令': Clipboard,
  '止战': ShieldCheck,
  '📍': MapPin,
  '⭐': Star,
  '🏷️': BookOpen,
  '💎': Diamond,
  '💰': Coins,
  '🌟': Star,
  '🗡️': Sword,
  '⚔️': Swords,
  '⚡': Zap,
  '🌊': Droplets,
  '🔒': Lock,
  '🔄': Activity,
  '🧪': Pill,
  '🌿': Leaf,
  '🎁': Gift,
  '⬆️': Activity,
  '⚑': Landmark,
  '📈': Activity,
  '📋': Clipboard,
  '🏅': Medal,
  '🏛️': Landmark,
  '⛔': X,
  '✓': ShieldCheck,
  'Swords': Swords,
  'Sword': Sword,
  'Shield': Shield,
  'Mountain': Mountain,
  'Wind': Wind,
  'Snowflake': Snowflake,
  'Flame': Flame,
  'Star': Star,
  'Orbit': Orbit,
  'Leaf': Leaf,
  'Skull': Skull,
  'Droplets': Droplets,
  'Zap': Zap,
  'Crosshair': Crosshair,
  'MapPin': MapPin,
  'Pickaxe': Pickaxe,
  'Sparkles': Sparkles,
  'Gem': Gem,
  'Coins': Coins,
  'Castle': Castle,
  'Medal': Medal,
  'Map': Map,
  'LogOut': LogOut,
  'Compass': Compass,
  'Home': Home,
  'Grid3X3': Grid3X3,
  'Store': Store,
  'Settings': Settings,
  'UsersRound': UsersRound,
  'UserRound': UserRound,
  'Landmark': Landmark,
  'ScrollText': ScrollText,
  'BookOpen': BookOpen,
  'Volume2': Volume2,
  'VolumeX': VolumeX,
  'Save': Save,
  'FolderOpen': FolderOpen,
  'Lock': Lock,
  'Gift': Gift,
  'Trophy': Trophy
}

export interface NavigationThemeItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: string
}

export const MAIN_NAV_ITEMS: NavigationThemeItem[] = [
  { path: '/game/cultivation', name: '修炼', shortName: '修炼', desc: '吐纳养息，稳住境界节奏。', icon: 'Sparkles' },
  { path: '/game/adventure', name: '历练', shortName: '历练', desc: '外出闯荡，推进地图与因果。', icon: 'Swords' },
  { path: '/game/map', name: '地图', shortName: '地图', desc: '查看界域、路径与风波。', icon: 'Map' },
  { path: '/game/sect', name: '宗门', shortName: '宗门', desc: '处理山门、人事与战局。', icon: 'Landmark' },
  { path: '/game/companion', name: '伙伴', shortName: '伙伴', desc: '人物、灵兽与结伴者。', icon: 'UsersRound' },
  { path: '/game/skills', name: '功法', shortName: '功法', desc: '功法树、术式与搭配。', icon: 'ScrollText' },
  { path: '/game/inventory', name: '背包', shortName: '背包', desc: '丹药、材料与随身法器。', icon: 'Backpack' },
  { path: '/game/shop', name: '坊市', shortName: '坊市', desc: '采买、交换与传闻流通。', icon: 'Store' },
  { path: '/game/profile', name: '角色', shortName: '角色', desc: '角色面板与成长记录。', icon: 'UserRound' },
  { path: '/game/settings', name: '设置', shortName: '设置', desc: '音画、主题与辅助开关。', icon: 'Settings' }
]

export function resolveGameIconComponent(iconCode: string): Component {
  return GAME_ICON_MAP[iconCode] || CircleDot
}

export function hasGameIcon(iconCode: string): boolean {
  return iconCode in GAME_ICON_MAP
}

export interface BattlePresentationDescriptor {
  spriteKey: string
  portraitKey: string
  badgeIcon: string
}

export function resolveRouteBgmType(path: string): BgmType {
  const routeBgm = GAME_THEME_TOKENS.routeBgm
  if (path.includes('/game/battle')) return routeBgm.battle
  if (path.includes('/game/story') || path.includes('story=1')) return routeBgm.story
  if (path.includes('/game/adventure')) return routeBgm.adventure
  if (path.includes('/game/shop')) return routeBgm.shop
  if (path.includes('/game/map')) return routeBgm.map
  if (path.includes('/game/sect')) return routeBgm.sect
  if (path.includes('/game/cultivation')) return routeBgm.cultivation
  if (path.includes('/game/settings')) return routeBgm.settings
  if (path.includes('/game/companion')) return routeBgm.companion
  return routeBgm.fallback
}

export function resolveBattleUnitPresentation(
  role: BattleActorRole,
  side: 'ally' | 'enemy',
  fallbackIcon = ''
): BattlePresentationDescriptor {
  const spriteKey = side === 'ally'
    ? 'actor_ally'
    : role === 'boss'
      ? 'actor_boss'
      : 'actor_enemy'

  const portraitKey = `${side}_${role}`

  return {
    spriteKey,
    portraitKey,
    badgeIcon: GAME_THEME_TOKENS.battle.roleBadges[role] || fallbackIcon || 'CircleDot'
  }
}

export function resolveStoryPerspectiveIcon(perspective: Perspective) {
  return GAME_THEME_TOKENS.story.perspectiveIcons[perspective]
}

export function resolveStoryEventTypeLabel(options: {
  hasCurrentNode: boolean
  hasSideQuest: boolean
  hasWarning: boolean
  hasClue: boolean
  mode: 'cultivation' | 'adventure'
}) {
  if (!options.hasCurrentNode) return GAME_THEME_TOKENS.story.eventTypeLabels.idle
  if (options.hasSideQuest) return GAME_THEME_TOKENS.story.eventTypeLabels.sideQuest
  if (options.hasWarning) return GAME_THEME_TOKENS.story.eventTypeLabels.warning
  if (options.hasClue) return GAME_THEME_TOKENS.story.eventTypeLabels.clue
  return options.mode === 'adventure'
    ? GAME_THEME_TOKENS.story.eventTypeLabels.adventure
    : GAME_THEME_TOKENS.story.eventTypeLabels.cultivation
}

export function resolveBattleEffectIcon(type: BattleEffectType) {
  return GAME_THEME_TOKENS.battle.effectIcons[type] || GAME_THEME_TOKENS.battle.effectIcons.slash
}

export function resolveBattleBgmType(
  units: Array<{
    side: 'ally' | 'enemy'
    battleRole: BattleActorRole
    stats: { currentHp: number; maxHp: number }
    isAlive: boolean
  }>
): BgmType {
  const enemyBosses = units.filter(unit => unit.side === 'enemy' && unit.isAlive && unit.battleRole === 'boss')
  if (enemyBosses.length > 0) {
    const lowHpBoss = enemyBosses.some(unit => unit.stats.currentHp / Math.max(1, unit.stats.maxHp) <= 0.4)
    return lowHpBoss ? 'battle_phase2' : 'battle_boss'
  }

  const enemyCount = units.filter(unit => unit.side === 'enemy' && unit.isAlive).length
  return enemyCount >= 4 ? 'battle_raid' : 'battle_normal'
}
