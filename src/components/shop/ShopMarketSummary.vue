<template>
  <div class="market-summary">
    <div class="wallet-strip">
      <div>
        <span>灵石</span>
        <strong>{{ gold }}</strong>
      </div>
      <div>
        <span>贡献</span>
        <strong>{{ contribution }}</strong>
      </div>
    </div>

    <div class="market-pulse">
      <div>
        <span>在售</span>
        <strong>{{ visibleCount }}/{{ totalCount }}</strong>
      </div>
      <div>
        <span>换货</span>
        <strong>{{ nextRefreshHint }}</strong>
      </div>
    </div>

    <div class="market-tags">
      <span v-for="tag in visibleTags" :key="tag">{{ tag }}</span>
      <span v-if="!visibleTags.length">散修市价</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  gold: number
  contribution: number
  totalCount: number
  visibleCount: number
  nextRefreshHint: string
  tags: string[]
}>()

const visibleTags = computed(() => props.tags.slice(0, 4))
</script>

<style scoped>
.market-summary {
  display: grid;
  grid-template-columns: minmax(180px, auto) minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}

.wallet-strip,
.market-pulse,
.market-tags {
  border: 1px solid rgba(189, 141, 58, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
}

.wallet-strip,
.market-pulse {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
}

.wallet-strip div,
.market-pulse div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.wallet-strip span,
.market-pulse span {
  color: rgba(95, 80, 54, 0.68);
  font-size: 11px;
}

.wallet-strip strong,
.market-pulse strong {
  color: #80602e;
  font-size: 16px;
  line-height: 1.2;
}

.market-tags {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
}

.market-tags span {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 249, 226, 0.78);
  color: #80602e;
  font-size: 11px;
}

@media (max-width: 720px) {
  .market-summary {
    grid-template-columns: 1fr;
  }
}
</style>
