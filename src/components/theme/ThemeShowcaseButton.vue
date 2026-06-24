<template>
  <button
    class="theme-showcase-button"
    :class="[`tone-${tone}`, `variant-${variant}`, { block, disabled }]"
    :style="buttonStyle"
    :disabled="disabled"
    type="button"
  >
    <span class="button-frame" aria-hidden="true"></span>
    <span class="button-content">
      <span v-if="$slots.icon" class="button-icon">
        <slot name="icon" />
      </span>
      <span class="button-label"><slot /></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import buttonCompactJade from '@/assets/theme/generated/sliced/buttons/button-compact-jade.png'
import buttonMutedStone from '@/assets/theme/generated/sliced/buttons/button-muted-stone.png'
import buttonPrimaryGreen from '@/assets/theme/generated/sliced/buttons/button-primary-green.png'
import buttonSecondaryPaper from '@/assets/theme/generated/sliced/buttons/button-secondary-paper.png'
import buttonWideLandscape from '@/assets/theme/generated/sliced/buttons/button-wide-landscape.png'

const props = withDefaults(defineProps<{
  tone?: 'gold' | 'jade' | 'mist' | 'stone'
  variant?: 'primary' | 'secondary' | 'wide'
  block?: boolean
  disabled?: boolean
}>(), {
  tone: 'gold',
  variant: 'primary',
  block: false,
  disabled: false
})

const buttonImage = computed(() => {
  if (props.disabled || props.tone === 'stone') return buttonMutedStone
  if (props.variant === 'wide') return buttonWideLandscape
  if (props.variant === 'secondary' && props.tone === 'gold') return buttonSecondaryPaper
  if (props.tone === 'jade' || props.tone === 'mist') return buttonCompactJade
  return buttonPrimaryGreen
})

const buttonStyle = computed(() => ({
  '--button-frame': `url("${buttonImage.value}")`
}))
</script>

<style scoped>
.theme-showcase-button {
  --button-text: #f4ecce;
  --button-height: 72px;
  --button-slice-top: 58;
  --button-slice-side: 132;
  --button-border-y: 34px;
  --button-border-x: 92px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 460px);
  height: var(--button-height);
  min-height: var(--button-height);
  box-sizing: border-box;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--button-text);
  cursor: pointer;
  filter: drop-shadow(0 12px 16px rgba(63, 75, 72, 0.14));
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.button-frame {
  position: absolute;
  inset: 0;
  border: var(--button-border-y) solid transparent;
  border-left-width: var(--button-border-x);
  border-right-width: var(--button-border-x);
  border-image-source: var(--button-frame);
  border-image-slice: var(--button-slice-top) var(--button-slice-side) fill;
  border-image-width: var(--button-border-y) var(--button-border-x);
  border-image-repeat: stretch;
  pointer-events: none;
}

.button-content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 0 96px;
  box-sizing: border-box;
}

.button-icon {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.button-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-game);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.58),
    0 0 12px rgba(185, 156, 86, 0.14);
}

.theme-showcase-button.variant-secondary {
  --button-height: 66px;
  --button-slice-top: 56;
  --button-slice-side: 116;
  --button-border-y: 30px;
  --button-border-x: 82px;
  width: min(100%, 420px);
}

.theme-showcase-button.variant-wide {
  --button-height: 76px;
  --button-slice-top: 62;
  --button-slice-side: 132;
  --button-border-y: 34px;
  --button-border-x: 104px;
  width: 100%;
}

.theme-showcase-button.tone-jade {
  --button-text: #435f5a;
}

.theme-showcase-button.tone-mist {
  --button-text: #536568;
}

.theme-showcase-button.tone-stone {
  --button-text: rgba(119, 124, 128, 0.9);
}

.theme-showcase-button.block {
  width: 100%;
}

.theme-showcase-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: drop-shadow(0 16px 22px rgba(63, 75, 72, 0.18));
}

.theme-showcase-button:active:not(:disabled) {
  transform: translateY(1px);
}

.theme-showcase-button.disabled,
.theme-showcase-button:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .theme-showcase-button {
    width: 100%;
  }

  .button-content {
    padding-inline: 74px;
  }
}
</style>
