<template>
  <div class="shop-toolbar">
    <div class="segmented category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="{ active: activeCategory === category.id }"
        @click="$emit('update:category', category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="market-controls">
      <label class="quality-select">
        <span>品质</span>
        <select
          :value="activeQuality"
          @change="$emit('update:quality', ($event.target as HTMLSelectElement).value as ShopQualityFilter)"
        >
          <option v-for="quality in qualities" :key="quality.id" :value="quality.id">
            {{ quality.name }}
          </option>
        </select>
      </label>

      <GameActionButton class="refresh-btn" tone="jade" icon="换" @click="$emit('refresh')">
        换货
      </GameActionButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import type { ShopCategoryId, ShopQuality } from '@/shop/config/shopCatalog'

type ShopQualityFilter = 'all' | ShopQuality

defineEmits<{
  'update:category': [category: ShopCategoryId]
  'update:quality': [quality: ShopQualityFilter]
  refresh: []
}>()

defineProps<{
  categories: Array<{ id: ShopCategoryId; name: string }>
  qualities: Array<{ id: ShopQualityFilter; name: string }>
  activeCategory: ShopCategoryId
  activeQuality: ShopQualityFilter
}>()
</script>

<style scoped>
.shop-toolbar {
  display: grid;
  gap: 12px;
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

@media (max-width: 720px) {
  .market-controls {
    align-items: stretch;
  }
}
</style>
