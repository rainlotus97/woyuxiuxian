<template>
  <button class="game-action-btn" :class="[`tone-${tone}`, { block }]" :disabled="disabled">
    <span v-if="icon" class="btn-icon">{{ icon }}</span>
    <span class="btn-label"><slot /></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string | null
  tone?: 'jade' | 'gold' | 'rose' | 'stone'
  block?: boolean
  disabled?: boolean
}>(), {
  icon: null,
  tone: 'jade',
  block: false,
  disabled: false
})
</script>

<style scoped>
.game-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(101, 152, 145, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.96), rgba(241, 249, 244, 0.88)),
    radial-gradient(circle at top, rgba(170, 232, 214, 0.16), transparent 62%);
  color: #315257;
  font-family: var(--font-game);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(87, 126, 121, 0.12);
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.game-action-btn.block {
  width: 100%;
}

.game-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(87, 126, 121, 0.16);
}

.game-action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.game-action-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  box-shadow: none;
}

.tone-gold {
  border-color: rgba(188, 141, 58, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.98), rgba(247, 240, 215, 0.9)),
    radial-gradient(circle at top, rgba(255, 213, 112, 0.24), transparent 62%);
  color: #8c6226;
}

.tone-rose {
  border-color: rgba(198, 121, 137, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 248, 249, 0.98), rgba(249, 234, 236, 0.9)),
    radial-gradient(circle at top, rgba(244, 181, 188, 0.2), transparent 62%);
  color: #8a4959;
}

.tone-stone {
  border-color: rgba(128, 146, 147, 0.22);
  background:
    linear-gradient(180deg, rgba(248, 250, 250, 0.96), rgba(234, 240, 239, 0.88)),
    radial-gradient(circle at top, rgba(196, 204, 202, 0.18), transparent 62%);
  color: #607171;
}

.btn-icon {
  font-size: 16px;
}

.btn-label {
  line-height: 1;
}
</style>
