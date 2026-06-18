import type { DropItem, AreaDefinition } from '@/types/adventure'
import type { AreaGameplayAccess } from './mapAreaAccessResolver'
import type { MapAreaEncounterContext } from './mapAreaEncounterResolver'
import { mergeEncounterDrops, type EncounterDropStack } from '@/character/runtime/inventoryDropResolver'

export interface AdventureSweepInput {
  area: Pick<AreaDefinition, 'id' | 'name' | 'expReward' | 'goldReward' | 'drops'>
  access: Pick<AreaGameplayAccess, 'sweepAllowed' | 'sweepCost' | 'entryReason'>
  encounter: Pick<MapAreaEncounterContext, 'rewardMultiplier' | 'riskLevel' | 'statusText'> | null
  sweepCount?: number
  rollReward: (range: { min: number; max: number }) => number
  resolveDrops: (drops: DropItem[], encounter: MapAreaEncounterContext | null) => EncounterDropStack[]
}

export interface AdventureSweepBlocked {
  success: false
  reason: string
  staminaCost: number
}

export interface AdventureSweepResolution {
  success: true
  areaId: string
  areaName: string
  sweepCount: number
  staminaCost: number
  cultivationGain: number
  goldGain: number
  drops: EncounterDropStack[]
  rewardMultiplier: number
  riskLabel: string
  taskProgress: Array<{ type: 'battle' | 'explore'; target: string; times: number }>
  summary: string
}

export type AdventureSweepResult = AdventureSweepBlocked | AdventureSweepResolution

export function resolveAdventureSweep(input: AdventureSweepInput): AdventureSweepResult {
  const sweepCount = Math.max(1, Math.floor(input.sweepCount ?? 3))
  const staminaCost = input.access.sweepCost
  if (!input.access.sweepAllowed) {
    return {
      success: false,
      reason: input.access.entryReason,
      staminaCost
    }
  }

  const rewardMultiplier = input.encounter?.rewardMultiplier ?? 1
  let cultivationGain = 0
  let goldGain = 0
  const drops: EncounterDropStack[] = []

  for (let index = 0; index < sweepCount; index++) {
    cultivationGain += Math.max(1, Math.floor(input.rollReward(input.area.expReward) * rewardMultiplier))
    goldGain += Math.max(1, Math.floor(input.rollReward(input.area.goldReward) * rewardMultiplier))
    drops.push(...input.resolveDrops(input.area.drops, input.encounter as MapAreaEncounterContext | null))
  }

  const mergedDrops = mergeEncounterDrops(drops)
  const riskLabel = input.encounter?.statusText ?? '界路平稳'

  return {
    success: true,
    areaId: input.area.id,
    areaName: input.area.name,
    sweepCount,
    staminaCost,
    cultivationGain,
    goldGain,
    drops: mergedDrops,
    rewardMultiplier,
    riskLabel,
    taskProgress: [
      { type: 'battle', target: 'monster', times: sweepCount },
      { type: 'explore', target: input.area.id, times: sweepCount }
    ],
    summary: `${input.area.name}扫荡 ${sweepCount} 次，获得 ${cultivationGain} 修为、${goldGain} 灵石。`
  }
}
