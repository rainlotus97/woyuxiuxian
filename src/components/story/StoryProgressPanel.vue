<template>
  <GameSurface tone="gold" padding="md" title="卷宗进度" :subtitle="summary">
    <div class="story-progress-panel">
      <div class="metric-grid">
        <div v-for="metric in metrics" :key="metric.label" class="metric">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
      </div>

      <div class="current-node">
        <span class="node-label">当前章回</span>
        <strong>{{ currentNodeName }}</strong>
        <small>{{ currentNodeMeta }}</small>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'

const props = defineProps<{
  perspectiveLabel: string
  loop: number
  volume: number
  completedCount: number
  totalNodes: number | string
  currentNodeName?: string | null
  currentNodeMap?: string | null
}>()

const summary = computed(() => {
  return `${props.perspectiveLabel} · 第 ${props.loop} 周目`
})

const currentNodeName = computed(() => props.currentNodeName || '尚未启程')
const currentNodeMeta = computed(() => props.currentNodeMap || '选择视角后开启本卷主线')

const metrics = computed(() => [
  { label: '当前卷', value: `第 ${props.volume} 卷` },
  { label: '已读节点', value: `${props.completedCount}` },
  { label: '本卷节点', value: `${props.totalNodes}` }
])
</script>

<style scoped>
.story-progress-panel {
  display: grid;
  gap: 14px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  display: grid;
  gap: 5px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(166, 132, 70, 0.16);
}

.metric span,
.node-label,
.current-node small {
  color: rgba(83, 87, 72, 0.64);
  font-size: 11px;
}

.metric strong {
  color: #835b22;
  font-size: 16px;
}

.current-node {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.76), rgba(242, 249, 236, 0.7)),
    linear-gradient(90deg, rgba(151, 103, 35, 0.14), transparent 45%);
  border: 1px solid rgba(148, 115, 60, 0.18);
}

.current-node strong {
  color: #35524a;
  font-size: 17px;
}

@media (max-width: 620px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
