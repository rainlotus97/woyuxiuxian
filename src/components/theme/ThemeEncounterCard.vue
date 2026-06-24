<template>
  <article class="theme-encounter-card" :class="[`tone-${tone}`, { compact }]" :style="cardStyle">
    <span v-if="tag" class="encounter-tag">{{ tag }}</span>
    <strong class="encounter-title">{{ title }}</strong>
    <p class="encounter-description">{{ description }}</p>
    <small v-if="hint" class="encounter-hint">{{ hint }}</small>
    <div v-if="$slots.actions" class="encounter-actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import cardEncounterCenter from '@/assets/theme/generated/sliced/cards/card-encounter-center.png'
import cardSectionRight from '@/assets/theme/generated/sliced/cards/card-section-right.png'
import cardStoryLeft from '@/assets/theme/generated/sliced/cards/card-story-left.png'

const props = withDefaults(defineProps<{
  tag?: string | null
  title: string
  description: string
  hint?: string | null
  tone?: 'jade' | 'gold' | 'mist'
  compact?: boolean
}>(), {
  tag: null,
  hint: null,
  tone: 'jade',
  compact: false
})

const cardImage = computed(() => {
  if (props.tone === 'gold') return cardStoryLeft
  if (props.tone === 'mist') return cardSectionRight
  return cardEncounterCenter
})

const cardStyle = computed(() => ({
  '--enc-frame': `url("${cardImage.value}")`
}))
</script>

<style scoped>
.theme-encounter-card {
  --enc-tag-bg: rgba(239, 248, 243, 0.92);
  --enc-tag-border: rgba(140, 182, 166, 0.2);
  --enc-title: #5f582d;
  --enc-text: rgba(59, 79, 77, 0.78);
  --enc-muted: rgba(90, 108, 104, 0.72);
  --enc-slice-top: 88;
  --enc-slice-side: 62;
  --enc-border-y: 38px;
  --enc-border-x: 30px;
  position: relative;
  display: grid;
  gap: 10px;
  min-height: 250px;
  box-sizing: border-box;
  padding: 0;
  border: var(--enc-border-y) solid transparent;
  border-left-width: var(--enc-border-x);
  border-right-width: var(--enc-border-x);
  border-image-source: var(--enc-frame);
  border-image-slice: var(--enc-slice-top) var(--enc-slice-side) fill;
  border-image-width: var(--enc-border-y) var(--enc-border-x);
  border-image-repeat: stretch;
  background: transparent;
  filter: drop-shadow(0 12px 16px rgba(62, 73, 71, 0.1));
}

.theme-encounter-card.tone-gold {
  --enc-tag-bg: rgba(255, 248, 228, 0.92);
  --enc-tag-border: rgba(203, 170, 101, 0.22);
}

.theme-encounter-card.tone-mist {
  --enc-tag-bg: rgba(244, 248, 248, 0.94);
  --enc-tag-border: rgba(168, 182, 183, 0.22);
}

.encounter-tag {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--enc-tag-bg);
  border: 1px solid var(--enc-tag-border);
  color: var(--enc-muted);
  font-size: 12px;
  margin: calc(var(--enc-border-y) * -1) calc(var(--enc-border-x) * -1) 0;
  transform: translate(20px, 18px);
}

.encounter-title {
  color: var(--enc-title);
  font-size: 22px;
  line-height: 1.18;
  margin: 18px calc(var(--enc-border-x) * -1) 0;
  padding: 0 22px;
}

.encounter-description,
.encounter-hint {
  margin: 0;
  color: var(--enc-text);
  line-height: 1.7;
  margin-left: calc(var(--enc-border-x) * -1);
  margin-right: calc(var(--enc-border-x) * -1);
  padding: 0 22px;
}

.encounter-hint {
  color: var(--enc-muted);
  font-size: 12px;
}

.encounter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
