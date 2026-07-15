<template>
  <GameSurface tone="realm" padding="md" title="故事回响" :subtitle="summary">
    <div class="run-summary">
      <div class="summary-strip">
        <div v-for="item in statusItems" :key="item.label" class="status-item">
          <XStatChip
            class="status-chip"
            :label="item.label"
            :value="item.value"
            :icon="item.icon"
            :tone="item.tone"
          />
          <small>{{ item.detail }}</small>
        </div>
      </div>

      <div class="effect-row">
        <span v-for="effect in effectItems" :key="effect">
          <XIcon icon="spark" size="0.85rem" />
          {{ effect }}
        </span>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon, XStatChip } from '@xianxia/ui'
import type { XIconName, XTone } from '@xianxia/ui'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { StoryBattleReplaySummary } from '@/story/runtime/storyBattleReplayArchive'

interface StatusItem {
  label: string
  value: string
  detail: string
  icon: XIconName
  tone: XTone
}

const props = defineProps<{
  perspectiveLabel: string
  selectedPerspectiveLabel: string
  loop: number
  volume: number
  completedCount: number
  totalNodes: number | string
  currentNodeName?: string | null
  currentNodeId?: string | null
  currentNodeMap?: string | null
  hasSave: boolean
  latestReplay?: StoryBattleReplaySummary | null
}>()

const summary = computed(() => {
  if (!props.hasSave) return `${props.selectedPerspectiveLabel} · 这条线还没真正动起来`
  return `${props.perspectiveLabel} · 第 ${props.volume} 段命线 · 第 ${props.loop} 轮走向`
})

const currentNodeLabel = computed(() => props.currentNodeName || props.currentNodeId || '尚未启程')
const currentNodeDetail = computed(() => props.currentNodeMap || '选定视角后，眼前这段事才会真正接上')
const progressLabel = computed(() => `${props.completedCount}/${props.totalNodes}`)

const replayLabel = computed(() => {
  if (!props.latestReplay) return '尚无战况'
  return `${props.latestReplay.resultLabel} · ${props.latestReplay.turns || 1} 手`
})

const replayDetail = computed(() => {
  if (!props.latestReplay) return '碰上剧情冲突后，会把这一战记下来'
  return props.latestReplay.title
})

const statusItems = computed<StatusItem[]>(() => [
  {
    label: '当前视角',
    value: props.hasSave ? props.perspectiveLabel : props.selectedPerspectiveLabel,
    detail: props.hasSave ? '顺着现有走向往下接' : '准备从这条线起步',
    icon: 'jade',
    tone: 'jade'
  },
  {
    label: '走到哪里',
    value: progressLabel.value,
    detail: `第 ${props.volume} 段命线 · 第 ${props.loop} 轮走向`,
    icon: 'scroll',
    tone: 'stone'
  },
  {
    label: '眼前这一段',
    value: currentNodeLabel.value,
    detail: currentNodeDetail.value,
    icon: 'map',
    tone: 'gold'
  },
  {
    label: '冲突回放',
    value: replayLabel.value,
    detail: replayDetail.value,
    icon: 'sword',
    tone: props.latestReplay?.result === 'defeat' ? 'rose' : 'jade'
  }
])

const effectItems = [
  '碰见新人物',
  '关系起变化',
  '地图会松动',
  '宗门会受影响',
  '可能撞上剧情战'
]
</script>

<style scoped>
.run-summary {
  display: grid;
  gap: 12px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.status-item {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.status-chip {
  width: 100%;
  min-width: 0;
}

.status-chip :deep(.x-stat-chip__copy),
.status-chip :deep(.x-stat-chip__copy strong) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-item small {
  overflow: hidden;
  padding-inline: 10px;
  color: rgba(53, 81, 83, 0.68);
  font-size: 11px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.effect-row span {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  border-radius: 999px;
  background: rgba(255, 250, 232, 0.68);
  color: #7b5b26;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 820px) {
  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
