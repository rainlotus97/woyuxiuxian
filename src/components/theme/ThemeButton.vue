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
  --button-tone-shadow: rgba(244, 223, 178, 0.34);
  --button-border: rgba(208, 177, 117, 0.56);
  --button-border-soft: rgba(120, 171, 160, 0.22);
  --button-surface-top: rgba(255, 252, 244, 0.98);
  --button-surface-bottom: rgba(241, 248, 243, 0.92);
  --button-highlight: rgba(255, 255, 255, 0.88);
  --button-shadow: rgba(94, 128, 122, 0.16);
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
  transition: transform 0.16s ease, opacity 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;
  appearance: none;
  border-radius: 999px;
  box-shadow: 0 16px 28px var(--button-shadow);
}

.theme-button.block {
  width: 100%;
}

.theme-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 1px solid var(--button-border);
  background:
    radial-gradient(circle at 50% 32%, rgba(255, 255, 255, 0.9), transparent 42%),
    linear-gradient(180deg, var(--button-surface-top), var(--button-surface-bottom));
  box-shadow:
    inset 0 1px 0 var(--button-highlight),
    inset 0 -1px 0 rgba(207, 174, 107, 0.22);
  pointer-events: none;
}

.theme-button::after {
  content: '';
  position: absolute;
  inset: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--button-border-soft);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.06)),
    linear-gradient(90deg, transparent 0 8%, rgba(255, 228, 165, 0.12) 18%, rgba(128, 191, 180, 0.1) 82%, transparent 100%);
  pointer-events: none;
}

.button-shell,
.button-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.button-shell {
  inset: 2px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 0 50%, rgba(218, 193, 135, 0.26), transparent 20%),
    radial-gradient(circle at 100% 50%, rgba(218, 193, 135, 0.26), transparent 20%);
  opacity: 0.9;
}

.button-glow {
  inset: 13px 12%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 251, 239, 0.7), rgba(255, 251, 239, 0.14) 58%, transparent 76%);
  opacity: 0.7;
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
    0 1px 0 rgba(255, 255, 255, 0.8),
    0 0 10px var(--button-tone-shadow);
}

.theme-button.size-lg {
  --button-height: 84px;
  --button-font-size: 20px;
  --button-side-padding: 34px;
}

.theme-button.tone-jade {
  --button-tone-text: #6f5222;
  --button-border: rgba(203, 173, 115, 0.58);
  --button-border-soft: rgba(115, 173, 162, 0.24);
  --button-surface-top: rgba(255, 252, 244, 0.98);
  --button-surface-bottom: rgba(236, 247, 241, 0.94);
}

.theme-button.tone-gold {
  --button-tone-text: #8c5d16;
  --button-border: rgba(216, 172, 87, 0.62);
  --button-border-soft: rgba(213, 187, 130, 0.26);
  --button-surface-top: rgba(255, 249, 231, 0.99);
  --button-surface-bottom: rgba(249, 238, 205, 0.94);
  --button-shadow: rgba(149, 121, 70, 0.16);
}

.theme-button.tone-rose {
  --button-tone-text: #7d4c57;
  --button-border: rgba(212, 155, 171, 0.54);
  --button-border-soft: rgba(199, 159, 170, 0.24);
  --button-surface-top: rgba(255, 248, 249, 0.98);
  --button-surface-bottom: rgba(245, 233, 237, 0.94);
}

.theme-button.tone-stone {
  --button-tone-text: #405f67;
  --button-border: rgba(170, 185, 188, 0.54);
  --button-border-soft: rgba(136, 168, 171, 0.2);
  --button-surface-top: rgba(248, 251, 251, 0.98);
  --button-surface-bottom: rgba(232, 240, 241, 0.94);
}

.theme-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 34px var(--button-shadow);
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
  opacity: 0.38;
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
    box-shadow:
      inset 0 1px 0 var(--button-highlight),
      inset 0 -1px 0 rgba(207, 174, 107, 0.2);
  }

  .theme-button::after {
    inset: 7px 12px;
  }

  .button-glow {
    inset: 13px 11%;
  }
}
</style>
