<template>
  <div class="inventory-panel">
    <div class="filter-row">
      <button
        v-for="filter in filters"
        :key="filter.id"
        :class="{ active: activeFilter === filter.id }"
        @click="$emit('update:activeFilter', filter.id)"
      >
        {{ filter.label }}
        <span>{{ filter.count }}</span>
      </button>
    </div>

    <div class="inventory-grid">
      <button
        v-for="item in items"
        :key="item.id"
        class="item-slot"
        :class="`quality-${item.quality}`"
        @click="$emit('select', item)"
      >
        <span>{{ item.icon }}</span>
        <b>{{ item.name }}</b>
        <em v-if="item.quantity > 1">{{ item.quantity }}</em>
      </button>
      <div
        v-for="index in visibleEmptySlots"
        :key="`empty-${index}`"
        class="item-slot empty"
      >
        <span>空</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InventoryItem } from '@/stores/playerStore'
import type { InventoryFilter } from '@/composables/useCharacterLoadout'

defineEmits<{
  'update:activeFilter': [filter: InventoryFilter]
  select: [item: InventoryItem]
}>()

const props = defineProps<{
  filters: Array<{ id: InventoryFilter; label: string; count: number }>
  activeFilter: InventoryFilter
  items: InventoryItem[]
  emptySlots: number
}>()

const visibleEmptySlots = computed(() => Math.min(props.emptySlots, 8))
</script>

<style scoped>
.inventory-panel {
  display: grid;
  gap: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-row button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  color: #55706a;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 800;
}

.filter-row button.active {
  color: #8b6326;
  background: rgba(255, 247, 218, 0.86);
  border-color: rgba(188, 141, 58, 0.26);
}

.filter-row span {
  margin-left: 6px;
  color: rgba(80, 111, 104, 0.68);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 10px;
}

.item-slot {
  position: relative;
  min-height: 98px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 7px;
  padding: 10px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  color: #345b59;
  font-family: var(--font-game);
}

.item-slot span {
  color: #8b6326;
  font-size: 24px;
  font-weight: 800;
}

.item-slot b {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.item-slot em {
  position: absolute;
  right: 8px;
  bottom: 7px;
  color: #5d756f;
  font-size: 11px;
  font-style: normal;
}

.item-slot.empty {
  border-style: dashed;
  opacity: 0.52;
}
</style>
