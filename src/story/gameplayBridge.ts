/**
 * 剧情玩法桥接 — 存根实现
 */
export const gameplayBridge = {
  GAMEPLAY_BRIDGE_STUB: true,
  execute: (action?: string) => ({ success: true }),
  applyGameplayEffect: (effect: unknown) => true,
  consumePendingTrigger: () => null,
  clearPendingTrigger: () => {}
}

export default gameplayBridge
export function applyGameplayEffect(effect: unknown): boolean {
  return true
}
