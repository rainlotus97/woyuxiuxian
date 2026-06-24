<template>
  <span class="theme-pill" :class="[`tone-${tone}`, { subtle }]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'jade' | 'gold' | 'mist'
  subtle?: boolean
}>(), {
  tone: 'mist',
  subtle: false
})
</script>

<style scoped>
.theme-pill {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(73, 97, 95, 0.82);
  background: rgba(248, 252, 248, 0.54);
  font-size: 10px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.theme-pill.tone-gold {
  color: #8b6226;
  background: rgba(255, 248, 229, 0.74);
}

.theme-pill.tone-jade {
  color: #3f7367;
  background: rgba(237, 249, 245, 0.76);
}

.theme-pill.subtle {
  opacity: 0.72;
  font-size: 9px;
}
</style>
