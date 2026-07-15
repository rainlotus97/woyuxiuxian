<template>
  <XActivityPanel
    class="theme-home-event-banner"
    :eyebrow="eyebrow"
    :title="title"
    :description="description"
    icon="spark"
    tone="gold"
  >
    <template #action>{{ cta }} <XIcon icon="chevron-right" size="0.9rem" /></template>
  </XActivityPanel>
</template>

<script setup lang="ts">
import { XActivityPanel, XIcon } from '@xianxia/ui'

withDefaults(defineProps<{
  eyebrow: string
  title: string
  description: string
  cta?: string
}>(), {
  cta: '前往'
})
</script>

<style scoped>
.theme-home-event-banner {
  width: 100%;
}
</style>
