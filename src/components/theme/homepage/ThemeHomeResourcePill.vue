<template>
  <XStatChip
    class="theme-home-resource-pill"
    :label="label || ''"
    :value="value"
    :suffix="suffix"
    tone="jade"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </XStatChip>
</template>

<script setup lang="ts">
import { XStatChip } from '@xianxia/ui'

defineProps<{
  value: string | number
  label?: string
  suffix?: string
}>()
</script>

<style scoped>
.theme-home-resource-pill {
  width: 100%;
  min-width: 0;
}
</style>
