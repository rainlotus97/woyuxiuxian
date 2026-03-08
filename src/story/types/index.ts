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
