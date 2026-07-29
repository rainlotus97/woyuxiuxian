import type { Realm, Element } from './unit'
import type { WorldRealm } from './map'
import type { ContentDefinition, DefinitionSkillRefs } from './definition'

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
export type NpcOriginType =
  | 'mortal_village'
  | 'cultivator_clan'
  | 'sect_foundling'
  | 'fallen_house'
  | 'ancient_lineage'
  | 'beast_blood'
  | 'wanderer'
  | 'outer_realm'
export type DestinyRank = 'ordinary' | 'fated' | 'anomalous' | 'legendary'
export type BloodlineGrade = 'none' | 'thin' | 'awakened' | 'ancient' | 'forbidden'
export type ConstitutionType =
  | 'ordinary_body'
  | 'sword_bone'
  | 'medicine_body'
  | 'demon_blood'
  | 'star_meridian'
  | 'void_meridian'
  | 'thunder_body'
  | 'ice_heart'
export type FactionStance = 'orthodox' | 'neutral' | 'demonic' | 'beast' | 'rogue' | 'imperial'
export type GrowthFlaw =
  | 'none'
  | 'heart_demon'
  | 'weak_body'
  | 'unstable_meridian'
  | 'vengeful'
  | 'oath_bound'
  | 'greedy_impulse'
  | 'reckless_breakthrough'

export interface AptitudeProfile {
  root: Element | '冰' | '风' | '空'
  rootGrade: RootGrade
  talent: TalentGrade
  bloodlineGrade: BloodlineGrade
  constitution: ConstitutionType
  comprehension: number
  luck: number
  physique: number
  willpower: number
  growthFlaws: GrowthFlaw[]
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

export interface NpcDefinition extends ContentDefinition, DefinitionSkillRefs {
  id: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  role: NpcRole
  homeMapId: string
  /** @deprecated Use affiliation.organizationId for new definitions. */
  sectId?: string
  aptitude: AptitudeProfile
  personality: PersonalityProfile
  profile: {
    title: string
    origin: string
    originType: NpcOriginType
    background: string
    familyStatus: string
    identityHook: string
    destinyRank: DestinyRank
    destinyTags: string[]
    bloodline: string
    constitutionNote: string
    factionStance: FactionStance
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
  notoriety: number
  lastActionTick: number
}

export type WorldLogScope = 'player' | 'npc' | 'sect' | 'weather' | 'world'
export type WorldLogSeverity = 'minor' | 'normal' | 'major' | 'legendary'
export type WorldLogVisibility = 'briefing' | 'record' | 'hidden'

export interface WorldLogEntry {
  id: string
  tick: number
  lastTick: number
  timeLabel: string
  scope: WorldLogScope
  severity: WorldLogSeverity
  visibility: WorldLogVisibility
  title: string
  text: string
  actorIds: string[]
  mapId?: string
  tags: string[]
  dedupeKey: string
  repeatCount: number
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
  type: 'gold' | 'cultivation' | 'contribution' | 'reputation' | 'item' | 'flag' | 'skill_exp'
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

export function formatWorldTimeAtTick(totalTicks: number): string {
  const safeTicks = Math.max(0, Math.floor(Number.isFinite(totalTicks) ? totalTicks : 0))
  const absoluteShichen = 4 + safeTicks
  const elapsedDays = Math.floor(absoluteShichen / SHICHEN_NAMES.length)
  const year = Math.floor(elapsedDays / (30 * 12)) + 1
  const month = Math.floor(elapsedDays / 30) % 12 + 1
  const day = elapsedDays % 30 + 1

  return formatWorldTime({
    year,
    month,
    day,
    shichenIndex: absoluteShichen % SHICHEN_NAMES.length,
    totalTicks: safeTicks,
    lastSimulatedAt: 0
  })
}
