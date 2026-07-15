<template>
  <XDialog
    :model-value="visible"
    :title="title || '提示'"
    tone="gold"
    size="md"
    @close="emit('close')"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </XDialog>
</template>

<script setup lang="ts">
import { XDialog } from '@xianxia/ui'

defineProps<{
  visible: boolean
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
:deep(.x-dialog__footer) {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
