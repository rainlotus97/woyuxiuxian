<template>
  <BattlePanelShell
    class="world-strip"
    variant="mist"
    padding="md"
    :eyebrow="currentTime"
    :title="statusLabel"
  >
    <p>{{ encounterNote }}</p>
  </BattlePanelShell>
</template>

<script setup lang="ts">
import BattlePanelShell from './BattlePanelShell.vue'

defineProps<{
  currentTime: string
  statusLabel: string
  encounterNote: string
}>()
</script>

<style scoped>
.world-strip {
  position: absolute;
  z-index: 2;
  left: 18px;
  top: calc(82px + env(safe-area-inset-top, 0px));
  width: min(440px, calc(100vw - 164px));
}

.world-strip p {
  margin: 0;
  color: rgba(45, 66, 64, 0.9);
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .world-strip {
    right: 18px;
    width: auto;
    top: calc(76px + env(safe-area-inset-top, 0px));
  }
}
</style>
