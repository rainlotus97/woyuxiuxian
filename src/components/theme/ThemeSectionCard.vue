<template>
  <section class="theme-section-card" :class="[`tone-${tone}`]" :style="cardStyle">
    <span v-if="eyebrow" class="section-eyebrow">{{ eyebrow }}</span>
    <strong class="section-title">{{ title }}</strong>
    <p class="section-description">{{ description }}</p>
    <div v-if="$slots.default" class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import cardEncounterCenter from '@/assets/theme/generated/sliced/cards/card-encounter-center.png'
import cardSectionRight from '@/assets/theme/generated/sliced/cards/card-section-right.png'
import cardStoryLeft from '@/assets/theme/generated/sliced/cards/card-story-left.png'

const props = withDefaults(defineProps<{
  eyebrow?: string | null
  title: string
  description: string
  tone?: 'gold' | 'jade' | 'mist' | 'plain'
}>(), {
  eyebrow: null,
  tone: 'plain'
})

const cardImage = computed(() => {
  if (props.tone === 'gold') return cardStoryLeft
  if (props.tone === 'jade') return cardEncounterCenter
  return cardSectionRight
})

const cardStyle = computed(() => ({
  '--section-frame': `url("${cardImage.value}")`
}))
</script>

<style scoped>
.theme-section-card {
  --section-slice-top: 86;
  --section-slice-side: 60;
  --section-border-y: 36px;
  --section-border-x: 28px;
  position: relative;
  display: grid;
  gap: 8px;
  min-height: 190px;
  box-sizing: border-box;
  padding: 0;
  border: var(--section-border-y) solid transparent;
  border-left-width: var(--section-border-x);
  border-right-width: var(--section-border-x);
  border-image-source: var(--section-frame);
  border-image-slice: var(--section-slice-top) var(--section-slice-side) fill;
  border-image-width: var(--section-border-y) var(--section-border-x);
  border-image-repeat: stretch;
  background: transparent;
  filter: drop-shadow(0 12px 16px rgba(62, 73, 71, 0.1));
}

.section-eyebrow {
  color: rgba(92, 106, 103, 0.72);
  font-size: 12px;
  margin: calc(var(--section-border-y) * -1) calc(var(--section-border-x) * -1) 0;
  padding: 20px 22px 0;
}

.section-title {
  color: #6f5123;
  font-size: 18px;
  line-height: 1.2;
  margin-left: calc(var(--section-border-x) * -1);
  margin-right: calc(var(--section-border-x) * -1);
  padding: 0 22px;
}

.section-description,
.section-body {
  margin: 0;
  color: rgba(60, 78, 77, 0.76);
  line-height: 1.7;
  margin-left: calc(var(--section-border-x) * -1);
  margin-right: calc(var(--section-border-x) * -1);
  padding: 0 22px;
}
</style>
