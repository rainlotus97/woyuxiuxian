<template>
  <BattlePanelShell
    v-if="units.length"
    class="action-order"
    variant="jade"
    padding="sm"
    eyebrow="气机轮转"
    title="行动序列"
  >
    <div class="order-list">
      <div
        v-for="unit in units"
        :key="unit.id"
        class="order-row"
        :class="{ active: currentActorId === unit.id, enemy: unit.side === 'enemy' }"
      >
        <span class="order-icon" :class="unit.portraitKey ? `portrait-${unit.portraitKey}` : ''">
          <GameIcon :icon="unit.icon" :size="12" />
        </span>
        <div class="order-meta">
          <b>{{ cleanName(unit.name) }}</b>
          <div class="gauge"><i :style="{ width: `${unit.actionGauge}%` }"></i></div>
        </div>
      </div>
    </div>
  </BattlePanelShell>
</template>

<script setup lang="ts">
import type { BattleRuntimeUnit } from '@/game/battle/battleRuntime'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import BattlePanelShell from './BattlePanelShell.vue'

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
  z-index: 3;
  right: 18px;
  top: calc(72px + env(safe-area-inset-top, 0px));
  width: 156px;
}

.order-list {
  display: grid;
  gap: 8px;
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
  background: rgba(255, 235, 154, 0.48);
  box-shadow: inset 0 0 0 1px rgba(207, 154, 66, 0.18);
}

.order-row.enemy .gauge i {
  background: linear-gradient(90deg, #f47c8c, #d64a5e);
}

.order-icon {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  color: #35585a;
}

.order-icon.portrait-ally_protagonist {
  background: linear-gradient(135deg, rgba(255, 241, 186, 0.94), rgba(244, 196, 104, 0.82));
  color: #6a4518;
}

.order-icon.portrait-ally_companion,
.order-icon.portrait-ally_pet,
.order-icon.portrait-ally_summon {
  background: linear-gradient(135deg, rgba(211, 248, 237, 0.94), rgba(126, 225, 201, 0.84));
  color: #1f6f66;
}

.order-icon.portrait-enemy_enemy,
.order-icon.portrait-enemy_elite,
.order-icon.portrait-enemy_boss {
  background: linear-gradient(135deg, rgba(255, 228, 225, 0.94), rgba(232, 128, 140, 0.84));
  color: #7f2f3c;
}

.order-icon.portrait-enemy_boss {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 0 0 1px rgba(181, 87, 100, 0.22);
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
    left: 10px;
    right: 10px;
    top: auto;
    bottom: calc(152px + env(safe-area-inset-bottom, 0px));
    width: auto;
    padding: 3px 5px;
  }

  .order-list {
    grid-auto-flow: column;
    grid-auto-columns: minmax(46px, 1fr);
    overflow-x: auto;
    gap: 3px;
  }

  .order-meta b {
    display: none;
  }

  .order-row {
    grid-template-columns: 18px 1fr;
    padding: 0;
    gap: 3px;
    min-width: 0;
  }

  .order-icon {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }

  .gauge {
    height: 4px;
  }
}
</style>
