/**
 * 故事系统核心类型定义
 */

// ============ 视角类型 ============
export type Perspective = 'male' | 'female' | 'common'

// ============ 触发类型 ============
export type TriggerType = 'must' | 'prob' | 'loop' | 'favor' | 'item'

// ============ 效果类型 ============
export type EffectType =
  | 'gain_item'
  | 'lose_item'
  | 'gain_clue'
  | 'unlock_clue'
  | 'favor_up'
  | 'favor_down'
  | 'route'
  | 'realm'
  | 'ability'
  | 'ending'
  | 'trigger_event'
  | 'set_var'
  | 'unlock_feature'
  | 'info'

// ============ 前置条件类型 ============
export type PrerequisiteType =
  | 'loop'
  | 'node_complete'
  | 'event_triggered'
  | 'favor'
  | 'item'
  | 'clue'
  | 'route'
  | 'choice'

// ============ 前置条件 ============
export interface Prerequisite {
  type: PrerequisiteType
  operator?: '>=' | '<=' | '=' | '<'
  value?: number | string
  characterId?: string
  nodeId?: string
  itemId?: string
  clueId?: string
  routeId?: string
  choiceRef?: string
}

// ============ 效果 ============
export interface Effect {
  type: EffectType
  target?: string
  value?: number | string
}

// ============ NPC对话 ============
export interface NpcDialog {
  speaker: string
  content: string
  emotion?: string
}

// ============ 选项 ============
export interface StoryChoice {
  text: string
  targetId: string | null  // null 表示结束节点
  effects?: Effect[]
  isEndMarker?: boolean    // 是否为结束标记
}

// ============ 故事内容 ============
export interface StoryContent {
  text: string
  maleText?: string
  femaleText?: string
  npcDialogs: NpcDialog[]
  choices: StoryChoice[]
  effects: Effect[]
  innerMonologue?: string
  gameplayTrigger?: GameplayTrigger
}

// ============ 效果 ============
export interface Effect {
  type: EffectType
  target?: string
  value?: number | string
}

// ============ 主线节点 ============
export interface StoryNode {
  id: string
  name: string
  perspective: Perspective
  map: string
  prerequisites: Prerequisite[]
  unlockLoop: number
  fallbackNode: string | null
  content: StoryContent
  triggerType?: TriggerType
  triggerValue?: number
}

// ============ 角色事件 ============
export interface CharacterEvent {
  id: string
  name: string
  triggerType: TriggerType
  priority: number
  unlockLoop: number
  prerequisites: Prerequisite[]
  fallbackNode: string | null
  baseProbability?: number
  loopIncrement?: number
  favorThreshold?: { character: string; value: number }
  content: StoryContent
}

// ============ 角色信息 ============
export interface CharacterInfo {
  id: string
  name: string
  gender: '男' | '女'
  identity: string
  relatedNodes: string[]
  unlockLoop: number
  fallbackNode: string | null
}

// ============ 触发规则 ============
export interface TriggerRule {
  mainNodeId: string
  characterId: string
  eventId: string
  triggerType: TriggerType
  baseValue: number
  priority: number
  unlockLoop: number
  fallbackNode: string | null
  fallbackCondition: string | null
  conditionType: 'this_loop' | 'loop_inherit'
  exclusiveEventId: string | null
  note?: string
}

// ============ 卷内容 ============
export interface VolumeContent {
  mainNodes: StoryNode[]
  commonNodes: StoryNode[]
  characterEvents: CharacterEvent[]
  triggerRules: TriggerRule[]
}

// ============ 结局系�� ============

/** 结局类型 */
export type EndingType = 'normal' | 'hidden' | 'true'

/** 故事终止原因 */
export type StoryTerminationReason =
  | 'volume_end'        // 卷结束，可继续下一卷
  | 'story_end'         // 全剧终
  | 'ending_unlocked'   // 解锁了某个结局
  | 'interrupted'       // 用户手动中断

/** 结局信息 */
export interface EndingInfo {
  id: string            // 结局唯一ID，如 END_NORMAL_001
  name: string          // 结局名称，如 正道·轮回闭环
  type: EndingType      // 结局类型
  description?: string  // 可选描述
  unlockedAt?: number   // 解锁时间戳
  loopNumber?: number   // 解锁时的周目数
}

/** 故事终止状态 */
export interface StoryTermination {
  reason: StoryTerminationReason
  volumeNumber?: number
  endingInfo?: EndingInfo
  hasNextVolume?: boolean
  nextVolumeId?: number
  canContinue?: boolean
  timestamp: number
}

/** 卷完成记录 */
export interface VolumeCompletion {
  volumeNumber: number
  completedAt: number
  endingId?: string
  routeId?: string
  perspective: Perspective
  loopNumber: number
}

/** 故事会话状态 */
export interface StorySessionState {
  status: 'idle' | 'playing' | 'suspended' | 'ended'
  termination?: StoryTermination
}

/** 故事中断点 */
export interface StorySuspendPoint {
  nodeId: string
  volumeNumber: number
  perspective: Perspective
  loopNumber: number
  suspendedAt: number
  reason: 'user_action' | 'volume_transition'
}

// ============ 事件系统类型 ============

/** 故事事件类型 */
export type StoryEventType =
  | 'node:enter'          // 进入节点
  | 'node:leave'          // 离开节点
  | 'choice:make'         // 做出选择
  | 'effect:execute'      // 执行效果
  | 'item:gain'           // 获得物品
  | 'item:lose'           // 失去物品
  | 'clue:unlock'         // 解锁线索
  | 'favor:change'        // 好感度变化
  | 'route:change'        // 路线变更
  | 'ending:unlock'       // 解锁结局
  | 'volume:complete'     // 卷完成
  | 'volume:transition'   // 卷过渡
  | 'story:suspend'       // 故事中断
  | 'story:resume'        // 故事恢复
  | 'sidequest:available' // 支线可用
  | 'sidequest:complete'  // 支线完成
  | 'gameplay:trigger'    // 游戏玩法触发
  | 'gameplay:complete'   // 游戏玩法完成

/** 事件回调函数类型 */
export type StoryEventCallback<T = unknown> = (event: StoryEvent<T>) => void | Promise<void>

/** 故事事件 */
export interface StoryEvent<T = unknown> {
  type: StoryEventType
  timestamp: number
  data: T
  nodeId?: string
  volumeNumber?: number
}

/** 事件订阅器 */
export interface StoryEventSubscription {
  id: string
  eventType: StoryEventType | '*'
  callback: StoryEventCallback
  once: boolean
}

// ============ 扩展系统类型 ============

/** 效果处理器 */
export type EffectHandler = (effect: Effect, context: EffectContext) => void | Promise<void>

/** 效果执行上下文 */
export interface EffectContext {
  nodeId: string
  choiceIndex?: number
  source: 'node' | 'choice'
}

/** 条件检查器 */
export type ConditionChecker = (prerequisite: Prerequisite) => boolean

/** 故事扩展 */
export interface StoryExtension {
  id: string
  name: string
  version: string
  description?: string
  /** 扩展初始化 */
  init?: (api: StoryPublicAPI) => void | Promise<void>
  /** 扩展销毁 */
  destroy?: () => void
  /** 自定义效果处理器 */
  effectHandlers?: Record<string, EffectHandler>
  /** 自定义条件检查器 */
  conditionCheckers?: Record<string, ConditionChecker>
  /** 事件钩子 */
  hooks?: Partial<Record<StoryEventType, StoryEventCallback>>
}

// ============ 玩法系统类型 ============

/** 玩法类型 */
export type GameplayType =
  | 'battle'        // 战斗
  | 'collect'       // 收集
  | 'upgrade'       // 升级/突破
  | 'explore'       // 探索
  | 'dialog'        // 对话挑战
  | 'puzzle'        // 解谜
  | 'custom'        // 自定义玩法

/** 玩法触发配置 */
export interface GameplayTrigger {
  type: GameplayType
  /** 玩法ID（如boss_id、任务id等） */
  targetId: string
  /** 玩法参数 */
  params?: Record<string, unknown>
  /** 完成后继续的目标节点（可选，不填则返回当前节点继续） */
  continueNodeId?: string
  /** 完成条件（可选） */
  completionCondition?: Prerequisite[]
  /** 失败处理 */
  onFailure?: 'retry' | 'skip' | 'gameover' | 'goto'
  /** 失败跳转节点 */
  failureNodeId?: string
}

/** 玩法结果 */
export interface GameplayResult {
  success: boolean
  gameplayType: GameplayType
  targetId: string
  /** 结果数据（如战斗获得的奖励等） */
  data?: Record<string, unknown>
  /** 耗时（秒） */
  duration?: number
}

/** 玩法暂停状态 */
export interface GameplaySuspendState {
  type: 'gameplay'
  gameplayTrigger: GameplayTrigger
  previousNodeId: string
  suspendedAt: number
  retryCount: number
}

// ============ 扩展效果类型 ============

/** 扩展效果类型（在原有基础上增加玩法触发） */
export type ExtendedEffectType = EffectType | 'trigger_gameplay'

/** 扩展效果接口 */
export interface ExtendedEffect extends Omit<Effect, 'type'> {
  type: ExtendedEffectType
  /** 玩法触发配置（当type为trigger_gameplay时） */
  gameplay?: GameplayTrigger
}

// ============ 公共API类型 ============

/** 故事进度信息 */
export interface StoryProgress {
  currentVolume: number
  currentNodeId: string | null
  currentLoop: number
  completedNodes: string[]
  completedCount: number
  totalNodes: number
  percentage: number
}

/** 支线任务详情 */
export interface SideQuestDetail {
  id: string
  name: string
  characterName: string
  triggerType: TriggerType
  prerequisites: Prerequisite[]
  isCompleted: boolean
  description?: string
  rewards?: Effect[]
}

/** 物品详情（从dictionary解析） */
export interface StoryItemDetail {
  id: string
  name: string
  type: '道具' | '消耗品'
  category: string
  inheritRule: string
  description?: string
}

/** 公共API接口 */
export interface StoryPublicAPI {
  // 状态查询
  getProgress(): StoryProgress
  getCurrentNode(): StoryNode | null
  getNodeById(id: string): StoryNode | null
  getSideQuests(): SideQuestDetail[]
  getCompletedSideQuests(): SideQuestDetail[]
  getAvailableSideQuests(): SideQuestDetail[]
  getItemDetail(itemId: string): StoryItemDetail | null
  getAllItems(): StoryItemDetail[]
  getClueDetail(clueId: string): { id: string; name: string } | null
  getUnlockedClues(): { id: string; name: string }[]
  getFavorability(characterId: string): number
  getAllFavorability(): Map<string, number>
  getEndingStatus(endingId: string): (EndingInfo & { unlocked: boolean }) | null
  getAllEndings(): (EndingInfo & { unlocked: boolean })[]

  // 导航控制
  goToNode(nodeId: string): Promise<void>
  makeChoice(choiceIndex: number): Promise<void>
  startSideQuest(eventId: string): Promise<boolean>

  // 卷控制
  transitionToVolume(volumeNumber: number): Promise<boolean>

  // 事件订阅
  on<T = unknown>(eventType: StoryEventType, callback: StoryEventCallback<T>): () => void
  once<T = unknown>(eventType: StoryEventType, callback: StoryEventCallback<T>): () => void
  off(subscriptionId: string): void

  // 扩展注册
  registerExtension(extension: StoryExtension): void
  unregisterExtension(extensionId: string): void

  // 调试API
  debug: {
    getState(): Record<string, unknown>
    setNode(nodeId: string): void
    addItem(itemId: string, count: number): void
    removeItem(itemId: string, count: number): void
    setFavorability(characterId: string, value: number): void
    unlockClue(clueId: string): void
    triggerEvent(eventId: string): void
    reset(): void
  }
}
