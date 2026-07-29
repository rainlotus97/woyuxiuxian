<template>
  <header class="story-scene-header">
    <button class="back-button" type="button" aria-label="返回修炼" title="返回修炼" @click="$emit('back')">
      <ArrowLeft :size="16" :stroke-width="1.8" />
      <span>返回</span>
    </button>
    <span v-if="mapCaption" class="scene-map">{{ mapCaption }}</span>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

defineEmits<{
  back: []
}>()

const props = defineProps<{
  mapName: string
  presenceLabel: string
  sceneHint?: string
}>()

const mapCaption = computed(() => {
  return props.sceneHint || props.presenceLabel || props.mapName || ''
})

</script>

<style scoped>
.story-scene-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: calc(42px + env(safe-area-inset-top, 0px));
  padding: calc(10px + env(safe-area-inset-top, 0px)) 4px 6px;
  border: 0;
  border-radius: 0;
}

.back-button {
  display: inline-flex;
  place-items: center;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 0 10px 0 8px;
  border: 1px solid rgba(101, 152, 145, 0.22);
  border-radius: 10px;
  background: rgba(248, 252, 248, 0.58);
  color: rgba(61, 91, 83, 0.82);
  font-family: var(--font-reading-sans), sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  background: rgba(248, 252, 248, 0.9);
  box-shadow: 0 8px 18px rgba(105, 121, 93, 0.1);
}

.scene-map {
  flex: 0 1 auto;
  min-width: 0;
  max-width: min(100%, 16ch);
  color: rgba(109, 127, 123, 0.48);
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
