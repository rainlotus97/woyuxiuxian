<template>
  <button class="game-btn" :class="{ 'btn-danger': danger }" :disabled="disabled" @click="handleClick">
    <component :is="icon" v-if="icon" class="btn-icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
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
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(145deg, rgb(35 38 52) 0%, rgba(30, 32, 48, 0.9) 100%);
  color: rgb(232 228 217);
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: var(--font-game);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

.game-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(126, 184, 218, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.game-btn:hover::before {
  transform: translateX(100%);
}

.game-btn:hover {
  border-color: #7eb8da;
  box-shadow: 0 0 12px rgba(126, 184, 218, 0.3);
}

.game-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.game-btn.btn-danger:hover {
  border-color: #c34043;
  box-shadow: 0 0 12px rgba(195, 64, 67, 0.4);
}

.game-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.game-btn:disabled:hover {
  border-color: rgba(126, 184, 218, 0.3);
  box-shadow: none;
  transform: none;
}

.btn-icon {
  width: 14px;
  height: 14px;
}
</style>
