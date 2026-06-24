<template>
  <button class="theme-action-tile" :class="[`tone-${tone}`, { disabled }]" type="button" :disabled="disabled">
    <span class="tile-shell" aria-hidden="true"></span>
    <span class="tile-tint" aria-hidden="true"></span>
    <span class="tile-glyph">{{ glyph }}</span>
    <span class="tile-copy">
      <strong>{{ title }}</strong>
      <small v-if="subtitle">{{ subtitle }}</small>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  glyph: string
  title: string
  subtitle?: string
  tone?: 'jade' | 'gold' | 'plain'
  disabled?: boolean
}>(), {
  subtitle: '',
  tone: 'plain',
  disabled: false
})
</script>

<style scoped>
.theme-action-tile {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-width: 0;
  min-height: 94px;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(172, 144, 92, 0.14);
  background: linear-gradient(180deg, rgba(255, 254, 250, 0.94), rgba(243, 248, 245, 0.9));
  color: #315257;
  text-align: left;
  box-shadow:
    0 12px 24px rgba(82, 114, 108, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, opacity 0.16s ease;
}

.theme-action-tile::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.42);
}

.theme-action-tile::after {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 18px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 252, 0.54), rgba(244, 248, 245, 0.16));
}

.tile-shell,
.tile-tint {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.tile-shell {
  background-image: var(--theme-panel-texture, none);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  opacity: 0.3;
  mix-blend-mode: multiply;
}

.tile-tint {
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 225, 153, 0.18), transparent 26%),
    linear-gradient(135deg, rgba(111, 174, 152, 0.08), transparent 48%, rgba(200, 164, 92, 0.06));
}

.theme-action-tile.tone-gold {
  border-color: rgba(193, 149, 66, 0.2);
  background: linear-gradient(180deg, rgba(255, 252, 241, 0.94), rgba(248, 242, 220, 0.9));
}

.theme-action-tile.tone-jade {
  border-color: rgba(106, 148, 142, 0.16);
  background: linear-gradient(180deg, rgba(246, 252, 248, 0.94), rgba(237, 247, 242, 0.9));
}

.theme-action-tile:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(82, 114, 108, 0.12);
}

.theme-action-tile:active:not(:disabled) {
  transform: scale(0.99);
}

.theme-action-tile.disabled,
.theme-action-tile:disabled {
  opacity: 0.46;
  cursor: not-allowed;
  box-shadow: none;
}

.tile-glyph {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 250, 237, 0.96), rgba(244, 247, 241, 0.8));
  color: #8b6226;
  font-family: var(--font-ui);
  font-size: 24px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.78),
    0 6px 14px rgba(112, 122, 102, 0.08);
}

.tile-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
  min-width: 0;
}

.tile-copy strong {
  color: #315257;
  font-family: var(--font-game);
  font-size: 19px;
  line-height: 1.25;
  font-weight: 700;
}

.tile-copy small {
  color: rgba(74, 97, 96, 0.74);
  font-family: var(--font-reading-sans);
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .theme-action-tile {
    min-height: 86px;
    padding: 14px;
    border-radius: 22px;
  }

  .tile-copy strong {
    font-size: 18px;
  }
}
</style>
