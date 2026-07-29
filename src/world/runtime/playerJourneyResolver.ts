import type {
  IdleMode,
  PlayerJourneyEntry,
  WorldAreaAnomaly,
  WorldClock,
  WorldWeather
} from '@/types/world'
import { formatWorldTime } from '@/types/world'
import { getAreaById } from '@/types/map'
import type { AreaRiskLevel } from '@/map/runtime/mapRuntimeTypes'
import type { TravelResult, WorldEffect } from '@/types/worldEvent'
import {
  resolveTravelJourney,
  type TravelJourneyResult
} from './idleJourneyResolver'
import {
  resolveIdleSkillTrainingProgression,
  type SkillExpDelta,
  type SkillProgressSkillInput
} from '@/character/runtime/characterSkillProgressResolver'
import {
  resolvePetJourneyRewards,
  type PetBondJourneyEffects
} from '@/pet/runtime/petBondResolver'
import { seededWorldRoll } from './worldSeed'

export interface PlayerJourneyInventoryItem {
  id: string
  definitionId?: string
  name: string
  icon: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  quantity: number
  description?: string
}

export interface PlayerJourneyResolution {
  cultivationDelta: number
  goldDelta: number
  sectContributionDelta: number
  sectReputationDelta: number
  petExpDelta: number
  petIntimacyDelta: number
  skillExpDeltas: SkillExpDelta[]
  inventoryItems: PlayerJourneyInventoryItem[]
  journeys: Array<Omit<PlayerJourneyEntry, 'id' | 'tick' | 'timeLabel' | 'mode'>>
}

export interface PlayerJourneyResolverContext {
  clock: WorldClock
  idleMode: IdleMode
  weather: WorldWeather
  baseCultivationGain: number
  hasEquippedPet: boolean
  petBondEffects?: PetBondJourneyEffects | null
  learnedSkills?: SkillProgressSkillInput[]
  activeAnomaly: WorldAreaAnomaly | null
  fallbackAreaId: string | null
  sectHomeAreaId: string | null
}

export interface PlayerTravelResolverContext {
  clock: WorldClock
  weather: WorldWeather
  fromAreaId: string
  toAreaId: string
  fromAreaName?: string | null
  toAreaName?: string | null
  routeRisk?: AreaRiskLevel
  routeDistance?: number
  hasAnomaly?: boolean
  stamina: number
}

export interface PlayerTravelResolution {
  travel: TravelResult
  journey: TravelJourneyResult
}

interface TravelRiskProfile {
  staminaCost: number
  interruptionChance: number
  label: string
}

interface TravelWeatherProfile {
  staminaDelta: number
  ticksDelta: number
  riskDelta: number
  interruptionChance: number
  label: string
}

const TRAVEL_RISK_PROFILES: Record<AreaRiskLevel, TravelRiskProfile> = {
  safe: { staminaCost: 0, interruptionChance: 0.025, label: '安稳路线' },
  watch: { staminaCost: 1, interruptionChance: 0.08, label: '需戒备路线' },
  danger: { staminaCost: 3, interruptionChance: 0.2, label: '危险路线' },
  chaos: { staminaCost: 5, interruptionChance: 0.34, label: '混乱路线' }
}

const TRAVEL_WEATHER_PROFILES: Record<WorldWeather, TravelWeatherProfile> = {
  clear: {
    staminaDelta: 0,
    ticksDelta: 0,
    riskDelta: 0,
    interruptionChance: 0,
    label: '天朗气清：按基础路线耗时与体力结算'
  },
  rain: {
    staminaDelta: 1,
    ticksDelta: 0,
    riskDelta: 0.025,
    interruptionChance: 0.03,
    label: '灵雨细落：泥泞略增体力消耗，草木气息遮住部分脚印'
  },
  storm: {
    staminaDelta: 3,
    ticksDelta: 1,
    riskDelta: 0.12,
    interruptionChance: 0.14,
    label: '雷暴压境：风雷拖慢行程，路线中断概率上升'
  },
  flood: {
    staminaDelta: 4,
    ticksDelta: 1,
    riskDelta: 0.18,
    interruptionChance: 0.2,
    label: '洪水漫野：水路绕行，耗时和中断风险均上升'
  },
  fire: {
    staminaDelta: 3,
    ticksDelta: 1,
    riskDelta: 0.1,
    interruptionChance: 0.12,
    label: '火潮蔓延：避开火脉与流民，行路更费灵力'
  },
  mist: {
    staminaDelta: 2,
    ticksDelta: 1,
    riskDelta: 0.09,
    interruptionChance: 0.1,
    label: '雾锁山河：辨路更慢，埋伏与隐秘岔路都更常见'
  }
}

const RISK_ORDER: Record<AreaRiskLevel, number> = {
  safe: 0,
  watch: 1,
  danger: 2,
  chaos: 3
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function resolveHigherRisk(left: AreaRiskLevel, right: AreaRiskLevel): AreaRiskLevel {
  return RISK_ORDER[left] >= RISK_ORDER[right] ? left : right
}

function createTravelResolution(
  context: PlayerTravelResolverContext,
  travel: TravelResult
): PlayerTravelResolution {
  return {
    travel,
    journey: resolveTravelJourney({
      clock: context.clock,
      travel,
      fromAreaName: context.fromAreaName,
      toAreaName: context.toAreaName
    })
  }
}

function createBlockedTravel(
  context: PlayerTravelResolverContext,
  routeRisk: AreaRiskLevel,
  weatherModifier: TravelWeatherProfile,
  message: string,
  destinationName: string
): PlayerTravelResolution {
  const effects: WorldEffect[] = [{
    type: 'outcome',
    targetId: 'travel-blocked',
    value: 'blocked',
    label: '赶路受阻',
    reason: message,
    metadata: { routeRisk, weather: context.weather }
  }]
  return createTravelResolution(context, {
    destinationId: context.toAreaId,
    destinationName,
    status: 'blocked',
    weather: context.weather,
    ticksSpent: 0,
    staminaSpent: 0,
    message,
    effects,
    fromAreaId: context.fromAreaId,
    routeRisk,
    weatherModifier
  })
}

export function resolvePlayerTravel(context: PlayerTravelResolverContext): PlayerTravelResolution {
  const fromArea = getAreaById(context.fromAreaId)
  const toArea = getAreaById(context.toAreaId)
  const weatherModifier = TRAVEL_WEATHER_PROFILES[context.weather]
  const fallbackRisk = toArea?.defaultRiskLevel ?? fromArea?.defaultRiskLevel ?? 'watch'
  const routeRisk = context.routeRisk
    ? resolveHigherRisk(context.routeRisk, fallbackRisk)
    : fallbackRisk
  const riskProfile = TRAVEL_RISK_PROFILES[routeRisk]
  const destinationName = context.toAreaName || toArea?.name || context.toAreaId

  if (!fromArea || !toArea) {
    return createBlockedTravel(context, routeRisk, weatherModifier, '地图上找不到完整的起点或终点，暂时无法确认路线。', destinationName)
  }
  if (fromArea.id === toArea.id) {
    return createBlockedTravel(context, routeRisk, weatherModifier, `你已经在${toArea.name}，没有必要重复赶路。`, destinationName)
  }

  const isAdjacent = fromArea.adjacentAreas.includes(toArea.id)
  if (!isAdjacent && context.routeDistance === undefined) {
    return createBlockedTravel(context, routeRisk, weatherModifier, `${fromArea.name}与${toArea.name}之间没有已知直连路线，需要先找到中途落脚点。`, destinationName)
  }

  const routeDistance = Math.max(1, Math.round(context.routeDistance ?? 1))
  const anomalyCost = context.hasAnomaly ? 2 : 0
  const staminaCost = 4 + routeDistance * 2 + riskProfile.staminaCost + weatherModifier.staminaDelta + anomalyCost
  const ticksSpent = clamp(1 + routeDistance + weatherModifier.ticksDelta + (routeRisk === 'chaos' ? 1 : 0), 1, 8)
  const weatherRisk = weatherModifier.riskDelta
  const interruptionChance = clamp(
    riskProfile.interruptionChance + weatherModifier.interruptionChance + (context.hasAnomaly ? 0.06 : 0),
    0.02,
    0.72
  )

  if (context.stamina < staminaCost) {
    return createBlockedTravel(
      context,
      routeRisk,
      weatherModifier,
      `体力不足，走完这条${riskProfile.label}至少需要${staminaCost}点体力。`,
      destinationName
    )
  }

  const interruptionRoll = seededWorldRoll(
    context.clock.totalTicks,
    context.fromAreaId,
    context.toAreaId,
    context.weather,
    'travel-interruption'
  )
  const interrupted = interruptionRoll < interruptionChance
  const actualTicks = interrupted ? Math.max(1, Math.ceil(ticksSpent / 2)) : ticksSpent
  const actualStamina = interrupted ? Math.max(1, Math.ceil(staminaCost * 0.6)) : staminaCost
  const interruption = interrupted
    ? {
        id: `travel-interruption-${context.clock.totalTicks}-${context.fromAreaId}-${context.toAreaId}`,
        title: context.weather === 'flood' || context.weather === 'storm' ? '天象截路' : '路上异动',
        text: context.weather === 'flood'
          ? `${destinationName}方向的水路突然漫涨，你只能在半途收拢行装，改日再寻路线。`
          : context.weather === 'storm'
            ? '一声闷雷落在前方山口，乱石和风压迫使你暂时退回避险。'
            : `前路出现无法忽视的异动，你在${destinationName}之外停下脚步，先保全自身。`,
        severity: routeRisk === 'danger' || routeRisk === 'chaos' ? 'major' as const : 'normal' as const,
        effects: [{
          type: 'outcome' as const,
          targetId: `travel-interruption-${context.toAreaId}`,
          value: 'interrupted',
          label: '中断事件',
          reason: '路线风险与当前天气共同触发了中断。'
        }]
      }
    : undefined
  const message = interrupted
    ? `${interruption?.title}：${interruption?.text}`
    : `你沿着${riskProfile.label}抵达${destinationName}。`
  const effects: WorldEffect[] = [
    {
      type: 'stamina',
      value: -actualStamina,
      label: '赶路体力',
      reason: `${riskProfile.label}，${weatherModifier.label}`
    },
    interrupted
      ? {
          type: 'outcome',
          targetId: interruption?.id,
          value: 'interrupted',
          label: '赶路中断',
          reason: message,
          metadata: { routeRisk, weather: context.weather, riskDelta: weatherRisk }
        }
      : {
          type: 'area',
          targetId: context.toAreaId,
          value: 1,
          label: '路线推进',
          reason: `已抵达${destinationName}`,
          metadata: { routeRisk, weather: context.weather, riskDelta: weatherRisk }
        }
  ]

  const travel: TravelResult = {
    destinationId: context.toAreaId,
    destinationName,
    status: interrupted ? 'interrupted' : 'arrived',
    weather: context.weather,
    ticksSpent: actualTicks,
    staminaSpent: actualStamina,
    message,
    effects,
    fromAreaId: context.fromAreaId,
    routeRisk,
    weatherModifier,
    interruption
  }
  return createTravelResolution(context, travel)
}

export const resolveTravel = resolvePlayerTravel

function createEmptyResolution(): PlayerJourneyResolution {
  return {
    cultivationDelta: 0,
    goldDelta: 0,
    sectContributionDelta: 0,
    sectReputationDelta: 0,
    petExpDelta: 0,
    petIntimacyDelta: 0,
    skillExpDeltas: [],
    inventoryItems: [],
    journeys: []
  }
}

export function resolvePlayerJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  if (context.idleMode === 'cultivate') return resolveCultivationJourney(context)
  if (context.idleMode === 'adventure') return resolveAdventureJourney(context)
  if (context.idleMode === 'gatherHerbs') return resolveHerbJourney(context)
  if (context.idleMode === 'sectDuty') return resolveSectDutyJourney(context)
  if (context.idleMode === 'trainSkill') return resolveSkillTrainingJourney(context)
  return createEmptyResolution()
}

function resolveCultivationJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  const result = createEmptyResolution()
  const gain = context.weather === 'rain'
    ? Math.floor(context.baseCultivationGain * 1.1)
    : context.baseCultivationGain
  result.cultivationDelta += gain
  if (context.hasEquippedPet) {
    const basePetExp = 2 + (seededWorldRoll(context.clock.totalTicks, 'pet-cultivate-exp') > 0.58 ? 2 : 0)
    const petRewards = resolvePetJourneyRewards({
      basePetExp,
      basePetIntimacy: 0,
      bondEffects: context.petBondEffects ?? null
    })
    result.petExpDelta += petRewards.petExp
    result.petIntimacyDelta += petRewards.petIntimacy
  }
  if (seededWorldRoll(context.clock.totalTicks, 'player-cultivate-insight') > 0.94) {
    const insightGain = Math.max(3, Math.floor(gain * 0.28))
    result.cultivationDelta += insightGain
    result.journeys.push({
      severity: 'major',
      title: '修炼顿悟',
      text: `你在${formatWorldTime(context.clock)}心有所感，顺手补上了一截火候，额外凝聚了${insightGain}点修为。`,
      rewards: [{ type: 'cultivation', label: '修为', value: insightGain }],
      tags: ['cultivation', 'insight']
    })
  }
  return result
}

function resolveAdventureJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  const result = createEmptyResolution()
  result.cultivationDelta += Math.floor(context.baseCultivationGain * 0.35)
  if (context.hasEquippedPet) {
    const basePetExp = 3 + (seededWorldRoll(context.clock.totalTicks, 'pet-adventure-exp') > 0.7 ? 3 : 0)
    const petRewards = resolvePetJourneyRewards({
      basePetExp,
      basePetIntimacy: 1,
      bondEffects: context.petBondEffects ?? null
    })
    result.petExpDelta += petRewards.petExp
    result.petIntimacyDelta += petRewards.petIntimacy
  }

  if (seededWorldRoll(context.clock.totalTicks, 'player-adventure-find') > 0.78) {
    const gold = 8 + Math.floor(seededWorldRoll(context.clock.totalTicks, 'player-adventure-gold') * 24)
    result.goldDelta += gold
    result.journeys.push({
      severity: 'normal',
      title: '游历所得',
      text: `你在城外寻到一处废弃洞府，带回${gold}枚灵石。`,
      rewards: [{ type: 'gold', label: '灵石', value: gold }],
      areaId: context.activeAnomaly?.areaId,
      tags: ['adventure', 'loot']
    })
  }

  if (seededWorldRoll(context.clock.totalTicks, 'player-adventure-encounter') > 0.9) {
    const areaId = context.activeAnomaly?.areaId ?? context.fallbackAreaId ?? undefined
    const cultivationGain = 6 + Math.floor(seededWorldRoll(context.clock.totalTicks, 'player-adventure-insight') * 12)
    result.cultivationDelta += cultivationGain
    result.journeys.push({
      severity: 'major',
      title: '奇遇现身',
      text: `你在${getAreaLabel(areaId)}偶遇一处残阵，借机参悟，额外获得${cultivationGain}点修为。`,
      rewards: [{ type: 'cultivation', label: '修为', value: cultivationGain }],
      areaId,
      tags: ['adventure', 'fortune']
    })
  }

  return result
}

function resolveHerbJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  const result = createEmptyResolution()
  if (seededWorldRoll(context.clock.totalTicks, 'player-herb-gather') <= 0.62) return result

  const quantity = 1 + Math.floor(seededWorldRoll(context.clock.totalTicks, 'player-herb-count') * 3)
  result.inventoryItems.push({
    id: `world_herb_${context.clock.totalTicks}_${Math.floor(seededWorldRoll(context.clock.totalTicks, 'player-herb-id') * 10000)}`,
    definitionId: 'herb_spirit_grass',
    name: '灵草',
    icon: '草',
    type: 'material',
    quality: 'common',
    quantity,
    description: '世界游历采得的灵草'
  })
  result.journeys.push({
    severity: 'normal',
    title: '采得灵草',
    text: '你循着雨后灵气，在山石夹缝间采到几株灵草。',
    rewards: [{ type: 'item', label: '灵草', value: quantity }],
    tags: ['herb', 'gather']
  })
  return result
}

function resolveSectDutyJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  const result = createEmptyResolution()
  if (seededWorldRoll(context.clock.totalTicks, 'player-sect-duty') <= 0.8) return result

  result.sectContributionDelta += 8
  result.sectReputationDelta += 3
  result.journeys.push({
    severity: 'normal',
    title: '宗门差遣',
    text: '宗门执事派你巡查山门，几名外门弟子对你多了些敬意。',
    rewards: [
      { type: 'contribution', label: '贡献', value: 8 },
      { type: 'reputation', label: '声望', value: 3 }
    ],
    areaId: context.sectHomeAreaId ?? undefined,
    tags: ['sect', 'duty']
  })
  return result
}

function resolveSkillTrainingJourney(context: PlayerJourneyResolverContext): PlayerJourneyResolution {
  const result = createEmptyResolution()
  if (seededWorldRoll(context.clock.totalTicks, 'player-skill-train') <= 0.86) return result
  const training = resolveIdleSkillTrainingProgression({
    learnedSkills: context.learnedSkills ?? [],
    baseCultivationGain: context.baseCultivationGain,
    seed: context.clock.totalTicks
  })
  result.skillExpDeltas.push(...training.skillExpDeltas)
  const rewardLabel = training.totalExp > 0 ? `功法经验 +${training.totalExp}` : '功法手感'

  result.journeys.push({
    severity: 'normal',
    title: '功法熟稔',
    text: training.totalExp > 0
      ? `你反复演练功法，灵力运转比先前顺畅了些，获得${training.totalExp}点功法经验。`
      : '你反复演练功法，灵力运转比先前顺畅了些。',
    rewards: training.totalExp > 0
      ? [{ type: 'skill_exp', label: rewardLabel, value: training.totalExp }]
      : [],
    tags: ['skill', 'training']
  })
  return result
}

function getAreaLabel(areaId?: string) {
  if (!areaId) return '未知地带'
  return getAreaById(areaId)?.name ?? areaId
}
