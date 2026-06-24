<template>
  <section class="theme-notice-panel" :class="[`variant-${variant}`, `tone-${tone}`, { compact }]" :style="panelStyle">
    <div v-if="eyebrow || $slots.badge" class="panel-topline">
      <span v-if="eyebrow" class="panel-eyebrow">{{ eyebrow }}</span>
      <slot name="badge" />
    </div>

    <strong v-if="title" class="panel-title">{{ title }}</strong>
    <p v-if="description" class="panel-description">{{ description }}</p>

    <div v-if="$slots.default" class="panel-body">
      <slot />
    </div>

    <footer v-if="$slots.actions || meta" class="panel-footer">
      <span v-if="meta" class="panel-meta">{{ meta }}</span>
      <div v-if="$slots.actions" class="panel-actions">
        <slot name="actions" />
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import panelAnnouncement from '@/assets/theme/generated/sliced/panels/panel-announcement.png'
import panelNoticeStrip from '@/assets/theme/generated/sliced/panels/panel-notice-strip.png'
import panelPrompt from '@/assets/theme/generated/sliced/panels/panel-prompt.png'
import panelTooltip from '@/assets/theme/generated/sliced/panels/panel-tooltip.png'

const props = withDefaults(defineProps<{
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  meta?: string | null
  variant?: 'announcement' | 'prompt' | 'tooltip' | 'notice'
  tone?: 'gold' | 'jade' | 'mist'
  compact?: boolean
}>(), {
  eyebrow: null,
  title: null,
  description: null,
  meta: null,
  variant: 'announcement',
  tone: 'mist',
  compact: false
})

const panelImage = computed(() => {
  if (props.variant === 'prompt') return panelPrompt
  if (props.variant === 'tooltip') return panelTooltip
  if (props.variant === 'notice') return panelNoticeStrip
  return panelAnnouncement
})

const panelStyle = computed(() => ({
  '--panel-frame': `url("${panelImage.value}")`
}))
</script>

<style scoped>
.theme-notice-panel {
  --panel-title: #6f5123;
  --panel-text: rgba(58, 76, 76, 0.8);
  --panel-muted: rgba(88, 102, 98, 0.7);
  --panel-slice-top: 92;
  --panel-slice-side: 70;
  --panel-border-y: 46px;
  --panel-border-x: 34px;
  position: relative;
  display: grid;
  gap: 8px;
  min-height: 220px;
  box-sizing: border-box;
  padding: 0;
  border: var(--panel-border-y) solid transparent;
  border-left-width: var(--panel-border-x);
  border-right-width: var(--panel-border-x);
  border-image-source: var(--panel-frame);
  border-image-slice: var(--panel-slice-top) var(--panel-slice-side) fill;
  border-image-width: var(--panel-border-y) var(--panel-border-x);
  border-image-repeat: stretch;
  background: transparent;
  filter: drop-shadow(0 14px 18px rgba(62, 73, 71, 0.12));
}

.theme-notice-panel.variant-tooltip {
  --panel-slice-top: 48;
  --panel-slice-side: 56;
  --panel-border-y: 24px;
  --panel-border-x: 28px;
  min-height: 132px;
}

.theme-notice-panel.variant-notice {
  --panel-slice-top: 52;
  --panel-slice-side: 108;
  --panel-border-y: 24px;
  --panel-border-x: 60px;
  gap: 6px;
  min-height: 108px;
}

.theme-notice-panel.compact {
  min-height: 0;
}

.panel-topline,
.panel-footer {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: calc(var(--panel-border-y) * -1) calc(var(--panel-border-x) * -1) 0;
  padding: 20px 24px 0;
}

.panel-eyebrow,
.panel-meta {
  color: var(--panel-muted);
  font-size: 12px;
  line-height: 1.4;
}

.panel-title,
.panel-description,
.panel-body {
  position: relative;
  z-index: 1;
  margin-left: calc(var(--panel-border-x) * -1);
  margin-right: calc(var(--panel-border-x) * -1);
  padding: 0 24px;
}

.panel-title {
  color: var(--panel-title);
  font-size: 20px;
  line-height: 1.15;
}

.panel-description,
.panel-body {
  color: var(--panel-text);
  line-height: 1.7;
}

.panel-footer {
  margin-top: 0;
  margin-bottom: calc(var(--panel-border-y) * -1);
  padding-bottom: 22px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
