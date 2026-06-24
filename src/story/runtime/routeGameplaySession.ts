/**
 * 路线游戏会话 — 存根实现
 */
export interface GameplaySession {
  id: string
  areaId: string
}

export function getRouteGameplaySession(routeKey?: string): GameplaySession | null {
  return null
}

export function completeRouteGameplaySession(sessionId: string): boolean {
  return true
}

export function consumeResolvedRouteGameplaySession(): GameplaySession | null {
  return null
}
