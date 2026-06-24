<template>
  <button
    class="theme-plaque-button"
    :class="[`tone-${tone}`, `size-${size}`, { block, disabled }]"
    :disabled="disabled"
    type="button"
  >
    <span class="plaque-shell" aria-hidden="true"></span>
    <span class="plaque-content">
      <span v-if="$slots.icon" class="plaque-icon">
        <slot name="icon" />
      </span>
      <span class="plaque-label"><slot /></span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'jade' | 'gold' | 'stone'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
}>(), {
  tone: 'gold',
  size: 'md',
  block: false,
  disabled: false
})
</script>

<style scoped>
.theme-plaque-button {
  --plaque-height: 60px;
  --plaque-max-width: 304px;
  --plaque-min-width: 208px;
  --plaque-text: #6c4b18;
  --plaque-filter: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(var(--plaque-min-width), 100%, var(--plaque-max-width));
  min-width: 0;
  height: var(--plaque-height);
  min-height: var(--plaque-height);
  max-height: var(--plaque-height);
  aspect-ratio: 901 / 249;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--plaque-text);
  cursor: pointer;
  transition: transform 0.16s ease, opacity 0.16s ease;
  appearance: none;
}

.theme-plaque-button.block {
  width: 100%;
}

.plaque-shell {
  position: absolute;
  inset: 0;
  background-image: var(--theme-button-texture, none);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  filter: var(--plaque-filter);
}

.theme-plaque-button::before {
  content: '';
  position: absolute;
  inset: 9px 18px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 251, 238, 0.52), rgba(255, 248, 225, 0.08)),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.26), transparent 72%);
  pointer-events: none;
}

.plaque-content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
  padding-inline: 26px;
}

.plaque-icon {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.plaque-label {
  min-width: 0;
  color: var(--plaque-text);
  font-family: var(--font-game);
  font-size: 17px;
  line-height: 1;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.72),
    0 0 10px rgba(246, 226, 185, 0.42);
}

.theme-plaque-button.tone-jade {
  --plaque-text: #3f6170;
  --plaque-filter: saturate(0.78) brightness(1.01);
}

.theme-plaque-button.tone-gold {
  --plaque-text: #7b5519;
  --plaque-filter: saturate(1.02) brightness(1.01);
}

.theme-plaque-button.tone-stone {
  --plaque-text: #5d6871;
  --plaque-filter: saturate(0.46) brightness(1.02);
}

.theme-plaque-button.size-sm {
  --plaque-height: 52px;
  --plaque-max-width: 264px;
  --plaque-min-width: 180px;
}

.theme-plaque-button.size-sm::before {
  inset: 8px 16px;
}

.theme-plaque-button.size-sm .plaque-content {
  gap: 8px;
  padding-inline: 22px;
}

.theme-plaque-button.size-sm .plaque-icon {
  width: 16px;
  height: 16px;
}

.theme-plaque-button.size-sm .plaque-label {
  font-size: 15px;
}

.theme-plaque-button.size-lg {
  --plaque-height: 70px;
  --plaque-max-width: 340px;
  --plaque-min-width: 232px;
}

.theme-plaque-button.size-lg::before {
  inset: 10px 20px;
}

.theme-plaque-button.size-lg .plaque-content {
  gap: 12px;
  padding-inline: 30px;
}

.theme-plaque-button.size-lg .plaque-icon {
  width: 20px;
  height: 20px;
}

.theme-plaque-button.size-lg .plaque-label {
  font-size: 18px;
}

.theme-plaque-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.theme-plaque-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.992);
}

.theme-plaque-button.disabled,
.theme-plaque-button:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.theme-plaque-button:disabled .plaque-shell,
.theme-plaque-button.disabled .plaque-shell {
  filter: saturate(0.2) brightness(1.04);
}

.theme-plaque-button:disabled .plaque-label,
.theme-plaque-button.disabled .plaque-label {
  color: rgba(142, 132, 113, 0.88);
}

@media (max-width: 720px) {
  .theme-plaque-button {
    --plaque-height: 58px;
    --plaque-max-width: 296px;
    --plaque-min-width: 196px;
  }

  .plaque-content {
    gap: 9px;
    padding-inline: 24px;
  }

  .plaque-label {
    font-size: 16px;
  }

  .theme-plaque-button.size-sm {
    --plaque-height: 48px;
    --plaque-max-width: 246px;
    --plaque-min-width: 168px;
  }

  .theme-plaque-button.size-sm .plaque-label {
    font-size: 14px;
  }

  .theme-plaque-button.size-lg {
    --plaque-height: 64px;
    --plaque-max-width: 318px;
    --plaque-min-width: 214px;
  }

  .theme-plaque-button.size-lg .plaque-label {
    font-size: 17px;
  }
}
</style>
