import type { IdleMode, PlayerJourneyEntry, WorldClock, WorldWeather } from '@/types/world'
import { formatWorldTime } from '@/types/world'
import type { TravelResult } from '@/types/worldEvent'

export type IdleJourneyEvent = 'start' | 'stop'

export interface IdleJourneyInput {
  event: IdleJourneyEvent
  clock: WorldClock
  idleMode: IdleMode
  cultivationPerSecond: number
  areaName?: string | null
  sectName?: string | null
  elapsedSeconds?: number | null
}

export type IdleJourneyResult = Omit<PlayerJourneyEntry, 'id' | 'tick' | 'timeLabel' | 'mode'>
export type TravelJourneyResult = IdleJourneyResult

const MODE_LABELS: Record<IdleMode, string> = {
  cultivate: '闭关修炼',
  adventure: '外出游历',
  sectDuty: '宗门差遣',
  gatherHerbs: '采集灵草',
  trainSkill: '演练功法'
}

const MODE_TAGS: Record<IdleMode, string[]> = {
  cultivate: ['cultivation'],
  adventure: ['adventure'],
  sectDuty: ['sect', 'duty'],
  gatherHerbs: ['herb', 'gather'],
  trainSkill: ['skill', 'training']
}

const WEATHER_LABELS: Record<WorldWeather, string> = {
  clear: '天朗气清',
  rain: '灵雨细落',
  storm: '雷暴压境',
  flood: '洪水漫野',
  fire: '火潮蔓延',
  mist: '雾锁山河'
}

const ROUTE_RISK_LABELS = {
  safe: '安稳',
  watch: '需戒备',
  danger: '危险',
  chaos: '混乱'
} as const

function formatElapsed(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return '片刻'
  if (seconds < 60) return `${seconds}息`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest > 0 ? `${minutes}分${rest}息` : `${minutes}分`
}

function getPlaceLine(input: IdleJourneyInput) {
  if (input.idleMode === 'sectDuty' && input.sectName) return `在${input.sectName}`
  if (input.areaName) return `向${input.areaName}`
  return '于当前界域'
}

function formatCultivationGain(value: number) {
  if (value <= 0) return '0'
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`
  return String(Math.max(1, Math.round(value)))
}

export function resolveIdleJourney(input: IdleJourneyInput): IdleJourneyResult {
  const modeLabel = MODE_LABELS[input.idleMode]
  const tags = ['idle', ...MODE_TAGS[input.idleMode]]

  if (input.event === 'stop') {
    const elapsedText = formatElapsed(input.elapsedSeconds)
    return {
      severity: 'normal',
      title: '行程收束',
      text: `你结束了${modeLabel}，此番持续${elapsedText}。后续世界时钟仍会根据当前排程继续沉淀收益、奇遇与异闻。`,
      rewards: [{ type: 'flag', label: '挂机收束', value: modeLabel }],
      tags: [...tags, 'summary']
    }
  }

  const placeLine = getPlaceLine(input)
  const gainLine = input.cultivationPerSecond > 0
    ? `当前每息约可沉淀 ${formatCultivationGain(input.cultivationPerSecond)} 点修为。`
    : '当前修为收益较低，更需要借助机缘、功法或宗门资源补足。'

  return {
    severity: 'normal',
    title: `${modeLabel}启程`,
    text: `${formatWorldTime(input.clock)}，你${placeLine}安排${modeLabel}。${gainLine}`,
    rewards: [{ type: 'flag', label: '挂机开始', value: modeLabel }],
    tags: [...tags, 'start']
  }
}

export interface TravelJourneyInput {
  clock: WorldClock
  travel: TravelResult
  fromAreaName?: string | null
  toAreaName?: string | null
}

export function resolveTravelJourney(input: TravelJourneyInput): TravelJourneyResult {
  const { travel } = input
  const from = input.fromAreaName || travel.fromAreaId || '出发地'
  const to = input.toAreaName || travel.destinationName || travel.destinationId
  const riskLabel = ROUTE_RISK_LABELS[travel.routeRisk ?? 'watch']
  const weatherLabel = WEATHER_LABELS[travel.weather]
  const modifierLabel = travel.weatherModifier?.label ?? `${weatherLabel}：按基础路线结算`
  const title = travel.status === 'arrived'
    ? '赶路抵达'
    : travel.status === 'interrupted'
      ? '赶路中断'
      : '赶路受阻'
  const severity = travel.status === 'interrupted' && (travel.routeRisk === 'danger' || travel.routeRisk === 'chaos')
    ? 'major'
    : 'normal'
  const locationId = travel.status === 'arrived'
    ? travel.destinationId
    : travel.fromAreaId ?? undefined
  const timeLine = travel.ticksSpent > 0 ? `耗时${travel.ticksSpent}个时辰，消耗${travel.staminaSpent}点体力` : '没有消耗体力'

  return {
    severity,
    title,
    text: `${formatWorldTime(input.clock)}，你从${from}前往${to}，${timeLine}。路线${riskLabel}，${modifierLabel}。${travel.message}`,
    areaId: locationId,
    rewards: [],
    tags: [
      'travel',
      `travel-${travel.status}`,
      `route-${travel.routeRisk ?? 'watch'}`,
      `weather-${travel.weather}`
    ]
  }
}
