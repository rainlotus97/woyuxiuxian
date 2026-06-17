<template>
  <div class="battle-page">
    <PhaserHost start-scene="BattleScene" />
    <BattleTopHud
      :area-name="currentArea?.name || null"
      :title="runtimeSnapshot?.result ? resultLabel : `第 ${runtimeSnapshot?.turn || 1} 手`"
      :auto-battle="autoBattle"
      :battle-speed="battleSpeed"
      @exit="exitBattle"
      @cycle-auto="cycleAuto"
    />
    <BattleActionOrder
      v-if="runtimeSnapshot"
      :units="sortedUnits"
      :current-actor-id="runtimeSnapshot.currentActorId"
    />

    <BattleWorldStrip
      :current-time="worldStore.currentTimeLabel"
      :status-label="areaStatusLabel"
      :encounter-note="encounterNote"
    />

    <BattleCommandDock
      v-if="runtimeSnapshot?.phase === 'selecting' && isPlayerSelecting && runtimeSnapshot"
      :spirit-fire="runtimeSnapshot.spiritFire"
      :max-spirit-fire="runtimeSnapshot.maxSpiritFire"
      :actor-name="currentActorName"
      :target-hint="targetHint"
      :targets="targetOptions"
      :selected-skill-id="selectedSkillId"
      :selected-target-id="selectedTargetId"
      :skills="playerSkills"
      @attack="playerAttack"
      @skill="playerSkill"
      @flee="fleeBattle"
      @select-target="setSelectedTargetId"
    />

    <BattleLogDock
      v-else-if="runtimeSnapshot"
      :spirit-fire="runtimeSnapshot.spiritFire"
      :max-spirit-fire="runtimeSnapshot.maxSpiritFire"
      :logs="runtimeSnapshot.logs"
    />

    <BattleResultPanel
      v-if="runtimeSnapshot?.phase === 'ended' && runtimeSnapshot.result"
      :result="runtimeSnapshot.result"
      :title="resultLabel"
      :rewards="pendingRewards"
      @confirm="claimAndExit"
    />
  </div>
</template>

<script setup lang="ts">
import PhaserHost from '@/game/engine/PhaserHost.vue'
import BattleActionOrder from '@/components/battle/BattleActionOrder.vue'
import BattleCommandDock from '@/components/battle/BattleCommandDock.vue'
import BattleLogDock from '@/components/battle/BattleLogDock.vue'
import BattleResultPanel from '@/components/battle/BattleResultPanel.vue'
import BattleTopHud from '@/components/battle/BattleTopHud.vue'
import BattleWorldStrip from '@/components/battle/BattleWorldStrip.vue'
import { useBattleSession } from '@/composables/useBattleSession'

const {
  autoBattle,
  battleSpeed,
  claimAndExit,
  currentActorName,
  currentArea,
  cycleAuto,
  exitBattle,
  fleeBattle,
  isPlayerSelecting,
  pendingRewards,
  playerAttack,
  playerSkills,
  playerSkill,
  resultLabel,
  runtimeSnapshot,
  selectedTargetId,
  setSelectedTargetId,
  selectedSkillId,
  sortedUnits,
  areaStatusLabel,
  encounterNote,
  targetHint,
  targetOptions,
  worldStore
} = useBattleSession()
</script>

<style scoped>
.battle-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #e8f7ff;
  color: #244a52;
  font-family: var(--font-pixel), serif;
}

.battle-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 58%, rgba(255, 239, 180, 0.34), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(181, 222, 218, 0.18));
  z-index: 1;
}
</style>
