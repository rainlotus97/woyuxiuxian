import { defineStore } from 'pinia'
import { computed, ref, toRaw, watchEffect } from 'vue'
import { usePlayerStore } from './playerStore'
import { useSectStore } from './sectStore'
import { useWorldStore } from './worldStore'
import {
  applyShopPurchases,
  createShopInventory,
  filterShopInventory,
  resolveShopPurchase,
  type ShopFilter,
  type ShopInventoryItem
} from '@/shop/runtime/shopInventoryResolver'
import type { ShopCategoryId, ShopQuality } from '@/shop/config/shopCatalog'

interface ShopState {
  purchasedByStockId: Record<string, number>
  refreshSeed: number
  lastManualRefreshTick: number | null
}

const STORAGE_KEY = 'woyu-xiuxian-shop'

function getDefaultShopState(): ShopState {
  return {
    purchasedByStockId: {},
    refreshSeed: 0,
    lastManualRefreshTick: null
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

  const purchasedByStockId = ref<Record<string, number>>({ ...initialData.purchasedByStockId })
  const refreshSeed = ref(initialData.refreshSeed ?? 0)
  const lastManualRefreshTick = ref<number | null>(initialData.lastManualRefreshTick ?? null)
  const activeCategory = ref<ShopCategoryId>('all')
  const activeQuality = ref<'all' | ShopQuality>('all')

  const context = computed(() => ({
    totalTicks: worldStore.clock.totalTicks,
    refreshSeed: refreshSeed.value,
    playerRealm: playerStore.realm,
    joinedSectId: sectStore.joinedSectId,
    unlockedSectIds: sectStore.unlockedSects,
    weather: worldStore.weather,
    sectWorldCondition: sectStore.worldCondition
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
      lastManualRefreshTick: lastManualRefreshTick.value
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
      playerInventory: playerStore.inventory,
      isInventoryFull: playerStore.isInventoryFull
    })
    if (!purchase.success || !purchase.inventoryItem || !purchase.purchasedItem || !purchase.stockId) {
      return { success: false, message: purchase.message }
    }

    const added = playerStore.addToInventory(purchase.inventoryItem)
    if (!added) return { success: false, message: '背包已满' }

    playerStore.gold -= purchase.price
    purchasedByStockId.value[purchase.stockId] = purchase.nextPurchasedQuantity
    return { success: true, message: purchase.message, item: purchase.purchasedItem }
  }

  function refreshMarket() {
    refreshSeed.value += 1
    lastManualRefreshTick.value = worldStore.clock.totalTicks
    purchasedByStockId.value = {}
  }

  watchEffect(() => {
    saveToStorage()
  })

  return {
    activeCategory,
    activeQuality,
    purchasedByStockId,
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
