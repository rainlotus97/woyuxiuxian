import type { AreaRiskLevel, AreaRuntimeState } from './mapRuntimeTypes'

export type MapAreaActionKind = 'patrol' | 'pacify' | 'suppress'

export interface MapAreaActionOption {
  kind: MapAreaActionKind
  label: string
  description: string
  staminaCost: number
  tone: 'jade' | 'gold' | 'rose'
}

export interface MapAreaActionInput {
  areaName: string
  areaState: AreaRuntimeState
  weather: string
  hasAnomaly: boolean
}

export interface MapAreaActionResult {
  kind: MapAreaActionKind
  title: string
  text: string
  stabilityDelta: number
  pressureDelta: number
  contested: boolean
  severity: 'normal' | 'major'
  tags: string[]
}

const RISK_COST: Record<AreaRiskLevel, number> = {
  safe: 4,
  watch: 6,
  danger: 9,
  chaos: 12
}

export function resolveMapAreaActionOptions(input: Pick<MapAreaActionInput, 'areaState' | 'hasAnomaly'>): MapAreaActionOption[] {
  const baseCost = RISK_COST[input.areaState.riskLevel]
  const anomalyCost = input.hasAnomaly ? 2 : 0
  return [
    {
      kind: 'patrol',
      label: '巡查',
      description: '低成本确认区域近况，小幅降低压力。',
      staminaCost: Math.max(3, baseCost - 2),
      tone: 'jade'
    },
    {
      kind: 'pacify',
      label: '安抚',
      description: '调停散修与地方势力，提升稳定度。',
      staminaCost: baseCost + anomalyCost,
      tone: 'gold'
    },
    {
      kind: 'suppress',
      label: '镇压',
      description: '直接压制失序源头，适合危险或争夺区域。',
      staminaCost: baseCost + 3 + anomalyCost,
      tone: 'rose'
    }
  ]
}

export function resolveMapAreaAction(input: MapAreaActionInput, kind: MapAreaActionKind): MapAreaActionResult {
  const risk = input.areaState.riskLevel
  const anomalyPressure = input.hasAnomaly ? 3 : 0
  const weatherPressure = input.weather === 'storm' || input.weather === 'flood' || input.weather === 'fire' ? 2 : 0

  if (kind === 'patrol') {
    const pressureDelta = risk === 'safe' ? -2 : -4 - anomalyPressure
    return {
      kind,
      title: `${input.areaName}巡查`,
      text: `你沿${input.areaName}外缘巡查了一圈，确认了几处灵气紊乱与妖兽踪迹。区域压力有所缓解。`,
      stabilityDelta: risk === 'safe' ? 1 : 2,
      pressureDelta,
      contested: input.areaState.contested,
      severity: 'normal',
      tags: ['map', 'area-action', 'patrol']
    }
  }

  if (kind === 'pacify') {
    const stabilityDelta = risk === 'chaos' ? 7 : 5
    return {
      kind,
      title: `${input.areaName}安抚`,
      text: `你在${input.areaName}调停地方修士与过路商队，补上了几处防线缺口。当地稳定度提升。`,
      stabilityDelta,
      pressureDelta: -3 - anomalyPressure,
      contested: input.areaState.contested && risk === 'chaos',
      severity: risk === 'danger' || risk === 'chaos' ? 'major' : 'normal',
      tags: ['map', 'area-action', 'pacify']
    }
  }

  return {
    kind,
    title: `${input.areaName}镇压`,
    text: `你在${input.areaName}强行清剿失序源头，震慑了暗处势力。区域压力明显下降${weatherPressure > 0 ? '，但恶劣天象仍让余波未平' : ''}。`,
    stabilityDelta: 3,
    pressureDelta: -8 - anomalyPressure + weatherPressure,
    contested: risk === 'chaos' ? false : input.areaState.contested,
    severity: 'major',
    tags: ['map', 'area-action', 'suppress']
  }
}
