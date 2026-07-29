import type { BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'

type Handler<T> = (payload: T) => void

interface ScopedBattleEvent {
  battleInstanceId: string
}

export interface BattleRenderCommand {
  type: 'attack' | 'skill'
  actorId: string
  targetIds: string[]
  skillId?: string
}

export interface BattleRenderHit {
  actorId: string
  targetId: string
  amount: number
  isCrit: boolean
  isHeal?: boolean
}

export interface BattleRenderEnded {
  battleInstanceId: string
  result: 'victory' | 'defeat' | 'fled'
}

export interface BattleRenderReady extends ScopedBattleEvent {
  sceneKey: string
}

export interface BattleArenaThemeChanged extends ScopedBattleEvent {
  arenaId: string
}

export interface BattleRenderSnapshotChanged extends ScopedBattleEvent {
  snapshot: BattleRuntimeSnapshot
}

export interface BattleRenderCommandRequested extends ScopedBattleEvent {
  command: BattleRenderCommand
}

export interface BattleRenderDamageNumberRequested extends ScopedBattleEvent {
  hit: BattleRenderHit
}

export interface BattleRenderHitResolved extends ScopedBattleEvent {
  hit: BattleRenderHit
}

export interface GameEvents {
  'battle:scene-ready': BattleRenderReady
  'battle:arena-theme': BattleArenaThemeChanged
  'battle:snapshot': BattleRenderSnapshotChanged
  'battle:play-command': BattleRenderCommandRequested
  'battle:damage-number': BattleRenderDamageNumberRequested
  'battle:hit': BattleRenderHitResolved
  'battle:ended': BattleRenderEnded
  'asset:preload-progress': { loaded: number; total: number }
}

class GameEventBus {
  private listeners = new Map<keyof GameEvents, Set<Handler<unknown>>>()

  on<K extends keyof GameEvents>(type: K, handler: Handler<GameEvents[K]>): () => void {
    const set = this.listeners.get(type) ?? new Set<Handler<unknown>>()
    set.add(handler as Handler<unknown>)
    this.listeners.set(type, set)
    return () => set.delete(handler as Handler<unknown>)
  }

  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
    const set = this.listeners.get(type)
    if (!set) return
    for (const handler of set) {
      handler(payload)
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const gameEvents = new GameEventBus()

let activeBattleInstanceId: string | null = null
let readyBattleInstanceId: string | null = null
let battleInstanceSequence = 0

export function createBattleInstanceId() {
  battleInstanceSequence += 1
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `battle-${battleInstanceSequence}-${crypto.randomUUID()}`
  }
  return `battle-${Date.now()}-${battleInstanceSequence}-${Math.random().toString(36).slice(2, 10)}`
}

export function setActiveBattleInstanceId(battleInstanceId: string | null) {
  if (activeBattleInstanceId !== battleInstanceId) {
    readyBattleInstanceId = null
  }
  activeBattleInstanceId = battleInstanceId
}

export function getActiveBattleInstanceId() {
  return activeBattleInstanceId
}

export function markBattleRendererReady(battleInstanceId: string | null) {
  readyBattleInstanceId = battleInstanceId
}

export function clearBattleRendererReady(battleInstanceId: string | null) {
  if (readyBattleInstanceId === battleInstanceId) {
    readyBattleInstanceId = null
  }
}

export function isActiveBattleInstance(battleInstanceId: string | null) {
  return Boolean(battleInstanceId && activeBattleInstanceId === battleInstanceId)
}

export function isBattleRendererReady(battleInstanceId: string) {
  return readyBattleInstanceId === battleInstanceId
}
