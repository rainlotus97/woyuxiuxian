<template>
  <div class="shop-view">
    <GameSurface
      class="market-shell"
      tone="gold"
      padding="lg"
      eyebrow="灵市开张"
      title="坊市"
      :subtitle="marketSubtitle"
    >
      <template #header>
        <ShopMarketSummary
          :gold="playerStore.gold"
          :contribution="sectStore.contribution"
          :total-count="shopStore.inventory.length"
          :visible-count="shopStore.filteredInventory.length"
          :next-refresh-hint="shopStore.nextRefreshHint"
          :tags="marketTags"
        />
      </template>

      <ShopToolbar
        :categories="SHOP_CATEGORY_OPTIONS"
        :qualities="SHOP_QUALITY_OPTIONS"
        :active-category="shopStore.activeCategory"
        :active-quality="shopStore.activeQuality"
        @update:category="shopStore.setFilter({ category: $event })"
        @update:quality="shopStore.setFilter({ quality: $event })"
        @refresh="handleRefreshMarket"
      />

      <div v-if="shopStore.filteredInventory.length" class="shop-grid">
        <ShopItemCard
          v-for="item in shopStore.filteredInventory"
          :key="item.stockId"
          :item="item"
          :can-buy="shopStore.canBuy(item)"
          :blocked-reason="getBlockedReason(item)"
          :quality-label="SHOP_QUALITY_LABELS[item.definition.quality]"
          :cost-label="formatItemCost(item)"
          @select="handleBuy"
        />
      </div>

      <div v-else class="empty-market">
        <strong>此类暂时无货</strong>
        <span>换个分类或等下一轮世界时辰刷新。</span>
      </div>
    </GameSurface>

    <ShopPurchaseDialog
      :item="selectedItem"
      :cost-label="selectedItem ? formatItemCost(selectedItem) : ''"
      @close="selectedItem = null"
      @confirm="confirmBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import ShopItemCard from '@/components/shop/ShopItemCard.vue'
import ShopMarketSummary from '@/components/shop/ShopMarketSummary.vue'
import ShopPurchaseDialog from '@/components/shop/ShopPurchaseDialog.vue'
import ShopToolbar from '@/components/shop/ShopToolbar.vue'
import { useAudio, sfxSpiritStone } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useShopStore } from '@/stores/shopStore'
import {
  SHOP_CATEGORY_OPTIONS,
  SHOP_QUALITY_LABELS,
  SHOP_QUALITY_OPTIONS
} from '@/shop/config/shopCatalog'
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const shopStore = useShopStore()
const { startShopBgm } = useAudio()
const { showItemAcquire } = useModal()
const { success, warning } = useToast()

const selectedItem = ref<ShopInventoryItem | null>(null)

const marketSubtitle = computed(() => {
  const ctx = shopStore.context
  const sectHint = ctx.joinedSectId ? '宗门渠道已接入' : '散修市价'
  return `${sectHint} · ${shopStore.nextRefreshHint} · ${shopStore.inventory.length} 种在售`
})

const marketTags = computed(() => {
  const tags = new Set<string>()
  for (const item of shopStore.inventory) {
    item.tags.slice(0, 2).forEach(tag => tags.add(tag))
    if (item.merchantEvent) tags.add('人物私货')
  }
  if (sectStore.joinedSectId) tags.add('宗门渠道')
  return [...tags]
})

onMounted(() => {
  startShopBgm()
})

function handleBuy(item: ShopInventoryItem) {
  if (!shopStore.canBuy(item)) {
    warning(getBlockedReason(item))
    return
  }
  selectedItem.value = item
}

function confirmBuy() {
  if (!selectedItem.value) return

  const result = shopStore.buy(selectedItem.value.stockId)
  if (!result.success || !result.item) {
    warning(result.message)
    selectedItem.value = null
    return
  }

  sfxSpiritStone()
  success(result.message)
  showItemAcquire({
    name: result.item.definition.name,
    quantity: 1,
    quality: result.item.definition.quality as 'normal' | 'fine' | 'excellent' | 'supreme',
    icon: result.item.definition.icon
  })
  selectedItem.value = null
}

function handleRefreshMarket() {
  shopStore.refreshMarket()
  success('坊市货架已换新')
}

function formatItemCost(item: ShopInventoryItem) {
  const parts = [`${item.price} 灵石`]
  if (item.definition.contributionCost) parts.push(`${item.definition.contributionCost} 贡献`)
  return parts.join(' · ')
}

function getBlockedReason(item: ShopInventoryItem) {
  if (playerStore.gold < item.price) return '灵石不足'
  if ((item.definition.contributionCost ?? 0) > sectStore.contribution) return '宗门贡献不足'
  return '背包已满'
}
</script>

<style scoped>
.shop-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.market-shell {
  flex: 1;
  min-height: 0;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-height: min(58vh, 620px);
  overflow-y: auto;
  padding: 2px 2px 10px;
}

.empty-market {
  min-height: 180px;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  color: rgba(49, 82, 87, 0.66);
  border: 1px dashed rgba(123, 153, 145, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.42);
}

.empty-market strong {
  color: #8d6528;
}

@media (max-width: 720px) {
  .shop-grid {
    grid-template-columns: 1fr;
    max-height: none;
  }
}
</style>
