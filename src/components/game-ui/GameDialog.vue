<template>
  <XDialog
    :model-value="visible"
    :title="title"
    :eyebrow="eyebrow || undefined"
    size="md"
    tone="gold"
    @close="emit('close')"
  >
    <div class="dialog-body">
      <slot />
    </div>

    <template v-if="$slots.footer" #footer>
      <div class="dialog-footer">
        <slot name="footer" />
      </div>
    </template>
  </XDialog>
</template>

<script setup lang="ts">
import { XDialog } from '@rainlotus97/ui'

defineProps<{
  visible: boolean
  title: string
  eyebrow?: string | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.dialog-body {
  min-width: 0;
  color: #345a58;
}

.dialog-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

.dialog-footer :deep(.game-action-btn) {
  flex: 1 1 160px;
  min-width: 0;
}

@media (max-width: 480px) {
  .dialog-footer {
    display: grid;
    grid-template-columns: 1fr;
  }

  .dialog-footer :deep(.game-action-btn) {
    width: 100%;
    flex-basis: auto;
  }
}
</style>
