import type { Realm } from '@/types/unit'
import type { RelationshipState, WorldWeather } from '@/types/world'
import type { SectWorldCondition } from '@/types/sect'
import type { InventoryItem } from '@/stores/playerStore'
import type { AreaRiskLevel } from '@/map/runtime/mapRuntimeTypes'
import { REALM_ORDER } from '@/types/unit'
import { seededWorldRoll } from '@/world/runtime/worldSeed'
import {
  SHOP_CATALOG,
  type ShopCategoryId,
  type ShopItemDefinition,
  type ShopQuality
} from '@/shop/config/shopCatalog'
import { SHOP_MERCHANT_ITEM_RULES } from '@/shop/config/shopMerchantCatalog'
import {
  resolveShopMerchantEvents,
  type ShopMerchantEventResolution
} from './shopMerchantEventResolver'

export interface ShopInventoryContext {
  totalTicks: number
  refreshSeed?: number
  playerRealm: Realm
  joinedSectId: string | null
  unlockedSectIds: string[]
  weather: WorldWeather
  sectWorldCondition?: SectWorldCondition | null
  marketAreaStates?: ShopMarketAreaState[]
  merchantNpcStates?: ShopMerchantNpcState[]
}

export interface ShopMarketAreaState {
  areaId: string
  controllingSectId: string | null
  riskLevel: AreaRiskLevel
  stability: number
  pressure: number
  contested: boolean
}

export interface ShopMarketInfluence {
  priceModifier: number
  stockModifier: number
  tags: string[]
  controlledByJoinedSectCount: number
  contestedCount: number
  unstableCount: number
  averageStability: number
}

export interface ShopMerchantNpcState {
  npcId: string
  name: string
  homeMapId: string
  locationMapId: string
  sectId?: string
  title: string
  tags: string[]
  constitution: string
  currentGoal: string
  hpState: string
  relationship: Pick<RelationshipState, 'favor' | 'debt' | 'bond'>
}

export interface ShopMerchantInfluence {
  priceModifier: number
  stockModifier: number
  categoryStockModifiers: Partial<Record<Exclude<ShopCategoryId, 'all'>, number>>
  tags: string[]
  merchantNames: string[]
  eventResolution: ShopMerchantEventResolution
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

interface ShopCatalogEntry {
  definition: ShopItemDefinition
  merchantNames: string[]
}

export interface ShopFilter {
  category: ShopCategoryId
  quality: 'all' | ShopQuality
}

export interface ShopPurchaseResolution {
  success: boolean
  reason: 'ready' | 'sold_out' | 'gold_shortage' | 'contribution_shortage' | 'inventory_full'
  message: string
  stockId: string | null
  price: number
  contributionCost: number
  nextPurchasedQuantity: number
  purchasedItem?: ShopInventoryItem
  inventoryItem?: ReturnType<typeof shopItemToInventoryItem>
}

const WEATHER_PRICE_MODIFIERS: Partial<Record<WorldWeather, number>> = {
  storm: 1.08,
  flood: 1.12,
  fire: 1.14,
  mist: 0.96,
  rain: 0.98
}

const REFRESH_TICK_SPAN = 12
const RISK_MARKET_PRICE_MODIFIERS: Record<AreaRiskLevel, number> = {
  safe: 0.97,
  watch: 1,
  danger: 1.06,
  chaos: 1.14
}

const RISK_MARKET_STOCK_MODIFIERS: Record<AreaRiskLevel, number> = {
  safe: 1.08,
  watch: 1,
  danger: 0.88,
  chaos: 0.72
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

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

function getMerchantCategoryBonuses(merchant: ShopMerchantNpcState): Array<Exclude<ShopCategoryId, 'all'>> {
  const text = getMerchantSearchText(merchant)
  const categories = new Set<Exclude<ShopCategoryId, 'all'>>()

  if (/炼丹|丹修|药|medicine|medicine_body|采药|seekTreasure/.test(text)) {
    categories.add('pill')
    categories.add('food')
    categories.add('breakthrough')
    categories.add('material')
  }
  if (/锻造|铸|剑修|炼器|forge|sword/.test(text)) {
    categories.add('equipment')
    categories.add('material')
  }
  if (/阵法|符箓|天机|推衍|void|空/.test(text)) {
    categories.add('sect')
    categories.add('material')
  }

  return [...categories]
}

function getMerchantSearchText(merchant: ShopMerchantNpcState) {
  return [
    merchant.title,
    merchant.constitution,
    merchant.currentGoal,
    ...merchant.tags
  ].join(' ')
}

function getMerchantRelationshipWeight(merchant: ShopMerchantNpcState) {
  const relationship = merchant.relationship
  const bondBonus = relationship.bond === 'friend'
    ? 0.08
    : relationship.bond === 'companion' || relationship.bond === 'lover'
      ? 0.16
      : relationship.bond === 'rival'
        ? -0.04
        : relationship.bond === 'enemy'
          ? -0.1
          : 0
  return clamp(
    1 + Math.max(-0.16, relationship.favor / 500) + Math.min(0.14, relationship.debt / 500) + bondBonus,
    0.72,
    1.32
  )
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

export function resolveShopMarketInfluence(context: ShopInventoryContext): ShopMarketInfluence {
  const marketAreas = (context.marketAreaStates ?? []).filter(area => area.areaId)

  if (!marketAreas.length) {
    return {
      priceModifier: 1,
      stockModifier: 1,
      tags: [],
      controlledByJoinedSectCount: 0,
      contestedCount: 0,
      unstableCount: 0,
      averageStability: 0
    }
  }

  const controlledByJoinedSectCount = marketAreas.filter(area => (
    context.joinedSectId
    && area.controllingSectId === context.joinedSectId
    && !area.contested
    && area.stability >= 55
  )).length
  const contestedCount = marketAreas.filter(area => area.contested).length
  const unstableCount = marketAreas.filter(area => (
    area.riskLevel === 'chaos'
    || area.stability < 38
    || area.pressure >= 72
  )).length
  const averageStability = marketAreas.reduce((sum, area) => sum + area.stability, 0) / marketAreas.length

  const averageRiskPrice = marketAreas.reduce((sum, area) => (
    sum + RISK_MARKET_PRICE_MODIFIERS[area.riskLevel]
  ), 0) / marketAreas.length
  const averageRiskStock = marketAreas.reduce((sum, area) => (
    sum + RISK_MARKET_STOCK_MODIFIERS[area.riskLevel]
  ), 0) / marketAreas.length

  const controlledRatio = controlledByJoinedSectCount / marketAreas.length
  const contestedRatio = contestedCount / marketAreas.length
  const unstableRatio = unstableCount / marketAreas.length
  const stabilityRelief = averageStability >= 70 ? 0.03 : averageStability <= 35 ? -0.04 : 0

  const priceModifier = clamp(
    averageRiskPrice
      - controlledRatio * 0.12
      + contestedRatio * 0.08
      + unstableRatio * 0.06
      - Math.max(0, stabilityRelief),
    0.84,
    1.32
  )
  const stockModifier = clamp(
    averageRiskStock
      + controlledRatio * 0.18
      - contestedRatio * 0.18
      - unstableRatio * 0.16
      + stabilityRelief,
    0.5,
    1.38
  )

  const tags: string[] = []
  if (controlledByJoinedSectCount > 0) tags.push('本宗商路')
  if (contestedCount > 0) tags.push('战线涨价')
  if (unstableCount > 0) tags.push('商路受阻')
  if (averageStability >= 70 && contestedCount === 0) tags.push('商路安定')

  return {
    priceModifier: Number(priceModifier.toFixed(3)),
    stockModifier: Number(stockModifier.toFixed(3)),
    tags,
    controlledByJoinedSectCount,
    contestedCount,
    unstableCount,
    averageStability: Number(averageStability.toFixed(1))
  }
}

export function resolveShopMerchantInfluence(context: ShopInventoryContext): ShopMerchantInfluence {
  const merchants = (context.merchantNpcStates ?? []).filter(merchant => (
    merchant.hpState !== 'dead'
    && merchant.hpState !== 'captured'
  ))

  if (!merchants.length) {
    const eventResolution = resolveShopMerchantEvents([])
    return {
      priceModifier: 1,
      stockModifier: 1,
      categoryStockModifiers: {},
      tags: [],
      merchantNames: [],
      eventResolution
    }
  }

  const eventResolution = resolveShopMerchantEvents(merchants)
  const categoryWeights: Partial<Record<Exclude<ShopCategoryId, 'all'>, number>> = {}
  let relationshipTotal = 0
  let activeCount = 0

  for (const merchant of merchants) {
    const categories = getMerchantCategoryBonuses(merchant)
    if (!categories.length) continue
    const weight = getMerchantRelationshipWeight(merchant)
    relationshipTotal += weight
    activeCount++
    for (const category of categories) {
      categoryWeights[category] = (categoryWeights[category] ?? 0) + weight
    }
  }

  if (activeCount === 0) {
    return {
      priceModifier: eventResolution.priceModifier,
      stockModifier: eventResolution.stockModifier,
      categoryStockModifiers: eventResolution.categoryStockModifiers,
      tags: eventResolution.tags,
      merchantNames: eventResolution.merchantNames,
      eventResolution
    }
  }

  const averageRelationshipWeight = relationshipTotal / activeCount
  const categoryStockModifiers = Object.fromEntries(
    Object.entries(categoryWeights).map(([category, weight]) => [
      category,
      Number(clamp(1 + (weight / activeCount) * 0.14, 1, 1.32).toFixed(3))
    ])
  ) as Partial<Record<Exclude<ShopCategoryId, 'all'>, number>>
  for (const [category, modifier] of Object.entries(eventResolution.categoryStockModifiers)) {
    const key = category as Exclude<ShopCategoryId, 'all'>
    categoryStockModifiers[key] = Number(((categoryStockModifiers[key] ?? 1) * (modifier ?? 1)).toFixed(3))
  }
  const merchantNames = [...new Set([
    ...merchants.slice(0, 2).map(merchant => merchant.name),
    ...eventResolution.merchantNames
  ])].slice(0, 3)

  return {
    priceModifier: Number(clamp((1 - Math.max(0, averageRelationshipWeight - 1) * 0.08) * eventResolution.priceModifier, 0.86, 1).toFixed(3)),
    stockModifier: Number(clamp((1 + Math.max(0, averageRelationshipWeight - 1) * 0.08) * eventResolution.stockModifier, 1, 1.24).toFixed(3)),
    categoryStockModifiers,
    tags: [...new Set(['人物商缘', ...eventResolution.tags])],
    merchantNames,
    eventResolution
  }
}

export function resolveShopCatalogEntries(context: ShopInventoryContext): ShopCatalogEntry[] {
  const baseEntries = SHOP_CATALOG.map(definition => ({
    definition,
    merchantNames: []
  }))
  const merchantEntries = resolveShopMerchantItemEntries(context)
  const eventEntries = resolveShopMerchantEventEntries(context)
  return [...baseEntries, ...merchantEntries, ...eventEntries]
}

function resolveShopMerchantEventEntries(context: ShopInventoryContext): ShopCatalogEntry[] {
  return resolveShopMerchantEvents(context.merchantNpcStates ?? []).events.flatMap(event => {
    if (!event.item) return []
    return [{
      definition: {
        ...event.item,
        description: `${event.item.description} 事件：${event.title}。`
      },
      merchantNames: [event.merchantName]
    }]
  })
}

function resolveShopMerchantItemEntries(context: ShopInventoryContext): ShopCatalogEntry[] {
  const entries: ShopCatalogEntry[] = []
  const seenIds = new Set<string>()

  for (const merchant of context.merchantNpcStates ?? []) {
    if (merchant.hpState === 'dead' || merchant.hpState === 'captured') continue
    const searchText = getMerchantSearchText(merchant)

    for (const rule of SHOP_MERCHANT_ITEM_RULES) {
      if (seenIds.has(rule.item.id)) continue
      const matched = rule.matchKeywords.some(keyword => searchText.includes(keyword))
      if (!matched) continue
      if ((rule.minFavor ?? -Infinity) > merchant.relationship.favor) continue
      if ((rule.minDebt ?? -Infinity) > merchant.relationship.debt) continue

      entries.push({
        definition: {
          ...rule.item,
          description: `${rule.item.description} 供货人：${merchant.name}。`
        },
        merchantNames: [merchant.name]
      })
      seenIds.add(rule.item.id)
    }
  }

  return entries
}

function getStock(
  definition: ShopItemDefinition,
  context: ShopInventoryContext,
  bucket: number,
  marketInfluence: ShopMarketInfluence,
  merchantInfluence: ShopMerchantInfluence
) {
  const [min, max] = definition.stockRange
  if (max <= 0) return 0

  const roll = seededWorldRoll('shop-stock', bucket, context.joinedSectId ?? 'wanderer', definition.id)
  if (min === 0 && roll > definition.refreshWeight) return 0

  const spread = Math.max(0, max - min)
  const amount = min + Math.floor(roll * (spread + 1))
  const categoryModifier = merchantInfluence.categoryStockModifiers[definition.category] ?? 1
  const influencedAmount = Math.round(amount * marketInfluence.stockModifier * merchantInfluence.stockModifier * categoryModifier)
  return Math.max(0, Math.min(max, influencedAmount))
}

function getPrice(
  definition: ShopItemDefinition,
  context: ShopInventoryContext,
  bucket: number,
  marketInfluence: ShopMarketInfluence,
  merchantInfluence: ShopMerchantInfluence
) {
  const weatherModifier = WEATHER_PRICE_MODIFIERS[context.weather] ?? 1
  const sectModifier = definition.sectIds?.includes(context.joinedSectId ?? '') ? 0.9 : 1
  const crisisModifier = context.sectWorldCondition?.status === 'rebuilding' ? 1.07 : 1
  const marketRoll = seededWorldRoll('shop-price', bucket, definition.id)
  const marketModifier = 0.94 + marketRoll * 0.14

  return Math.max(1, Math.round(
    definition.basePrice
    * weatherModifier
    * sectModifier
    * crisisModifier
    * marketInfluence.priceModifier
    * merchantInfluence.priceModifier
    * marketModifier
  ))
}

function getTags(
  definition: ShopItemDefinition,
  context: ShopInventoryContext,
  marketInfluence: ShopMarketInfluence,
  merchantInfluence: ShopMerchantInfluence,
  itemMerchantNames: string[]
) {
  const tags: string[] = []
  if (definition.sectIds?.length) {
    tags.push(definition.sectIds.includes(context.joinedSectId ?? '') ? '本宗折扣' : '宗门限定')
  }
  if (definition.minRealm) tags.push(`${definition.minRealm}起`)
  if (context.weather === 'flood' || context.weather === 'fire' || context.weather === 'storm') tags.push('灾象涨价')
  const categoryMerchantModifier = merchantInfluence.categoryStockModifiers[definition.category] ?? 1
  const merchantTags = categoryMerchantModifier > 1
    ? merchantInfluence.merchantNames.map(name => `${name}供货`)
    : []
  return [...tags, ...marketInfluence.tags, ...merchantInfluence.tags, ...merchantTags, ...itemMerchantNames.map(name => `${name}私货`)]
}

export function createShopInventory(context: ShopInventoryContext): ShopInventoryItem[] {
  const bucket = getRefreshBucket(context.totalTicks) + (context.refreshSeed ?? 0) * 1000
  const marketInfluence = resolveShopMarketInfluence(context)
  const merchantInfluence = resolveShopMerchantInfluence(context)

  return resolveShopCatalogEntries(context).flatMap(({ definition, merchantNames }) => {
    const availability = getDefinitionAvailability(definition, context)
    if (!availability.available) return []

    const stock = getStock(definition, context, bucket, marketInfluence, merchantInfluence)
    if (stock <= 0) return []

    return [{
      stockId: `${definition.id}:${bucket}`,
      definition,
      price: getPrice(definition, context, bucket, marketInfluence, merchantInfluence),
      stock,
      maxStock: definition.stockRange[1],
      tags: getTags(definition, context, marketInfluence, merchantInfluence, merchantNames),
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

export function applyShopPurchases(items: ShopInventoryItem[], purchasedByStockId: Record<string, number>) {
  return items
    .map(item => ({
      ...item,
      stock: Math.max(0, item.stock - (purchasedByStockId[item.stockId] ?? 0))
    }))
    .filter(item => item.stock > 0)
}

export function canInventoryAcceptShopItem(input: {
  item: ShopInventoryItem
  inventory: InventoryItem[]
  isInventoryFull: boolean
}) {
  if (!input.isInventoryFull) return true
  if (input.item.definition.type === 'equipment') return false

  return input.inventory.some(inventoryItem => {
    if (inventoryItem.type !== input.item.definition.type) return false
    if (inventoryItem.definitionId && input.item.definition.definitionId) {
      return inventoryItem.definitionId === input.item.definition.definitionId
    }
    return inventoryItem.name === input.item.definition.name
  })
}

export function resolveShopPurchase(input: {
  stockId: string
  inventory: ShopInventoryItem[]
  purchasedByStockId: Record<string, number>
  gold: number
  contribution: number
  playerInventory: InventoryItem[]
  isInventoryFull: boolean
}): ShopPurchaseResolution {
  const item = input.inventory.find(entry => entry.stockId === input.stockId)
  if (!item || item.stock <= 0) {
    return createPurchaseFailure('sold_out', '此物已经售罄')
  }

  if (input.gold < item.price) {
    return createPurchaseFailure('gold_shortage', '灵石不足', item)
  }

  const contributionCost = item.definition.contributionCost ?? 0
  if (input.contribution < contributionCost) {
    return createPurchaseFailure('contribution_shortage', '宗门贡献不足', item)
  }

  if (!canInventoryAcceptShopItem({
    item,
    inventory: input.playerInventory,
    isInventoryFull: input.isInventoryFull
  })) {
    return createPurchaseFailure('inventory_full', '背包已满', item)
  }

  return {
    success: true,
    reason: 'ready',
    message: `购买了 ${item.definition.name}`,
    stockId: item.stockId,
    price: item.price,
    contributionCost,
    nextPurchasedQuantity: (input.purchasedByStockId[item.stockId] ?? 0) + 1,
    purchasedItem: item,
    inventoryItem: shopItemToInventoryItem(item)
  }
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

function createPurchaseFailure(
  reason: Exclude<ShopPurchaseResolution['reason'], 'ready'>,
  message: string,
  item?: ShopInventoryItem
): ShopPurchaseResolution {
  return {
    success: false,
    reason,
    message,
    stockId: item?.stockId ?? null,
    price: item?.price ?? 0,
    contributionCost: item?.definition.contributionCost ?? 0,
    nextPurchasedQuantity: 0
  }
}
