<template>
  <Transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
      <GameSurface class="dialog-card" tone="gold" padding="lg">
        <template #header>
          <div class="dialog-header">
            <div class="dialog-copy">
              <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
              <strong>{{ title }}</strong>
            </div>
            <button class="dialog-close" @click="$emit('close')">×</button>
          </div>
        </template>

        <div class="dialog-body">
          <slot />
        </div>

        <template v-if="$slots.footer" #footer>
          <div class="dialog-footer">
            <slot name="footer" />
          </div>
        </template>
      </GameSurface>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import GameSurface from './GameSurface.vue'

defineProps<{
  visible: boolean
  title: string
  eyebrow?: string | null
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(165, 194, 186, 0.28);
  backdrop-filter: blur(8px);
}

.dialog-card {
  width: min(420px, calc(100vw - 36px));
  max-height: min(86vh, 720px);
}

.dialog-header {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.dialog-copy {
  display: grid;
  gap: 3px;
}

.dialog-copy .eyebrow {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.dialog-copy strong {
  color: #8e6227;
  font-size: 18px;
}

.dialog-close {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(134, 157, 149, 0.24);
  background: rgba(255, 255, 255, 0.76);
  color: #67807f;
  font-size: 18px;
}

.dialog-body {
  max-height: min(58vh, 520px);
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: stretch;
}

.dialog-footer :deep(.game-action-btn) {
  flex: 1 1 160px;
  min-width: 0;
}

@media (max-width: 480px) {
  .dialog-overlay {
    padding: 12px;
  }

  .dialog-card {
    width: min(100vw - 24px, 420px);
  }

  .dialog-copy strong {
    font-size: 17px;
    line-height: 1.2;
  }

  .dialog-footer {
    display: grid;
    grid-template-columns: 1fr;
  }

  .dialog-footer :deep(.game-action-btn) {
    width: 100%;
    flex-basis: auto;
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
