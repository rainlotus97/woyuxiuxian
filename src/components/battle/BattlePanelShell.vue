<template>
  <section
    class="panel-shell"
    :class="[
      `variant-${variant}`,
      `padding-${padding}`,
      { 'header-start': headerAlign === 'start' }
    ]"
  >
    <header v-if="hasHeader" class="panel-header">
      <div v-if="eyebrow || title || subtitle" class="panel-copy">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <strong v-if="title">{{ title }}</strong>
        <small v-if="subtitle">{{ subtitle }}</small>
      </div>
      <slot name="header" />
    </header>

    <div class="panel-body">
      <slot />
    </div>

    <footer v-if="hasFooter" class="panel-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  eyebrow?: string | null
  title?: string | null
  subtitle?: string | null
  variant?: 'jade' | 'gold' | 'mist' | 'rose'
  padding?: 'sm' | 'md' | 'lg'
  headerAlign?: 'start' | 'center'
}>(), {
  eyebrow: null,
  title: null,
  subtitle: null,
  variant: 'jade',
  padding: 'md',
  headerAlign: 'center'
})

const slots = useSlots()

const hasHeader = computed(() => {
  return Boolean(props.eyebrow || props.title || props.subtitle || slots.header)
})

const hasFooter = computed(() => Boolean(slots.footer))
</script>

<style scoped>
.panel-shell {
  --panel-border: var(--battle-panel-border, rgba(93, 149, 141, 0.24));
  --panel-bg: var(
    --battle-panel-bg,
    linear-gradient(180deg, rgba(255, 255, 250, 0.9), rgba(240, 249, 244, 0.84))
  );
  --panel-shadow: var(--battle-panel-shadow, 0 20px 48px rgba(86, 123, 118, 0.16));
  --panel-title: var(--battle-title-color, #8f6226);
  --panel-text: var(--battle-ink, #29484a);
  --panel-muted: var(--battle-muted, rgba(58, 88, 86, 0.72));

  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(14px);
}

.variant-gold {
  --panel-border: rgba(187, 139, 57, 0.34);
  --panel-bg:
    linear-gradient(180deg, rgba(255, 251, 233, 0.96), rgba(245, 255, 244, 0.92)),
    radial-gradient(circle at top, rgba(255, 218, 122, 0.22), transparent 58%);
}

.variant-mist {
  --panel-border: rgba(116, 154, 173, 0.24);
  --panel-bg:
    linear-gradient(180deg, rgba(247, 253, 255, 0.9), rgba(240, 249, 246, 0.82)),
    radial-gradient(circle at top left, rgba(184, 226, 240, 0.18), transparent 62%);
}

.variant-rose {
  --panel-border: rgba(194, 123, 136, 0.28);
  --panel-bg:
    linear-gradient(180deg, rgba(255, 249, 247, 0.92), rgba(250, 241, 241, 0.88)),
    radial-gradient(circle at top, rgba(243, 173, 164, 0.16), transparent 58%);
}

.padding-sm {
  padding: 10px 12px;
}

.padding-md {
  padding: 14px 16px;
}

.padding-lg {
  padding: 18px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.header-start .panel-header {
  align-items: flex-start;
}

.panel-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.panel-copy .eyebrow {
  color: var(--panel-muted);
  font-size: 11px;
}

.panel-copy strong {
  color: var(--panel-title);
  font-size: 16px;
  line-height: 1.2;
}

.panel-copy small {
  color: var(--panel-muted);
  font-size: 12px;
  line-height: 1.45;
}

.panel-body {
  color: var(--panel-text);
  min-width: 0;
}

.panel-footer {
  margin-top: 14px;
}
</style>
