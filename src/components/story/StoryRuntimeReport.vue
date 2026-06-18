<template>
  <GameSurface tone="gold" padding="md" title="因果回写" :subtitle="report.summary">
    <div class="runtime-report">
      <div class="report-head">
        <div>
          <span>故事运行</span>
          <strong>{{ report.headline }}</strong>
        </div>
        <small>{{ report.entries.length }} 条近况</small>
      </div>

      <div class="metric-grid">
        <div v-for="metric in report.metrics" :key="metric.label" class="metric-card" :class="`tone-${metric.tone}`">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.detail }}</small>
        </div>
      </div>

      <div class="entry-list">
        <article v-for="entry in report.entries" :key="entry.id" class="report-entry" :class="`tone-${entry.tone}`">
          <strong>{{ entry.title }}</strong>
          <p>{{ entry.text }}</p>
        </article>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { StoryRunReport } from '@/story/runtime/storyRunReportResolver'

defineProps<{
  report: StoryRunReport
}>()
</script>

<style scoped>
.runtime-report {
  display: grid;
  gap: 12px;
}

.report-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.report-head div {
  display: grid;
  gap: 4px;
}

.report-head span,
.report-head small,
.metric-card span,
.metric-card small {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  line-height: 1.45;
}

.report-head strong {
  color: #8b6226;
  font-size: 15px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.64);
}

.metric-card strong {
  overflow: hidden;
  color: #315257;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.82);
}

.metric-card.tone-jade {
  border-color: rgba(99, 151, 130, 0.2);
  background: rgba(242, 252, 247, 0.82);
}

.metric-card.tone-rose {
  border-color: rgba(198, 121, 137, 0.22);
  background: rgba(255, 244, 247, 0.82);
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.report-entry {
  min-width: 0;
  display: grid;
  gap: 6px;
  padding: 11px;
  border-radius: 14px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background: rgba(252, 255, 251, 0.74);
}

.report-entry strong {
  color: #315257;
  font-size: 13px;
}

.report-entry p {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.report-entry.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.82);
}

.report-entry.tone-jade {
  border-color: rgba(99, 151, 130, 0.2);
  background: rgba(242, 252, 247, 0.82);
}

.report-entry.tone-rose {
  border-color: rgba(198, 121, 137, 0.22);
  background: rgba(255, 244, 247, 0.82);
}

@media (max-width: 820px) {
  .metric-grid,
  .entry-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .metric-grid,
  .entry-list {
    grid-template-columns: 1fr;
  }
}
</style>
