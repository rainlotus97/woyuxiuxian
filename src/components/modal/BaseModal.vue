<template>
  <Transition name="modal-fade">
    <div
      v-if="visible"
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <div class="modal-container">
        <div v-if="title" class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-container {
  background: linear-gradient(145deg, #2b2d3c 0%, #1e2030 100%);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 4px;
  max-width: 420px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid rgba(200, 164, 92, 0.2);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-accent-warm);
  text-align: center;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  max-height: 60vh;
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(200, 164, 92, 0.2);
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 模态框动画 */
.modal-fade-enter-active {
  animation: modal-in 0.25s ease-out;
}

.modal-fade-leave-active {
  animation: modal-out 0.2s ease-in;
}

@keyframes modal-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
