<template>
  <ThemeButton :tone="tone" :block="block" :disabled="disabled">
    <template v-if="icon" #icon>
      <GameIcon :icon="icon" :size="16" />
    </template>
    <slot />
  </ThemeButton>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'
import ThemeButton from '@/components/theme/ThemeButton.vue'

withDefaults(defineProps<{
  icon?: string | null
  tone?: 'jade' | 'gold' | 'rose' | 'stone'
  block?: boolean
  disabled?: boolean
}>(), {
  icon: null,
  tone: 'jade',
  block: false,
  disabled: false
})
</script>
