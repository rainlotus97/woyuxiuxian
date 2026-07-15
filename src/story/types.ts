export type Perspective = 'male' | 'female' | 'both'

export interface StoryEvent {
  id: string
  name: string
  type: string
  text?: string
  choices?: StoryChoice[]
  effects?: Effect[]
  prerequisites?: Prerequisite[]
  prerequisiteExpression?: PrerequisiteExpression | null
}

export interface StoryChoice {
  id?: string
  text: string
  targetId?: string | null
  effects?: Effect[]
  isEndMarker?: boolean
}

export interface Effect {
  type: string
  target?: string
  value?: number | string
  path?: string
  source?: string
  nodeId?: string
}

export type EffectType = Effect['type']

export type TriggerType = 'auto' | 'realm' | 'npc_interaction' | 'encounter' | 'sect_join' | 'choice_flag'

export interface StoryNode {
  id: string
  name: string
  perspective: Perspective
  map: string
  prerequisites: Prerequisite[]
  prerequisiteExpression: PrerequisiteExpression | null
  rawPrerequisiteText: string | null
  unlockLoop: number
  fallbackNode: string | null
  content: StoryNodeContent
  requiredRealm?: import('@/types/unit').Realm | null
  requiredRealmLevel?: number | null
}

export interface StoryNodeContent {
  text: string
  maleText?: string
  femaleText?: string
  innerMonologue?: string
  npcDialogs?: NpcDialog[]
  choices: StoryChoice[]
  effects: Effect[]
  gameplayTrigger?: GameplayTrigger
  illustration?: StoryIllustration | null
}

export interface NpcDialog {
  speaker: string
  content: string
  emotion?: string
  speakerTitle?: string
  avatar?: string
  portrait?: string
  avatarFocus?: {
    x: number
    y: number
    scale: number
  }
}

export interface StoryIllustration {
  type: 'scene' | 'faction' | 'character'
  src: string
  alt: string
  align?: 'left' | 'center' | 'right'
  emphasis?: 'soft' | 'focus'
  subjectId?: string
}

export interface Prerequisite {
  type: string
  nodeId?: string
  characterId?: string
  itemId?: string
  clueId?: string
  choiceRef?: string
  routeId?: string
  value?: number | string | boolean
  operator?: string
  rawText?: string
}

export interface PrerequisiteExpression {
  type: 'condition' | 'and' | 'or' | 'not'
  conditions?: PrerequisiteExpression[]
  condition?: Prerequisite
}

export interface EndingInfo {
  id: string
  name: string
  type: 'normal' | 'hidden' | 'true'
  unlockedAt?: number
  loopNumber?: number
  description?: string
}

export interface VolumeCompletion {
  volumeNumber: number
  completedAt: number
  endingId?: string
  routeId?: string
  perspective: Perspective
  loopNumber: number
}

export interface StoryTermination {
  reason: 'volume_end' | 'ending_unlocked' | 'story_end'
  volumeNumber?: number
  hasNextVolume?: boolean
  nextVolumeId?: number
  canContinue: boolean
  endingInfo?: EndingInfo & { unlockedAt: number; loopNumber: number }
  timestamp: number
}

export interface StorySessionState {
  status: 'idle' | 'playing' | 'suspended' | 'ended'
  termination?: StoryTermination
}

export type GameplayType =
  | 'battle'
  | 'collect'
  | 'upgrade'
  | 'explore'
  | 'dialog'
  | 'puzzle'
  | 'custom'

export interface GameplayTrigger {
  type: GameplayType
  targetId: string
  params?: Record<string, unknown>
  context?: Record<string, unknown>
  continueNodeId?: string
  outcomeNodeIds?: Partial<Record<'victory' | 'defeat' | 'fled' | 'success' | 'failure', string>>
  completionCondition?: Prerequisite[]
  onFailure?: 'retry' | 'skip' | 'gameover' | 'goto'
  failureNodeId?: string
}

export interface GameplayResult {
  success: boolean
  gameplayType: GameplayType
  targetId: string
  data?: Record<string, unknown>
  duration?: number
  narrative?: string
  effects?: Effect[]
}

export interface GameplaySuspendState {
  type: 'gameplay'
  gameplayTrigger: GameplayTrigger
  previousNodeId: string
  suspendedAt: number
  retryCount: number
}

export interface SideQuestDetail {
  id: string
  name: string
  characterId: string
  characterName: string
  triggerType: TriggerType
  priority: number
  prerequisites: Prerequisite[]
  isAvailable: boolean
  isCompleted: boolean
  description?: string
  rewards?: Effect[]
}
