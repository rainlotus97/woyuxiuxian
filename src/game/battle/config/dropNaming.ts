import type { DropItem } from '@/types/adventure'
import type { WorldWeather } from '@/types/world'

export type DropNamingKind = 'normal' | 'region' | 'weather' | 'event' | 'boss' | 'story'

export interface DropNamingContext {
  kind: DropNamingKind
  weather?: WorldWeather
  regionName?: string | null
  eventName?: string | null
}

export interface DropNamingProfile {
  label: string
  namePrefix: string
  descriptionPrefix: string
}

export const DROP_NAMING_TABLE: Record<DropNamingKind, DropNamingProfile> = {
  normal: { label: '普通掉落', namePrefix: '', descriptionPrefix: '常规战利' },
  region: { label: '区域掉落', namePrefix: '界域·', descriptionPrefix: '此界域常见的战利' },
  weather: { label: '天气掉落', namePrefix: '天象·', descriptionPrefix: '受当前天象浸染的战利' },
  event: { label: '事件掉落', namePrefix: '异闻·', descriptionPrefix: '与当前异动相关的战利' },
  boss: { label: 'Boss掉落', namePrefix: '王庭·', descriptionPrefix: '强敌核心留下的战利' },
  story: { label: '故事纪念物', namePrefix: '旧章·', descriptionPrefix: '只属于这段故事的纪念物' }
}

const WEATHER_PREFIX: Partial<Record<WorldWeather, string>> = {
  rain: '雨痕·',
  storm: '雷纹·',
  flood: '潮生·',
  fire: '火脉·',
  mist: '雾隐·'
}

export function resolveDropDisplayName(drop: DropItem, context?: DropNamingContext) {
  if (!context || context.kind === 'normal') return drop.name
  const profile = DROP_NAMING_TABLE[context.kind]
  const prefix = context.kind === 'weather' && context.weather
    ? WEATHER_PREFIX[context.weather] ?? profile.namePrefix
    : profile.namePrefix
  if (!prefix || drop.name.startsWith(prefix)) return drop.name
  return `${prefix}${drop.name}`
}

export function resolveDropDisplayDescription(drop: DropItem, context?: DropNamingContext) {
  if (!context || context.kind === 'normal') return drop.description
  const profile = DROP_NAMING_TABLE[context.kind]
  const contextName = context.eventName || context.regionName
  const lead = contextName ? `${contextName}的${profile.descriptionPrefix}` : profile.descriptionPrefix
  return drop.description ? `${lead}：${drop.description}` : lead
}
