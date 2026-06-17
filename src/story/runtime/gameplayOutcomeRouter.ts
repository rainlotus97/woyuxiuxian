import type { GameplayResult, GameplayTrigger } from '../types'

export type GameplayOutcomeKey = 'victory' | 'defeat' | 'fled' | 'success' | 'failure'

export interface GameplayOutcomeRouteMap {
  victory?: string
  defeat?: string
  fled?: string
  success?: string
  failure?: string
}

function asOutcomeKey(value: unknown): GameplayOutcomeKey | null {
  if (value === 'victory' || value === 'defeat' || value === 'fled' || value === 'success' || value === 'failure') {
    return value
  }
  return null
}

export function extractGameplayOutcomeRoutes(trigger: GameplayTrigger): GameplayOutcomeRouteMap {
  const params = trigger.params || {}
  const routes: GameplayOutcomeRouteMap = {}

  const candidates: Array<[GameplayOutcomeKey, unknown]> = [
    ['victory', params.onVictoryNodeId],
    ['defeat', params.onDefeatNodeId],
    ['fled', params.onFledNodeId],
    ['success', params.onSuccessNodeId],
    ['failure', params.onFailureNodeId]
  ]

  for (const [key, value] of candidates) {
    if (typeof value === 'string' && value.trim()) {
      routes[key] = value.trim()
    }
  }

  return routes
}

export function resolveGameplayOutcomeKey(result: GameplayResult): GameplayOutcomeKey {
  const battleResult = asOutcomeKey(result.data?.battleResult)
  if (battleResult) return battleResult
  return result.success ? 'success' : 'failure'
}

export function resolveGameplayContinueNode(trigger: GameplayTrigger, result: GameplayResult): string | null {
  const outcomeKey = resolveGameplayOutcomeKey(result)
  const outcomeRoutes = extractGameplayOutcomeRoutes(trigger)
  const matchedRoute = outcomeRoutes[outcomeKey]

  if (matchedRoute) return matchedRoute
  if (!result.success && trigger.failureNodeId) return trigger.failureNodeId
  return trigger.continueNodeId || null
}
