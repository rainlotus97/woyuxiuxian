/** 存根实现 - 故事效果运行时 */
export function createStoryEffectRuntime() {
  return {
    execute: async () => true,
    state: null,
    consumePendingGameplayTrigger: () => null,
    clearPendingGameplayTrigger: () => {},
    serializeState: () => '',
    hydrateState: () => {}
  }
}
