import type { MapArea } from '@/types/map'
import type { WorldWeather } from '@/types/world'
import type { AreaRuntimeState } from './mapRuntimeTypes'

export type MapExplorationPointKind = 'landmark' | 'resource' | 'trail'

export interface MapExplorationPoint {
  id: string
  kind: MapExplorationPointKind
  title: string
  description: string
  staminaCost: number
  rewardHint: string
  disabledReason: string | null
}

export interface MapExplorationResult {
  success: boolean
  reason: string
  pointId: string
  title: string
  text: string
  staminaCost: number
  rewards: {
    cultivation: number
    gold: number
    itemName: string | null
  }
  areaPatch: {
    stabilityDelta: number
    pressureDelta: number
  }
  severity: 'normal' | 'major'
  tags: string[]
}

const RISK_COST = {
  safe: 5,
  watch: 7,
  danger: 10,
  chaos: 13
} as const

export function resolveMapExplorationPoints(input: {
  area: MapArea
  areaState: AreaRuntimeState | null
  weather: WorldWeather
  hasAnomaly: boolean
}): MapExplorationPoint[] {
  const riskLevel = input.areaState?.riskLevel ?? 'safe'
  const cost = RISK_COST[riskLevel] + (input.hasAnomaly ? 2 : 0)
  const firstResource = input.area.resources[0] ?? '散落灵材'
  const weatherLocked = input.weather === 'storm' || input.weather === 'flood' || input.weather === 'fire'

  return [
    {
      id: `${input.area.id}:landmark`,
      kind: 'landmark',
      title: `${input.area.name}地标`,
      description: `探查${input.area.name}最显眼的地势节点，补全区域记忆。`,
      staminaCost: cost,
      rewardHint: '修为 / 区域稳定',
      disabledReason: null
    },
    {
      id: `${input.area.id}:resource`,
      kind: 'resource',
      title: `${firstResource}线索`,
      description: `沿灵气流向搜寻${firstResource}，有机会带回少量资源。`,
      staminaCost: cost + 1,
      rewardHint: '灵石 / 资源线索',
      disabledReason: null
    },
    {
      id: `${input.area.id}:trail`,
      kind: 'trail',
      title: '隐秘路径',
      description: '寻找可绕开正面冲突的小路，降低后续区域压力。',
      staminaCost: cost + 2,
      rewardHint: '压力下降',
      disabledReason: weatherLocked ? '恶劣天象下路径难辨' : null
    }
  ]
}

export function resolveMapExploration(input: {
  area: MapArea
  areaState: AreaRuntimeState | null
  pointId: string
  weather: WorldWeather
  hasAnomaly: boolean
  stamina: number
}): MapExplorationResult {
  const point = resolveMapExplorationPoints(input).find(item => item.id === input.pointId)
  if (!point) {
    return fail(input.pointId, '探索点不存在。')
  }
  if (point.disabledReason) {
    return fail(point.id, point.disabledReason)
  }
  if (input.stamina < point.staminaCost) {
    return fail(point.id, `体力不足，需要 ${point.staminaCost} 点体力。`, point.staminaCost)
  }

  const riskLevel = input.areaState?.riskLevel ?? 'safe'
  const riskBonus = riskLevel === 'chaos' ? 8 : riskLevel === 'danger' ? 5 : riskLevel === 'watch' ? 2 : 0
  const anomalyBonus = input.hasAnomaly ? 3 : 0

  if (point.kind === 'resource') {
    const itemName = input.area.resources[0] ?? '灵材'
    return {
      success: true,
      reason: '',
      pointId: point.id,
      title: `${input.area.name}采获`,
      text: `你顺着${input.area.name}的灵气流向搜寻，带回了${itemName}线索，也摸清了附近商路的价差。`,
      staminaCost: point.staminaCost,
      rewards: {
        cultivation: 3 + anomalyBonus,
        gold: 10 + riskBonus,
        itemName
      },
      areaPatch: {
        stabilityDelta: 1,
        pressureDelta: -1
      },
      severity: input.hasAnomaly ? 'major' : 'normal',
      tags: ['map', 'explore', 'resource']
    }
  }

  if (point.kind === 'trail') {
    return {
      success: true,
      reason: '',
      pointId: point.id,
      title: `${input.area.name}暗径`,
      text: `你记下了一条绕开主路的隐秘路径，后续修士往来不必正面撞上最混乱的地段。`,
      staminaCost: point.staminaCost,
      rewards: {
        cultivation: 5 + anomalyBonus,
        gold: 4,
        itemName: null
      },
      areaPatch: {
        stabilityDelta: 2,
        pressureDelta: -5
      },
      severity: riskLevel === 'danger' || riskLevel === 'chaos' ? 'major' : 'normal',
      tags: ['map', 'explore', 'trail']
    }
  }

  return {
    success: true,
    reason: '',
    pointId: point.id,
    title: `${input.area.name}踏勘`,
    text: `你踏勘了${input.area.name}的地标节点，将地势、灵脉与宗门活动范围记入舆图。`,
    staminaCost: point.staminaCost,
    rewards: {
      cultivation: 8 + anomalyBonus,
      gold: 3,
      itemName: null
    },
    areaPatch: {
      stabilityDelta: 3,
      pressureDelta: -2
    },
    severity: 'normal',
    tags: ['map', 'explore', 'landmark']
  }
}

function fail(pointId: string, reason: string, staminaCost = 0): MapExplorationResult {
  return {
    success: false,
    reason,
    pointId,
    title: '无法探索',
    text: reason,
    staminaCost,
    rewards: {
      cultivation: 0,
      gold: 0,
      itemName: null
    },
    areaPatch: {
      stabilityDelta: 0,
      pressureDelta: 0
    },
    severity: 'normal',
    tags: ['map', 'explore']
  }
}
