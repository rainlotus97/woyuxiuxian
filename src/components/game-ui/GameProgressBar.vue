<template>
  <div class="progress-shell">
    <div class="progress-labels">
      <span>{{ label }}</span>
      <strong>{{ valueText }}</strong>
    </div>
    <XProgressBar
      class="progress-kernel"
      :value="boundedValue"
      :max="safeMax"
      :show-value="false"
      :tone="progressTone"
    />
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XProgressBar } from '@rainlotus97/ui'
import type { XTone } from '@rainlotus97/ui'

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

const safeMax = computed(() => Math.max(0, props.max))
const boundedValue = computed(() => (
  safeMax.value > 0
    ? Math.max(0, Math.min(props.current, safeMax.value))
    : 0
))
const progressTone = computed<XTone>(() => props.tone === 'sky' ? 'stone' : props.tone)
const valueText = computed(() => `${formatAmount(props.current)}/${formatAmount(props.max)}`)

function formatAmount(value: number) {
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`
  return String(Math.round(value))
}
</script>

<style scoped>
.progress-shell {
  display: grid;
  gap: 7px;
  min-width: 0;
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
  white-space: nowrap;
}

.progress-kernel :deep(.x-progress__track) {
  height: 10px;
}

.progress-shell small {
  line-height: 1.45;
  text-wrap: pretty;
}
</style>
