<template>
  <Teleport to="body">
    <div class="toast-container toast-top">
      <TransitionGroup name="toast">
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @close="remove(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import ToastItem from './ToastItem.vue'

const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  padding: 0 16px;
  max-width: 100%;
}

.toast-top {
  top: env(safe-area-inset-top, 16px);
  padding-top: 16px;
}

/* Toast 动画 */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
