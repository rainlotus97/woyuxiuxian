<template>
  <div class="inventory-view">
    <div class="game-panel">
      <h2 class="panel-title">背包</h2>
      <p class="panel-desc">携带的物品与宝物</p>

      <div class="inventory-grid">
        <div
          v-for="item in items"
          :key="item.id"
          class="item-slot"
          :class="`quality-${item.quality}`"
          @click="handleItemClick(item)"
        >
          <div class="item-icon">{{ item.icon }}</div>
          <div v-if="item.quantity > 1" class="item-quantity">x{{ item.quantity }}</div>
        </div>
        <div v-for="i in emptySlots" :key="'empty-' + i" class="item-slot empty"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { sfxItem } from '@/composables/useAudio'

const { info } = useToast()

const items = ref([
  { id: 1, name: '灵石', icon: '石', quantity: 100, quality: 'normal' },
  { id: 2, name: '聚气丹', icon: '丹', quantity: 5, quality: 'fine' },
  { id: 3, name: '玄铁剑', icon: '剑', quantity: 1, quality: 'excellent' },
  { id: 4, name: '仙草', icon: '草', quantity: 3, quality: 'supreme' }
])

const maxSlots = 20
const emptySlots = computed(() => maxSlots - items.value.length)

const handleItemClick = (item: { name: string; description?: string }) => {
  sfxItem()
  info(`选中: ${item.name}`)
}
</script>

<style scoped>
.inventory-view {
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 16px 0;
  text-align: center;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.item-slot {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease;
}

.item-slot.empty {
  border: 1px dashed rgba(107, 114, 128, 0.3);
}

.item-slot:not(.empty):hover {
  transform: scale(1.05);
}

.item-slot.quality-normal {
  border: 1px solid #6b7280;
}

.item-slot.quality-fine {
  border: 1px solid #d4976a;
  box-shadow: inset 0 0 8px rgba(212, 151, 106, 0.3);
}

.item-slot.quality-excellent {
  border: 1px solid #a8c4d4;
  box-shadow: inset 0 0 8px rgba(168, 196, 212, 0.4);
}

.item-slot.quality-supreme {
  border: 1px solid #ffd700;
  box-shadow: inset 0 0 12px rgba(255, 215, 0, 0.5);
}

.item-icon {
  font-size: 1.25rem;
}

.item-quantity {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.625rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 1px 4px;
  border-radius: 2px;
}
</style>
