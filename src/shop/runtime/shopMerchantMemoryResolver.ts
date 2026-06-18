import type { ShopCategoryId } from '@/shop/config/shopCatalog'
import type { ShopInventoryItem } from './shopInventoryResolver'

export interface ShopMerchantMemory {
  id: string
  merchantId: string
  merchantName: string
  eventTag: string
  category: Exclude<ShopCategoryId, 'all'>
  expiresAtTick: number
  stockModifier: number
  priceModifier: number
  label: string
}

export interface ShopMerchantMemoryInfluence {
  priceModifier: number
  stockModifier: number
  categoryStockModifiers: Partial<Record<Exclude<ShopCategoryId, 'all'>, number>>
  merchantNames: string[]
  tags: string[]
}

const MEMORY_DURATION_TICKS = 36

export function createShopMerchantMemory(item: ShopInventoryItem, currentTick: number): ShopMerchantMemory | null {
  const event = item.merchantEvent
  if (!event) return null

  return {
    id: `${event.id}:${item.definition.category}`,
    merchantId: event.merchantId,
    merchantName: event.merchantName,
    eventTag: event.tag,
    category: item.definition.category,
    expiresAtTick: currentTick + MEMORY_DURATION_TICKS,
    stockModifier: getMemoryStockModifier(event.tag),
    priceModifier: getMemoryPriceModifier(event.tag),
    label: `${event.merchantName}${event.tag}`
  }
}

export function upsertShopMerchantMemory(
  memories: ShopMerchantMemory[],
  memory: ShopMerchantMemory | null,
  currentTick: number
) {
  const active = pruneShopMerchantMemories(memories, currentTick)
  if (!memory) return active
  const existingIndex = active.findIndex(item => item.id === memory.id)
  if (existingIndex >= 0) {
    active[existingIndex] = memory
    return active
  }
  return [memory, ...active].slice(0, 12)
}

export function pruneShopMerchantMemories(memories: ShopMerchantMemory[] = [], currentTick: number) {
  return memories.filter(memory => memory.expiresAtTick > currentTick)
}

export function resolveShopMerchantMemoryInfluence(
  memories: ShopMerchantMemory[] = [],
  currentTick: number
): ShopMerchantMemoryInfluence {
  const active = pruneShopMerchantMemories(memories, currentTick)
  const categoryStockModifiers: ShopMerchantMemoryInfluence['categoryStockModifiers'] = {}
  let priceModifier = 1
  let stockModifier = 1

  for (const memory of active) {
    priceModifier *= memory.priceModifier
    stockModifier *= memory.stockModifier
    categoryStockModifiers[memory.category] = Number(((categoryStockModifiers[memory.category] ?? 1) * memory.stockModifier).toFixed(3))
  }

  return {
    priceModifier: Number(clamp(priceModifier, 0.9, 1).toFixed(3)),
    stockModifier: Number(clamp(stockModifier, 1, 1.18).toFixed(3)),
    categoryStockModifiers,
    merchantNames: [...new Set(active.map(memory => memory.merchantName))].slice(0, 3),
    tags: [...new Set(active.map(memory => `${memory.label}余脉`))].slice(0, 4)
  }
}

function getMemoryStockModifier(eventTag: string) {
  if (eventTag === '炉火开张') return 1.08
  if (eventTag === '药脉折价') return 1.06
  if (eventTag === '人情赊账') return 1.04
  return 1.03
}

function getMemoryPriceModifier(eventTag: string) {
  if (eventTag === '人情赊账') return 0.97
  if (eventTag === '药脉折价') return 0.98
  return 0.995
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
