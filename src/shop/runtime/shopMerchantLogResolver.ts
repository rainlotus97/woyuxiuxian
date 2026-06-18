import type { WorldLogEntry } from '@/types/world'
import type { ShopInventoryItem } from './shopInventoryResolver'
import { resolveShopMerchantRelationshipDeltas } from './shopMerchantRelationshipResolver'

export interface ShopMerchantTradeLog {
  scope: WorldLogEntry['scope']
  severity: WorldLogEntry['severity']
  title: string
  text: string
  actorIds: string[]
  mapId?: string
  tags: string[]
}

export function resolveShopMerchantTradeLog(item: ShopInventoryItem): ShopMerchantTradeLog | null {
  const event = item.merchantEvent
  if (!event) return null

  return {
    scope: 'npc',
    severity: item.definition.quality === 'excellent' || item.definition.quality === 'legendary' ? 'major' : 'normal',
    title: `${event.merchantName}促成交易`,
    text: `${event.merchantName}借“${event.tag}”为你调来${item.definition.name}。坊市记下这次往来，后续人物商缘可能继续影响供货。`,
    actorIds: [event.merchantId],
    mapId: event.mapId,
    tags: ['shop', 'merchant', 'trade', event.tag, item.definition.category]
  }
}

export function resolveShopMerchantTradeOutcome(item: ShopInventoryItem) {
  const log = resolveShopMerchantTradeLog(item)
  if (!log) return null
  return {
    log,
    relationshipDeltas: resolveShopMerchantRelationshipDeltas(item)
  }
}
