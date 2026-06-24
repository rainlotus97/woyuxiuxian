import type { AreaDefinition } from '@/types/adventure'
import { getAreaById as getAdventureAreaById } from '@/types/adventure'
import type { MapArea } from '@/types/map'
import { getAreaById as getMapAreaById } from '@/types/map'
import { getSectById } from '@/types/sect'
import type { WorldAreaAnomaly, WorldWeather } from '@/types/world'
import type { AreaRiskLevel, AreaRuntimeState } from './mapRuntimeTypes'

const MAP_AREA_ADVENTURE_AREA_MAP: Record<string, AreaDefinition['id']> = {
  qingyun_mountain: 'misty_forest',
  azure_valley: 'misty_forest',
  cloud_peak: 'dark_cave',
  flame_city: 'dark_cave',
  thunder_plains: 'barren_desert',
  sky_temple: 'barren_desert',
  hundred_beast_forest: 'frozen_tundra',
  fox_den: 'frozen_tundra',
  dragon_pool: 'lava_volcano',
  phoenix_nest: 'lava_volcano',
  blood_sea: 'abyss_depths',
  shadow_city: 'abyss_depths',
  chaos_abyss: 'abyss_depths',
  jade_palace: 'immortal_ruins',
  star_sea: 'immortal_ruins',
  void_temple: 'immortal_ruins'
}

const AREA_RISK_CONFIG: Record<AreaRiskLevel, {
  label: string
  color: string
  enemyMultiplier: number
  rewardMultiplier: number
  note: string
}> = {
  safe: {
    label: '安稳',
    color: '#4ade80',
    enemyMultiplier: 0.94,
    rewardMultiplier: 0.92,
    note: '局势平稳，妖兽活动偏弱。'
  },
  watch: {
    label: '戒备',
    color: '#7eb8da',
    enemyMultiplier: 1,
    rewardMultiplier: 1,
    note: '区域气氛紧绷，但尚未失控。'
  },
  danger: {
    label: '险地',
    color: '#f59e0b',
    enemyMultiplier: 1.12,
    rewardMultiplier: 1.16,
    note: '边境摩擦频发，强敌与机缘同时增多。'
  },
  chaos: {
    label: '混乱',
    color: '#ef4444',
    enemyMultiplier: 1.26,
    rewardMultiplier: 1.32,
    note: '区域彻底失序，敌人更凶险，回报也更丰厚。'
  }
}

const WEATHER_BATTLE_CONFIG: Record<WorldWeather, {
  enemyMultiplier: number
  rewardMultiplier: number
  note: string
}> = {
  clear: { enemyMultiplier: 1, rewardMultiplier: 1, note: '天象平稳。' },
  rain: { enemyMultiplier: 1.02, rewardMultiplier: 1.03, note: '细雨助长灵气，也让战场更湿滑。' },
  storm: { enemyMultiplier: 1.07, rewardMultiplier: 1.08, note: '雷雨激发凶性，战斗更难预测。' },
  flood: { enemyMultiplier: 1.1, rewardMultiplier: 1.1, note: '洪水扰乱地脉，危险与收益一同上升。' },
  fire: { enemyMultiplier: 1.09, rewardMultiplier: 1.11, note: '火势扩散，狂暴生灵更易现身。' },
  mist: { enemyMultiplier: 1.05, rewardMultiplier: 1.06, note: '迷雾遮蔽视线，埋伏与奇遇都更常见。' }
}

const RISK_NOTE_VARIANTS: Record<AreaRiskLevel, string[]> = {
  safe: [
    '路上风声浅，妖气和人迹都还压得住。',
    '这片地界还算安分，适合先认路。'
  ],
  watch: [
    '表面还稳，但已经有人开始盯这片地方了。',
    '气氛收紧了些，先听风声再深入更稳。'
  ],
  danger: [
    '人和事都开始往这边聚，稍不留神就会撞正面。',
    '边上已经有人试探伸手，机缘和麻烦多半一起到。'
  ],
  chaos: [
    '这片地界已经失序，来的不只是一拨人。',
    '局面彻底乱了，越往里走越像踩进别人没收拾完的旧账里。'
  ]
}

const WEATHER_NOTE_VARIANTS: Record<WorldWeather, string[]> = {
  clear: ['天象还算稳。'],
  rain: ['雨气压着脚下的路。', '地面发潮，很多痕迹都不肯久留。'],
  storm: ['雷雨激得灵气发躁。', '天上压着雷意，很多东西会提前露凶相。'],
  flood: ['水路乱了，退路也会跟着乱。'],
  fire: ['火脉躁得厉害，靠近时最好别只顾着抢。'],
  mist: ['雾里更容易藏人，也更容易撞上埋伏。']
}

function pickVariant<T>(items: T[], seedSource: string) {
  if (items.length <= 1) return items[0]
  const seed = [...seedSource].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return items[seed % items.length]
}

const AREA_RISK_PRIORITY: Record<AreaRiskLevel, number> = {
  safe: 0,
  watch: 1,
  danger: 2,
  chaos: 3
}

export interface MapAreaEncounterContext {
  mapArea: MapArea
  mapAreaId: string
  adventureAreaId: AreaDefinition['id']
  adventureArea: AreaDefinition
  controllerSectId: string | null
  controllerSectName: string | null
  riskLevel: AreaRiskLevel
  riskLabel: string
  riskColor: string
  enemyStatMultiplier: number
  rewardMultiplier: number
  contested: boolean
  statusText: string
  encounterNote: string
  anomaly: WorldAreaAnomaly | null
  anomalyTitle: string | null
  anomalyType: WorldAreaAnomaly['type'] | null
  anomalySeverity: WorldAreaAnomaly['severity'] | null
  anomalyRiskHint: string | null
  accessState: 'open' | 'risky' | 'blocked'
  accessLabel: string
}

export function resolveMapAreaAdventureAreaId(mapAreaId: string) {
  return MAP_AREA_ADVENTURE_AREA_MAP[mapAreaId] ?? 'misty_forest'
}

function resolveFallbackAreaState(mapArea: MapArea): AreaRuntimeState {
  return {
    areaId: mapArea.id,
    controllingSectId: mapArea.controllingSectId ?? mapArea.sects[0] ?? null,
    riskLevel: mapArea.defaultRiskLevel ?? 'watch',
    stability: 50,
    pressure: 20,
    contested: false,
    lastUpdatedTick: 0
  }
}

export function resolveMapAreaEncounter(
  mapAreaId: string,
  areaState: AreaRuntimeState | null,
  weather: WorldWeather,
  anomaly: WorldAreaAnomaly | null = null
): MapAreaEncounterContext | null {
  const mapArea = getMapAreaById(mapAreaId)
  if (!mapArea) return null

  const adventureAreaId = resolveMapAreaAdventureAreaId(mapAreaId)
  const adventureArea = getAdventureAreaById(adventureAreaId)
  if (!adventureArea) return null

  const state = areaState ?? resolveFallbackAreaState(mapArea)
  const riskConfig = AREA_RISK_CONFIG[state.riskLevel]
  const weatherConfig = WEATHER_BATTLE_CONFIG[weather]
  const controllerSect = state.controllingSectId ? getSectById(state.controllingSectId) : null
  const contestedBonus = state.contested ? 1.08 : 1
  const rewardBonus = state.contested ? 1.1 : 1
  const anomalyEnemyBonus = anomaly ? (
    anomaly.type === 'ruins' || anomaly.type === 'spiritual_vein'
      ? 1.04
      : anomaly.type === 'bandit'
        ? 1.08
        : 1.12
  ) : 1
  const anomalyRewardBonus = anomaly ? (
    anomaly.type === 'ruins' || anomaly.type === 'spiritual_vein'
      ? 1.18
      : anomaly.type === 'bandit'
        ? 1.1
        : 1.06
  ) : 1

  const enemyStatMultiplier = Number((riskConfig.enemyMultiplier * weatherConfig.enemyMultiplier * contestedBonus * anomalyEnemyBonus).toFixed(3))
  const rewardMultiplier = Number((riskConfig.rewardMultiplier * weatherConfig.rewardMultiplier * rewardBonus * anomalyRewardBonus).toFixed(3))
  const anomalyNote = anomaly ? `异动：${anomaly.title}。${anomaly.riskHint}` : ''
  const riskNote = pickVariant(RISK_NOTE_VARIANTS[state.riskLevel], mapAreaId)
  const weatherNote = pickVariant(WEATHER_NOTE_VARIANTS[weather], `${mapAreaId}:${weather}`)
  const accessState: MapAreaEncounterContext['accessState'] =
    anomaly && anomaly.severity === 'legendary' && (
      anomaly.type === 'flood' || anomaly.type === 'fire' || anomaly.type === 'beast_tide'
    )
      ? 'blocked'
      : anomaly?.type === 'flood' || anomaly?.type === 'fire'
        ? 'risky'
        : anomaly?.type === 'beast_tide'
          ? 'risky'
          : 'open'
  const accessLabel =
    accessState === 'blocked'
      ? '封锁'
      : accessState === 'risky'
        ? '异动中'
        : '开放'

  return {
    mapArea,
    mapAreaId,
    adventureAreaId,
    adventureArea,
    controllerSectId: state.controllingSectId,
    controllerSectName: controllerSect?.name ?? null,
    riskLevel: state.riskLevel,
    riskLabel: riskConfig.label,
    riskColor: riskConfig.color,
    enemyStatMultiplier,
    rewardMultiplier,
    contested: state.contested,
    statusText: `${riskConfig.label}${state.contested ? ' · 争夺中' : ''}${controllerSect ? ` · ${controllerSect.name}` : ''}${anomaly ? ' · 异动' : ''}`,
    encounterNote: `${riskNote}${weatherNote}${anomalyNote}`,
    anomaly,
    anomalyTitle: anomaly?.title ?? null,
    anomalyType: anomaly?.type ?? null,
    anomalySeverity: anomaly?.severity ?? null,
    anomalyRiskHint: anomaly?.riskHint ?? null,
    accessState,
    accessLabel
  }
}

function compareEncounterPriority(
  current: MapAreaEncounterContext,
  candidate: MapAreaEncounterContext
) {
  const currentScore = AREA_RISK_PRIORITY[current.riskLevel]
    + (current.contested ? 0.5 : 0)
  const candidateScore = AREA_RISK_PRIORITY[candidate.riskLevel]
    + (candidate.contested ? 0.5 : 0)

  if (candidateScore !== currentScore) {
    return candidateScore - currentScore
  }

  const currentControllerScore = current.controllerSectId ? 1 : 0
  const candidateControllerScore = candidate.controllerSectId ? 1 : 0
  if (candidateControllerScore !== currentControllerScore) {
    return candidateControllerScore - currentControllerScore
  }

  return candidate.mapAreaId.localeCompare(current.mapAreaId)
}

export function resolveAdventureAreaEncounter(
  adventureAreaId: AreaDefinition['id'],
  areaStates: Record<string, AreaRuntimeState>,
  weather: WorldWeather,
  areaAnomalies: WorldAreaAnomaly[] = []
) {
  let activeEncounter: MapAreaEncounterContext | null = null

  for (const [mapAreaId, state] of Object.entries(areaStates)) {
    const anomaly = areaAnomalies.find(item => item.areaId === mapAreaId) ?? null
    const encounter = resolveMapAreaEncounter(mapAreaId, state, weather, anomaly)
    if (!encounter || encounter.adventureAreaId !== adventureAreaId) continue
    if (!activeEncounter || compareEncounterPriority(activeEncounter, encounter) > 0) {
      activeEncounter = encounter
    }
  }

  return activeEncounter
}

export function applyEncounterRewardMultiplier(amount: number, multiplier: number) {
  return Math.max(1, Math.floor(amount * multiplier))
}
