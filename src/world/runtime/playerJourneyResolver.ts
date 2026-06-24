import type {
  IdleMode,
  PlayerJourneyEntry,
  WorldAreaAnomaly,
  WorldClock,
  WorldWeather
} from '@/types/world'
import { formatWorldTime } from '@/types/world'
import { getAreaById } from '@/types/map'
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
