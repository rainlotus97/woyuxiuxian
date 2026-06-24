<template>
  <section class="theme-home-panel-shell">
    <div class="panel-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.theme-home-panel-shell {
  position: relative;
  width: 100%;
  aspect-ratio: 1672 / 941;
  background:
    center / 100% 100% no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/cultivation-panel-v1.png');
}

.panel-content {
  position: absolute;
  inset: 8.4% 5.2% 9.1%;
}
</style>
