<template>
  <XItemArt
    v-if="resolvedArtSrc"
    class="item-art"
    data-ui-art="image"
    :icon-src="resolvedArtSrc"
    :alt="alt || label"
    :tone="tone"
    :size="size"
  />
  <span
    v-else
    class="item-art-fallback"
    data-ui-art="fallback"
    :class="`tone-${tone}`"
    :style="{ width: size, height: size }"
    role="img"
    :aria-label="alt || label"
  >
    <GameIcon :icon="icon" :size="iconSize" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XItemArt } from '@rainlotus97/ui'
import GameIcon from './GameIcon.vue'

const props = withDefaults(defineProps<{
  icon?: string
  artKey?: string
  label?: string
  alt?: string
  tone?: 'jade' | 'gold' | 'rose' | 'stone'
  size?: string
  iconSize?: number
}>(), {
  icon: '物',
  artKey: '',
  label: '物品',
  alt: '',
  tone: 'jade',
  size: '3.4rem',
  iconSize: 24
})

const assetModules = import.meta.glob('@/assets/items/**/*.{png,webp,jpg,jpeg}', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const resolvedArtSrc = computed(() => {
  if (!props.artKey) return ''
  return Object.entries(assetModules).find(([path]) => path.endsWith(props.artKey))?.[1] ?? ''
})
</script>

<style scoped>
.item-art-fallback {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(112, 153, 143, 0.24);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255, 255, 250, 0.94), rgba(231, 246, 239, 0.88));
  color: #4d8b79;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.item-art-fallback.tone-gold {
  border-color: rgba(192, 145, 59, 0.32);
  color: #9a6b27;
  background: linear-gradient(145deg, rgba(255, 252, 235, 0.96), rgba(242, 246, 229, 0.9));
}

.item-art-fallback.tone-rose {
  border-color: rgba(185, 99, 112, 0.28);
  color: #a25667;
  background: linear-gradient(145deg, rgba(255, 247, 248, 0.96), rgba(248, 235, 239, 0.9));
}

.item-art-fallback.tone-stone {
  border-color: rgba(103, 137, 145, 0.28);
  color: #5b7e86;
  background: linear-gradient(145deg, rgba(247, 252, 252, 0.96), rgba(229, 241, 243, 0.9));
}

.item-art :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
