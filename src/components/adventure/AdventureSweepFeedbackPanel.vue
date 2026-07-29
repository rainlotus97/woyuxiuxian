<template>
  <GameSurface
    tone="realm"
    padding="md"
    compact
    class="sweep-feedback-panel"
  >
    <div class="sweep-feedback">
      <XAnnouncement
        class="sweep-summary"
        eyebrow="历练回报"
        title="最近扫荡"
        :message="feedback.result.summary"
        icon="gift"
        tone="gold"
      />
      <div class="sweep-stat-row">
        <GameStatChip icon="cultivation" label="修为" :value="feedback.result.cultivationGain" tone="gold" />
        <GameStatChip icon="spirit-stone" label="灵石" :value="feedback.result.goldGain" tone="jade" />
        <GameStatChip icon="Crosshair" label="态势" :value="feedback.result.riskLabel" tone="rose" />
      </div>
      <div class="sweep-drops">
        <span>掉落</span>
        <strong v-if="feedback.dropMessages.length === 0">未获得额外物品</strong>
        <strong v-else>{{ feedback.dropMessages.slice(0, 4).join('、') }}</strong>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { XAnnouncement } from '@rainlotus97/ui'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { AdventureSweepFeedback } from '@/composables/useAdventureSweep'

defineProps<{
  feedback: AdventureSweepFeedback
}>()
</script>

<style scoped>
.sweep-feedback {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.sweep-summary {
  min-width: 0;
}

.sweep-stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}

.sweep-stat-row :deep(.x-stat-chip) {
  width: 100%;
  min-width: 0;
}

.sweep-drops {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
}

.sweep-drops span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.sweep-drops strong {
  color: #315257;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

@media (max-width: 720px) {
  .sweep-stat-row {
    grid-template-columns: 1fr;
  }

  .sweep-drops {
    min-width: 0;
    padding: 10px;
  }
}
</style>
