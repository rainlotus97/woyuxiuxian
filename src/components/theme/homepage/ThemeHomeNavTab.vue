<template>
  <div class="theme-home-nav-tab" :class="{ active }">
    <div class="tab-shell" aria-hidden="true"></div>
    <div class="tab-content">
      <slot name="icon" />
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  active?: boolean
}>()
</script>

<style scoped>
.theme-home-nav-tab {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 3.9rem;
  width: 100%;
}

.tab-shell {
  position: absolute;
  inset: 0.08rem 0.08rem 0.16rem;
  opacity: 0;
  background:
    center / contain no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/bottom-nav-tab-v1.png');
  transition: opacity 0.18s ease;
}

.theme-home-nav-tab.active .tab-shell {
  opacity: 1;
}

.tab-content {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  color: rgba(123, 132, 127, 0.9);
  transform: translateY(0.04rem);
}

.theme-home-nav-tab.active .tab-content {
  color: #4f9188;
}

.tab-content :deep(svg) {
  width: 1.18rem;
  height: 1.18rem;
  stroke-width: 1.8;
}

.tab-content span {
  font-family: var(--font-game);
  font-size: 0.74rem;
  line-height: 1;
  letter-spacing: 0.01em;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.86);
}

@media (max-width: 640px) {
  .theme-home-nav-tab {
    min-height: 3.42rem;
  }

  .tab-content {
    gap: 0.08rem;
    transform: translateY(0);
  }

  .tab-content :deep(svg) {
    width: 1rem;
    height: 1rem;
  }

  .tab-content span {
    font-size: 0.58rem;
  }
}
</style>
