import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'
import type { AdventureSweepResolution } from './adventureSweepResolver'

export interface AdventureSweepJourneyInput {
  result: Pick<
    AdventureSweepResolution,
    'areaId' | 'areaName' | 'sweepCount' | 'staminaCost' | 'cultivationGain' | 'goldGain' | 'drops' | 'rewardMultiplier' | 'riskLabel'
  >
}

export interface AdventureSweepJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  areaId: string
  tags: string[]
}

export function resolveAdventureSweepJourney(input: AdventureSweepJourneyInput): AdventureSweepJourneyResult {
  const { result } = input
  const dropText = result.drops.length > 0
    ? `，并带回${result.drops.slice(0, 3).map(drop => `${drop.item.name}x${drop.quantity}`).join('、')}${result.drops.length > 3 ? '等物' : ''}`
    : ''
  const multiplierText = result.rewardMultiplier > 1
    ? `当前区域态势让收益提升至 ${result.rewardMultiplier.toFixed(2)} 倍。`
    : ''

  return {
    severity: result.rewardMultiplier > 1.15 || result.sweepCount >= 3 ? 'major' : 'normal',
    title: `${result.areaName}扫荡`,
    text: `你在${result.areaName}完成 ${result.sweepCount} 次扫荡，消耗 ${result.staminaCost} 点体力，获得修为与灵石。${result.riskLabel}${dropText}。${multiplierText}`,
    rewards: buildSweepJourneyRewards(result),
    areaId: result.areaId,
    tags: ['adventure', 'sweep', 'map']
  }
}

function buildSweepJourneyRewards(result: AdventureSweepJourneyInput['result']): PlayerJourneyEntry['rewards'] {
  const rewards: PlayerJourneyEntry['rewards'] = []
  if (result.cultivationGain > 0) {
    rewards.push({ type: 'cultivation', label: '修为', value: result.cultivationGain })
  }
  if (result.goldGain > 0) {
    rewards.push({ type: 'gold', label: '灵石', value: result.goldGain })
  }
  for (const drop of result.drops) {
    rewards.push({ type: 'item', label: drop.item.name, value: drop.quantity })
  }
  return rewards
}
