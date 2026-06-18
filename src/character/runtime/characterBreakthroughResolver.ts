import type { InventoryItem } from '@/stores/playerStore'
import type { Realm } from '@/types/unit'
import { REALM_ORDER } from '@/types/unit'
import { seededWorldRoll } from '@/world/runtime/worldSeed'

export interface BreakthroughAidDefinition {
  definitionIds: string[]
  name: string
  realm: Realm
  successBonus: number
  failureCultivationRetainBonus: number
}

export interface BreakthroughAidCandidate extends BreakthroughAidDefinition {
  itemId: string
  quantity: number
}

export interface BreakthroughPreview {
  canAttempt: boolean
  reason: 'ready' | 'not_peak' | 'cultivation_shortage' | 'max_realm'
  message: string
  currentRealm: Realm
  nextRealm: Realm | null
  baseSuccessRate: number
  successRate: number
  failureCultivationRetainRate: number
  selectedAid: BreakthroughAidCandidate | null
  aidCandidates: BreakthroughAidCandidate[]
}

export interface BreakthroughAttemptResolution extends BreakthroughPreview {
  success: boolean
  roll: number
  consumedItemId: string | null
  nextMaxCultivation: number
  skillPointsGained: number
  failureCultivation: number
}

export const BREAKTHROUGH_AIDS: BreakthroughAidDefinition[] = [
  {
    definitionIds: ['pill_foundation_guard'],
    name: '护脉筑基丹',
    realm: '筑基',
    successBonus: 0.18,
    failureCultivationRetainBonus: 0.18
  },
  {
    definitionIds: ['pill_gold_core'],
    name: '凝金丹',
    realm: '金丹',
    successBonus: 0.24,
    failureCultivationRetainBonus: 0.24
  }
]

const BASE_REALM_SUCCESS_RATE: Partial<Record<Realm, number>> = {
  '筑基': 0.78,
  '金丹': 0.68,
  '元婴': 0.58,
  '化神': 0.5,
  '渡劫': 0.42,
  '大乘': 0.35,
  '仙人': 0.3
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getNextRealm(currentRealm: Realm) {
  const index = REALM_ORDER.indexOf(currentRealm)
  if (index < 0 || index >= REALM_ORDER.length - 1) return null
  return REALM_ORDER[index + 1] ?? null
}

function resolveBaseSuccessRate(nextRealm: Realm | null) {
  if (!nextRealm) return 0
  return BASE_REALM_SUCCESS_RATE[nextRealm] ?? 0.48
}

export function resolveBreakthroughAidCandidates(input: {
  inventory: InventoryItem[]
  nextRealm: Realm | null
}): BreakthroughAidCandidate[] {
  if (!input.nextRealm) return []

  const aids = BREAKTHROUGH_AIDS.filter(aid => aid.realm === input.nextRealm)
  return aids.flatMap(aid => {
    const item = input.inventory.find(entry => (
      entry.type === 'consumable'
      && entry.quantity > 0
      && (
        aid.definitionIds.includes(entry.definitionId ?? '')
        || aid.name === entry.name
      )
    ))
    if (!item) return []
    return [{
      ...aid,
      itemId: item.id,
      quantity: item.quantity
    }]
  })
}

export function resolveBreakthroughPreview(input: {
  realm: Realm
  realmLevel: number
  cultivation: number
  maxCultivation: number
  inventory: InventoryItem[]
  selectedAidItemId?: string | null
}): BreakthroughPreview {
  const nextRealm = getNextRealm(input.realm)
  const aidCandidates = resolveBreakthroughAidCandidates({
    inventory: input.inventory,
    nextRealm
  })
  const selectedAid = aidCandidates.find(aid => aid.itemId === input.selectedAidItemId)
    ?? aidCandidates[0]
    ?? null
  const baseSuccessRate = resolveBaseSuccessRate(nextRealm)
  const successRate = clamp(baseSuccessRate + (selectedAid?.successBonus ?? 0), 0.05, 0.95)
  const failureCultivationRetainRate = clamp(0.42 + (selectedAid?.failureCultivationRetainBonus ?? 0), 0.25, 0.82)

  if (!nextRealm) {
    return createPreviewState('max_realm', '已抵达当前版本最高境界', input.realm, null, baseSuccessRate, successRate, failureCultivationRetainRate, selectedAid, aidCandidates)
  }

  if (input.realmLevel < 9) {
    return createPreviewState('not_peak', '需修至九层圆满后才能破境', input.realm, nextRealm, baseSuccessRate, successRate, failureCultivationRetainRate, selectedAid, aidCandidates)
  }

  if (input.cultivation < input.maxCultivation) {
    return createPreviewState('cultivation_shortage', '修为尚未圆满，暂不可破境', input.realm, nextRealm, baseSuccessRate, successRate, failureCultivationRetainRate, selectedAid, aidCandidates)
  }

  return createPreviewState('ready', selectedAid ? `可消耗${selectedAid.name}护持破境` : '可尝试破境，未使用护持丹药', input.realm, nextRealm, baseSuccessRate, successRate, failureCultivationRetainRate, selectedAid, aidCandidates)
}

export function resolveBreakthroughAttempt(input: {
  realm: Realm
  realmLevel: number
  cultivation: number
  maxCultivation: number
  inventory: InventoryItem[]
  selectedAidItemId?: string | null
  seedParts?: Array<number | string>
}): BreakthroughAttemptResolution {
  const preview = resolveBreakthroughPreview(input)
  const roll = seededWorldRoll('player-breakthrough', input.realm, input.realmLevel, input.cultivation, ...(input.seedParts ?? []))
  const success = preview.canAttempt && roll <= preview.successRate
  const nextMaxCultivation = Math.floor(input.maxCultivation * 1.5)
  const nextRealm = preview.nextRealm
  const nextRealmIndex = nextRealm ? REALM_ORDER.indexOf(nextRealm) : -1
  const skillPointsGained = success ? Math.max(1, nextRealmIndex) : 0
  const failureCultivation = success
    ? 0
    : Math.floor(input.maxCultivation * preview.failureCultivationRetainRate)

  return {
    ...preview,
    success,
    roll: Number(roll.toFixed(5)),
    consumedItemId: preview.selectedAid?.itemId ?? null,
    nextMaxCultivation,
    skillPointsGained,
    failureCultivation
  }
}

function createPreviewState(
  reason: BreakthroughPreview['reason'],
  message: string,
  currentRealm: Realm,
  nextRealm: Realm | null,
  baseSuccessRate: number,
  successRate: number,
  failureCultivationRetainRate: number,
  selectedAid: BreakthroughAidCandidate | null,
  aidCandidates: BreakthroughAidCandidate[]
): BreakthroughPreview {
  return {
    canAttempt: reason === 'ready',
    reason,
    message,
    currentRealm,
    nextRealm,
    baseSuccessRate: Number(baseSuccessRate.toFixed(3)),
    successRate: Number(successRate.toFixed(3)),
    failureCultivationRetainRate: Number(failureCultivationRetainRate.toFixed(3)),
    selectedAid,
    aidCandidates
  }
}
