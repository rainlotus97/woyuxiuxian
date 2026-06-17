<template>
  <BattlePanelShell
    class="log-dock"
    variant="mist"
    padding="md"
    eyebrow="战场流光"
    title="战斗记录"
    :subtitle="summaryText"
    header-align="start"
  >
    <template #header>
      <SpiritFireBar :current="spiritFire" :max="maxSpiritFire" />
    </template>

    <div class="log-list">
      <div
        v-for="log in logs"
        :key="log.id"
        class="battle-log"
        :class="log.severity"
      >
        {{ log.text }}
      </div>
    </div>
  </BattlePanelShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BattleRuntimeLog } from '@/game/battle/battleRuntime'
import BattlePanelShell from './BattlePanelShell.vue'
import SpiritFireBar from './SpiritFireBar.vue'

const props = defineProps<{
  spiritFire: number
  maxSpiritFire: number
  logs: BattleRuntimeLog[]
}>()

const summaryText = computed(() => {
  const latest = props.logs[props.logs.length - 1]
  return latest?.severity === 'major' ? '局势正在迅速变化' : '阵中灵机未定'
})
</script>

<style scoped>
.log-dock {
  position: absolute;
  z-index: 2;
  left: 18px;
  bottom: 18px;
  max-width: min(560px, calc(100vw - 36px));
}

.log-list {
  display: grid;
  gap: 8px;
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

@media (max-width: 720px) {
  .log-dock {
    right: 18px;
    max-width: none;
  }
}
</style>
