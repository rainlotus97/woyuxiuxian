<template>
  <button
    class="theme-button"
    :class="[`tone-${tone}`, `size-${size}`, { block, disabled, iconOnly }]"
    :disabled="disabled"
    type="button"
  >
    <span class="button-shell" aria-hidden="true"></span>
    <span class="button-glow" aria-hidden="true"></span>
    <span class="button-content">
      <span v-if="$slots.icon" class="button-icon">
        <slot name="icon" />
      </span>
      <span v-if="!iconOnly" class="button-label"><slot /></span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'jade' | 'gold' | 'rose' | 'stone'
  size?: 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  iconOnly?: boolean
}>(), {
  tone: 'jade',
  size: 'md',
  block: false,
  disabled: false,
  iconOnly: false
})
</script>

<style scoped>
.theme-button {
  --button-height: 78px;
  --button-font-size: 18px;
  --button-side-padding: 30px;
  --button-label-max-width: min(100%, 18em);
  --button-tone-text: #6f5222;
  --button-tone-shadow: rgba(244, 223, 178, 0.46);
  --button-tone-filter: none;
  --button-shell-opacity: 1;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 100%);
  min-width: 0;
  min-height: var(--button-height);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--button-tone-text);
  cursor: pointer;
  overflow: visible;
  transition: transform 0.16s ease, opacity 0.16s ease, filter 0.16s ease;
  appearance: none;
}

.theme-button.block {
  width: 100%;
}

.theme-button::before {
  content: '';
  position: absolute;
  inset: 8px 18px 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 252, 243, 0.64), rgba(255, 249, 228, 0.18));
  opacity: 0.42;
  pointer-events: none;
}

.button-shell,
.button-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.button-shell {
  background-image: var(--theme-button-texture, none);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  opacity: var(--button-shell-opacity);
  filter: var(--button-tone-filter);
}

.button-glow {
  inset: 14px 13%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 251, 239, 0.74), rgba(255, 251, 239, 0.16) 56%, transparent 76%);
  opacity: 0.5;
}

.button-content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  min-height: var(--button-height);
  width: 100%;
  padding-inline: var(--button-side-padding);
}

.button-icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.button-label {
  display: -webkit-box;
  max-width: var(--button-label-max-width);
  overflow: hidden;
  color: var(--button-tone-text);
  font-family: var(--font-game);
  font-size: var(--button-font-size);
  line-height: 1.15;
  font-weight: 700;
  text-align: center;
  text-wrap: balance;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.78),
    0 0 14px var(--button-tone-shadow);
}

.theme-button.size-lg {
  --button-height: 84px;
  --button-font-size: 20px;
  --button-side-padding: 34px;
}

.theme-button.tone-jade {
  --button-tone-text: #6f5222;
  --button-tone-shadow: rgba(245, 229, 186, 0.52);
  --button-tone-filter: none;
}

.theme-button.tone-gold {
  --button-tone-text: #8c5d16;
  --button-tone-shadow: rgba(255, 224, 148, 0.54);
  --button-tone-filter: saturate(1.06) hue-rotate(-8deg) brightness(1.02);
}

.theme-button.tone-rose {
  --button-tone-text: #7d4c57;
  --button-tone-shadow: rgba(255, 221, 228, 0.5);
  --button-tone-filter: saturate(0.92) hue-rotate(18deg) brightness(1.03);
}

.theme-button.tone-stone {
  --button-tone-text: #405f67;
  --button-tone-shadow: rgba(233, 243, 242, 0.42);
  --button-tone-filter: saturate(0.72) brightness(0.99);
}

.theme-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.theme-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.992);
}

.theme-button.disabled,
.theme-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.theme-button:disabled .button-shell,
.theme-button.disabled .button-shell {
  filter: saturate(0.3) brightness(1.04);
}

.theme-button:disabled .button-label,
.theme-button.disabled .button-label {
  color: rgba(136, 119, 87, 0.82);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.64);
}

.theme-button.iconOnly {
  width: var(--button-height);
  min-width: var(--button-height);
}

.theme-button.iconOnly .button-content {
  padding-inline: 0;
}

@media (max-width: 720px) {
  .theme-button {
    --button-height: 74px;
    --button-font-size: 17px;
    --button-side-padding: 26px;
  }

  .theme-button.size-lg {
    --button-height: 80px;
    --button-font-size: 18px;
    --button-side-padding: 28px;
  }

  .theme-button::before {
    inset: 9px 16px 11px;
  }

  .button-glow {
    inset: 14px 12%;
  }
}
</style>
