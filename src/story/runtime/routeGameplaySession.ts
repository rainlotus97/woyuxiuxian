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

export type GameplaySession = RouteGameplaySession

export interface RouteGameplaySessionInput {
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
    context: trigger.context ? { ...trigger.context } : undefined,
    outcomeNodeIds: trigger.outcomeNodeIds ? { ...trigger.outcomeNodeIds } : undefined,
    completionCondition: trigger.completionCondition?.map(condition => ({ ...condition }))
  }
}

function cloneResult(result: GameplayResult | null): GameplayResult | null {
  if (!result) return null
  return {
    ...result,
    data: result.data ? { ...result.data } : undefined,
    effects: result.effects?.map(effect => ({ ...effect }))
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

  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('[routeGameplaySession] Failed to persist session:', error)
  }
}

function readSession(): RouteGameplaySession | null {
  if (memorySession) return cloneSession(memorySession)
  if (!canUseStorage()) return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RouteGameplaySession
    if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    memorySession = parsed
    return cloneSession(parsed)
  } catch (error) {
    console.error('[routeGameplaySession] Failed to read session:', error)
    localStorage.removeItem(STORAGE_KEY)
    memorySession = null
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
  return cloneSession(session) as RouteGameplaySession
}

export function getRouteGameplaySession(sessionId?: string): RouteGameplaySession | null {
  const session = readSession()
  if (!session || session.status !== 'pending' || (sessionId && session.id !== sessionId)) return null
  return session
}

export function completeRouteGameplaySession(
  sessionId: string,
  result: GameplayResult
): RouteGameplaySession | null {
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

export function clearRouteGameplaySession(sessionId?: string): void {
  const session = readSession()
  if (!session || (sessionId && session.id !== sessionId)) return
  writeSession(null)
}

export function consumeResolvedRouteGameplaySession(sessionId?: string): RouteGameplaySession | null {
  const session = readSession()
  if (!session || session.status !== 'resolved' || (sessionId && session.id !== sessionId)) return null
  writeSession(null)
  return cloneSession(session)
}

export function hasRouteGameplaySession(sessionId?: string): boolean {
  const session = readSession()
  return Boolean(session && (!sessionId || session.id === sessionId))
}
