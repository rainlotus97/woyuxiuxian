<template>
  <div
    v-if="toast.visible"
    class="toast-item"
    :class="`toast-${toast.type}`"
    @click="emit('close')"
  >
    <div class="toast-icon">
      <span v-if="toast.type === 'info'">修</span>
      <span v-else-if="toast.type === 'success'">成</span>
      <span v-else-if="toast.type === 'warning'">警</span>
      <span v-else-if="toast.type === 'error'">败</span>
    </div>
    <div class="toast-message">{{ toast.message }}</div>
  </div>
</template>

<script setup lang="ts">
import type { ToastItem } from '@/composables/useToast'

defineProps<{
  toast: ToastItem
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: var(--font-game);
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 320px;
  word-break: break-word;
}

.toast-info {
  background: linear-gradient(135deg, #3b5998 0%, #2d4373 100%);
  color: #e8e4d8;
}

.toast-success {
  background: linear-gradient(135deg, #5a9e6f 0%, #4a8e5f 100%);
  color: #e8e4d8;
}

.toast-warning {
  background: linear-gradient(135deg, #c8a45c 0%, #a8893c 100%);
  color: #1a1a1a;
}

.toast-error {
  background: linear-gradient(135deg, #c34043 0%, #a33033 100%);
  color: #e8e4d8;
}

.toast-icon {
  font-size: 0.75rem;
  opacity: 0.9;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}
</style>
