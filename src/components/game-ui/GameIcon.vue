<template>
  <component
    :is="iconComponent"
    v-if="hasIcon"
    :size="size"
    :stroke-width="strokeWidth"
    class="game-icon"
    :class="[colorClass]"
    aria-hidden="true"
    focusable="false"
  />
  <span v-else class="game-icon-fallback" :class="[colorClass]" aria-hidden="true">{{ icon }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveGameIconComponent, hasGameIcon } from '@/game/theme/gameTheme'

const props = withDefaults(defineProps<{
  icon: string
  size?: number
  strokeWidth?: number
  color?: string
}>(), {
  size: 16,
  strokeWidth: 2,
  color: ''
})

const iconComponent = computed(() => resolveGameIconComponent(props.icon))
const hasIcon = computed(() => hasGameIcon(props.icon))
const colorClass = computed(() => props.color ? `icon-${props.color}` : '')
</script>

<style scoped>
.game-icon, .game-icon-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
.game-icon-fallback {
  font-size: 14px;
  line-height: 1;
}
</style>
