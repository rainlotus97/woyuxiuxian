import type { SectRelation, SectWar } from '@/types/sect'

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
