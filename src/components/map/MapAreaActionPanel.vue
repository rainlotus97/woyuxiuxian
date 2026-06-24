<template>
  <GameSurface tone="realm" padding="md" compact>
    <div class="area-action-panel">
      <div class="action-head">
        <div>
          <span>区域处置</span>
          <strong>稳定局势</strong>
        </div>
        <small>{{ feedback ? '最近处置已写入世界日志' : '消耗体力换取区域状态变化' }}</small>
      </div>

      <div class="action-options">
        <button
          v-for="option in options"
          :key="option.kind"
          class="action-option"
          :class="`tone-${option.tone}`"
          :disabled="stamina < option.staminaCost"
          @click="$emit('act', option.kind)"
        >
          <span>{{ option.label }}</span>
          <strong>{{ option.staminaCost }} 体力</strong>
          <small>{{ option.description }}</small>
        </button>
      </div>

      <div v-if="feedback" class="action-feedback">
        <strong>{{ feedback.title }}</strong>
        <p>{{ feedback.text }}</p>
        <div class="delta-row">
          <span>稳定 {{ formatDelta(feedback.stabilityDelta) }}</span>
          <span>压力 {{ formatDelta(feedback.pressureDelta) }}</span>
        </div>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { MapAreaActionFeedback } from '@/composables/useMapAreaAction'
import type { MapAreaActionKind, MapAreaActionOption } from '@/map/runtime/mapAreaActionResolver'

defineProps<{
  options: MapAreaActionOption[]
  stamina: number
  feedback: MapAreaActionFeedback | null
}>()

defineEmits<{
  act: [kind: MapAreaActionKind]
}>()

function formatDelta(value: number) {
  if (value > 0) return `+${value}`
  return `${value}`
}
</script>

<style scoped>
.area-action-panel,
.action-feedback {
  display: grid;
  gap: 12px;
}

.action-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.action-head div {
  display: grid;
  gap: 4px;
}

.action-head span,
.action-head small,
.action-option small {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  line-height: 1.45;
}

.action-head strong {
  color: #315257;
  font-size: 14px;
}

.action-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.action-option {
  min-width: 0;
  display: grid;
  gap: 6px;
  padding: 11px;
  border-radius: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.7);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
}

.action-option:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.action-option span {
  color: #8b6226;
  font-size: 12px;
}

.action-option strong {
  color: #315257;
  font-size: 13px;
}

.action-option.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.8);
}

.action-option.tone-rose {
  border-color: rgba(198, 121, 137, 0.2);
  background: rgba(255, 245, 247, 0.78);
}

.action-feedback {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.78);
}

.action-feedback strong {
  color: #8b6226;
  font-size: 13px;
}

.action-feedback p {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.delta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.delta-row span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(73, 97, 95, 0.8);
  font-size: 10px;
}

@media (max-width: 720px) {
  .action-head {
    display: grid;
  }

  .action-options {
    grid-template-columns: 1fr;
  }
}
</style>
