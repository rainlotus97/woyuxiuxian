<template>
  <div class="story-choice-list" :class="{ single: isSingleChoice }">
    <button
      v-for="(choice, index) in choices"
      :key="`${choice.text}-${index}`"
      class="story-choice"
      :class="{
        single: isSingleChoice,
        terminal: isTerminalChoice(choice),
        branch: !isSingleChoice
      }"
      type="button"
      @click="$emit('choose', index)"
    >
      <span v-if="!isSingleChoice" class="choice-index">{{ resolveChoiceMark(index, choice) }}</span>
      <span class="choice-copy">
        <small v-if="isSingleChoice" class="choice-state">{{ isTerminalChoice(choice) ? '这一截先压住' : '眼前这一步' }}</small>
        <span class="choice-text">{{ resolveChoiceText(choice) }}</span>
      </span>
      <span class="choice-tail">{{ isSingleChoice ? '›' : '去' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StoryChoice } from '@/story/types'

defineEmits<{
  choose: [index: number]
}>()

const props = defineProps<{
  choices: StoryChoice[]
}>()

const isSingleChoice = computed(() => props.choices.length === 1)

function isTerminalChoice(choice: StoryChoice) {
  return Boolean(choice.isEndMarker || choice.targetId === null)
}

function resolveChoiceMark(index: number, choice: StoryChoice) {
  if (isTerminalChoice(choice)) return '收'
  return ['壹', '贰', '叁', '肆'][index] ?? `${index + 1}`
}

function resolveChoiceText(choice: StoryChoice) {
  const text = choice.text.trim()
  if (!text) return '接着往下走'
  if (/终章待续|收束本章|本章完|章·完|卷[一二三四五六七八九十百千\d]+(?:[·•].*)?|第.+章/u.test(text)) {
    return '先把这件事压住'
  }
  return text
}
</script>

<style scoped>
.story-choice-list {
  display: grid;
  gap: 5px;
}

.story-choice-list.single {
  gap: 0;
}

.story-choice {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 30px;
  padding: 6px 8px 6px 7px;
  border: 0;
  border-left: 2px solid rgba(150, 113, 52, 0.14);
  border-radius: 0 14px 14px 0;
  background:
    linear-gradient(90deg, rgba(255, 252, 243, 0.92), rgba(245, 250, 246, 0.72));
  color: #3b544d;
  font-family: var(--font-game);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 8px 18px rgba(44, 61, 57, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.story-choice:hover {
  transform: translateX(1px);
  border-left-color: rgba(165, 122, 54, 0.36);
  background:
    linear-gradient(90deg, rgba(255, 249, 234, 0.98), rgba(245, 250, 246, 0.8));
}

.story-choice.single {
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 36px;
  padding: 6px 10px 7px 10px;
  border-left-width: 3px;
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 249, 233, 0.96), rgba(242, 248, 244, 0.9)),
    radial-gradient(circle at right center, rgba(231, 198, 122, 0.18), transparent 32%);
}

.story-choice.terminal {
  border-left-color: rgba(170, 126, 58, 0.3);
}

.story-choice.branch {
  background:
    linear-gradient(90deg, rgba(250, 252, 247, 0.92), rgba(240, 247, 243, 0.74));
}

.choice-index {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(141, 94, 29, 0.08);
  color: #8a5d23;
  font-size: 8px;
}

.choice-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.choice-state {
  color: rgba(126, 92, 39, 0.68);
  font-size: 8px;
  line-height: 1.2;
  letter-spacing: 0.08em;
}

.choice-text {
  line-height: 1.42;
  text-wrap: pretty;
}

.choice-tail {
  color: rgba(132, 98, 42, 0.48);
  font-size: 12px;
  line-height: 1;
}

@media (max-width: 560px) {
  .story-choice {
    min-height: 28px;
    padding: 5px 7px 5px 7px;
    font-size: 9px;
    gap: 7px;
  }

  .story-choice.single {
    min-height: 34px;
    padding: 6px 9px 7px;
  }

  .choice-state,
  .choice-index {
    font-size: 7px;
  }

  .choice-tail {
    font-size: 11px;
  }
}
</style>
