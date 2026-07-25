<template>
  <XPanel class="theme-home-panel-shell" tone="gold">
    <slot />
  </XPanel>
</template>

<script setup lang="ts">
import { XPanel } from '@rainlotus97/ui'
</script>

<style scoped>
.theme-home-panel-shell {
  width: 100%;
  min-height: 0;
}
</style>
