import type { MapArea } from '@/types/map'
import type {
  IdleMode,
  NpcStoryRecord,
  PlayerJourneyEntry,
  WorldAreaAnomaly,
  WorldClock,
  WorldLogSeverity,
  WorldWeather
} from '@/types/world'
import { formatWorldTime } from '@/types/world'
import type { AreaRuntimeState } from '@/map/runtime/mapRuntimeTypes'
import { seededWorldRoll } from './worldSeed'

type NarrativeAnomalyType = WorldAreaAnomaly['type']

export interface WorldDisasterTrigger {
  areaId: string
  type: NarrativeAnomalyType
  severity: WorldLogSeverity
  riskHint: string
  stabilityDelta: number
  pressureDelta: number
  untilTick: number | null
}

function buildNarrativeId(prefix: string, clock: WorldClock, suffix: string) {
  return `${prefix}_${clock.totalTicks}_${suffix}`
}

export function createPlayerJourney(
  clock: WorldClock,
  mode: IdleMode,
  input: Omit<PlayerJourneyEntry, 'id' | 'tick' | 'timeLabel' | 'mode'>
): PlayerJourneyEntry {
  return {
    id: buildNarrativeId('journey', clock, Math.random().toString(36).slice(2, 7)),
    tick: clock.totalTicks,
    timeLabel: formatWorldTime(clock),
    mode,
    ...input
  }
}

export function createNpcStoryRecord(
  clock: WorldClock,
  npcId: string,
  input: Omit<NpcStoryRecord, 'id' | 'tick' | 'timeLabel' | 'npcId'>
): NpcStoryRecord {
  return {
    id: buildNarrativeId('npc_story', clock, npcId),
    tick: clock.totalTicks,
    timeLabel: formatWorldTime(clock),
    npcId,
    ...input
  }
}

function buildAreaAnomalyCopy(area: MapArea, trigger: WorldDisasterTrigger) {
  const templates: Record<NarrativeAnomalyType, { title: string; text: string }> = {
    flood: {
      title: `${area.name}水患暴涨`,
      text: `${area.name}地脉受暴雨牵动，洪流冲垮了几处山道，当地修士正在抢修灵脉节点。`
    },
    fire: {
      title: `${area.name}爆发火势`,
      text: `${area.name}突起灵火，疑似修士斗法殃及坊市，周边势力已开始戒严。`
    },
    beast_tide: {
      title: `${area.name}妖潮外溢`,
      text: `${area.name}外围妖兽躁动成潮，附近村镇与宗门据点都在紧急调兵。`
    },
    ruins: {
      title: `${area.name}遗迹显形`,
      text: `${area.name}雾障松动，一处古修遗迹短暂显形，闻风而来的修士正蜂拥而至。`
    },
    spiritual_vein: {
      title: `${area.name}灵脉喷涌`,
      text: `${area.name}地下灵脉忽然活跃，灵气如潮外泄，既是机缘，也是新的争夺焦点。`
    },
    bandit: {
      title: `${area.name}匪修盘踞`,
      text: `${area.name}出现一股匪修势力趁乱盘踞，过路散修与商队接连失踪。`
    }
  }
  return templates[trigger.type]
}

export function createAreaAnomaly(
  clock: WorldClock,
  area: MapArea,
  trigger: WorldDisasterTrigger
): WorldAreaAnomaly {
  const copy = buildAreaAnomalyCopy(area, trigger)
  return {
    id: buildNarrativeId('anomaly', clock, area.id),
    tick: clock.totalTicks,
    timeLabel: formatWorldTime(clock),
    areaId: area.id,
    realm: area.realm,
    type: trigger.type,
    severity: trigger.severity,
    title: copy.title,
    text: copy.text,
    riskHint: trigger.riskHint,
    stabilityDelta: trigger.stabilityDelta,
    pressureDelta: trigger.pressureDelta,
    untilTick: trigger.untilTick
  }
}

export function resolveWorldDisasterTrigger(input: {
  clock: WorldClock
  weather: WorldWeather
  areaStates: Record<string, AreaRuntimeState>
}): WorldDisasterTrigger | null {
  const candidates = Object.values(input.areaStates)
    .filter(state => state.riskLevel === 'danger' || state.riskLevel === 'chaos' || input.weather === 'fire' || input.weather === 'flood')

  if (!candidates.length) return null

  const threshold = input.weather === 'fire' || input.weather === 'flood'
    ? 0.968
    : input.weather === 'storm'
      ? 0.978
      : 0.988

  const roll = seededWorldRoll(input.clock.totalTicks, input.weather, 'world-disaster-trigger')
  if (roll <= threshold) return null

  const candidateIndex = Math.floor(
    seededWorldRoll(input.clock.totalTicks, input.weather, 'world-disaster-area') * candidates.length
  )
  const candidate = candidates[candidateIndex] ?? candidates[0]
  if (!candidate) return null

  let type: NarrativeAnomalyType = 'bandit'
  if (input.weather === 'flood') type = 'flood'
  else if (input.weather === 'fire') type = 'fire'
  else if (candidate.riskLevel === 'chaos' && seededWorldRoll(input.clock.totalTicks, candidate.areaId, 'world-beast-tide') > 0.52) type = 'beast_tide'
  else if (seededWorldRoll(input.clock.totalTicks, candidate.areaId, 'world-spiritual-vein') > 0.7) type = 'spiritual_vein'
  else if (seededWorldRoll(input.clock.totalTicks, candidate.areaId, 'world-ruins') > 0.45) type = 'ruins'

  const config: Record<NarrativeAnomalyType, Omit<WorldDisasterTrigger, 'areaId' | 'type'>> = {
    flood: {
      severity: 'major',
      riskHint: '山洪冲毁道路，区域稳定度下降。',
      stabilityDelta: -8,
      pressureDelta: 9,
      untilTick: input.clock.totalTicks + 6
    },
    fire: {
      severity: 'major',
      riskHint: '灵火蔓延，争斗与救援同时加剧。',
      stabilityDelta: -7,
      pressureDelta: 10,
      untilTick: input.clock.totalTicks + 5
    },
    beast_tide: {
      severity: 'major',
      riskHint: '妖潮外溢，区域风险短时走高。',
      stabilityDelta: -6,
      pressureDelta: 8,
      untilTick: input.clock.totalTicks + 5
    },
    ruins: {
      severity: 'legendary',
      riskHint: '遗迹现世，争夺机缘将引来更多强敌。',
      stabilityDelta: -2,
      pressureDelta: 7,
      untilTick: input.clock.totalTicks + 8
    },
    spiritual_vein: {
      severity: 'legendary',
      riskHint: '灵脉喷涌，修炼收益提高，但也更易引发争斗。',
      stabilityDelta: 1,
      pressureDelta: 6,
      untilTick: input.clock.totalTicks + 8
    },
    bandit: {
      severity: 'normal',
      riskHint: '匪修活跃，商旅受阻。',
      stabilityDelta: -4,
      pressureDelta: 6,
      untilTick: input.clock.totalTicks + 4
    }
  }

  return {
    areaId: candidate.areaId,
    type,
    ...config[type]
  }
}
