import type { BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'

type Handler<T> = (payload: T) => void

interface ScopedBattleEvent {
  battleInstanceId: string
}

export interface BattleSceneCommand {
  type: 'attack' | 'skill'
  actorId: string
  targetIds: string[]
  skillId?: string
}

export interface BattleSceneHit {
  actorId: string
  targetId: string
  amount: number
  isCrit: boolean
  isHeal?: boolean
}

export interface BattleSceneEnded {
  battleInstanceId: string
  result: 'victory' | 'defeat' | 'fled'
}

export interface BattleSceneReady extends ScopedBattleEvent {
  sceneKey: string
}

export interface BattleArenaThemeChanged extends ScopedBattleEvent {
  arenaId: string
}

export interface BattleSceneSnapshotChanged extends ScopedBattleEvent {
  snapshot: BattleRuntimeSnapshot
}

export interface BattleSceneCommandRequested extends ScopedBattleEvent {
  command: BattleSceneCommand
}

export interface BattleSceneDamageNumberRequested extends ScopedBattleEvent {
  hit: BattleSceneHit
}

export interface BattleSceneHitResolved extends ScopedBattleEvent {
  hit: BattleSceneHit
}

export interface GameEvents {
  'battle:scene-ready': BattleSceneReady
  'battle:arena-theme': BattleArenaThemeChanged
  'battle:snapshot': BattleSceneSnapshotChanged
  'battle:play-command': BattleSceneCommandRequested
  'battle:damage-number': BattleSceneDamageNumberRequested
  'battle:hit': BattleSceneHitResolved
  'battle:ended': BattleSceneEnded
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

export function setActiveBattleInstanceId(battleInstanceId: string | null) {
  if (activeBattleInstanceId !== battleInstanceId) {
    readyBattleInstanceId = null
  }
  activeBattleInstanceId = battleInstanceId
}

export function getActiveBattleInstanceId() {
  return activeBattleInstanceId
}

export function markBattleSceneReady(battleInstanceId: string | null) {
  readyBattleInstanceId = battleInstanceId
}

export function clearBattleSceneReady(battleInstanceId: string | null) {
  if (readyBattleInstanceId === battleInstanceId) {
    readyBattleInstanceId = null
  }
}

export function isBattleSceneReady(battleInstanceId: string) {
  return readyBattleInstanceId === battleInstanceId
}
