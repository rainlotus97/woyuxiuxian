import type { BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'

type Handler<T> = (payload: T) => void

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
  result: 'victory' | 'defeat' | 'fled'
}

export interface BattleSceneReady {
  sceneKey: string
}

export interface GameEvents {
  'battle:scene-ready': BattleSceneReady
  'battle:snapshot': BattleRuntimeSnapshot
  'battle:play-command': BattleSceneCommand
  'battle:damage-number': BattleSceneHit
  'battle:hit': BattleSceneHit
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
