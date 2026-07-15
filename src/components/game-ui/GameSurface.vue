<template>
  <XCard
    class="game-surface"
    :class="[
      `tone-${tone}`,
      `padding-${padding}`,
      { clickable, compact }
    ]"
    :tone="cardTone"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyboardClick"
    @keydown.space.prevent="handleKeyboardClick"
  >
    <template #background>
      <span class="surface-texture" aria-hidden="true"></span>
    </template>

    <template v-if="hasHeader" #title>
      <header class="surface-header">
        <div v-if="eyebrow || title || subtitle" class="surface-copy">
          <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
          <strong v-if="title">{{ title }}</strong>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <slot name="header" />
      </header>
    </template>

    <template #content>
      <div class="surface-body">
        <slot />
      </div>
    </template>

    <template v-if="hasFooter" #footer>
      <footer class="surface-footer">
        <slot name="footer" />
      </footer>
    </template>
  </XCard>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, useSlots } from 'vue'
import { XCard } from '@xianxia/ui'

const props = withDefaults(defineProps<{
  eyebrow?: string | null
  title?: string | null
  subtitle?: string | null
  tone?: 'jade' | 'gold' | 'mist' | 'realm'
  padding?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  compact?: boolean
}>(), {
  eyebrow: null,
  title: null,
  subtitle: null,
  tone: 'jade',
  padding: 'md',
  clickable: false,
  compact: false
})

const slots = useSlots()
const instance = getCurrentInstance()
const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

const cardTone = computed<'jade' | 'gold' | 'mist' | 'rose'>(() => (
  props.tone === 'realm' ? 'jade' : props.tone
))
const hasHeader = computed(() => Boolean(props.eyebrow || props.title || props.subtitle || slots.header))
const hasFooter = computed(() => Boolean(slots.footer))
const isInteractive = computed(() => props.clickable && Boolean(instance?.vnode.props?.onClick))

function handleClick(event: MouseEvent) {
  if (props.clickable) emit('click', event)
}

function handleKeyboardClick(event: KeyboardEvent) {
  if (props.clickable) emit('click', event)
}
</script>

<style scoped>
.game-surface {
  --surface-title: var(--theme-surface-title, #8e6227);
  --surface-text: var(--theme-surface-text, #325154);
  --surface-muted: var(--theme-surface-muted, rgba(67, 92, 90, 0.72));
  width: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 20px;
  font-family: var(--font-game);
}

.game-surface.tone-realm {
  --surface-title: #47776e;
  --surface-text: #315b57;
}

.surface-texture {
  display: block;
  width: 100%;
  height: 100%;
  background-image: var(--theme-surface-image, none);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.game-surface :deep(.x-card__content) {
  gap: 0;
  min-height: 0;
}

.game-surface :deep(.x-card__title) {
  display: block;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  letter-spacing: normal;
}

.game-surface :deep(.x-card__body) {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

.game-surface :deep(.x-card__footer) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.game-surface.padding-sm :deep(.x-card__content) {
  padding: 12px;
}

.game-surface.padding-md :deep(.x-card__content) {
  padding: 16px;
}

.game-surface.padding-lg :deep(.x-card__content) {
  padding: 20px;
}

.game-surface.compact {
  border-radius: 16px;
}

.game-surface.compact.padding-sm :deep(.x-card__content) {
  padding: 10px;
}

.game-surface.compact.padding-md :deep(.x-card__content) {
  padding: 12px;
}

.game-surface.compact.padding-lg :deep(.x-card__content) {
  padding: 14px;
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  margin-bottom: 14px;
}

.compact .surface-header {
  gap: 10px;
  margin-bottom: 10px;
}

.surface-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.surface-copy .eyebrow {
  color: var(--surface-muted);
  font-size: 11px;
}

.surface-copy strong {
  color: var(--surface-title);
  font-size: 18px;
  line-height: 1.15;
  text-wrap: pretty;
}

.surface-copy p {
  margin: 0;
  color: var(--surface-muted);
  font-size: 12px;
  line-height: 1.5;
  text-wrap: pretty;
}

.surface-body {
  min-width: 0;
  color: var(--surface-text);
}

.surface-footer {
  width: 100%;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(117, 174, 157, 0.18);
}

.compact .surface-footer {
  margin-top: 10px;
  padding-top: 9px;
}

.game-surface.clickable {
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, border-color 0.18s ease;
}

.game-surface.clickable:focus-visible {
  outline: 2px solid rgba(194, 146, 66, 0.58);
  outline-offset: 3px;
}

.game-surface.clickable:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 16px 24px rgba(88, 123, 116, 0.14));
}

@media (prefers-reduced-motion: reduce) {
  .game-surface.clickable {
    transition: none;
  }
}
</style>
