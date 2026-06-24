<template>
  <button
    ref="buttonRef"
    class="theme-home-button"
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
import buttonTexture from '@/assets/theme/generated/component-masters-homepage-v3-transparent/primary-button-v3.png'

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
const labelFontSize = ref(1)
let resizeObserver: ResizeObserver | null = null
const slots = useSlots()
const hasIconSlot = computed(() => Boolean(slots.icon))

const SIZE_MAX_REM: Record<'sm' | 'md' | 'lg', number> = {
  sm: 0.94,
  md: 1.08,
  lg: 1.18
}

const SIZE_MIN_REM: Record<'sm' | 'md' | 'lg', number> = {
  sm: 0.76,
  md: 0.84,
  lg: 0.9
}

const buttonStyle = computed(() => ({
  '--home-button-image': `url("${buttonTexture}")`,
  '--home-button-label-size': `${labelFontSize.value}rem`
}))

function syncLabelSize() {
  const label = labelRef.value
  if (!label) return

  const maxSize = SIZE_MAX_REM[props.size]
  const minSize = SIZE_MIN_REM[props.size]
  labelFontSize.value = maxSize

  requestAnimationFrame(() => {
    const currentLabel = labelRef.value
    if (!currentLabel) return
    const availableWidth = currentLabel.clientWidth
    const contentWidth = currentLabel.scrollWidth

    if (!availableWidth || contentWidth <= availableWidth) return

    const nextSize = Math.max(minSize, Number((maxSize * (availableWidth / contentWidth)).toFixed(2)))
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
.theme-home-button {
  --button-height: 3.5rem;
  --button-width: min(100%, 15.25rem);
  --button-content-width: 62%;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--button-width);
  min-width: 0;
  height: var(--button-height);
  padding: 0;
  border: 0;
  background: center / 100% 100% no-repeat var(--home-button-image);
  color: #eff3ea;
  cursor: pointer;
  appearance: none;
  transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
  filter: drop-shadow(0 0.42rem 0.72rem rgba(101, 159, 154, 0.14));
}

.theme-home-button.size-sm {
  --button-height: 3rem;
  --button-width: min(100%, 12.75rem);
  --button-content-width: 58%;
}

.theme-home-button.size-lg {
  --button-height: 3.85rem;
  --button-width: min(100%, 17rem);
  --button-content-width: 64%;
}

.theme-home-button.block {
  width: min(100%, 100%);
}

.button-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: min(100%, var(--button-content-width));
  min-width: 0;
  transform: translateY(-0.02rem);
}

.theme-home-button.iconless .button-content {
  width: min(100%, 68%);
}

.button-icon {
  display: grid;
  place-items: center;
  width: 1.04rem;
  height: 1.04rem;
  flex: 0 0 auto;
  color: #eef7ef;
}

.button-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.button-label {
  min-width: 0;
  overflow: hidden;
  color: #f3f5ee;
  font-family: var(--font-game);
  font-size: var(--home-button-label-size, 1rem);
  font-weight: 700;
  line-height: 0.96;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.01em;
  text-shadow:
    0 0.0625rem 0 rgba(31, 59, 61, 0.46),
    0 0 0.28rem rgba(255, 250, 238, 0.12);
}

.theme-home-button:hover:not(:disabled) {
  transform: translateY(-0.0625rem);
  filter: brightness(1.02) drop-shadow(0 0.5rem 0.8rem rgba(101, 159, 154, 0.18));
}

.theme-home-button:active:not(:disabled) {
  transform: translateY(0.0625rem) scale(0.992);
}

.theme-home-button:disabled,
.theme-home-button.disabled {
  opacity: 0.56;
  cursor: not-allowed;
  filter: saturate(0.52);
}

@media (max-width: 640px) {
  .theme-home-button {
    filter: drop-shadow(0 0.28rem 0.54rem rgba(101, 159, 154, 0.12));
  }

  .button-content {
    gap: 0.38rem;
  }

  .button-icon {
    width: 0.96rem;
    height: 0.96rem;
  }
}
</style>
