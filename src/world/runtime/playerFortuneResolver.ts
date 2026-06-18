import type { IdleMode, PlayerJourneyEntry, WorldClock, WorldWeather } from '@/types/world'
import { getAreaById } from '@/types/map'
import { seededWorldRoll } from './worldSeed'

export type PlayerFortuneType = 'insight' | 'hidden_cache' | 'spirit_herb' | 'strange_rumor'

export interface PlayerFortuneInput {
  clock: WorldClock
  idleMode: IdleMode
  weather: WorldWeather
  stamina: number
  areaId: string | null
  sectName: string | null
  npcCount: number
}

export interface PlayerFortuneItem {
  id: string
  definitionId?: string
  name: string
  icon: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  quantity: number
  description?: string
}

export interface PlayerFortuneResolution {
  success: true
  type: PlayerFortuneType
  severity: PlayerJourneyEntry['severity']
  title: string
  text: string
  staminaCost: number
  cultivationGain: number
  goldGain: number
  item: PlayerFortuneItem | null
  areaId?: string
  tags: string[]
  rewards: PlayerJourneyEntry['rewards']
}

export interface PlayerFortuneBlocked {
  success: false
  reason: string
  staminaCost: number
}

export type PlayerFortuneResult = PlayerFortuneResolution | PlayerFortuneBlocked

const BASE_STAMINA_COST = 8

function pickFortuneType(input: PlayerFortuneInput): PlayerFortuneType {
  const roll = seededWorldRoll(input.clock.totalTicks, `player-fortune-${input.idleMode}-${input.weather}`)
  if (input.idleMode === 'gatherHerbs' || roll > 0.78) return 'spirit_herb'
  if (input.idleMode === 'adventure' || roll > 0.52) return 'hidden_cache'
  if (input.npcCount > 0 && roll > 0.32) return 'strange_rumor'
  return 'insight'
}

function createFortuneItem(input: PlayerFortuneInput, type: PlayerFortuneType): PlayerFortuneItem | null {
  if (type !== 'spirit_herb') return null
  const quantity = 1 + Math.floor(seededWorldRoll(input.clock.totalTicks, 'player-fortune-herb-count') * 3)
  return {
    id: `fortune_herb_${input.clock.totalTicks}_${Math.floor(seededWorldRoll(input.clock.totalTicks, 'player-fortune-herb-id') * 10000)}`,
    definitionId: 'herb_spirit_grass',
    name: '灵草',
    icon: '草',
    type: 'material',
    quality: 'common',
    quantity,
    description: '机缘中采得的灵草，可用于宗门炼丹与材料任务。'
  }
}

function createFortuneText(input: PlayerFortuneInput, type: PlayerFortuneType, cultivationGain: number, goldGain: number, item: PlayerFortuneItem | null) {
  const place = input.areaId ? getAreaById(input.areaId)?.name ?? input.areaId : input.sectName ?? '山野之间'
  if (type === 'insight') {
    return {
      title: '一念通明',
      text: `你在${place}静坐片刻，忽然想通一处气机关窍，修为增长 ${cultivationGain}。`
    }
  }
  if (type === 'hidden_cache') {
    return {
      title: '残龛暗藏',
      text: `你在${place}发现一座半埋石龛，清点后得灵石 ${goldGain}、修为感悟 ${cultivationGain}。`
    }
  }
  if (type === 'spirit_herb') {
    return {
      title: '灵草微光',
      text: `你循着草木灵光，在${place}采得${item ? `${item.name} x${item.quantity}` : '几株灵草'}。`
    }
  }
  return {
    title: '异闻入耳',
    text: `你在${place}听到一则人物异闻，虽然真假未明，却让你对局势多了几分判断。`
  }
}

export function resolvePlayerFortune(input: PlayerFortuneInput): PlayerFortuneResult {
  const weatherCost = input.weather === 'storm' || input.weather === 'flood' || input.weather === 'fire' ? 4 : 0
  const staminaCost = BASE_STAMINA_COST + weatherCost
  if (input.stamina < staminaCost) {
    return {
      success: false,
      reason: `体力不足，需要 ${staminaCost} 点体力处理机缘。`,
      staminaCost
    }
  }

  const type = pickFortuneType(input)
  const cultivationGain = type === 'spirit_herb'
    ? 0
    : 10 + Math.floor(seededWorldRoll(input.clock.totalTicks, `player-fortune-cultivation-${type}`) * 28)
  const goldGain = type === 'hidden_cache'
    ? 12 + Math.floor(seededWorldRoll(input.clock.totalTicks, 'player-fortune-gold') * 36)
    : 0
  const item = createFortuneItem(input, type)
  const content = createFortuneText(input, type, cultivationGain, goldGain, item)
  const rewards: PlayerJourneyEntry['rewards'] = []
  if (cultivationGain > 0) rewards.push({ type: 'cultivation', label: '修为', value: cultivationGain })
  if (goldGain > 0) rewards.push({ type: 'gold', label: '灵石', value: goldGain })
  if (item) rewards.push({ type: 'item', label: item.name, value: item.quantity })
  if (type === 'strange_rumor') rewards.push({ type: 'flag', label: '异闻线索', value: '人物动向' })

  return {
    success: true,
    type,
    severity: type === 'hidden_cache' || type === 'insight' ? 'major' : 'normal',
    title: content.title,
    text: content.text,
    staminaCost,
    cultivationGain,
    goldGain,
    item,
    areaId: input.areaId ?? undefined,
    tags: ['fortune', type],
    rewards
  }
}
