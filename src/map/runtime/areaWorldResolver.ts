import type { MapArea } from '@/types/map'
import type { AreaRuntimeState, AreaWorldContext, AreaRuntimeUpdate, AreaRiskLevel } from './mapRuntimeTypes'
import { seededWorldRoll } from '@/world/runtime/worldSeed'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function resolveRiskLevel(stability: number, pressure: number): AreaRiskLevel {
  const tension = pressure - stability * 0.65
  if (tension >= 42) return 'chaos'
  if (tension >= 22) return 'danger'
  if (tension >= 8) return 'watch'
  return 'safe'
}

export function createDefaultAreaRuntimeState(area: MapArea): AreaRuntimeState {
  return {
    areaId: area.id,
    controllingSectId: area.controllingSectId ?? area.sects[0] ?? null,
    riskLevel: area.defaultRiskLevel ?? (area.realm === '人界' ? 'watch' : 'danger'),
    stability: area.realm === '人界' ? 58 : area.realm === '仙界' ? 66 : 50,
    pressure: area.realm === '魔界' ? 34 : area.realm === '妖界' ? 28 : 18,
    contested: false,
    lastUpdatedTick: 0
  }
}

export function buildAreaRuntimeStates(areas: MapArea[]) {
  const states: Record<string, AreaRuntimeState> = {}
  for (const area of areas) {
    states[area.id] = createDefaultAreaRuntimeState(area)
  }
  return states
}

export function mergeAreaRuntimeStates(
  areas: MapArea[],
  existingStates: Record<string, AreaRuntimeState> | undefined
) {
  const merged: Record<string, AreaRuntimeState> = {}
  for (const area of areas) {
    const base = createDefaultAreaRuntimeState(area)
    const existing = existingStates?.[area.id]
    const nextState: AreaRuntimeState = {
      areaId: existing?.areaId ?? base.areaId,
      controllingSectId: existing?.controllingSectId ?? base.controllingSectId,
      riskLevel: existing?.riskLevel ?? base.riskLevel,
      stability: existing?.stability ?? base.stability,
      pressure: existing?.pressure ?? base.pressure,
      contested: existing?.contested ?? base.contested,
      lastUpdatedTick: existing?.lastUpdatedTick ?? base.lastUpdatedTick
    }
    merged[area.id] = nextState
  }
  return merged
}

export function resolveAreaWorldUpdate(
  context: AreaWorldContext,
  currentStability: number,
  currentPressure: number
) {
  let stability = currentStability
  let pressure = currentPressure
  let contested = false
  let log: AreaRuntimeUpdate['log']

  const weatherPressure = context.weather === 'storm' || context.weather === 'flood' ? 4 : context.weather === 'mist' ? 2 : 0
  pressure += weatherPressure

  if (context.activeWar && (context.activeWar.attackerSectId === context.controllingSectId || context.activeWar.defenderSectId === context.controllingSectId)) {
    pressure += 8
    contested = true
  }

  if (context.joinedSectId && context.controllingSectId === context.joinedSectId) {
    stability += 4
  }

  const hostileRelations = Object.values(context.relations).filter(relation => relation === 'hostile' || relation === 'at_war').length
  pressure += hostileRelations * 2

  const randomDrift = seededWorldRoll(context.totalTicks, context.areaId, 'area-runtime-drift')
  if (randomDrift > 0.93) {
    pressure += 5
  } else if (randomDrift < 0.07) {
    stability += 3
  }

  stability = clamp(stability, 18, 100)
  pressure = clamp(pressure, 0, 100)
  const riskLevel = resolveRiskLevel(stability, pressure)

  const instabilitySpike = riskLevel === 'chaos' && seededWorldRoll(context.totalTicks, context.areaId, 'area-chaos-log') > 0.88
  const watchSpike = riskLevel === 'danger' && seededWorldRoll(context.totalTicks, context.areaId, 'area-danger-log') > 0.91

  if (instabilitySpike) {
    log = {
      type: 'world',
      title: '区域局势恶化',
      description: `${context.areaId}附近灵气紊乱、流寇四起，当地局势已近失控。`,
      impact: '区域风险升至混乱'
    }
  } else if (watchSpike) {
    log = {
      type: 'sect',
      title: '边境压力上升',
      description: `${context.areaId}一带冲突频发，已有宗门开始调动弟子戒备。`,
      impact: '区域风险升至危险'
    }
  }

  return {
    areaId: context.areaId,
    controllingSectId: context.controllingSectId,
    riskLevel,
    stabilityDelta: stability - currentStability,
    pressureDelta: pressure - currentPressure,
    contested,
    lastUpdatedTick: context.totalTicks,
    log
  }
}
