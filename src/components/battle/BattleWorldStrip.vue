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
  top: calc(70px + env(safe-area-inset-top, 0px));
  width: min(380px, calc(100vw - 176px));
}

.world-strip p {
  margin: 0;
  color: rgba(45, 66, 64, 0.9);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .world-strip {
    left: 10px;
    right: 108px;
    width: auto;
    top: calc(38px + env(safe-area-inset-top, 0px));
    padding: 3px 5px;
  }

  .world-strip p {
    font-size: 8px;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
