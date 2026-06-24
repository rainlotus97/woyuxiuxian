<template>
  <header class="story-scene-header">
    <button class="back-button" type="button" @click="$emit('back')">退</button>
    <span v-if="mapCaption" class="scene-map">{{ mapCaption }}</span>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineEmits<{
  back: []
}>()

const props = defineProps<{
  mapName: string
  presenceLabel: string
  sceneHint?: string
}>()

const mapCaption = computed(() => {
  return props.sceneHint || props.presenceLabel || ''
})

</script>

<style scoped>
.story-scene-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 2px;
  border: 0;
  border-radius: 0;
  min-height: 20px;
}

.back-button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 252, 244, 0.16);
  color: rgba(125, 85, 37, 0.42);
  font-family: var(--font-ui);
  font-size: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 252, 244, 0.56);
  box-shadow: 0 8px 18px rgba(105, 121, 93, 0.1);
}

.scene-map {
  min-width: 0;
  max-width: min(100%, 10ch);
  color: rgba(109, 127, 123, 0.48);
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
