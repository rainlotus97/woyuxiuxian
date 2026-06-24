import type { WorldRealm } from '@/types/map'
import type { SectRelation, SectWar } from '@/types/sect'

export type AreaRiskLevel = 'safe' | 'watch' | 'danger' | 'chaos'

export interface AreaRuntimeState {
  areaId: string
  controllingSectId: string | null
  riskLevel: AreaRiskLevel
  stability: number
  pressure: number
  contested: boolean
  lastUpdatedTick: number
}

export interface AreaRuntimeLogEffect {
  title: string
  description: string
  impact?: string
  type: 'world' | 'sect' | 'personal'
}

export interface AreaRuntimeUpdate {
  areaId: string
  controllingSectId?: string | null
  riskLevel?: AreaRiskLevel
  stabilityDelta?: number
  pressureDelta?: number
  contested?: boolean
  lastUpdatedTick?: number
  log?: AreaRuntimeLogEffect
}

export interface AreaWorldContext {
  totalTicks: number
  weather: string
  areaId: string
  realm: WorldRealm
  controllingSectId: string | null
  joinedSectId: string | null
  activeWar: SectWar | null
  relations: Record<string, SectRelation>
}
