import { defineStore } from 'pinia'
import { computed, ref, toRaw, watchEffect } from 'vue'
import { usePlayerStore } from './playerStore'
import { useSectStore } from './sectStore'
import { useWorldStore } from './worldStore'
import { useMapStore } from './mapStore'
import {
  applyShopPurchases,
  createShopInventory,
  filterShopInventory,
  resolveShopPurchase,
  type ShopFilter,
  type ShopInventoryItem
} from '@/shop/runtime/shopInventoryResolver'
import { resolveShopMerchantTradeOutcome } from '@/shop/runtime/shopMerchantLogResolver'
import {
  pruneShopMerchantMemories,
  upsertShopMerchantMemory,
  type ShopMerchantMemory
} from '@/shop/runtime/shopMerchantMemoryResolver'
import type { ShopCategoryId, ShopQuality } from '@/shop/config/shopCatalog'

interface ShopState {
  purchasedByStockId: Record<string, number>
  refreshSeed: number
  lastManualRefreshTick: number | null
  merchantMemories: ShopMerchantMemory[]
}

const STORAGE_KEY = 'woyu-xiuxian-shop'

function getDefaultShopState(): ShopState {
  return {
    purchasedByStockId: {},
    refreshSeed: 0,
    lastManualRefreshTick: null,
    merchantMemories: []
  }
}

export const useShopStore = defineStore('shop', () => {
  let initialData: ShopState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    initialData = saved ? { ...getDefaultShopState(), ...JSON.parse(saved) } : getDefaultShopState()
  } catch (error) {
    console.warn('Failed to load shop data, using defaults:', error)
    initialData = getDefaultShopState()
  }

  const playerStore = usePlayerStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const mapStore = useMapStore()

  const purchasedByStockId = ref<Record<string, number>>({ ...initialData.purchasedByStockId })
  const refreshSeed = ref(initialData.refreshSeed ?? 0)
  const lastManualRefreshTick = ref<number | null>(initialData.lastManualRefreshTick ?? null)
  const merchantMemories = ref<ShopMerchantMemory[]>(pruneShopMerchantMemories(initialData.merchantMemories ?? [], worldStore.clock.totalTicks))
  const activeCategory = ref<ShopCategoryId>('all')
  const activeQuality = ref<'all' | ShopQuality>('all')

  const context = computed(() => ({
    totalTicks: worldStore.clock.totalTicks,
    refreshSeed: refreshSeed.value,
    playerRealm: playerStore.realm,
    joinedSectId: sectStore.joinedSectId,
    unlockedSectIds: sectStore.unlockedSects,
    weather: worldStore.weather,
    sectWorldCondition: sectStore.worldCondition,
    merchantMemories: merchantMemories.value,
    merchantNpcStates: worldStore.npcStates
      .flatMap(state => {
        if (!worldStore.unlockedNpcIds.includes(state.id)) return []
        const definition = worldStore.npcDefinitions.find(item => item.id === state.id)
        if (!definition) return []
        const inCurrentRealm = mapStore.currentRealmAreas.some(area => (
          area.id === state.locationMapId || area.id === definition.homeMapId
        ))
        const relatedToSect = Boolean(
          sectStore.joinedSectId
          && (
            definition.sectId === sectStore.joinedSectId
            || state.locationMapId === sectStore.currentSect?.areaId
          )
        )
        if (!inCurrentRealm && !relatedToSect) return []
        return [{
          npcId: state.id,
          name: definition.name,
          homeMapId: definition.homeMapId,
          locationMapId: state.locationMapId,
          sectId: definition.sectId,
          title: definition.profile.title,
          tags: definition.tags,
          constitution: definition.aptitude.constitution,
          currentGoal: state.currentGoal,
          hpState: state.hpState,
          relationship: worldStore.getRelationshipState(state.id)
        }]
      }),
    marketAreaStates: mapStore.currentRealmAreas
      .filter(area => area.isUnlocked || mapStore.conqueredAreas.includes(area.id))
      .flatMap(area => {
        const state = mapStore.areaStates[area.id]
        if (!state) return []
        return [{
          areaId: state.areaId,
          controllingSectId: state.controllingSectId,
          riskLevel: state.riskLevel,
          stability: state.stability,
          pressure: state.pressure,
          contested: state.contested
        }]
      })
  }))

  const baseInventory = computed(() => createShopInventory(context.value))

  const inventory = computed<ShopInventoryItem[]>(() => {
    return applyShopPurchases(baseInventory.value, purchasedByStockId.value)
  })

  const filteredInventory = computed(() => filterShopInventory(inventory.value, {
    category: activeCategory.value,
    quality: activeQuality.value
  }))

  const nextRefreshHint = computed(() => {
    const ticksIntoCycle = worldStore.clock.totalTicks % 12
    const remaining = ticksIntoCycle === 0 ? 12 : 12 - ticksIntoCycle
    return `约 ${remaining} 个时辰后换货`
  })

  function saveToStorage() {
    const data: ShopState = {
      purchasedByStockId: toRaw(purchasedByStockId.value),
      refreshSeed: refreshSeed.value,
      lastManualRefreshTick: lastManualRefreshTick.value,
      merchantMemories: toRaw(merchantMemories.value)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function setFilter(filter: Partial<ShopFilter>) {
    if (filter.category) activeCategory.value = filter.category
    if (filter.quality) activeQuality.value = filter.quality
  }

  function canBuy(item: ShopInventoryItem) {
    return resolveShopPurchase({
      stockId: item.stockId,
      inventory: inventory.value,
      purchasedByStockId: purchasedByStockId.value,
      gold: playerStore.gold,
      contribution: sectStore.contribution,
      playerInventory: playerStore.inventory,
      isInventoryFull: playerStore.isInventoryFull
    }).success
  }

  function buy(stockId: string) {
    const purchase = resolveShopPurchase({
      stockId,
      inventory: inventory.value,
      purchasedByStockId: purchasedByStockId.value,
      gold: playerStore.gold,
      contribution: sectStore.contribution,
      playerInventory: playerStore.inventory,
      isInventoryFull: playerStore.isInventoryFull
    })
    if (!purchase.success || !purchase.inventoryItem || !purchase.purchasedItem || !purchase.stockId) {
      return { success: false, message: purchase.message }
    }

    const added = playerStore.addToInventory(purchase.inventoryItem)
    if (!added) return { success: false, message: '背包已满' }

    playerStore.gold -= purchase.price
    if (purchase.contributionCost > 0) {
      sectStore.addContribution(-purchase.contributionCost)
    }
    purchasedByStockId.value[purchase.stockId] = purchase.nextPurchasedQuantity
    const merchantOutcome = resolveShopMerchantTradeOutcome(purchase.purchasedItem, worldStore.clock.totalTicks)
    if (merchantOutcome) {
      worldStore.recordMerchantTradeEvent(merchantOutcome)
      merchantMemories.value = upsertShopMerchantMemory(
        merchantMemories.value,
        merchantOutcome.merchantMemory,
        worldStore.clock.totalTicks
      )
    }
    return { success: true, message: purchase.message, item: purchase.purchasedItem }
  }

  function refreshMarket() {
    refreshSeed.value += 1
    lastManualRefreshTick.value = worldStore.clock.totalTicks
    purchasedByStockId.value = {}
    merchantMemories.value = pruneShopMerchantMemories(merchantMemories.value, worldStore.clock.totalTicks)
  }

  watchEffect(() => {
    saveToStorage()
  })

  return {
    activeCategory,
    activeQuality,
    purchasedByStockId,
    merchantMemories,
    refreshSeed,
    lastManualRefreshTick,
    context,
    inventory,
    filteredInventory,
    nextRefreshHint,
    setFilter,
    canBuy,
    buy,
    refreshMarket
  }
})
