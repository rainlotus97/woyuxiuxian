import type { AreaDefinition } from '@/types/adventure'
import { getAreaById as getAdventureAreaById } from '@/types/adventure'
import type { MapArea } from '@/types/map'
import { getAreaById as getMapAreaById } from '@/types/map'
import { getSectById } from '@/types/sect'
import type { WorldWeather } from '@/types/world'
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
  weather: WorldWeather
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

  const enemyStatMultiplier = Number((riskConfig.enemyMultiplier * weatherConfig.enemyMultiplier * contestedBonus).toFixed(3))
  const rewardMultiplier = Number((riskConfig.rewardMultiplier * weatherConfig.rewardMultiplier * rewardBonus).toFixed(3))

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
    statusText: `${riskConfig.label}${state.contested ? ' · 争夺中' : ''}${controllerSect ? ` · ${controllerSect.name}` : ''}`,
    encounterNote: `${riskConfig.note}${weatherConfig.note}`
  }
}

export function applyEncounterRewardMultiplier(amount: number, multiplier: number) {
  return Math.max(1, Math.floor(amount * multiplier))
}
