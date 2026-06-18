import type { Realm } from '@/types/unit'
import type { WorldWeather } from '@/types/world'
import type { SectWorldCondition } from '@/types/sect'
import { REALM_ORDER } from '@/types/unit'
import { seededWorldRoll } from '@/world/runtime/worldSeed'
import {
  SHOP_CATALOG,
  type ShopCategoryId,
  type ShopItemDefinition,
  type ShopQuality
} from '@/shop/config/shopCatalog'

export interface ShopInventoryContext {
  totalTicks: number
  refreshSeed?: number
  playerRealm: Realm
  joinedSectId: string | null
  unlockedSectIds: string[]
  weather: WorldWeather
  sectWorldCondition?: SectWorldCondition | null
}

export interface ShopInventoryItem {
  stockId: string
  definition: ShopItemDefinition
  price: number
  stock: number
  maxStock: number
  tags: string[]
  limitedReason?: string
}

export interface ShopFilter {
  category: ShopCategoryId
  quality: 'all' | ShopQuality
}

const WEATHER_PRICE_MODIFIERS: Partial<Record<WorldWeather, number>> = {
  storm: 1.08,
  flood: 1.12,
  fire: 1.14,
  mist: 0.96,
  rain: 0.98
}

const REFRESH_TICK_SPAN = 12

function getRefreshBucket(totalTicks: number) {
  return Math.floor(Math.max(0, totalTicks) / REFRESH_TICK_SPAN)
}

function getRealmRank(realm: Realm) {
  return REALM_ORDER.indexOf(realm)
}

function canUseByRealm(definition: ShopItemDefinition, playerRealm: Realm) {
  if (!definition.minRealm) return true
  return getRealmRank(playerRealm) >= getRealmRank(definition.minRealm)
}

function canSeeSectItem(definition: ShopItemDefinition, context: ShopInventoryContext) {
  if (!definition.sectIds?.length) return true
  const knownSectIds = new Set([
    ...context.unlockedSectIds,
    context.joinedSectId ?? ''
  ])
  return definition.sectIds.some(sectId => knownSectIds.has(sectId))
}

function getDefinitionAvailability(definition: ShopItemDefinition, context: ShopInventoryContext) {
  if (!canUseByRealm(definition, context.playerRealm)) {
    return { available: false, reason: `${definition.minRealm}后坊市才会流通` }
  }

  if (!canSeeSectItem(definition, context)) {
    return { available: false, reason: '未接触相关宗门' }
  }

  if (
    definition.category === 'sect'
    && context.sectWorldCondition?.status === 'collapsed'
    && definition.sectIds?.includes(context.joinedSectId ?? '')
  ) {
    return { available: false, reason: '所属宗门沦陷，供货中断' }
  }

  return { available: true, reason: undefined }
}

function getStock(definition: ShopItemDefinition, context: ShopInventoryContext, bucket: number) {
  const [min, max] = definition.stockRange
  if (max <= 0) return 0

  const roll = seededWorldRoll('shop-stock', bucket, context.joinedSectId ?? 'wanderer', definition.id)
  if (min === 0 && roll > definition.refreshWeight) return 0

  const spread = Math.max(0, max - min)
  const amount = min + Math.floor(roll * (spread + 1))
  return Math.max(0, Math.min(max, amount))
}

function getPrice(definition: ShopItemDefinition, context: ShopInventoryContext, bucket: number) {
  const weatherModifier = WEATHER_PRICE_MODIFIERS[context.weather] ?? 1
  const sectModifier = definition.sectIds?.includes(context.joinedSectId ?? '') ? 0.9 : 1
  const crisisModifier = context.sectWorldCondition?.status === 'rebuilding' ? 1.07 : 1
  const marketRoll = seededWorldRoll('shop-price', bucket, definition.id)
  const marketModifier = 0.94 + marketRoll * 0.14

  return Math.max(1, Math.round(definition.basePrice * weatherModifier * sectModifier * crisisModifier * marketModifier))
}

function getTags(definition: ShopItemDefinition, context: ShopInventoryContext) {
  const tags: string[] = []
  if (definition.sectIds?.length) {
    tags.push(definition.sectIds.includes(context.joinedSectId ?? '') ? '本宗折扣' : '宗门限定')
  }
  if (definition.minRealm) tags.push(`${definition.minRealm}起`)
  if (context.weather === 'flood' || context.weather === 'fire' || context.weather === 'storm') tags.push('灾象涨价')
  return tags
}

export function createShopInventory(context: ShopInventoryContext): ShopInventoryItem[] {
  const bucket = getRefreshBucket(context.totalTicks) + (context.refreshSeed ?? 0) * 1000

  return SHOP_CATALOG.flatMap(definition => {
    const availability = getDefinitionAvailability(definition, context)
    if (!availability.available) return []

    const stock = getStock(definition, context, bucket)
    if (stock <= 0) return []

    return [{
      stockId: `${definition.id}:${bucket}`,
      definition,
      price: getPrice(definition, context, bucket),
      stock,
      maxStock: definition.stockRange[1],
      tags: getTags(definition, context),
      limitedReason: availability.reason
    }]
  }).sort((a, b) => {
    if (a.definition.category !== b.definition.category) {
      return a.definition.category.localeCompare(b.definition.category)
    }
    return a.price - b.price
  })
}

export function filterShopInventory(items: ShopInventoryItem[], filter: ShopFilter) {
  return items.filter(item => {
    if (filter.category !== 'all' && item.definition.category !== filter.category) return false
    if (filter.quality !== 'all' && item.definition.quality !== filter.quality) return false
    return true
  })
}

export function shopItemToInventoryItem(item: ShopInventoryItem, quantity = 1) {
  const definition = item.definition
  return {
    id: `item_${Date.now()}_${Math.floor(seededWorldRoll('shop-buy', item.stockId, quantity) * 100000)}`,
    definitionId: definition.definitionId,
    equipmentId: definition.equipmentId,
    name: definition.name,
    icon: definition.icon,
    type: definition.type,
    quality: definition.quality,
    quantity,
    description: definition.description,
    effects: definition.effects ? definition.effects.map(effect => ({ ...effect })) : undefined
  }
}
