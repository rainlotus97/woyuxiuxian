<template>
  <div class="theme-home-resource-pill">
    <span class="pill-icon">
      <slot name="icon" />
    </span>
    <div class="pill-copy">
      <strong>{{ value }}</strong>
      <small v-if="label">{{ label }}</small>
    </div>
    <span v-if="suffix" class="pill-suffix">{{ suffix }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  label?: string
  suffix?: string
}>()
</script>

<style scoped>
.theme-home-resource-pill {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.34rem;
  width: 100%;
  max-width: 10.9rem;
  min-width: 0;
  aspect-ratio: 1748 / 899;
  padding: 0 0.92rem 0 0.74rem;
  background:
    center / 100% 100% no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/resource-pill-v1.png');
}

.pill-icon {
  display: grid;
  place-items: center;
  width: 1.12rem;
  height: 1.12rem;
  color: #6fae98;
}

.pill-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.pill-copy {
  display: grid;
  min-width: 0;
  gap: 0.02rem;
}

.pill-copy strong {
  overflow: hidden;
  color: #4e5358;
  font-family: var(--font-game);
  font-size: 0.9rem;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-copy small {
  overflow: hidden;
  color: rgba(83, 105, 109, 0.68);
  font-size: 0.54rem;
  line-height: 1.02;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-suffix {
  color: #b28b4d;
  font-size: 0.8rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .theme-home-resource-pill {
    gap: 0.2rem;
    padding: 0 0.7rem 0 0.58rem;
  }

  .pill-icon {
    width: 0.94rem;
    height: 0.94rem;
  }

  .pill-copy strong {
    font-size: 0.82rem;
  }

  .pill-copy small {
    font-size: 0.48rem;
  }

  .pill-suffix {
    font-size: 0.72rem;
  }
}
</style>
