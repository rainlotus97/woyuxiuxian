<template>
  <section
    class="game-surface"
    :class="[
      `tone-${tone}`,
      `padding-${padding}`,
      { clickable, compact }
    ]"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyboardClick"
    @keydown.space.prevent="handleKeyboardClick"
  >
    <header v-if="hasHeader" class="surface-header">
      <div v-if="eyebrow || title || subtitle" class="surface-copy">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <strong v-if="title">{{ title }}</strong>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <slot name="header" />
    </header>

    <div class="surface-body">
      <slot />
    </div>

    <footer v-if="hasFooter" class="surface-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, useSlots } from 'vue'

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
  --surface-border: var(--theme-surface-border, rgba(101, 152, 145, 0.22));
  --surface-bg:
    var(--theme-surface-image, none),
    linear-gradient(180deg, rgba(255, 255, 250, 0.96), rgba(240, 249, 244, 0.88)),
    radial-gradient(circle at top, rgba(255, 227, 150, 0.14), transparent 62%);
  --surface-shadow: 0 18px 42px rgba(88, 123, 116, 0.14);
  --surface-title: var(--theme-surface-title, #8e6227);
  --surface-text: var(--theme-surface-text, #325154);
  --surface-muted: var(--theme-surface-muted, rgba(67, 92, 90, 0.72));

  border: 1px solid var(--surface-border);
  border-radius: 20px;
  background: var(--surface-bg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: var(--surface-shadow);
  backdrop-filter: blur(14px);
}

.tone-gold {
  --surface-border: rgba(188, 141, 58, 0.3);
  --surface-bg:
    var(--theme-surface-image, none),
    linear-gradient(180deg, rgba(255, 252, 239, 0.98), rgba(246, 255, 242, 0.9)),
    radial-gradient(circle at top, rgba(255, 215, 122, 0.22), transparent 62%);
}

.tone-mist {
  --surface-border: rgba(119, 158, 178, 0.22);
  --surface-bg:
    var(--theme-surface-image, none),
    linear-gradient(180deg, rgba(247, 253, 255, 0.94), rgba(239, 249, 246, 0.86)),
    radial-gradient(circle at top left, rgba(174, 218, 240, 0.18), transparent 64%);
}

.tone-realm {
  --surface-border: rgba(125, 170, 147, 0.26);
  --surface-bg:
    var(--theme-surface-image, none),
    linear-gradient(180deg, rgba(242, 255, 247, 0.9), rgba(232, 247, 243, 0.88)),
    radial-gradient(circle at top right, rgba(88, 198, 165, 0.18), transparent 62%);
}

.padding-sm {
  padding: 12px;
}

.padding-md {
  padding: 16px;
}

.padding-lg {
  padding: 20px;
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
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
}

.surface-copy p {
  margin: 0;
  color: var(--surface-muted);
  font-size: 12px;
  line-height: 1.5;
}

.surface-body {
  color: var(--surface-text);
  min-width: 0;
}

.surface-footer {
  margin-top: 14px;
}

.game-surface.clickable {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.game-surface.clickable:focus-visible {
  outline: 2px solid rgba(194, 146, 66, 0.58);
  outline-offset: 3px;
}

.game-surface.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 48px rgba(88, 123, 116, 0.18);
}

.game-surface.compact {
  border-radius: 16px;
}
</style>
