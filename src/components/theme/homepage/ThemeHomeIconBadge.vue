<template>
  <XAvatarFrame
    class="theme-home-icon-badge"
    :size="badgeSize"
    :status="alert ? '!' : undefined"
    tone="jade"
    shape="round"
  >
    <span class="badge-inner">
      <slot />
    </span>
  </XAvatarFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XAvatarFrame } from '@rainlotus97/ui'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  alert?: boolean
}>(), {
  size: 'md',
  alert: false
})

const badgeSize = computed(() => ({
  sm: '2.34rem',
  md: '3.68rem',
  lg: '4.46rem'
})[props.size])
</script>

<style scoped>
.theme-home-icon-badge {
  flex: 0 0 auto;
}

.badge-inner {
  display: grid;
  place-items: center;
  width: 48%;
  height: 48%;
  color: #5e9387;
}

.badge-inner :deep(svg) {
  width: 100%;
  height: 100%;
  stroke-width: 1.9;
}
</style>
