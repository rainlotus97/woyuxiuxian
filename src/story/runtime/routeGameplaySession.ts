import type { GameplayResult, GameplayTrigger, GameplayType } from '../types'

const STORAGE_KEY = 'woyu-xiuxian-route-gameplay-session'

export type RouteGameplayStatus = 'pending' | 'resolved'

export interface RouteGameplaySession {
  id: string
  gameplayType: GameplayType
  trigger: GameplayTrigger
  previousNodeId: string
  returnPath: string
  status: RouteGameplayStatus
  result: GameplayResult | null
  createdAt: number
  updatedAt: number
}

interface RouteGameplaySessionInput {
  gameplayType: GameplayType
  trigger: GameplayTrigger
  previousNodeId: string
  returnPath: string
}

let memorySession: RouteGameplaySession | null = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function cloneTrigger(trigger: GameplayTrigger): GameplayTrigger {
  return {
    ...trigger,
    params: trigger.params ? { ...trigger.params } : undefined,
    completionCondition: trigger.completionCondition ? [...trigger.completionCondition] : undefined
  }
}

function cloneResult(result: GameplayResult | null): GameplayResult | null {
  if (!result) return null
  return {
    ...result,
    data: result.data ? { ...result.data } : undefined
  }
}

function cloneSession(session: RouteGameplaySession | null): RouteGameplaySession | null {
  if (!session) return null
  return {
    ...session,
    trigger: cloneTrigger(session.trigger),
    result: cloneResult(session.result)
  }
}

function writeSession(session: RouteGameplaySession | null) {
  memorySession = cloneSession(session)
  if (!canUseStorage()) return
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function readSession(): RouteGameplaySession | null {
  if (memorySession) return cloneSession(memorySession)
  if (!canUseStorage()) return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as RouteGameplaySession
    memorySession = parsed
    return cloneSession(parsed)
  } catch (error) {
    console.error('[routeGameplaySession] Failed to parse session:', error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function createRouteGameplaySession(input: RouteGameplaySessionInput): RouteGameplaySession {
  const now = Date.now()
  const session: RouteGameplaySession = {
    id: `route-gameplay-${now}-${Math.random().toString(36).slice(2, 8)}`,
    gameplayType: input.gameplayType,
    trigger: cloneTrigger(input.trigger),
    previousNodeId: input.previousNodeId,
    returnPath: input.returnPath,
    status: 'pending',
    result: null,
    createdAt: now,
    updatedAt: now
  }
  writeSession(session)
  return cloneSession(session)!
}

export function getRouteGameplaySession(): RouteGameplaySession | null {
  return readSession()
}

export function completeRouteGameplaySession(sessionId: string, result: GameplayResult): RouteGameplaySession | null {
  const session = readSession()
  if (!session || session.id !== sessionId) return null

  const resolvedSession: RouteGameplaySession = {
    ...session,
    status: 'resolved',
    result: cloneResult(result),
    updatedAt: Date.now()
  }
  writeSession(resolvedSession)
  return cloneSession(resolvedSession)
}

export function clearRouteGameplaySession(sessionId?: string) {
  const session = readSession()
  if (!session) return
  if (sessionId && session.id !== sessionId) return
  writeSession(null)
}

export function consumeResolvedRouteGameplaySession(sessionId?: string): RouteGameplaySession | null {
  const session = readSession()
  if (!session || session.status !== 'resolved') return null
  if (sessionId && session.id !== sessionId) return null
  writeSession(null)
  return cloneSession(session)
}

export function hasRouteGameplaySession(sessionId?: string): boolean {
  const session = readSession()
  if (!session) return false
  if (sessionId && session.id !== sessionId) return false
  return true
}
