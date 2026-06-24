<template>
  <section class="theme-panel-frame" :class="[`variant-${variant}`, { inset, compact }]">
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'surface' | 'story' | 'action' | 'info'
  inset?: boolean
  compact?: boolean
}>(), {
  variant: 'surface',
  inset: false,
  compact: false
})
</script>

<style scoped>
.theme-panel-frame {
  position: relative;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background:
    var(--theme-panel-texture),
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(241, 248, 244, 0.9));
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  box-shadow:
    0 18px 42px rgba(88, 123, 116, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.46);
  overflow: hidden;
}

.theme-panel-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(255, 222, 148, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(111, 174, 152, 0.06), transparent 46%, rgba(200, 164, 92, 0.04));
}

.theme-panel-frame.variant-story {
  background:
    var(--theme-story-bg-image),
    var(--theme-panel-texture),
    linear-gradient(180deg, rgba(255, 252, 246, 0.96), rgba(244, 249, 245, 0.94));
  background-position: center, center, center;
  background-size: cover, 100% 100%, auto;
  background-repeat: no-repeat, no-repeat, no-repeat;
}

.theme-panel-frame.variant-action {
  border-color: rgba(200, 164, 92, 0.22);
  background:
    var(--theme-panel-texture),
    linear-gradient(180deg, rgba(255, 251, 239, 0.96), rgba(244, 249, 245, 0.92));
}

.theme-panel-frame.variant-info {
  border-color: rgba(111, 174, 152, 0.18);
  background:
    var(--theme-panel-texture),
    linear-gradient(180deg, rgba(248, 252, 250, 0.94), rgba(238, 246, 242, 0.9));
}

.theme-panel-frame.inset {
  box-shadow:
    inset 0 0 0 1px rgba(200, 164, 92, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.theme-panel-frame.compact {
  border-radius: 18px;
}
</style>
