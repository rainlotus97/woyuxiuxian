<template>
  <GameSurface
    tone="mist"
    padding="md"
    compact
    class="npc-activity-panel"
    eyebrow="人物动向"
    :title="totalEvents ? `${totalEvents} 条新纪闻` : '静候消息'"
    :subtitle="timeLabel"
  >
    <div class="activity-list">
      <XTaskEntry
        v-for="item in items"
        :key="item.id"
        class="npc-activity-entry"
        :title="item.title"
        :description="item.text"
        :tag="item.label"
        :reward="`${item.npcName} · ${item.timeLabel}`"
        :icon="resolveActivityIcon(item)"
        :tone="resolveActivityTone(item.tone)"
        state="active"
        :interactive="false"
      />
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { XTaskEntry } from '@rainlotus97/ui'
import type { XIconName, XTone } from '@rainlotus97/ui'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { NpcActivityInsightItem } from '@/world/runtime/npcActivityInsightResolver'

defineProps<{
  items: NpcActivityInsightItem[]
  totalEvents: number
  timeLabel: string
}>()

function resolveActivityTone(tone: NpcActivityInsightItem['tone']): XTone {
  return tone === 'mist' ? 'stone' : tone
}

function resolveActivityIcon(item: NpcActivityInsightItem): XIconName {
  if (item.tags.includes('breakthrough')) return 'cultivation'
  if (item.tags.includes('injured') || item.tags.includes('captured') || item.tags.includes('captivity')) return 'armor'
  if (item.tags.includes('relationship') || item.tags.includes('lineage')) return 'jade'
  if (item.tags.includes('scheme')) return 'scroll'
  if (item.severity === 'legendary') return 'crown'
  return 'mission'
}
</script>

<style scoped>
.npc-activity-panel {
  min-width: 0;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.npc-activity-entry {
  min-width: 0;
}

.npc-activity-entry :deep(.x-task-entry__description) {
  display: -webkit-box;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.npc-activity-entry :deep(.x-task-entry__reward) {
  overflow: hidden;
  max-width: 8rem;
  text-overflow: ellipsis;
}

.npc-activity-entry :deep(.x-task-entry__end > .x-icon) {
  display: none;
}

@media (max-width: 720px) {
  .activity-list {
    grid-template-columns: 1fr;
  }

  .npc-activity-entry :deep(.x-task-entry__reward) {
    max-width: min(32vw, 7rem);
  }
}

@media (max-width: 420px) {
  .npc-activity-entry.x-task-entry {
    gap: 8px;
    padding-inline: 10px;
  }

  .npc-activity-entry :deep(.x-task-entry__end) {
    max-width: 5.5rem;
  }

  .npc-activity-entry :deep(.x-task-entry__reward) {
    max-width: 5.5rem;
  }
}
</style>
