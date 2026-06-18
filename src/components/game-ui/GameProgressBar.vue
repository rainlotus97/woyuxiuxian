<template>
  <div class="progress-shell">
    <div class="progress-labels">
      <span>{{ label }}</span>
      <strong>{{ valueText }}</strong>
    </div>
    <div class="progress-track">
      <i class="progress-fill" :class="`tone-${tone}`" :style="{ width: `${clampedPercent}%` }"></i>
    </div>
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  current: number
  max: number
  hint?: string | null
  tone?: 'jade' | 'gold' | 'rose' | 'sky'
}>(), {
  hint: null,
  tone: 'gold'
})

const clampedPercent = computed(() => {
  if (props.max <= 0) return 0
  return Math.max(0, Math.min(100, (props.current / props.max) * 100))
})

const valueText = computed(() => `${formatAmount(props.current)}/${formatAmount(props.max)}`)

function formatAmount(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
</script>

<style scoped>
.progress-shell {
  display: grid;
  gap: 7px;
}

.progress-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.progress-labels span,
.progress-shell small {
  color: rgba(72, 96, 94, 0.74);
  font-size: 11px;
}

.progress-labels strong {
  color: #315257;
  font-size: 13px;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(111, 136, 133, 0.16);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(53, 76, 74, 0.18);
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.28s ease;
}

.tone-gold {
  background: linear-gradient(90deg, #f4b34f, #ffd989);
}

.tone-jade {
  background: linear-gradient(90deg, #4bc1aa, #a2e7cf);
}

.tone-rose {
  background: linear-gradient(90deg, #e67a90, #f6b0b8);
}

.tone-sky {
  background: linear-gradient(90deg, #71b7df, #b7e4ff);
}
</style>
