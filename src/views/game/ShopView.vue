<template>
  <div class="shop-view">
    <GameSurface
      class="market-shell"
      tone="mist"
      padding="md"
      eyebrow="灵市开张"
      title="坊市"
      :subtitle="marketSubtitle"
    >
      <ShopMarketSummary
        :total-count="shopStore.inventory.length"
        :visible-count="shopStore.filteredInventory.length"
        :next-refresh-hint="shopStore.nextRefreshHint"
        @details="marketDetailOpen = true"
      />

      <ShopToolbar
        :categories="SHOP_CATEGORY_OPTIONS"
        :qualities="SHOP_QUALITY_OPTIONS"
        :active-category="shopStore.activeCategory"
        :active-quality="shopStore.activeQuality"
        @update:category="shopStore.setFilter({ category: $event })"
        @update:quality="shopStore.setFilter({ quality: $event })"
        @refresh="handleRefreshMarket"
      />

      <div class="shop-stock-heading">
        <strong>货架</strong>
        <span>{{ shopStore.filteredInventory.length }} 件可查看</span>
      </div>

      <div v-if="shopStore.filteredInventory.length" class="shop-grid" data-ui-list="shop">
        <ShopItemCard
          v-for="item in shopStore.filteredInventory"
          :key="item.stockId"
          :item="item"
          :can-buy="shopStore.canBuy(item)"
          :quality-label="SHOP_QUALITY_LABELS[item.definition.quality]"
          @select="handleSelect"
        />
      </div>

      <div v-else class="empty-market" data-ui-empty-state="shop">
        <strong>此类暂时无货</strong>
        <span>换个分类或等下一轮世界时辰刷新。</span>
      </div>
    </GameSurface>

    <ShopPurchaseDialog
      :item="selectedItem"
      :cost-label="selectedItem ? formatItemCost(selectedItem) : ''"
      :can-buy="selectedItem ? shopStore.canBuy(selectedItem) : false"
      :blocked-reason="selectedItem ? getBlockedReason(selectedItem) : ''"
      @close="selectedItem = null"
      @confirm="confirmBuy"
    />

    <GameDialog
      :visible="marketDetailOpen"
      title="本轮市况"
      eyebrow="灵市风向"
      @close="marketDetailOpen = false"
    >
      <div class="market-detail">
        <div class="market-detail-lead">
          <GameIcon icon="store" :size="24" />
          <div>
            <strong>{{ marketSubtitle }}</strong>
            <p>{{ marketDetailSummary }}</p>
          </div>
        </div>
        <div v-if="marketTags.length" class="market-detail-tags">
          <span v-for="tag in marketTags" :key="tag">{{ tag }}</span>
        </div>
        <p v-else class="market-detail-empty">本轮市况平稳，价格会随天气、商路和世界推进变化。</p>
      </div>

      <template #footer>
        <GameActionButton tone="stone" @click="marketDetailOpen = false">收起</GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import ShopItemCard from '@/components/shop/ShopItemCard.vue'
import ShopMarketSummary from '@/components/shop/ShopMarketSummary.vue'
import ShopPurchaseDialog from '@/components/shop/ShopPurchaseDialog.vue'
import ShopToolbar from '@/components/shop/ShopToolbar.vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import { sfxSpiritStone } from '@/composables/useAudio'
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
const { showItemAcquire } = useModal()
const { success, warning } = useToast()

const selectedItem = ref<ShopInventoryItem | null>(null)
const marketDetailOpen = ref(false)

const marketSubtitle = computed(() => {
  const ctx = shopStore.context
  const sectHint = ctx.joinedSectId ? '宗门渠道已接入' : '散修市价'
  return `${sectHint} · ${shopStore.inventory.length} 种货品`
})

const marketDetailSummary = computed(() => {
  if (!marketTags.value.length) return '当前没有明显的商路异动。'
  return `本轮价格受到${marketTags.value.slice(0, 2).join('、')}影响，货架会随世界推进重新结算。`
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

function handleSelect(item: ShopInventoryItem) {
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
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.market-shell {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.market-shell :deep(.x-card__content) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.market-shell :deep(.x-card__title),
.market-shell :deep(.x-card__body) {
  min-height: 0;
}

.market-shell :deep(.x-card__title) {
  flex: 0 0 auto;
  margin-bottom: 0.58rem;
}

.market-shell :deep(.x-card__body) {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  overflow: hidden;
}

.market-shell :deep(.surface-body) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex: 1 1 0;
  min-height: 0;
  gap: 0.5rem;
  overflow-y: auto;
  padding: 0.12rem 0.12rem 0.4rem;
  align-content: start;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.shop-stock-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 1.2rem;
  padding: 0.2rem 0.1rem 0;
}

.shop-stock-heading strong {
  color: #4a7068;
  font-size: 0.74rem;
}

.shop-stock-heading span {
  color: rgba(73, 97, 95, 0.62);
  font-size: 0.62rem;
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

.market-detail {
  display: grid;
  gap: 0.8rem;
}

.market-detail-lead {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: start;
  color: #4d8175;
}

.market-detail-lead > .game-icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid rgba(123, 153, 145, 0.2);
  border-radius: 0.7rem;
  background: rgba(237, 247, 239, 0.82);
}

.market-detail-lead strong {
  color: #315b57;
  font-size: 0.88rem;
}

.market-detail-lead p,
.market-detail-empty {
  margin: 0.3rem 0 0;
  color: rgba(55, 82, 80, 0.72);
  font-size: 0.74rem;
  line-height: 1.6;
}

.market-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.market-detail-tags span {
  padding: 0.34rem 0.52rem;
  border: 1px solid rgba(189, 141, 58, 0.2);
  border-radius: 999px;
  background: rgba(255, 249, 226, 0.78);
  color: #80602e;
  font-size: 0.68rem;
}

.market-detail-empty {
  padding: 0.7rem;
  border: 1px dashed rgba(123, 153, 145, 0.24);
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.46);
}

@media (min-width: 900px) {
  .shop-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
