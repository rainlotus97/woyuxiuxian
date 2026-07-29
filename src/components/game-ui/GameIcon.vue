<template>
  <img
    v-if="generatedIconSrc"
    :src="generatedIconSrc"
    :width="resolvedSize"
    :height="resolvedSize"
    class="game-icon generated-game-icon"
    :class="[colorClass]"
    alt=""
    aria-hidden="true"
  />
  <component
    :is="lucideComponent"
    v-else
    :size="resolvedSize"
    :stroke-width="strokeWidth"
    class="game-icon"
    :class="[colorClass]"
    aria-hidden="true"
    focusable="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveGameIconComponent } from '@/game/theme/gameTheme'
import {
  resolveGeneratedGameIconKey,
  resolveGeneratedGameIconSource
} from '@/game/theme/generatedIconAssets'
import {
  resolveGameIconSize,
  type GameIconSizeToken
} from '@/game/theme/gameIconTokens'

const props = withDefaults(defineProps<{
  icon: string
  size?: number | GameIconSizeToken
  strokeWidth?: number
  color?: string
}>(), {
  size: 'md',
  strokeWidth: 2,
  color: ''
})

const generatedIconKey = computed(() => resolveGeneratedGameIconKey(props.icon))
const lucideComponent = computed(() => resolveGameIconComponent(generatedIconKey.value ?? props.icon))
const generatedIconSrc = computed(() => resolveGeneratedGameIconSource(props.icon))
const resolvedSize = computed(() => resolveGameIconSize(props.size))
const colorClass = computed(() => props.color ? `icon-${props.color}` : '')
</script>

<style scoped>
.game-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: currentColor;
  vertical-align: middle;
}

.generated-game-icon {
  object-fit: contain;
}
</style>
