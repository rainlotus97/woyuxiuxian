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

// 导出字典解析器
export { dictionaryParser, DictionaryParser } from './dictionaryParser'
export type { DictionaryItem, DictionaryCharacter } from './dictionaryParser'
