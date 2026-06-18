<template>
  <div class="story-dialog-list">
    <button
      v-for="(dialog, index) in dialogs"
      :key="`${dialog.speaker}-${index}`"
      class="story-dialog"
      :class="{ active: activeIndex === index }"
      type="button"
      @click="$emit('select', index)"
    >
      <span class="speaker">{{ dialog.speaker }}</span>
      <span class="content">{{ dialog.content }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NpcDialog } from '@/story/types'

defineEmits<{
  select: [index: number]
}>()

defineProps<{
  dialogs: NpcDialog[]
  activeIndex: number
}>()
</script>

<style scoped>
.story-dialog-list {
  display: grid;
  gap: 10px;
}

.story-dialog {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(103, 139, 126, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.64);
  color: #35504b;
  text-align: left;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.story-dialog:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.86);
}

.story-dialog.active {
  border-color: rgba(171, 118, 43, 0.42);
  background: rgba(255, 248, 226, 0.9);
}

.speaker {
  color: #8a5c24;
  font-size: 12px;
  font-weight: 800;
}

.content {
  font-size: 14px;
  line-height: 1.7;
}
</style>
