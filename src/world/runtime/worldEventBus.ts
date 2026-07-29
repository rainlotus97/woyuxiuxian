import type {
  WorldEffectTransaction,
  WorldEventCallbacks,
  WorldNotification,
  WorldUnlock,
  WorldJournalEntry,
  WorldTickResult
} from '@/types/worldEvent'

type WorldEventMap = {
  'world:committed': WorldTickResult
  'world:journal': WorldJournalEntry
  'world:unlock': WorldUnlock
  'world:notification': WorldNotification
  'world:effect-transaction': WorldEffectTransaction
}

type Handler<T> = (payload: T) => void

class WorldEventBus {
  private listeners = new Map<keyof WorldEventMap, Set<Handler<unknown>>>()

  on<K extends keyof WorldEventMap>(type: K, handler: Handler<WorldEventMap[K]>) {
    const set = this.listeners.get(type) ?? new Set<Handler<unknown>>()
    set.add(handler as Handler<unknown>)
    this.listeners.set(type, set)
    return () => set.delete(handler as Handler<unknown>)
  }

  emit<K extends keyof WorldEventMap>(type: K, payload: WorldEventMap[K]) {
    this.listeners.get(type)?.forEach(handler => handler(payload))
  }

  publish(result: WorldTickResult, callbacks?: WorldEventCallbacks) {
    this.emit('world:committed', result)
    result.journals.forEach(entry => {
      this.emit('world:journal', entry)
      callbacks?.onJournal?.(entry)
    })
    result.unlocks.forEach(unlock => {
      this.emit('world:unlock', unlock)
      callbacks?.onUnlock?.(unlock)
    })
    result.notifications.forEach(notification => {
      this.emit('world:notification', notification)
      callbacks?.onNotification?.(notification)
    })
    result.transactions.forEach(transaction => {
      this.emit('world:effect-transaction', transaction)
      callbacks?.onEffectTransaction?.(transaction)
    })
    callbacks?.onCommitted?.(result)
  }

  clear() {
    this.listeners.clear()
  }
}

export const worldEventBus = new WorldEventBus()
