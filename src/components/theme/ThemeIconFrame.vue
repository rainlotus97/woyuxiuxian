<template>
  <span class="theme-icon-frame" :class="[`tone-${tone}`, `size-${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'jade' | 'gold' | 'mist'
  size?: 'sm' | 'md'
}>(), {
  tone: 'jade',
  size: 'md'
})
</script>

<style scoped>
.theme-icon-frame {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 999px;
  border: 1px solid rgba(190, 152, 78, 0.22);
  background:
    radial-gradient(circle at 50% 28%, rgba(255, 250, 234, 0.96), rgba(239, 248, 243, 0.88) 68%),
    var(--theme-emblem-texture, none);
  background-size: cover;
  background-position: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 8px 18px rgba(98, 128, 120, 0.12);
  overflow: hidden;
}

.theme-icon-frame::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.42);
  pointer-events: none;
}

.theme-icon-frame.size-sm {
  width: 28px;
  height: 28px;
}

.theme-icon-frame.size-md {
  width: 36px;
  height: 36px;
}

.theme-icon-frame.tone-gold {
  border-color: rgba(198, 148, 63, 0.28);
}

.theme-icon-frame.tone-mist {
  border-color: rgba(125, 162, 178, 0.24);
}
</style>
