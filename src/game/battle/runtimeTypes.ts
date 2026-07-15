import type { Skill } from '@/types/skill'
import type { StatusEffect, Unit } from '@/types/unit'
import type { BattleActorRole } from './presentationRoles'
import type { BattleReplayEvent, BattleReplayLogEntry } from './battleReplay'

export type BattleRuntimePhase = 'intro' | 'running' | 'selecting' | 'animating' | 'ended'
export type BattleRuntimeResult = 'victory' | 'defeat' | 'fled' | null

export interface BattleRuntimeUnit extends Unit {
  side: 'ally' | 'enemy'
  battleRole: BattleActorRole
  spriteKey: string
  portraitKey?: string
  markerText?: string
  actionGauge: number
  skillCooldowns: Record<string, number>
}

export interface BattleRuntimeCommand {
  type: 'attack' | 'skill'
  actorId: string
  targetIds: string[]
  skillId?: string
}

export interface BattleRuntimeHit {
  actorId: string
  targetId: string
  amount: number
  isCrit: boolean
  isHeal?: boolean
}

export type BattleRuntimeLog = BattleReplayLogEntry

export interface BattleRuntimeSnapshot {
  phase: BattleRuntimePhase
  units: BattleRuntimeUnit[]
  currentActorId: string | null
  spiritFire: number
  maxSpiritFire: number
  turn: number
  result: BattleRuntimeResult
  logs: BattleRuntimeLog[]
  replayEvents: BattleReplayEvent[]
}

export interface BattlePreparedEffect {
  actorId: string
  targetId: string
  effectType: 'damage' | 'heal' | 'status'
  rawAmount: number
  isCrit: boolean
  isHeal: boolean
  statusEffect?: StatusEffect
}

export interface BattlePreparedSummon {
  actorId: string
  summonId: string
  side: 'ally' | 'enemy'
}

export interface BattleAppliedEffect {
  actorId: string
  targetId: string
  effectType: 'damage' | 'heal' | 'status'
  amount: number
  absorbed: number
  isCrit: boolean
  isHeal: boolean
  appliedStatus?: StatusEffect
  targetDefeated: boolean
}

export interface BattleSummonOutcome {
  actorId: string
  summonId: string
  summonName: string
  unitId?: string
  success: boolean
  reason?: 'limit' | 'missing-owner' | 'missing-definition'
}

export interface BattleResolvedCommand {
  command: BattleRuntimeCommand
  actorId: string
  actionName: string
  skill: Skill | null
  targetIds: string[]
  preparedEffects: BattlePreparedEffect[]
  preparedSummons: BattlePreparedSummon[]
  previewEffects: BattleAppliedEffect[]
  displayHits: BattleRuntimeHit[]
}

export interface BattleTurnStartResolution {
  hits: BattleRuntimeHit[]
  logs: string[]
  actionBlocked: boolean
  actorDefeated: boolean
}

export interface BattleTurnContext {
  hits: BattleRuntimeHit[]
  logs: string[]
}
