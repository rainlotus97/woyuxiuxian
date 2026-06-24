<template>
  <div class="theme-inset-card" :class="[`tone-${tone}`, { compact }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'jade' | 'gold' | 'mist' | 'plain'
  compact?: boolean
}>(), {
  tone: 'plain',
  compact: false
})
</script>

<style scoped>
.theme-inset-card {
  position: relative;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.74), rgba(241, 249, 244, 0.56));
  box-shadow:
    0 10px 22px rgba(88, 123, 116, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
  overflow: hidden;
}

.theme-inset-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(255, 223, 147, 0.12), transparent 26%),
    linear-gradient(135deg, rgba(111, 174, 152, 0.05), transparent 52%);
}

.theme-inset-card.tone-gold {
  border-color: rgba(188, 141, 58, 0.22);
  background:
    linear-gradient(180deg, rgba(255, 250, 236, 0.82), rgba(247, 242, 223, 0.7));
}

.theme-inset-card.tone-jade {
  border-color: rgba(103, 149, 144, 0.16);
  background:
    linear-gradient(180deg, rgba(244, 252, 248, 0.8), rgba(236, 246, 242, 0.72));
}

.theme-inset-card.tone-mist {
  border-color: rgba(119, 158, 178, 0.18);
  background:
    linear-gradient(180deg, rgba(247, 252, 252, 0.82), rgba(237, 244, 244, 0.72));
}

.theme-inset-card.compact {
  padding: 10px;
  border-radius: 14px;
}
</style>
