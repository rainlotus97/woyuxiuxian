import type { Realm, Quality, Element } from '@/types/unit'
import { AREAS, DIFFICULTY_CONFIG } from '@/game/battle/config/areas'
import { ENEMIES } from '@/game/battle/config/enemies'

export type { Realm, Quality, Element } from '@/types/unit'

export const REALM_PRIMARY_COLOR: Record<Realm, string> = {
  炼气: '#7eb8da',
  筑基: '#4ade80',
  金丹: '#fbbf24',
  元婴: '#a78bfa',
  化神: '#f472b6',
  渡劫: '#67e8f9',
  大乘: '#fcd34d',
  仙人: '#fef08a'
}

export const REALM_LEVELS: Record<Realm, number> = {
  炼气: 1,
  筑基: 2,
  金丹: 3,
  元婴: 4,
  化神: 5,
  渡劫: 6,
  大乘: 7,
  仙人: 8
}

export function getRealmLevel(realm: Realm): number {
  return REALM_LEVELS[realm] || 1
}

export type RealmRequirement = {
  realm: Realm
  level: number
}

export type DropType = 'material' | 'equipment' | 'consumable' | 'gold' | 'exp'

export interface DropItem {
  id: string
  name: string
  icon: string
  type: DropType
  quality: 'common' | 'fine' | 'rare' | 'epic' | 'legendary'
  minQuantity: number
  maxQuantity: number
  dropRate: number
  description?: string
}

export interface EnemyDefinition {
  id: string
  name: string
  icon: string
  realm: Realm
  realmLevel: number
  baseStats: {
    maxHp: number
    attack: number
    defense: number
    speed: number
  }
  skills: string[]
  drops: string[]
  expReward: number
  goldReward: { min: number; max: number }
}

export interface FullEnemyDefinition extends EnemyDefinition {
  element?: Element
  quality?: Quality
}

export type AreaDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare' | 'extreme'

export interface AreaDefinition {
  id: string
  name: string
  icon: string
  description: string
  requiredRealm: Realm
  requiredRealmLevel: number
  staminaCost: number
  difficulty: AreaDifficulty
  recommendedPower: number
  enemies: string[]
  waves: number
  drops: DropItem[]
  expReward: { min: number; max: number }
  goldReward: { min: number; max: number }
  background?: string
}

export interface AreaProgress {
  areaId: string
  cleared: boolean
  clearCount: number
  fastestTime?: number
  stars: number
  unlocked: boolean
}

export interface StaminaState {
  current: number
  max: number
  lastRecoverTime: number
  recoverRate: number
}

export interface AdventureResult {
  success: boolean
  areaId: string
  timeUsed: number
  expGained: number
  goldGained: number
  drops: DropItem[]
  stars: number
}

export interface SweepResult {
  areaId: string
  sweepCount: number
  totalExp: number
  totalGold: number
  totalDrops: Map<string, { item: DropItem; quantity: number }>
}

export interface AreaDifficultyConfig {
  label: string
  color: string
  multiplier: number
  waves: number
  enemyStatMult: number
  enemiesPerWave: number[]
  bossStatMult?: number
  isRaid?: boolean
}

export { DIFFICULTY_CONFIG, AREAS, ENEMIES }

export function getAreaById(id: string): AreaDefinition | undefined {
  return AREAS.find(area => area.id === id)
}

export function isAreaUnlocked(area: AreaDefinition, playerRealm: Realm, playerRealmLevel: number): boolean {
  const requiredLevel = REALM_LEVELS[area.requiredRealm]
  const playerLevel = REALM_LEVELS[playerRealm]

  if (playerLevel > requiredLevel) return true
  if (playerLevel === requiredLevel && playerRealmLevel >= area.requiredRealmLevel) return true
  return false
}

export function getRealmRequirementText(realm: Realm, level: number): string {
  return `${realm}${level}层`
}

export function calculatePower(stats: { maxHp: number; attack: number; defense: number; speed: number }): number {
  return Math.floor(stats.maxHp * 0.5 + stats.attack * 3 + stats.defense * 2 + stats.speed * 0.5)
}

export function rollDrops(drops: DropItem[]): { item: DropItem; quantity: number }[] {
  const result: { item: DropItem; quantity: number }[] = []

  for (const drop of drops) {
    if (Math.random() < drop.dropRate) {
      const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
      result.push({ item: drop, quantity })
    }
  }

  return result
}

export function rollReward(range: { min: number; max: number }): number {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}
