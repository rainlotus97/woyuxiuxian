<template>
  <XButton
    class="game-action-btn"
    :tone="tone"
    :block="block"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <template v-if="icon || $slots.icon" #icon>
      <slot name="icon">
        <GameIcon v-if="icon" :icon="icon" :size="16" />
      </slot>
    </template>
    <slot />
  </XButton>
</template>

<script setup lang="ts">
import { XButton } from '@xianxia/ui'
import GameIcon from '@/components/game-ui/GameIcon.vue'

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

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.game-action-btn {
  min-width: 0;
  max-width: 100%;
  font-family: var(--font-game);
}

:global(.game-surface.compact) .game-action-btn {
  min-height: 2.7rem;
  padding-inline: 0.85rem;
  font-size: 0.88rem;
}

@media (max-width: 480px) {
  .game-action-btn {
    min-width: 0;
    padding-inline: 0.9rem;
  }
}
</style>
