import type { Realm, Element } from './unit'

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

export const SHICHEN_NAMES: ShichenName[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function formatWorldTime(clock: WorldClock): string {
  return `修仙历${clock.year}年${clock.month}月${clock.day}日 ${SHICHEN_NAMES[clock.shichenIndex]}时`
}
