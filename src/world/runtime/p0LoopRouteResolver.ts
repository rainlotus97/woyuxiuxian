import type { MainLoopReadinessKey } from './mainLoopReadinessResolver'

export type P0LoopRouteTarget =
  | string
  | {
      path: string
      query?: Record<string, string>
    }

export interface P0LoopRouteInput {
  id: MainLoopReadinessKey
  hotspotAreaId?: string | null
}

export function resolveP0LoopRouteTarget(input: P0LoopRouteInput): P0LoopRouteTarget {
  if (input.id === 'adventure') return '/game/adventure'
  if (input.id === 'story') return '/game/story'
  if (input.id === 'npc') return '/game/companion'
  if (input.id === 'sect') return '/game/sect'
  if (input.id === 'map') {
    return input.hotspotAreaId
      ? { path: '/game/map', query: { areaId: input.hotspotAreaId } }
      : '/game/map'
  }
  return '/game/cultivation'
}
