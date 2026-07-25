<template>
  <XAnnouncement
    v-if="toast.visible"
    class="toast-item"
    :title="toastTitle"
    :message="toast.message"
    :tone="toastTone"
    :icon="toastIcon"
    dismissible
    @close="emit('close')"
    @click="emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XAnnouncement, type XIconName, type XTone } from '@rainlotus97/ui'
import type { ToastItem } from '@/composables/useToast'

const props = defineProps<{
  toast: ToastItem
}>()

const emit = defineEmits<{
  close: []
}>()

const toastType = computed(() => props.toast.type ?? 'info')

const toastTone = computed<XTone>(() => ({
  info: 'stone',
  success: 'jade',
  warning: 'gold',
  error: 'rose'
})[toastType.value] as XTone)

const toastIcon = computed<XIconName>(() => ({
  info: 'scroll',
  success: 'spark',
  warning: 'mission',
  error: 'close'
})[toastType.value] as XIconName)

const toastTitle = computed(() => ({
  info: '修途提示',
  success: '已完成',
  warning: '请留意',
  error: '未能完成'
})[toastType.value])
</script>

<style scoped>
.toast-item {
  margin-bottom: 8px;
  pointer-events: auto;
  cursor: pointer;
  width: min(22rem, calc(100vw - 2rem));
}
</style>
