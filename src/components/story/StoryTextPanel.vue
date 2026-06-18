<template>
  <section class="story-text-panel">
    <div class="paper-rule" />
    <div class="story-main-text">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.story-text-panel {
  position: relative;
  min-height: 240px;
  padding: 24px;
  border: 1px solid rgba(151, 133, 79, 0.2);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 254, 246, 0.98), rgba(244, 249, 238, 0.94)),
    repeating-linear-gradient(0deg, transparent 0 31px, rgba(153, 134, 83, 0.055) 31px 32px);
  box-shadow: 0 20px 48px rgba(82, 108, 96, 0.12);
  overflow: hidden;
}

.paper-rule {
  position: absolute;
  inset: 18px auto 18px 18px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #b67d2f, rgba(127, 168, 121, 0.22));
}

.story-main-text {
  padding-left: 16px;
  color: #314b45;
  font-size: 16px;
  line-height: 2.05;
  white-space: pre-wrap;
}

@media (max-width: 560px) {
  .story-text-panel {
    min-height: 200px;
    padding: 18px;
    border-radius: 18px;
  }

  .story-main-text {
    font-size: 15px;
    line-height: 1.9;
  }
}
</style>
