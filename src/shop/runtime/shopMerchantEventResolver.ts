import type { ShopCategoryId, ShopItemDefinition } from '@/shop/config/shopCatalog'
import type { ShopMerchantNpcState } from './shopInventoryResolver'

export interface ShopMerchantEvent {
  id: string
  merchantId: string
  merchantName: string
  title: string
  tag: string
  priceModifier: number
  stockModifier: number
  categoryStockModifiers: Partial<Record<Exclude<ShopCategoryId, 'all'>, number>>
  item?: ShopItemDefinition
}

export interface ShopMerchantEventResolution {
  events: ShopMerchantEvent[]
  priceModifier: number
  stockModifier: number
  categoryStockModifiers: Partial<Record<Exclude<ShopCategoryId, 'all'>, number>>
  tags: string[]
  merchantNames: string[]
}

export function resolveShopMerchantEvents(merchants: ShopMerchantNpcState[] = []): ShopMerchantEventResolution {
  const events = merchants
    .filter(merchant => merchant.hpState !== 'dead' && merchant.hpState !== 'captured')
    .flatMap(resolveMerchantEvents)
    .slice(0, 3)

  const categoryStockModifiers: ShopMerchantEventResolution['categoryStockModifiers'] = {}
  let priceModifier = 1
  let stockModifier = 1

  for (const event of events) {
    priceModifier *= event.priceModifier
    stockModifier *= event.stockModifier
    for (const [category, modifier] of Object.entries(event.categoryStockModifiers)) {
      const key = category as Exclude<ShopCategoryId, 'all'>
      categoryStockModifiers[key] = Number(((categoryStockModifiers[key] ?? 1) * (modifier ?? 1)).toFixed(3))
    }
  }

  return {
    events,
    priceModifier: Number(clamp(priceModifier, 0.86, 1.08).toFixed(3)),
    stockModifier: Number(clamp(stockModifier, 1, 1.22).toFixed(3)),
    categoryStockModifiers,
    tags: events.map(event => event.tag),
    merchantNames: events.map(event => event.merchantName)
  }
}

function resolveMerchantEvents(merchant: ShopMerchantNpcState): ShopMerchantEvent[] {
  const text = [
    merchant.title,
    merchant.constitution,
    merchant.currentGoal,
    ...merchant.tags
  ].join(' ')
  const events: ShopMerchantEvent[] = []

  if (
    /炼丹|丹修|药|medicine_body|药王谷真传/.test(text)
    && merchant.relationship.favor >= 65
  ) {
    events.push({
      id: `merchant_event_medicine_${merchant.npcId}`,
      merchantId: merchant.npcId,
      merchantName: merchant.name,
      title: `${merchant.name}开出药脉折价`,
      tag: '药脉折价',
      priceModifier: 0.95,
      stockModifier: 1.08,
      categoryStockModifiers: {
        pill: 1.12,
        food: 1.08,
        breakthrough: 1.1
      },
      item: {
        id: `merchant_event_${merchant.npcId}_jade_soup`,
        definitionId: 'food_jade_marrow_soup',
        name: '玉髓羹',
        icon: '羹',
        category: 'food',
        type: 'consumable',
        quality: 'fine',
        basePrice: 96,
        description: `${merchant.name}临时带来的温养灵食，适合闭关前调息。`,
        effects: [{ type: 'stamina', value: 25 }, { type: 'food_cultivation', value: 0.18, duration: 4 }],
        stockRange: [1, 2],
        refreshWeight: 1
      }
    })
  }

  if (
    /锻造|铸|炼器|forge|剑修|sword/.test(text)
    && merchant.relationship.favor >= 50
  ) {
    events.push({
      id: `merchant_event_forge_${merchant.npcId}`,
      merchantId: merchant.npcId,
      merchantName: merchant.name,
      title: `${merchant.name}临时开炉`,
      tag: '炉火开张',
      priceModifier: 0.98,
      stockModifier: 1.1,
      categoryStockModifiers: {
        equipment: 1.14,
        material: 1.16
      },
      item: {
        id: `merchant_event_${merchant.npcId}_tempered_iron`,
        definitionId: 'material_tempered_iron',
        name: '百炼玄铁',
        icon: '炼',
        category: 'material',
        type: 'material',
        quality: 'excellent',
        basePrice: 165,
        description: `${merchant.name}开炉后余下的精炼玄铁，适合后续炼器与强化。`,
        stockRange: [1, 3],
        refreshWeight: 1
      }
    })
  }

  if (
    /阵法|符箓|天机|推衍|void|空/.test(text)
    && merchant.relationship.debt >= 25
  ) {
    events.push({
      id: `merchant_event_array_${merchant.npcId}`,
      merchantId: merchant.npcId,
      merchantName: merchant.name,
      title: `${merchant.name}偿还阵墨人情`,
      tag: '人情赊账',
      priceModifier: 0.93,
      stockModifier: 1.04,
      categoryStockModifiers: {
        sect: 1.12,
        material: 1.1
      },
      item: {
        id: `merchant_event_${merchant.npcId}_array_ink`,
        definitionId: 'sect_secret_array_ink',
        name: '秘演阵墨',
        icon: '演',
        category: 'sect',
        type: 'material',
        quality: 'excellent',
        basePrice: 220,
        contributionCost: 20,
        description: `${merchant.name}以人情价让出的阵墨，可用于后续宗门阵法与剧情道具。`,
        stockRange: [1, 2],
        refreshWeight: 1
      }
    })
  }

  return events
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
