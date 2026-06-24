import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'
import type { MapAreaActionOption, MapAreaActionResult } from './mapAreaActionResolver'

export interface MapAreaActionJourneyInput {
  result: Pick<MapAreaActionResult, 'kind' | 'title' | 'text' | 'severity' | 'stabilityDelta' | 'pressureDelta' | 'tags'>
  option: Pick<MapAreaActionOption, 'label' | 'staminaCost'>
}

export interface MapAreaActionJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveMapAreaActionJourney(input: MapAreaActionJourneyInput): MapAreaActionJourneyResult {
  const stabilityLabel = input.result.stabilityDelta >= 0
    ? `+${input.result.stabilityDelta}`
    : String(input.result.stabilityDelta)
  const pressureLabel = input.result.pressureDelta <= 0
    ? String(input.result.pressureDelta)
    : `+${input.result.pressureDelta}`

  return {
    severity: input.result.severity,
    title: input.result.title,
    text: `${input.result.text}你消耗 ${input.option.staminaCost} 点体力完成${input.option.label}，区域稳定 ${stabilityLabel}，压力 ${pressureLabel}。`,
    rewards: [
      { type: 'flag', label: '稳定', value: stabilityLabel },
      { type: 'flag', label: '压力', value: pressureLabel }
    ],
    tags: [
      'map',
      'area-action',
      input.result.kind,
      ...input.result.tags.filter(tag => tag !== 'map' && tag !== 'area-action' && tag !== input.result.kind)
    ]
  }
}
