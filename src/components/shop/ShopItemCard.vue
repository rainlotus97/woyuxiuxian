<template>
  <button
    class="shop-card"
    :class="[`quality-${item.definition.quality}`, { disabled: !canBuy }]"
    @click="$emit('select', item)"
  >
    <span class="item-icon">{{ item.definition.icon }}</span>
    <span class="item-copy">
      <span class="item-heading">
        <strong>{{ item.definition.name }}</strong>
        <em>{{ qualityLabel }}</em>
      </span>
      <span class="item-desc">{{ item.definition.description }}</span>
      <span class="item-meta">
        <span>{{ costLabel }}</span>
        <span>存货 {{ item.stock }}/{{ item.maxStock }}</span>
        <span v-if="!canBuy" class="blocked">{{ blockedReason }}</span>
      </span>
      <span v-if="item.merchantEvent" class="event-line">
        {{ item.merchantEvent.merchantName }} · {{ item.merchantEvent.title }}
      </span>
      <span v-if="item.tags.length" class="item-tags">
        <i v-for="tag in item.tags.slice(0, 4)" :key="tag">{{ tag }}</i>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'

defineEmits<{
  select: [item: ShopInventoryItem]
}>()

defineProps<{
  item: ShopInventoryItem
  canBuy: boolean
  blockedReason: string
  qualityLabel: string
  costLabel: string
}>()
</script>

<style scoped>
.shop-card {
  min-height: 138px;
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
  color: #315257;
  font-family: var(--font-game);
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
  opacity: 0.58;
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
  color: #8d6528;
  font-size: 11px;
  font-style: normal;
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

.item-meta .blocked {
  border-color: rgba(190, 95, 82, 0.2);
  background: rgba(255, 245, 242, 0.8);
  color: #9a5548;
}

.event-line {
  color: #8d6528;
  font-size: 11px;
  line-height: 1.4;
}

.quality-excellent .item-icon,
.quality-supreme .item-icon,
.quality-legendary .item-icon {
  border-color: rgba(192, 145, 59, 0.38);
  background: linear-gradient(180deg, rgba(255, 252, 230, 0.95), rgba(235, 249, 240, 0.9));
}
</style>
