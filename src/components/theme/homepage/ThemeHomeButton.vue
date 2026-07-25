<template>
  <XButton
    class="theme-home-button"
    :class="`size-${size}`"
    :block="block"
    :disabled="disabled"
    :size-tone="size"
    tone="jade"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </XButton>
</template>

<script setup lang="ts">
import { XButton } from '@rainlotus97/ui'

withDefaults(defineProps<{
  block?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  block: false,
  disabled: false,
  size: 'md'
})
</script>

<style scoped>
.theme-home-button {
  max-width: 15.25rem;
}

.theme-home-button.size-sm {
  max-width: 12.75rem;
}

.theme-home-button.size-lg {
  max-width: 17rem;
}

.theme-home-button.x-button--block {
  max-width: 100%;
}
</style>
