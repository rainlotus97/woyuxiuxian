import { REALM_CULTIVATION_PER_SECOND, REALM_ORDER, type Realm } from '@/types/unit'
import type { WorldLogSeverity, WorldWeather } from '@/types/world'
import { seededWorldRoll } from './worldSeed'

export interface PlayerCaptivityContext {
  currentTick: number
  sinceTick: number | null
  captorName: string
  realm: Realm
  realmLevel: number
  weather: WorldWeather
  sectReputation: number
}

export interface PlayerCaptivityForecast {
  chance: number
  label: string
  hint: string
}

export interface PlayerCaptivityNarrative {
  severity: WorldLogSeverity
  title: string
  text: string
  tags: string[]
}

export interface PlayerCaptivityTickResult {
  cultivationGain: number
  narrative: PlayerCaptivityNarrative | null
}

export interface PlayerCaptivityEscapeResult {
  success: boolean
  chance: number
  cultivationGain: number
  narrative: PlayerCaptivityNarrative
}

function clampChance(value: number) {
  return Math.max(0.12, Math.min(0.82, value))
}

export function getPlayerCaptivityForecast(context: PlayerCaptivityContext): PlayerCaptivityForecast {
  const realmIndex = Math.max(0, REALM_ORDER.indexOf(context.realm))
  const durationTicks = context.sinceTick === null ? 0 : Math.max(0, context.currentTick - context.sinceTick)
  const weatherBonus = context.weather === 'mist'
    ? 0.09
    : context.weather === 'storm'
      ? 0.07
      : context.weather === 'rain'
        ? 0.03
        : 0
  const durationBonus = Math.min(0.14, durationTicks * 0.008)
  const reputationBonus = Math.min(0.12, context.sectReputation / 2600)
  const chance = clampChance(
    0.16
      + realmIndex * 0.038
      + Math.max(0, context.realmLevel - 1) * 0.018
      + weatherBonus
      + durationBonus
      + reputationBonus
  )

  const percent = Math.round(chance * 100)
  const hint = context.weather === 'mist' || context.weather === 'storm'
    ? `天象扰乱守备，当前脱困较有机会。预计成功率 ${percent}%。`
    : `时机仍在酝酿，可继续囚中调息、观察守备。预计成功率 ${percent}%。`

  return {
    chance,
    label: `脱困机率 ${percent}%`,
    hint
  }
}

export function resolvePlayerCaptivityTick(context: PlayerCaptivityContext): PlayerCaptivityTickResult {
  const forecast = getPlayerCaptivityForecast(context)
  const baseGain = REALM_CULTIVATION_PER_SECOND[context.realm]
  const cultivationGain = Math.max(
    1,
    Math.floor(
      baseGain * (
        context.weather === 'mist' || context.weather === 'storm'
          ? 18
          : 12
      )
    )
  )

  const observationRoll = seededWorldRoll(context.currentTick, context.realm, context.realmLevel, 'captivity-observation')
  if (observationRoll <= 0.76) {
    return {
      cultivationGain,
      narrative: null
    }
  }

  const narrative = context.weather === 'mist' || context.weather === 'storm'
    ? {
        severity: 'major' as const,
        title: '囚中窥隙',
        text: `${context.captorName}的守备在${context.weather === 'mist' ? '雾气' : '风雷'}中出现了短暂空档，你借机记下了几处薄弱点。`,
        tags: ['captivity', 'observation', 'escape-window']
      }
    : {
        severity: forecast.chance >= 0.42 ? 'normal' as const : 'minor' as const,
        title: '囚中调息',
        text: `你在囚室中默运心法，借着零碎灵气稳住道基，也逐渐摸清了${context.captorName}的换防节奏。`,
        tags: ['captivity', 'focus']
      }

  return {
    cultivationGain,
    narrative
  }
}

export function resolvePlayerCaptivityEscape(context: PlayerCaptivityContext): PlayerCaptivityEscapeResult {
  const forecast = getPlayerCaptivityForecast(context)
  const success = Math.random() < forecast.chance
  const baseGain = REALM_CULTIVATION_PER_SECOND[context.realm]

  if (success) {
    return {
      success: true,
      chance: forecast.chance,
      cultivationGain: Math.max(6, Math.floor(baseGain * 10)),
      narrative: {
        severity: 'legendary',
        title: '脱困而出',
        text: context.weather === 'mist' || context.weather === 'storm'
          ? `你借着${context.weather === 'mist' ? '浓雾' : '雷雨'}遮掩脱离囚地，终于摆脱了${context.captorName}的控制。`
          : `你抓住换防的破绽强行脱身，惊险地甩开了${context.captorName}的追索。`,
        tags: ['captivity', 'escape', 'success']
      }
    }
  }

  return {
    success: false,
    chance: forecast.chance,
    cultivationGain: Math.max(2, Math.floor(baseGain * 4)),
    narrative: {
      severity: 'normal',
      title: '脱困受阻',
      text: `你试探性地寻找出路，却发现${context.captorName}的禁制比预想更严。所幸心神未乱，反而在压迫下稳固了气机。`,
      tags: ['captivity', 'escape', 'failed']
    }
  }
}
