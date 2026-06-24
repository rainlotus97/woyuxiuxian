/**
 * 故事模块入口
 */

// 导出类型
export * from './types'

// 导出store
export { useStoryStore } from './storyStore'

// 导出事件总线
export { storyEventBus, StoryEventBus } from './eventBus'

// 导出扩展管理器
export { extensionManager, ExtensionManager } from './extensionManager'

// 导出玩法桥接器
export { gameplayBridge, GameplayBridge } from './gameplayBridge'
export { createStoryEffectRuntime } from './runtime/storyEffectRuntime'
export { registerDefaultGameplayHandlers } from './runtime/registerDefaultGameplayHandlers'
export { getStoryBattleTemplate, STORY_BATTLE_TEMPLATES } from './runtime/storyBattleCatalog'
export {
  extractGameplayOutcomeRoutes,
  resolveGameplayOutcomeKey,
  resolveGameplayContinueNode
} from './runtime/gameplayOutcomeRouter'
export {
  createRouteGameplaySession,
  getRouteGameplaySession,
  completeRouteGameplaySession,
  clearRouteGameplaySession,
  consumeResolvedRouteGameplaySession,
  hasRouteGameplaySession
} from './runtime/routeGameplaySession'
export {
  createStoryBattleReplayRecord,
  saveStoryBattleReplayRecord,
  getStoryBattleReplayArchive,
  getStoryBattleReplayRecord,
  getStoryBattleReplaySummaries,
  clearStoryBattleReplayArchive
} from './runtime/storyBattleReplayArchive'
export { createStoryBattleReplayViewerState } from './runtime/storyBattleReplayViewer'
export {
  STORY_CHARACTER_BINDINGS,
  getStoryCharacterBindingById,
  findStoryCharacterBinding,
  resolveStoryCharacterTarget,
  describeStoryCharacterTarget,
  validateStoryCharacterBindings
} from './runtime/storyCharacterRegistry'
export {
  syncStoryFavorToWorld,
  formatStoryFavorLabel
} from './runtime/storyFavorSync'
export {
  syncStoryRelationshipMetric,
  formatStoryRelationshipLabel
} from './runtime/storyRelationshipSync'

// 导出字典解析器
export { dictionaryParser, DictionaryParser } from './dictionaryParser'
export type { DictionaryItem, DictionaryCharacter } from './dictionaryParser'
