<template>
  <button
    class="shop-card"
    data-ui-card="shop-item"
    type="button"
    :class="[`quality-${item.definition.quality}`, { disabled: !canBuy }]"
    @click="$emit('select', item)"
  >
    <span class="shop-card-topline">
      <span class="item-quality">{{ qualityLabel }}</span>
      <span class="item-stock">{{ item.stock }}/{{ item.maxStock }}</span>
    </span>
    <ItemArt
      class="shop-card-art"
      :icon="item.definition.icon"
      :art-key="item.definition.artKey"
      :label="item.definition.name"
      :tone="item.definition.quality === 'legendary' ? 'gold' : 'jade'"
      size="3.1rem"
      :icon-size="22"
    />
    <strong class="item-name">{{ item.definition.name }}</strong>
    <span class="shop-card-bottomline">
      <span class="item-cost">{{ item.price }} 灵石</span>
      <GameIcon class="shop-card-arrow" icon="chevron-right" :size="14" />
    </span>
  </button>
</template>

<script setup lang="ts">
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'
import ItemArt from '@/components/game-ui/ItemArt.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'

defineEmits<{
  select: [item: ShopInventoryItem]
}>()

defineProps<{
  item: ShopInventoryItem
  canBuy: boolean
  qualityLabel: string
}>()
</script>

<style scoped>
.shop-card {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 8rem;
  display: grid;
  grid-template-rows: auto 3.1rem minmax(1.1rem, auto) auto;
  gap: 0.28rem;
  align-content: start;
  justify-items: center;
  padding: 0.58rem 0.48rem 0.5rem;
  border: 1.5px solid rgba(118, 150, 142, 0.24);
  border-radius: 0.9rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(240, 249, 242, 0.88)),
    radial-gradient(circle at top left, rgba(248, 214, 122, 0.16), transparent 58%);
  box-shadow: 0 8px 18px rgba(83, 116, 108, 0.08);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  text-wrap: pretty;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.shop-card:hover:not(.disabled) {
  transform: translateY(-1px);
  border-color: rgba(180, 133, 52, 0.58);
  box-shadow: 0 12px 24px rgba(91, 118, 111, 0.14);
}

.shop-card.disabled {
  opacity: 0.68;
}

.shop-card-topline,
.shop-card-bottomline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}

.shop-card-topline {
  gap: 0.3rem;
}

.item-quality,
.item-stock {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-quality {
  color: #80602e;
  font-size: 0.6rem;
}

.item-stock {
  color: rgba(73, 97, 95, 0.58);
  font-size: 0.58rem;
}

.shop-card-art {
  display: grid;
  place-items: center;
  width: 3.1rem;
  height: 3.1rem;
}

.shop-card :deep(.item-art-fallback) {
  border-radius: 0.78rem;
  font-size: 22px;
  font-weight: 800;
}

.item-name {
  display: block;
  width: 100%;
  min-width: 0;
  color: #315257;
  font-size: 0.76rem;
  line-height: 1.3;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-cost {
  color: #8d6528;
  font-size: 0.64rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.shop-card-arrow {
  color: #78968b;
}

.quality-common {
  border-color: rgba(118, 150, 142, 0.25);
}

.quality-fine {
  border-color: rgba(76, 163, 121, 0.46);
}

.quality-excellent {
  border-color: rgba(88, 139, 190, 0.5);
}

.quality-supreme {
  border-color: rgba(143, 105, 179, 0.54);
}

.quality-legendary {
  border-color: rgba(192, 145, 59, 0.64);
  background:
    linear-gradient(180deg, rgba(255, 252, 230, 0.96), rgba(240, 248, 236, 0.9)),
    radial-gradient(circle at top, rgba(248, 214, 122, 0.2), transparent 62%);
}

.quality-excellent .item-quality {
  color: #557fa8;
}

.quality-supreme .item-quality {
  color: #8060a1;
}

.quality-legendary .item-quality {
  color: #9b6e24;
}

@container game-stage (max-width: 350px) {
  .shop-card {
    min-height: 7.4rem;
    grid-template-rows: auto 2.8rem minmax(1.1rem, auto) auto;
  }

  .shop-card-art {
    width: 2.8rem;
    height: 2.8rem;
  }
}
</style>
