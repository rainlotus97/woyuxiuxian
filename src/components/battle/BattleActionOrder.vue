<template>
  <div class="action-order" v-if="units.length">
    <div class="order-title">行动序列</div>
    <div
      v-for="unit in units"
      :key="unit.id"
      class="order-row"
      :class="{ active: currentActorId === unit.id, enemy: unit.side === 'enemy' }"
    >
      <span>{{ unit.icon }}</span>
      <div class="order-meta">
        <b>{{ cleanName(unit.name) }}</b>
        <div class="gauge"><i :style="{ width: `${unit.actionGauge}%` }"></i></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BattleRuntimeUnit } from '@/game/battle/battleRuntime'

defineProps<{
  units: BattleRuntimeUnit[]
  currentActorId: string | null
}>()

function cleanName(name: string) {
  return name.replace('[BOSS]', '').replace('[精英]', '')
}
</script>

<style scoped>
.action-order {
  position: absolute;
  z-index: 2;
  right: 18px;
  top: 106px;
  width: 148px;
  display: grid;
  gap: 8px;
  padding: 11px 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(97, 147, 135, 0.28);
  background: rgba(255, 252, 236, 0.56);
  box-shadow: 0 18px 45px rgba(89, 139, 130, 0.16);
  backdrop-filter: blur(12px);
}

.order-title {
  color: #8c652c;
  font-size: 12px;
  text-align: center;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(176, 133, 55, 0.18);
}

.order-row {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 7px;
  opacity: 0.82;
  padding: 6px;
  border-radius: 11px;
}

.order-row.active {
  opacity: 1;
  background: rgba(255, 235, 154, 0.56);
  filter: drop-shadow(0 4px 10px rgba(188, 134, 44, 0.24));
}

.order-row.enemy .gauge i {
  background: linear-gradient(90deg, #f47c8c, #d64a5e);
}

.order-meta {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.order-meta b {
  color: #345b59;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gauge {
  height: 7px;
  background: rgba(112, 130, 121, 0.18);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(60, 86, 83, 0.2);
}

.gauge i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #4cc7b4, #9ee6cf);
}

@media (max-width: 720px) {
  .action-order {
    width: 118px;
    right: 10px;
  }

  .order-title,
  .order-meta b {
    display: none;
  }

  .order-row {
    grid-template-columns: 22px 1fr;
    padding: 5px;
  }
}
</style>
