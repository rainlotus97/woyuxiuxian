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
  relationshipDeltas?: WorldRuntimeRelationshipDelta[]
  playerEffect?: WorldRuntimePlayerEffect
  logs?: WorldRuntimeLogEffect[]
}
