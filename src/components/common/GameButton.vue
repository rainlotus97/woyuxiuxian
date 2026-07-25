<template>
  <XButton
    class="game-btn"
    :tone="danger ? 'rose' : 'jade'"
    size-tone="sm"
    :disabled="disabled"
    @click="handleClick"
  >
    <template v-if="icon" #icon>
      <component :is="icon" class="btn-icon" />
    </template>
    <slot />
  </XButton>
</template>

<script setup lang="ts">
import { XButton } from '@rainlotus97/ui'
import { sfxClick } from '@/composables/useAudio'
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  danger?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  sfxClick()
  emit('click')
}
</script>

<style scoped>
.game-btn {
  min-width: 7rem;
}

.btn-icon {
  width: 14px;
  height: 14px;
}
</style>
