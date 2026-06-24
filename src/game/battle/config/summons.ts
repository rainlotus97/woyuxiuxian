/**
 * 召唤物配置 — 存根
 */
import type { Unit } from '@/types/unit'

export interface SummonDefinition {
  id: string
  name: string
  icon: string
}

export function getSummonDefinition(id: string): SummonDefinition | null {
  return null
}
