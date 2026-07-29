<template>
  <div class="shop-toolbar">
    <div class="category-actions category-tabs" aria-label="坊市分类">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="{ current: activeCategory === category.id }"
        :aria-pressed="activeCategory === category.id"
        @click="$emit('update:category', category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="market-controls">
      <div class="quality-select">
        <details ref="qualityMenu" class="quality-menu">
          <summary class="quality-menu-trigger" aria-haspopup="listbox">
            <span>品质</span>
            <strong>{{ activeQualityLabel }}</strong>
            <GameIcon icon="chevron-down" :size="15" />
          </summary>
          <div class="quality-menu-popover" role="listbox" aria-label="选择品质">
            <button
              v-for="quality in qualities"
              :key="quality.id"
              type="button"
              role="option"
              :aria-selected="activeQuality === quality.id"
              :class="{ active: activeQuality === quality.id }"
              @click="selectQuality(quality.id)"
            >
              <span>{{ quality.name }}</span>
              <GameIcon v-if="activeQuality === quality.id" icon="✓" :size="14" />
            </button>
          </div>
        </details>
        <select
          class="quality-select__native"
          :value="activeQuality"
          aria-hidden="true"
          tabindex="-1"
          @change="$emit('update:quality', ($event.target as HTMLSelectElement).value as ShopQualityFilter)"
        >
          <option v-for="quality in qualities" :key="quality.id" :value="quality.id">
            {{ quality.name }}
          </option>
        </select>
      </div>

      <GameActionButton class="refresh-btn" tone="jade" icon="refresh" @click="$emit('refresh')">
        换货
      </GameActionButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import type { ShopCategoryId, ShopQuality } from '@/shop/config/shopCatalog'

type ShopQualityFilter = 'all' | ShopQuality

const emit = defineEmits<{
  'update:category': [category: ShopCategoryId]
  'update:quality': [quality: ShopQualityFilter]
  refresh: []
}>()

const props = defineProps<{
  categories: Array<{ id: ShopCategoryId; name: string }>
  qualities: Array<{ id: ShopQualityFilter; name: string }>
  activeCategory: ShopCategoryId
  activeQuality: ShopQualityFilter
}>()

const qualityMenu = ref<HTMLDetailsElement | null>(null)
const activeQualityLabel = computed(() => (
  props.qualities.find(quality => quality.id === props.activeQuality)?.name ?? '全部品质'
))

function selectQuality(quality: ShopQualityFilter) {
  emit('update:quality', quality)
  if (qualityMenu.value) qualityMenu.value.open = false
}
</script>

<style scoped>
.shop-toolbar {
  min-width: 0;
  display: grid;
  gap: 12px;
}

.category-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.38rem;
  padding: 0.05rem;
}

.category-actions button {
  min-width: 0;
  min-height: 2.35rem;
  padding: 0 0.3rem;
  border: 1px solid rgba(123, 153, 145, 0.2);
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.54);
  color: #526f67;
  font-family: var(--font-game);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.category-actions button.current,
.category-actions button:hover {
  border-color: rgba(194, 146, 66, 0.42);
  background: rgba(255, 248, 229, 0.88);
  color: #966b29;
  box-shadow: 0 5px 12px rgba(134, 112, 65, 0.1);
}

.category-actions button:active {
  transform: translateY(1px);
}

.market-controls {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.quality-select {
  position: relative;
  min-width: 0;
}

.quality-menu {
  position: relative;
}

.quality-menu-trigger {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.8rem;
  padding: 0 0.75rem;
  border: 1px solid rgba(132, 157, 149, 0.2);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.7);
  color: #57706c;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.quality-menu-trigger::-webkit-details-marker {
  display: none;
}

.quality-menu-trigger strong {
  min-width: 0;
  overflow: hidden;
  color: #315257;
  font-family: var(--font-game);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quality-menu[open] .quality-menu-trigger {
  border-color: rgba(155, 110, 36, 0.42);
  background: rgba(255, 250, 232, 0.92);
  color: #8b6326;
}

.quality-menu-popover {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  z-index: 24;
  display: grid;
  gap: 0.18rem;
  width: min(13rem, calc(100vw - 2.5rem));
  max-height: min(18rem, 48vh);
  padding: 0.35rem;
  border: 1px solid rgba(82, 136, 120, 0.24);
  border-radius: 0.82rem;
  background: rgba(251, 255, 250, 0.98);
  box-shadow: 0 16px 34px rgba(68, 104, 96, 0.2);
  overflow-y: auto;
}

.quality-menu-popover button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.45rem;
  padding: 0 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.58rem;
  background: transparent;
  color: #4a6e66;
  font-family: var(--font-game);
  font-size: 0.74rem;
  text-align: left;
  cursor: pointer;
}

.quality-menu-popover button.active,
.quality-menu-popover button:hover {
  border-color: rgba(155, 110, 36, 0.24);
  background: rgba(255, 247, 218, 0.86);
  color: #8b6326;
}

.quality-select__native {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.refresh-btn {
  min-width: 4.35rem;
  min-height: 2.65rem;
  padding-inline: 0.55rem;
}

.refresh-btn :deep(.x-button__label) {
  white-space: nowrap;
}

@media (max-width: 720px) {
  .market-controls {
    align-items: stretch;
  }
}

@container game-stage (max-width: 360px) {
  .market-controls {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.45rem;
  }

  .refresh-btn {
    width: auto;
  }
}
</style>
