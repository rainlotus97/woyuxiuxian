<template>
  <div class="story-event-card" :class="[`tone-${data.eventTone}`, { compact }]">
    <div v-if="data.visual" class="event-visual" :class="`visual-${data.visual.type}`">
      <img :src="data.visual.src" :alt="data.visual.alt" loading="lazy" />
      <span v-if="showVisualMark" class="event-visual-mark">{{ data.visual.alt }}</span>
    </div>

    <div class="event-topline">
      <span class="event-scene">{{ compact ? compactToplineText : data.eventTypeLabel }}</span>
      <span v-if="showToplineLocation" class="event-location">{{ toplineHint }}</span>
    </div>

    <div class="event-head">
      <div class="event-mark" :title="data.perspectiveLabel">
        <span>{{ data.perspectiveIcon }}</span>
      </div>
      <div class="event-copy">
        <small v-if="showFocusLabel" class="event-focus">{{ data.focusLabel }}</small>
        <strong>{{ displayHeadline }}</strong>
        <div class="event-hook">
          <p class="lead">{{ displayHookLine }}</p>
          <p v-if="showDetailLine" class="muted">{{ data.detailLine }}</p>
        </div>
      </div>
    </div>

    <div v-if="showRail" class="event-rail">
      <span v-if="showSceneHint" class="rail-scene">{{ compact ? data.sceneHint : data.sceneHint }}</span>
      <div class="rail-copy">
        <p>{{ data.nextMoveLabel }}</p>
      </div>
    </div>

    <div class="event-foot" :class="{ compact }">
      <div v-if="compact" class="event-inline-actions" :class="{ single: !showSecondaryAction }">
        <button class="inline-primary" type="button" @click="$emit('primary')">
          <span class="inline-primary-label">{{ compactPrimaryLabel }}</span>
          <span class="inline-primary-arrow">›</span>
        </button>
        <button
          v-if="showSecondaryAction"
          class="inline-secondary"
          type="button"
          @click="$emit('secondary')"
        >
          {{ data.actions.secondary }}
        </button>
      </div>
      <div v-else class="event-actions" :class="{ single: !showSecondaryAction }">
        <GameActionButton tone="gold" icon="Sparkles" @click="$emit('primary')">
          {{ data.actions.primary }}
        </GameActionButton>
        <GameActionButton
          v-if="showSecondaryAction"
          tone="stone"
          icon="Map"
          @click="$emit('secondary')"
        >
          {{ data.actions.secondary }}
        </GameActionButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import type { StoryEventCardData } from '@/story/runtime/storyEventCardResolver'

const props = defineProps<{
  data: StoryEventCardData
  compact?: boolean
}>()

defineEmits<{
  primary: []
  secondary: []
}>()

const toplineHint = computed(() => (
  props.compact
    ? props.data.locationLabel
    : (props.data.locationLabel || props.data.sceneHint)
))
const displayHookLine = computed(() => {
  const hook = props.data.hookLine.trim()
  const location = props.data.locationLabel.trim()
  if (!props.compact || !hook || !location) return hook
  if (!props.data.headline.includes(location)) return hook

  const stripped = hook
    .replace(new RegExp(`^${location}`, 'u'), '')
    .replace(/^(这边|那边|前头|这里|那头)/u, '')
    .replace(/^(已经先|已经|先)/u, '')
    .replace(/^[，、；：\s]+/u, '')
    .trim()

  return stripped || hook
})
const displayHeadline = computed(() => {
  const headline = props.data.headline.trim()
  const location = props.data.locationLabel.trim()
  if (!props.compact || !location || !headline.startsWith(location)) return headline

  const stripped = headline.slice(location.length).replace(/^[，、；：\s]+/u, '').trim()
  return stripped || headline
})
const compactToplineText = computed(() => (
  props.data.locationLabel || props.data.focusLabel || props.data.eventTypeLabel
))
const compactPrimaryLabel = computed(() => {
  const primary = props.data.actions.primary.trim()
  if (!props.compact) return primary
  if (/继续|接着|往下|顺着/u.test(primary)) return '追上这一截'
  return primary
})
const showVisualMark = computed(() => (
  !props.compact
  || !props.data.locationLabel
  || props.data.visual?.alt !== props.data.locationLabel
))
const showToplineLocation = computed(() => (
  !!toplineHint.value
  && (
    !props.compact
    || (
      toplineHint.value !== props.data.locationLabel
      && !props.data.headline.includes(toplineHint.value)
    )
  )
))
const showFocusLabel = computed(() => (
  !!props.data.focusLabel
  && !props.compact
  && props.data.focusLabel !== props.data.eventTypeLabel
  && props.data.focusLabel !== props.data.headline
))
const showDetailLine = computed(() => (
  !!props.data.detailLine
  && props.data.detailLine !== props.data.hookLine
  && !props.compact
))
const showSceneHint = computed(() => (
  !!props.data.sceneHint
  && !props.compact
))
const showRail = computed(() => (
  !!props.data.nextMoveLabel
  && !props.compact
))
const showSecondaryAction = computed(() => Boolean(props.data.actions.secondary?.trim()))
</script>

<style scoped>
.story-event-card {
  position: relative;
  display: grid;
  gap: 6px;
  padding: 8px 8px 7px;
  border-radius: 12px;
  border: 0;
  background:
    linear-gradient(145deg, rgba(255, 252, 241, 0.74), rgba(237, 246, 240, 0.68)),
    radial-gradient(circle at top right, rgba(255, 221, 146, 0.08), transparent 58%);
  box-shadow: none;
  overflow: hidden;
}

.event-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(223, 232, 227, 0.5);
}

.event-visual img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center center;
  filter: saturate(0.94) contrast(1.02) brightness(0.94);
}

.event-visual.visual-character img {
  object-fit: contain;
  object-position: center top;
  background:
    radial-gradient(circle at top, rgba(240, 245, 255, 0.76), rgba(210, 224, 233, 0.92));
}

.event-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(240, 246, 241, 0.28) 42%, rgba(240, 246, 241, 0.68));
}

.event-visual-mark {
  position: absolute;
  left: 8px;
  bottom: 7px;
  z-index: 1;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(247, 252, 249, 0.7);
  color: rgba(84, 66, 34, 0.78);
  font-size: 8px;
  font-weight: 700;
}

.story-event-card.compact {
  gap: 4px;
  padding: 2px 0 0;
  border-radius: 0;
  background: transparent;
}

.story-event-card.compact .event-visual {
  display: none;
}

.story-event-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: linear-gradient(180deg, rgba(186, 138, 63, 0.72), rgba(104, 151, 134, 0.14));
}

.story-event-card::after {
  display: none;
}

.story-event-card.compact::after {
  display: none;
}

.story-event-card.compact::before {
  width: 2px;
  opacity: 0.88;
}

.story-event-card.tone-gold {
  border-color: rgba(194, 146, 66, 0.26);
  background:
    linear-gradient(145deg, rgba(255, 249, 230, 0.94), rgba(247, 252, 239, 0.9)),
    radial-gradient(circle at top right, rgba(255, 214, 122, 0.22), transparent 58%);
}

.story-event-card.tone-mist {
  border-color: rgba(126, 153, 181, 0.24);
  background:
    linear-gradient(145deg, rgba(247, 251, 255, 0.94), rgba(238, 247, 245, 0.9)),
    radial-gradient(circle at top right, rgba(166, 198, 224, 0.2), transparent 58%);
}

.event-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 0 1px 4px;
  border-bottom: 0;
}

.event-scene,
.event-location {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.event-scene {
  color: rgba(132, 92, 29, 0.74);
}

.event-location {
  color: rgba(71, 100, 95, 0.62);
}

.event-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 5px;
  padding-left: 4px;
}

.event-mark {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #8c6329;
  font-size: 9px;
  box-shadow: none;
}

.event-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.event-focus {
  color: rgba(91, 70, 33, 0.72);
  font-size: 9px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-copy strong {
  color: #754f21;
  font-size: 12px;
  line-height: 1.22;
  text-wrap: pretty;
}

.story-event-card.compact .event-copy strong {
  font-size: 13px;
  line-height: 1.12;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.story-event-card.compact .event-hook p {
  font-size: 9px;
  line-height: 1.28;
}

.event-hook {
  display: grid;
  gap: 2px;
}

.event-hook p {
  margin: 0;
  color: rgba(49, 82, 87, 0.86);
  line-height: 1.32;
  font-size: 9px;
  text-wrap: pretty;
}

.event-hook p.lead {
  color: rgba(49, 82, 87, 0.9);
  font-size: 9px;
  font-weight: 650;
}

.story-event-card.compact .event-hook p.lead {
  display: -webkit-box;
  overflow: hidden;
  font-size: 9px;
  line-height: 1.28;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  color: rgba(60, 89, 84, 0.8);
}

.event-hook p.muted {
  color: rgba(49, 82, 87, 0.64);
  font-size: 9px;
}

.event-rail {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 3px 0 5px;
}

.rail-scene {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.46);
  color: rgba(84, 66, 34, 0.72);
  font-size: 8px;
  line-height: 1.2;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-copy {
  min-width: 0;
  flex: 1 1 0;
}

.rail-copy p {
  margin: 0;
  color: rgba(95, 73, 36, 0.72);
  font-size: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-foot {
  display: grid;
  gap: 5px;
  padding-left: 4px;
}

.event-foot.compact {
  gap: 2px;
  padding-top: 0;
}

.story-event-card.compact .event-topline {
  padding: 0 0 0 6px;
}

.story-event-card.compact .event-location {
  display: none;
}

.story-event-card.compact .event-head,
.story-event-card.compact .event-rail,
.story-event-card.compact .event-foot {
  padding-left: 6px;
}

.story-event-card.compact .event-rail {
  padding-top: 0;
}

.story-event-card.compact .event-mark {
  width: 16px;
  height: 16px;
  font-size: 8px;
  box-shadow: none;
  background: rgba(255, 255, 255, 0.26);
}

.story-event-card.compact .event-hook {
  gap: 1px;
}

.story-event-card.compact .event-copy {
  gap: 2px;
}

.story-event-card.compact .event-actions {
  gap: 4px;
}

.event-inline-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.event-inline-actions.single {
  grid-template-columns: minmax(0, 1fr);
}

.inline-primary,
.inline-secondary {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--font-game);
  cursor: pointer;
}

.inline-primary {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
  color: #335a57;
  text-align: left;
}

.inline-primary-label {
  display: -webkit-box;
  overflow: hidden;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.inline-primary-arrow {
  flex: 0 0 auto;
  color: rgba(137, 99, 38, 0.62);
  font-size: 13px;
  line-height: 1;
}

.inline-secondary {
  color: rgba(84, 111, 108, 0.74);
  font-size: 8px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.story-event-card.compact .rail-scene {
  display: none;
}

.story-event-card.compact .rail-copy p {
  font-size: 8px;
  line-height: 1.24;
}

.event-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.event-actions.single {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 560px) {
  .story-event-card {
    padding: 10px 10px 10px;
    border-radius: 16px;
    gap: 7px;
  }

  .story-event-card.compact {
    padding: 0;
    gap: 0;
  }

  .story-event-card.compact .event-copy strong {
    font-size: 13px;
  }

  .story-event-card.compact .event-hook p.lead {
    font-size: 9px;
  }

  .event-visual {
    border-radius: 12px;
  }

  .event-mark {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    font-size: 12px;
  }

  .event-copy strong {
    font-size: 14px;
  }

  .event-focus {
    font-size: 9px;
  }

  .event-hook p {
    font-size: 10px;
    line-height: 1.45;
  }

  .event-hook p.lead {
    font-size: 11px;
  }

  .rail-copy p {
    font-size: 9px;
  }

  .story-event-card.compact .event-rail {
    padding-top: 0;
  }

  .story-event-card.compact .rail-copy p {
    font-size: 6.5px;
  }

  .inline-primary-label {
    font-size: 8px;
  }

  .inline-secondary {
    font-size: 7px;
  }
}
</style>
