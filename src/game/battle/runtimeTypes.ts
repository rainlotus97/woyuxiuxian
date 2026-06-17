import type { Skill } from '@/types/skill'
import type { StatusEffect, Unit } from '@/types/unit'
import type { BattleActorRole } from './presentationRoles'

export type BattleRuntimePhase = 'intro' | 'running' | 'selecting' | 'animating' | 'ended'
export type BattleRuntimeResult = 'victory' | 'defeat' | 'fled' | null

export interface BattleRuntimeUnit extends Unit {
  side: 'ally' | 'enemy'
  battleRole: BattleActorRole
  spriteKey: string
  portraitKey?: string
  actionGauge: number
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

export interface BattleRuntimeLog {
  id: string
  text: string
  severity: 'normal' | 'major'
}

export interface BattleRuntimeSnapshot {
  phase: BattleRuntimePhase
  units: BattleRuntimeUnit[]
  currentActorId: string | null
  spiritFire: number
  maxSpiritFire: number
  turn: number
  result: BattleRuntimeResult
  logs: BattleRuntimeLog[]
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

export interface BattleResolvedCommand {
  command: BattleRuntimeCommand
  actorId: string
  actionName: string
  skill: Skill | null
  targetIds: string[]
  preparedEffects: BattlePreparedEffect[]
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
