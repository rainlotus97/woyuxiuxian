import type { Realm, Element } from './unit'
import type { WorldRealm } from './map'

export type ShichenName = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'
export type IdleMode = 'cultivate' | 'adventure' | 'sectDuty' | 'gatherHerbs' | 'trainSkill'
export type WorldWeather = 'clear' | 'rain' | 'storm' | 'flood' | 'fire' | 'mist'

export interface WorldClock {
  year: number
  month: number
  day: number
  shichenIndex: number
  totalTicks: number
  lastSimulatedAt: number
}

export type RootGrade = 'mixed' | 'dual' | 'single' | 'heavenly' | 'mutated'
export type TalentGrade = 'mortal' | 'good' | 'spirit' | 'genius' | 'monster' | 'destined'

export interface AptitudeProfile {
  root: Element | '冰' | '风' | '空'
  rootGrade: RootGrade
  talent: TalentGrade
  comprehension: number
  luck: number
  physique: number
  willpower: number
}

export interface PersonalityProfile {
  ambition: number
  loyalty: number
  cruelty: number
  affection: number
  caution: number
  greed: number
}

export type NpcRole = 'main' | 'sect' | 'enemy' | 'random' | 'companion'
export type NpcGoal = 'cultivate' | 'adventure' | 'challenge' | 'recover' | 'seekTreasure' | 'sectDuty'
export type NpcHealthState = 'healthy' | 'injured' | 'critical' | 'dead' | 'captured'

export interface RelationshipState {
  favor: number
  hatred: number
  fear: number
  debt: number
  bond: 'stranger' | 'friend' | 'rival' | 'enemy' | 'mentor' | 'companion' | 'lover'
}

export interface NpcDefinition {
  id: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  role: NpcRole
  homeMapId: string
  sectId?: string
  aptitude: AptitudeProfile
  personality: PersonalityProfile
  profile: {
    title: string
    origin: string
    background: string
    destinyTags: string[]
  }
  tags: string[]
}

export interface NpcRuntimeState {
  id: string
  realm: Realm
  realmLevel: number
  cultivation: number
  hpState: NpcHealthState
  locationMapId: string
  currentGoal: NpcGoal
  relationships: Record<string, RelationshipState>
  flags: string[]
  lastActionTick: number
}

export type WorldLogScope = 'player' | 'npc' | 'sect' | 'weather' | 'world'
export type WorldLogSeverity = 'minor' | 'normal' | 'major' | 'legendary'

export interface WorldLogEntry {
  id: string
  tick: number
  timeLabel: string
  scope: WorldLogScope
  severity: WorldLogSeverity
  title: string
  text: string
  actorIds: string[]
  mapId?: string
  tags: string[]
  revealed: boolean
}

export interface WorldRewardItem {
  id: string
  name: string
  icon: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  quantity: number
  description?: string
  effects?: {
    type: string
    value: number
    duration?: number
  }[]
}

export interface PlayerJourneyReward {
  type: 'gold' | 'cultivation' | 'contribution' | 'reputation' | 'item' | 'flag'
  label: string
  value: number | string
}

export interface PlayerJourneyEntry {
  id: string
  tick: number
  timeLabel: string
  mode: IdleMode
  severity: WorldLogSeverity
  title: string
  text: string
  areaId?: string
  rewards: PlayerJourneyReward[]
  tags: string[]
}

export interface NpcStoryRecord {
  id: string
  tick: number
  timeLabel: string
  npcId: string
  title: string
  text: string
  severity: WorldLogSeverity
  mapId?: string
  tags: string[]
}

export interface WorldAreaAnomaly {
  id: string
  tick: number
  timeLabel: string
  areaId: string
  realm: WorldRealm
  type: 'flood' | 'fire' | 'beast_tide' | 'ruins' | 'spiritual_vein' | 'bandit'
  severity: WorldLogSeverity
  title: string
  text: string
  riskHint: string
  stabilityDelta: number
  pressureDelta: number
  untilTick: number | null
}

export const SHICHEN_NAMES: ShichenName[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function formatWorldTime(clock: WorldClock): string {
  return `修仙历${clock.year}年${clock.month}月${clock.day}日 ${SHICHEN_NAMES[clock.shichenIndex]}时`
}
