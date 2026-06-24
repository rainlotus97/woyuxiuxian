import type { WorldRuntimeRelationshipDelta } from '@/world/runtime/worldRuntimeTypes'
import type { ShopInventoryItem } from './shopInventoryResolver'

export function resolveShopMerchantRelationshipDeltas(item: ShopInventoryItem): WorldRuntimeRelationshipDelta[] {
  const event = item.merchantEvent
  if (!event) return []

  const favorDelta = getFavorDelta(item)
  const debtDelta = getDebtDelta(item)
  const fearDelta = getFearDelta(item)

  return [{
    npcId: event.merchantId,
    favorDelta,
    debtDelta,
    fearDelta
  }]
}

function getFavorDelta(item: ShopInventoryItem) {
  const qualityBonus = item.definition.quality === 'excellent' ? 2 : item.definition.quality === 'supreme' || item.definition.quality === 'legendary' ? 3 : 1
  if (item.merchantEvent?.tag === '人情赊账') return 1
  return qualityBonus
}

function getDebtDelta(item: ShopInventoryItem) {
  if (item.merchantEvent?.tag === '人情赊账') return -5
  if (item.merchantEvent?.tag === '药脉折价') return -1
  return 0
}

function getFearDelta(item: ShopInventoryItem) {
  if (item.merchantEvent?.tag === '炉火开张' && item.definition.quality === 'excellent') return -1
  return 0
}
