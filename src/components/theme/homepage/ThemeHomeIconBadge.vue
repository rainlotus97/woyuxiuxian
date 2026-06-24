<template>
  <button class="theme-home-icon-badge" :class="[`size-${size}`, { alert }]" type="button">
    <span class="badge-inner">
      <slot />
    </span>
    <span v-if="alert" class="badge-dot" aria-hidden="true"></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  alert?: boolean
}>(), {
  size: 'md',
  alert: false
})
</script>

<style scoped>
.theme-home-icon-badge {
  --badge-size: 3.68rem;
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--badge-size);
  height: var(--badge-size);
  padding: 0;
  border: 0;
  background:
    center / 100% 100% no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/side-icon-badge-v1.png');
  color: #6e9d95;
  appearance: none;
  filter: drop-shadow(0 0.32rem 0.56rem rgba(109, 157, 150, 0.12));
}

.theme-home-icon-badge.size-sm {
  --badge-size: 2.34rem;
}

.theme-home-icon-badge.size-lg {
  --badge-size: 4.46rem;
}

.badge-inner {
  display: grid;
  place-items: center;
  width: 44%;
  height: 44%;
  transform: translateY(-0.02rem);
}

.badge-inner :deep(svg) {
  width: 100%;
  height: 100%;
  stroke-width: 1.95;
  filter: drop-shadow(0 0.04rem 0 rgba(255, 251, 244, 0.7));
}

.badge-dot {
  position: absolute;
  top: 10.5%;
  right: 8.5%;
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 999px;
  background: #e68258;
  box-shadow:
    0 0 0 0.12rem rgba(255, 251, 247, 0.9),
    0 0.18rem 0.36rem rgba(230, 130, 88, 0.24);
}

@media (max-width: 640px) {
  .theme-home-icon-badge {
    filter: drop-shadow(0 0.22rem 0.44rem rgba(109, 157, 150, 0.1));
  }

  .badge-inner {
    width: 42%;
    height: 42%;
  }

  .badge-dot {
    width: 0.38rem;
    height: 0.38rem;
  }
}
</style>
