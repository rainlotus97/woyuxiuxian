import { defineStore } from 'pinia'

/**
 * Legacy compatibility store.
 *
 * The active battle pipeline is now:
 * `useBattleSession -> src/game/battle/battleRuntime.ts -> Phaser scenes`.
 *
 * Keep this store only as a defensive compatibility boundary so any stale import
 * fails loudly instead of silently reviving the deprecated battle flow.
 */
export const useBattleStore = defineStore('battle-legacy', () => {
  function unsupported(): never {
    throw new Error(
      'battleStore has been retired from the main battle flow. Use useBattleSession() and src/game/battle/battleRuntime.ts instead.'
    )
  }

  return {
    unsupported
  }
})
