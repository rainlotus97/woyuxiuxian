<template>
  <button
    ref="buttonRef"
    class="theme-reference-button"
    :class="[`size-${size}`, { block, disabled, 'iconless': !hasIconSlot }]"
    :style="buttonStyle"
    :disabled="disabled"
    type="button"
  >
    <span class="button-content">
      <span v-if="$slots.icon" class="button-icon">
        <slot name="icon" />
      </span>
      <span ref="labelRef" class="button-label"><slot /></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import buttonFull from '@/assets/theme/generated/transparent-buttons/button-reference-style-v1.png'

const props = withDefaults(defineProps<{
  block?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  block: false,
  disabled: false,
  size: 'md'
})

const buttonRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const labelFontSize = ref(18)
let resizeObserver: ResizeObserver | null = null
const slots = useSlots()
const hasIconSlot = computed(() => Boolean(slots.icon))

const SIZE_MAX_FONT: Record<'sm' | 'md' | 'lg', number> = {
  sm: 14,
  md: 16,
  lg: 17
}

const SIZE_MIN_FONT: Record<'sm' | 'md' | 'lg', number> = {
  sm: 11,
  md: 13,
  lg: 13
}

const buttonStyle = computed(() => ({
  '--button-full': `url("${buttonFull}")`,
  '--button-label-size': `${labelFontSize.value}px`
}))

function syncLabelSize() {
  const label = labelRef.value
  if (!label) return

  const maxSize = SIZE_MAX_FONT[props.size]
  const minSize = SIZE_MIN_FONT[props.size]

  labelFontSize.value = maxSize

  requestAnimationFrame(() => {
    const currentLabel = labelRef.value
    if (!currentLabel) return
    const availableWidth = currentLabel.clientWidth
    const contentWidth = currentLabel.scrollWidth

    if (!availableWidth || contentWidth <= availableWidth) return

    const nextSize = Math.max(minSize, Math.floor(maxSize * (availableWidth / contentWidth)))
    labelFontSize.value = nextSize
  })
}

onMounted(async () => {
  await nextTick()
  syncLabelSize()

  if (buttonRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncLabelSize()
    })
    resizeObserver.observe(buttonRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(() => props.size, () => {
  syncLabelSize()
})
</script>

<style scoped>
.theme-reference-button {
  --button-height: var(--ui-button-md-height, 52px);
  --button-max-width: var(--ui-button-md-width, 244px);
  --button-min-width: 0px;
  --button-side-inset: var(--ui-button-md-side-inset, 52px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, var(--button-max-width));
  height: var(--button-height);
  min-width: 0;
  padding: 0;
  border: 0;
  background:
    center / 100% 100% no-repeat var(--button-full);
  cursor: pointer;
  appearance: none;
  transition: transform 0.16s ease, filter 0.16s ease, opacity 0.16s ease;
}

.theme-reference-button.size-sm {
  --button-height: var(--ui-button-sm-height, 46px);
  --button-max-width: var(--ui-button-sm-width, 208px);
  --button-side-inset: var(--ui-button-sm-side-inset, 42px);
}

.theme-reference-button.size-md {
  --button-height: var(--ui-button-md-height, 52px);
  --button-max-width: var(--ui-button-md-width, 244px);
  --button-side-inset: var(--ui-button-md-side-inset, 52px);
}

.theme-reference-button.size-lg {
  --button-height: var(--ui-button-lg-height, 58px);
  --button-max-width: var(--ui-button-lg-width, 322px);
  --button-side-inset: var(--ui-button-lg-side-inset, 64px);
}

.theme-reference-button.block {
  width: 100%;
  --button-max-width: 100%;
}

.button-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  max-width: calc(100% - (var(--button-side-inset) * 2));
  min-width: 0;
  box-sizing: border-box;
}

.theme-reference-button.iconless .button-content {
  max-width: calc(100% - (var(--button-side-inset) * 1.6));
}

.button-icon {
  display: grid;
  place-items: center;
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  color: #f2e7c2;
  transform: translateY(0);
}

.theme-reference-button.size-sm .button-icon {
  width: 14px;
  height: 14px;
}

.theme-reference-button.size-lg .button-icon {
  width: 16px;
  height: 16px;
}

.button-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.button-label {
  min-width: 0;
  overflow: hidden;
  color: #f4eccf;
  font-family: var(--font-game);
  font-size: var(--button-label-size, 17px);
  font-weight: 700;
  line-height: 1.05;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow:
    0 1px 0 rgba(36, 57, 56, 0.42),
    0 0 12px rgba(255, 240, 200, 0.1);
}

.theme-reference-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.02);
}

.theme-reference-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.992);
}

.theme-reference-button:disabled {
  opacity: 0.54;
  cursor: not-allowed;
  filter: grayscale(0.25);
}

@media (max-width: 720px) {
  .theme-reference-button {
    width: min(100%, var(--button-max-width));
  }
}
</style>
