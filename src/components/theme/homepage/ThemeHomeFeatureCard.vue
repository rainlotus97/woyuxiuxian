<template>
  <button class="theme-home-feature-card" type="button">
    <XCard class="feature-card-shell" tone="jade">
      <template #title>{{ title }}</template>
      <p>{{ description }}</p>
      <template #footer>
        <span class="card-action">
          <slot name="icon">
            <XIcon icon="chevron-right" size="1rem" />
          </slot>
        </span>
      </template>
    </XCard>
  </button>
</template>

<script setup lang="ts">
import { XCard, XIcon } from '@xianxia/ui'

defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.theme-home-feature-card {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.feature-card-shell {
  min-height: 9.5rem;
  height: 100%;
  transition: transform 0.16s ease, border-color 0.16s ease;
}

.theme-home-feature-card:hover .feature-card-shell {
  transform: translateY(-2px);
}

.theme-home-feature-card:active .feature-card-shell {
  transform: translateY(1px);
}

.theme-home-feature-card:focus-visible {
  outline: 2px solid rgba(190, 147, 58, 0.7);
  outline-offset: 3px;
}

.theme-home-feature-card p {
  margin: 0;
}

.card-action {
  display: flex;
  justify-content: flex-end;
  color: #5e9387;
}
</style>
