<template>
  <GameSurface
    tone="gold"
    padding="md"
    eyebrow="后续回响"
    title="这几股风声"
    subtitle="眼前这件事之外，别的动静也在慢慢逼近。"
  >
    <div class="briefing-grid">
      <XActivityPanel
        v-for="item in items"
        :key="item.id"
        class="briefing-card"
        :eyebrow="item.badge"
        :title="item.title"
        :description="item.summary"
        :reward="item.meta"
        :tone="resolveBriefingTone(item.tone)"
        :interactive="false"
      >
        <template #icon>
          <GameIcon :icon="item.icon" :size="24" />
        </template>
        <template #action>
          <GameActionButton
            v-if="item.action"
            :tone="item.tone === 'mist' ? 'rose' : item.tone === 'gold' ? 'gold' : 'jade'"
            :disabled="item.action.disabled"
            @click="emit('action', item)"
          >
            {{ item.action.label }}
          </GameActionButton>
        </template>
      </XActivityPanel>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { XActivityPanel } from '@xianxia/ui'
import type { XTone } from '@xianxia/ui'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { WorldBriefingItem, WorldBriefingTone } from '@/world/runtime/worldBriefingResolver'

defineProps<{
  items: WorldBriefingItem[]
}>()

const emit = defineEmits<{
  action: [item: WorldBriefingItem]
}>()

function resolveBriefingTone(tone: WorldBriefingTone): XTone {
  return tone === 'mist' ? 'stone' : tone
}
</script>

<style scoped>
.briefing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.briefing-card.x-activity-panel {
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 13px;
}

.briefing-card :deep(.x-activity-panel__body) {
  padding-block: 8px;
}

.briefing-card :deep(.x-activity-panel__copy small) {
  -webkit-line-clamp: 3;
}

.briefing-card :deep(.x-activity-panel__footer) {
  min-width: 0;
}

.briefing-card :deep(.x-activity-panel__reward) {
  min-width: 0;
  overflow-wrap: anywhere;
}

.briefing-card :deep(.x-activity-panel__action) {
  min-width: 0;
  max-width: 55%;
}

.briefing-card :deep(.game-action-btn) {
  min-height: 2.45rem;
  padding-inline: 12px;
  font-size: 0.78rem;
}

@media (max-width: 480px) {
  .briefing-card.x-activity-panel {
    padding: 11px;
  }

  .briefing-card :deep(.x-activity-panel__footer) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 8px;
  }

  .briefing-card :deep(.x-activity-panel__action) {
    width: 100%;
    max-width: none;
  }

  .briefing-card :deep(.game-action-btn) {
    width: 100%;
  }
}
</style>
