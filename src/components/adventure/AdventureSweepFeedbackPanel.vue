<template>
  <GameSurface
    tone="realm"
    padding="md"
    eyebrow="历练回报"
    title="最近扫荡"
    :subtitle="feedback.result.summary"
  >
    <div class="sweep-feedback">
      <div class="sweep-stat-row">
        <GameStatChip icon="修" label="修为" :value="feedback.result.cultivationGain" tone="gold" />
        <GameStatChip icon="石" label="灵石" :value="feedback.result.goldGain" tone="jade" />
        <GameStatChip icon="险" label="态势" :value="feedback.result.riskLabel" tone="rose" />
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
}

.sweep-stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
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
}

@media (max-width: 640px) {
  .sweep-stat-row {
    grid-template-columns: 1fr;
  }
}
</style>
