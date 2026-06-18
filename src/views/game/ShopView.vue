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
        <div class="market-wallet">
          <span>灵石</span>
          <strong>{{ playerStore.gold }}</strong>
        </div>
      </template>

      <div class="market-toolbar">
        <div class="segmented category-tabs">
          <button
            v-for="category in SHOP_CATEGORY_OPTIONS"
            :key="category.id"
            :class="{ active: shopStore.activeCategory === category.id }"
            @click="shopStore.setFilter({ category: category.id })"
          >
            {{ category.name }}
          </button>
        </div>

        <div class="market-controls">
          <label class="quality-select">
            <span>品质</span>
            <select
              :value="shopStore.activeQuality"
              @change="shopStore.setFilter({ quality: ($event.target as HTMLSelectElement).value as typeof shopStore.activeQuality })"
            >
              <option
                v-for="quality in SHOP_QUALITY_OPTIONS"
                :key="quality.id"
                :value="quality.id"
              >
                {{ quality.name }}
              </option>
            </select>
          </label>

          <GameActionButton
            class="refresh-btn"
            tone="jade"
            icon="换"
            @click="shopStore.refreshMarket()"
          >
            换货
          </GameActionButton>
        </div>
      </div>

      <div v-if="shopStore.filteredInventory.length" class="shop-grid">
        <button
          v-for="item in shopStore.filteredInventory"
          :key="item.stockId"
          class="shop-card"
          :class="[`quality-${item.definition.quality}`, { disabled: !shopStore.canBuy(item) }]"
          @click="handleBuy(item)"
        >
          <span class="item-icon">{{ item.definition.icon }}</span>
          <span class="item-copy">
            <span class="item-heading">
              <strong>{{ item.definition.name }}</strong>
              <em>{{ SHOP_QUALITY_LABELS[item.definition.quality] }}</em>
            </span>
            <span class="item-desc">{{ item.definition.description }}</span>
            <span class="item-meta">
              <span>{{ item.price }} 灵石</span>
              <span>存货 {{ item.stock }}/{{ item.maxStock }}</span>
            </span>
            <span v-if="item.tags.length" class="item-tags">
              <i v-for="tag in item.tags" :key="tag">{{ tag }}</i>
            </span>
          </span>
        </button>
      </div>

      <div v-else class="empty-market">
        <strong>此类暂时无货</strong>
        <span>换个分类或等下一轮世界时辰刷新。</span>
      </div>
    </GameSurface>

    <GameDialog
      :visible="Boolean(selectedItem)"
      title="确认购入"
      eyebrow="坊市交易"
      @close="selectedItem = null"
    >
      <div v-if="selectedItem" class="confirm-body">
        <div class="confirm-preview" :class="`quality-${selectedItem.definition.quality}`">
          <span>{{ selectedItem.definition.icon }}</span>
          <div>
            <strong>{{ selectedItem.definition.name }}</strong>
            <p>{{ selectedItem.definition.description }}</p>
          </div>
        </div>
        <div class="confirm-stats">
          <span>价格</span>
          <strong>{{ selectedItem.price }} 灵石</strong>
          <span>库存</span>
          <strong>{{ selectedItem.stock }}</strong>
        </div>
      </div>

      <template #footer>
        <GameActionButton tone="stone" @click="selectedItem = null">取消</GameActionButton>
        <GameActionButton tone="gold" @click="confirmBuy">购买</GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useAudio, sfxSpiritStone } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/playerStore'
import { useShopStore } from '@/stores/shopStore'
import {
  SHOP_CATEGORY_OPTIONS,
  SHOP_QUALITY_LABELS,
  SHOP_QUALITY_OPTIONS
} from '@/shop/config/shopCatalog'
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'

const playerStore = usePlayerStore()
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

onMounted(() => {
  startShopBgm()
})

function handleBuy(item: ShopInventoryItem) {
  if (!shopStore.canBuy(item)) {
    warning(playerStore.gold < item.price ? '灵石不足' : '背包已满')
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

.market-wallet {
  min-width: 104px;
  display: grid;
  gap: 3px;
  justify-items: end;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(189, 141, 58, 0.2);
  color: #80602e;
}

.market-wallet span {
  font-size: 11px;
  color: rgba(95, 80, 54, 0.68);
}

.market-wallet strong {
  font-size: 18px;
}

.market-toolbar {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
}

.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(143, 172, 151, 0.18);
}

.segmented button {
  flex: 1 1 72px;
  min-height: 36px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #526f67;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 700;
}

.segmented button.active {
  background: linear-gradient(180deg, rgba(255, 248, 220, 0.98), rgba(230, 246, 237, 0.9));
  color: #966b29;
  box-shadow: 0 8px 18px rgba(134, 112, 65, 0.12);
}

.market-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.quality-select {
  flex: 1;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(132, 157, 149, 0.2);
  color: #57706c;
  font-size: 12px;
  font-weight: 700;
}

.quality-select select {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #315257;
  font-family: var(--font-game);
  font-weight: 700;
}

.refresh-btn {
  min-width: 96px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-height: min(58vh, 620px);
  overflow-y: auto;
  padding: 2px 2px 10px;
}

.shop-card {
  min-height: 132px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 12px;
  border: 1px solid rgba(118, 150, 142, 0.2);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(240, 249, 242, 0.88)),
    radial-gradient(circle at top left, rgba(248, 214, 122, 0.16), transparent 58%);
  box-shadow: 0 14px 28px rgba(83, 116, 108, 0.1);
  text-align: left;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.shop-card:hover:not(.disabled) {
  transform: translateY(-2px);
  border-color: rgba(180, 133, 52, 0.35);
  box-shadow: 0 18px 34px rgba(91, 118, 111, 0.14);
}

.shop-card.disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.item-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(119, 148, 139, 0.2);
  color: #8d6528;
  font-size: 22px;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.item-copy {
  min-width: 0;
  display: grid;
  gap: 7px;
}

.item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.item-heading strong {
  min-width: 0;
  color: #315257;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-heading em {
  flex: 0 0 auto;
  font-style: normal;
  font-size: 11px;
  color: #8d6528;
}

.item-desc {
  min-height: 34px;
  color: rgba(52, 82, 79, 0.72);
  font-size: 12px;
  line-height: 1.45;
}

.item-meta,
.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-meta span,
.item-tags i {
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(122, 151, 141, 0.16);
  color: #587069;
  font-size: 11px;
  font-style: normal;
}

.quality-excellent .item-icon,
.quality-supreme .item-icon,
.quality-legendary .item-icon {
  border-color: rgba(192, 145, 59, 0.38);
  background: linear-gradient(180deg, rgba(255, 252, 230, 0.95), rgba(235, 249, 240, 0.9));
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

.confirm-body {
  display: grid;
  gap: 14px;
}

.confirm-preview {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 12px;
  align-items: center;
}

.confirm-preview > span {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(174, 139, 68, 0.26);
  color: #8d6528;
  font-size: 24px;
  font-weight: 800;
}

.confirm-preview strong {
  color: #315257;
}

.confirm-preview p {
  margin: 5px 0 0;
  color: rgba(58, 82, 80, 0.72);
  font-size: 12px;
  line-height: 1.5;
}

.confirm-stats {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  color: #5a716d;
}

.confirm-stats strong {
  color: #8d6528;
}

@media (max-width: 720px) {
  .market-controls {
    align-items: stretch;
  }

  .shop-grid {
    grid-template-columns: 1fr;
    max-height: none;
  }

  .shop-card {
    min-height: 118px;
  }
}
</style>
