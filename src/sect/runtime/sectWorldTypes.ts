import type { SectEventType, SectRelation, SectWar } from '@/types/sect'

export interface SectRuntimeStateSnapshot {
  joinedSectId: string | null
  reputation: number
  sectHp: number
  sectMaxHp: number
  relations: Record<string, SectRelation>
  activeWar: SectWar | null
}

export interface SectRuntimeLogEffect {
  title: string
  description: string
}

export interface SectRuntimeWarProgress {
  attackerWon: boolean
  log?: SectRuntimeLogEffect
}

export interface SectRelationShift {
  targetSectId: string
  relation: SectRelation
}

export interface SectWorldTickEvent {
  id: string
  type: SectEventType
  title: string
  description: string
}

export interface SectWorldTickResolution {
  warProgress: SectRuntimeWarProgress | null
  relationDrift: {
    shift: SectRelationShift
    log: SectRuntimeLogEffect
  } | null
  events: SectWorldTickEvent[]
}

export interface SectWarResolution {
  warId: string
  attackerSectId: string
  defenderSectId: string
  winner: 'attacker' | 'defender'
  status: 'victory' | 'defeat'
  attackerScore: number
  defenderScore: number
  rewards?: {
    contribution: number
    gold: number
    reputation: number
  }
  penalties?: {
    contribution: number
    reputation: number
  }
  log?: SectRuntimeLogEffect
}
