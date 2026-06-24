<template>
  <div class="theme-section-heading" :class="[`tone-${tone}`, { centered }]">
    <span class="heading-line"></span>
    <div class="heading-copy">
      <small v-if="eyebrow">{{ eyebrow }}</small>
      <strong>{{ title }}</strong>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <span class="heading-line"></span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  subtitle?: string
  tone?: 'jade' | 'gold' | 'mist'
  centered?: boolean
}>(), {
  eyebrow: '',
  subtitle: '',
  tone: 'gold',
  centered: false
})
</script>

<style scoped>
.theme-section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-surface-title, #8e6227);
}

.theme-section-heading.centered {
  justify-content: center;
  text-align: center;
}

.heading-line {
  flex: 1 1 auto;
  min-width: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(199, 162, 92, 0.72), transparent);
  opacity: 0.72;
}

.heading-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.heading-copy small {
  color: var(--theme-surface-muted, rgba(67, 92, 90, 0.72));
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.08em;
}

.heading-copy strong {
  color: inherit;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 700;
}

.heading-copy p {
  margin: 0;
  color: var(--theme-surface-muted, rgba(67, 92, 90, 0.72));
  font-size: 11px;
  line-height: 1.45;
}

.tone-jade {
  color: #567f74;
}

.tone-mist {
  color: #627f84;
}
</style>
