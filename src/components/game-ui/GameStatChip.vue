<template>
  <XStatChip
    class="stat-chip"
    :class="{ compact }"
    :label="label"
    :value="value"
    :tone="tone"
  >
    <template #icon>
      <GameIcon :icon="icon" :size="14" />
    </template>
  </XStatChip>
</template>

<script setup lang="ts">
import { XStatChip } from '@xianxia/ui'
import GameIcon from '@/components/game-ui/GameIcon.vue'

withDefaults(defineProps<{
  icon: string
  label: string
  value: string | number
  tone?: 'jade' | 'gold' | 'rose'
  compact?: boolean
}>(), {
  tone: 'jade',
  compact: false
})
</script>

<style scoped>
.stat-chip {
  min-width: 0;
  max-width: 100%;
}

.stat-chip.compact {
  gap: 7px;
  min-height: 40px;
  padding: 7px 10px;
}

.stat-chip.compact :deep(.x-stat-chip__icon) {
  width: 24px;
  height: 24px;
}

.stat-chip.compact :deep(.x-stat-chip__copy strong) {
  overflow: hidden;
  max-width: 92px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
