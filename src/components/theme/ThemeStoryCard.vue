<template>
  <article class="theme-story-card" :class="[`tone-${tone}`, { compact }]" :style="cardStyle">
    <div class="card-head">
      <span v-if="tag" class="card-tag">{{ tag }}</span>
      <span v-if="progress" class="card-progress">{{ progress }}</span>
    </div>

    <strong class="card-title">{{ title }}</strong>
    <p class="card-description">{{ description }}</p>

    <div v-if="$slots.default" class="card-body">
      <slot />
    </div>

    <footer v-if="footerLabel || $slots.actions" class="card-footer">
      <span v-if="footerLabel" class="card-footer-label">{{ footerLabel }}</span>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import cardEncounterCenter from '@/assets/theme/generated/sliced/cards/card-encounter-center.png'
import cardSectionRight from '@/assets/theme/generated/sliced/cards/card-section-right.png'
import cardStoryLeft from '@/assets/theme/generated/sliced/cards/card-story-left.png'

const props = withDefaults(defineProps<{
  tag?: string | null
  progress?: string | null
  title: string
  description: string
  footerLabel?: string | null
  tone?: 'gold' | 'jade' | 'mist'
  compact?: boolean
}>(), {
  tag: null,
  progress: null,
  footerLabel: null,
  tone: 'gold',
  compact: false
})

const cardImage = computed(() => {
  if (props.tone === 'jade') return cardEncounterCenter
  if (props.tone === 'mist') return cardSectionRight
  return cardStoryLeft
})

const cardStyle = computed(() => ({
  '--card-frame': `url("${cardImage.value}")`
}))
</script>

<style scoped>
.theme-story-card {
  --card-tag-bg: rgba(255, 248, 228, 0.92);
  --card-tag-border: rgba(203, 170, 101, 0.22);
  --card-title: #6f5123;
  --card-text: rgba(60, 78, 77, 0.78);
  --card-muted: rgba(97, 114, 110, 0.72);
  --card-slice-top: 96;
  --card-slice-side: 64;
  --card-border-y: 46px;
  --card-border-x: 34px;
  position: relative;
  display: grid;
  gap: 10px;
  min-height: 360px;
  box-sizing: border-box;
  padding: 0;
  border: var(--card-border-y) solid transparent;
  border-left-width: var(--card-border-x);
  border-right-width: var(--card-border-x);
  border-image-source: var(--card-frame);
  border-image-slice: var(--card-slice-top) var(--card-slice-side) fill;
  border-image-width: var(--card-border-y) var(--card-border-x);
  border-image-repeat: stretch;
  background: transparent;
  filter: drop-shadow(0 14px 18px rgba(62, 73, 71, 0.12));
}

.theme-story-card.tone-jade {
  --card-tag-bg: rgba(239, 248, 243, 0.92);
  --card-tag-border: rgba(140, 182, 166, 0.2);
}

.theme-story-card.tone-mist {
  --card-tag-bg: rgba(244, 248, 248, 0.94);
  --card-tag-border: rgba(168, 182, 183, 0.22);
}

.theme-story-card.compact {
  min-height: 0;
}

.card-head,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin: calc(var(--card-border-y) * -1) calc(var(--card-border-x) * -1) 0;
  padding: 22px 24px 0;
}

.card-tag,
.card-progress {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
}

.card-tag {
  background: var(--card-tag-bg);
  border: 1px solid var(--card-tag-border);
  color: var(--card-muted);
}

.card-progress {
  color: var(--card-muted);
}

.card-title {
  color: var(--card-title);
  font-size: 28px;
  line-height: 1.12;
  margin-left: calc(var(--card-border-x) * -1);
  margin-right: calc(var(--card-border-x) * -1);
  padding: 0 24px;
}

.card-description,
.card-body {
  margin: 0;
  color: var(--card-text);
  line-height: 1.75;
  margin-left: calc(var(--card-border-x) * -1);
  margin-right: calc(var(--card-border-x) * -1);
  padding: 0 24px;
}

.card-footer-label {
  color: var(--card-muted);
  font-size: 12px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card-footer {
  margin-top: auto;
  margin-bottom: calc(var(--card-border-y) * -1);
  padding-bottom: 22px;
}
</style>
