<template>
  <div class="story-choice-list">
    <button
      v-for="(choice, index) in choices"
      :key="`${choice.text}-${index}`"
      class="story-choice"
      type="button"
      @click="$emit('choose', index)"
    >
      <span class="choice-index">{{ index + 1 }}</span>
      <span>{{ choice.text }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { StoryChoice } from '@/story/types'

defineEmits<{
  choose: [index: number]
}>()

defineProps<{
  choices: StoryChoice[]
}>()
</script>

<style scoped>
.story-choice-list {
  display: grid;
  gap: 10px;
}

.story-choice {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 12px 14px;
  border: 1px solid rgba(150, 113, 52, 0.22);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 253, 241, 0.98), rgba(238, 248, 239, 0.9)),
    radial-gradient(circle at 8% 0%, rgba(186, 127, 48, 0.14), transparent 45%);
  color: #3b544d;
  font-family: var(--font-game);
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(84, 112, 101, 0.1);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.story-choice:hover {
  transform: translateY(-2px);
  border-color: rgba(172, 121, 45, 0.42);
  box-shadow: 0 16px 32px rgba(84, 112, 101, 0.16);
}

.choice-index {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(141, 94, 29, 0.12);
  color: #8a5d23;
}
</style>
