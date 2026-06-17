<template>
  <section class="log-dock">
    <div class="dock-header passive">
      <SpiritFireBar :current="spiritFire" :max="maxSpiritFire" />
    </div>
    <div
      v-for="log in logs"
      :key="log.id"
      class="battle-log"
      :class="log.severity"
    >
      {{ log.text }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BattleRuntimeLog } from '@/game/battle/battleRuntime'
import SpiritFireBar from './SpiritFireBar.vue'

defineProps<{
  spiritFire: number
  maxSpiritFire: number
  logs: BattleRuntimeLog[]
}>()
</script>

<style scoped>
.log-dock {
  position: absolute;
  z-index: 2;
  left: 18px;
  bottom: 18px;
  display: grid;
  gap: 7px;
  max-width: min(560px, calc(100vw - 36px));
}

.dock-header.passive {
  margin: 0 0 8px;
}

.battle-log {
  padding: 8px 12px;
  border-radius: 10px;
  color: rgba(53, 71, 68, 0.82);
  background: rgba(255, 255, 255, 0.72);
  border-left: 3px solid rgba(76, 184, 166, 0.34);
  box-shadow: 0 8px 20px rgba(89, 130, 128, 0.11);
  font-size: 13px;
}

.battle-log.major {
  color: #8b5a20;
  border-left-color: #e3a642;
  background: rgba(255, 248, 218, 0.78);
}
</style>
