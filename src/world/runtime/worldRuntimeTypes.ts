import type {
  NpcGoal,
  NpcHealthState,
  NpcDefinition,
  NpcRuntimeState,
  RelationshipState,
  WorldClock,
  WorldLogEntry,
  WorldWeather
} from '@/types/world'

export interface WorldRuntimeNpcContext {
  clock: WorldClock
  weather: WorldWeather
  npcDefinition: NpcDefinition
  npcState: NpcRuntimeState
  playerRelationship: RelationshipState
  playerGold: number
}

export interface WorldRuntimeNpcSocialContext {
  clock: WorldClock
  weather: WorldWeather
  actorDefinition: NpcDefinition
  actorState: NpcRuntimeState
  actorRelationship: RelationshipState
  targetDefinition: NpcDefinition
  targetState: NpcRuntimeState
  targetRelationship: RelationshipState
}

export interface WorldRuntimeNpcPatch {
  id: string
  cultivationDelta?: number
  realmLevelDelta?: number
  hpState?: NpcHealthState
  currentGoal?: NpcGoal
  locationMapId?: string
  lastActionTick?: number
  addFlags?: string[]
}

export interface WorldRuntimeRelationshipDelta {
  npcId: string
  subjectId?: string
  favorDelta?: number
  hatredDelta?: number
  fearDelta?: number
  debtDelta?: number
}

export interface WorldRuntimePlayerEffect {
  cultivationDelta?: number
  goldDelta?: number
}

export interface WorldRuntimeLogEffect {
  scope: WorldLogEntry['scope']
  severity: WorldLogEntry['severity']
  title: string
  text: string
  actorIds: string[]
  tags: string[]
  mapId?: string
}

export interface WorldRuntimeNpcActionResult {
  npcPatch?: WorldRuntimeNpcPatch
  npcPatches?: WorldRuntimeNpcPatch[]
  relationshipDeltas?: WorldRuntimeRelationshipDelta[]
  playerEffect?: WorldRuntimePlayerEffect
  logs?: WorldRuntimeLogEffect[]
}

export interface WorldRuntimeAftermathResult {
  npcPatches?: WorldRuntimeNpcPatch[]
  relationshipDeltas?: WorldRuntimeRelationshipDelta[]
  playerCaptivity?: {
    isCaptured: boolean
    captorSectId: string | null
    sinceTick: number | null
  }
  sectCondition?: {
    status: 'stable' | 'rebuilding' | 'collapsed'
    occupiedBySectId: string | null
    lastUpdatedTick: number | null
  }
  logs?: WorldRuntimeLogEffect[]
}
