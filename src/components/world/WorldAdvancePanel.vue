<template>
  <GameSurface tone="realm" padding="md" eyebrow="世界推演" title="一时辰流转" subtitle="手动推进一次世界时钟，立即看到主角行程、NPC 动向、区域异动与世界日志的结果。">
    <div class="advance-panel">
      <div class="advance-status">
        <div>
          <span>当前时辰</span>
          <strong>{{ timeLabel }}</strong>
        </div>
        <GameActionButton icon="map" tone="jade" :disabled="!canAdvance" @click="$emit('advance')">
          推演一时辰
        </GameActionButton>
      </div>

      <div v-if="summary" class="summary-card">
        <div class="summary-head">
          <span>第 {{ summary.tick }} 时辰</span>
          <strong>{{ summary.timeLabel }}</strong>
          <em>{{ summary.totalEvents > 0 ? `${summary.totalEvents} 条新结果` : '平稳流转' }}</em>
        </div>
        <div class="summary-list">
          <article v-for="item in summary.items" :key="item.id" class="summary-item" :class="`tone-${item.tone}`">
            <span>{{ item.label }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>

      <div v-else class="empty-summary">
        <strong>尚未手动推演</strong>
        <p>点击后会同步推进挂机、NPC 自主行动、天气、宗门与区域状态，并把新增结果汇总在这里。</p>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { WorldAdvanceSummary } from '@/composables/useWorldAdvanceSummary'

defineProps<{
  timeLabel: string
  summary: WorldAdvanceSummary | null
  canAdvance?: boolean
}>()

defineEmits<{
  advance: []
}>()
</script>

<style scoped>
.advance-panel,
.summary-card,
.summary-list,
.empty-summary {
  display: grid;
  gap: 12px;
}

.advance-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.advance-status div,
.summary-head {
  display: grid;
  gap: 4px;
}

.advance-status span,
.summary-head span,
.summary-head em,
.summary-item span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  font-style: normal;
}

.advance-status strong,
.summary-head strong,
.empty-summary strong {
  color: #315257;
  font-size: 14px;
}

.summary-card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.56);
}

.summary-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-item,
.empty-summary {
  min-width: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(252, 255, 251, 0.78);
}

.summary-item {
  display: grid;
  gap: 6px;
}

.summary-item strong {
  color: #315257;
  font-size: 13px;
  line-height: 1.35;
}

.summary-item p,
.empty-summary p {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.summary-item.tone-gold {
  border-color: rgba(194, 146, 66, 0.24);
  background: rgba(255, 250, 236, 0.82);
}

.summary-item.tone-rose {
  border-color: rgba(198, 121, 137, 0.22);
  background: rgba(255, 244, 247, 0.82);
}

.summary-item.tone-mist {
  border-color: rgba(119, 158, 178, 0.18);
  background: rgba(247, 253, 255, 0.78);
}

@media (max-width: 720px) {
  .advance-status {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-list {
    grid-template-columns: 1fr;
  }
}
</style>
