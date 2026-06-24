<template>
  <div class="battle-page">
    <PhaserHost start-scene="BattleScene" />
    <div v-if="!battleVisualReady" class="battle-loading-veil">
      <div class="battle-loading-core">
        <small>战场正在聚形</small>
        <strong>灵气还在落位</strong>
        <p>稍稳住就会直接接回这一场交锋，不会跳成单独的阅读页。</p>
      </div>
    </div>
    <BattleTopHud
      :area-name="currentArea?.name || null"
      :title="runtimeSnapshot?.result ? resultLabel : `第 ${runtimeSnapshot?.turn || 1} 手`"
      :auto-battle="autoBattle"
      :battle-speed="battleSpeed"
      @exit="exitBattle"
      @cycle-auto="cycleAuto"
    />
    <BattleActionOrder
      v-if="battleVisualReady && runtimeSnapshot"
      :units="sortedUnits"
      :current-actor-id="runtimeSnapshot.currentActorId"
    />

    <BattleWorldStrip
      v-if="battleVisualReady"
      :current-time="worldStore.currentTimeLabel"
      :status-label="areaStatusLabel"
      :encounter-note="encounterNote"
    />

    <BattleCommandDock
      v-if="battleVisualReady && runtimeSnapshot?.phase === 'selecting' && isPlayerSelecting && runtimeSnapshot"
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
      v-else-if="battleVisualReady && runtimeSnapshot"
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
import { GAME_THEME_TOKENS } from '@/game/theme/gameTheme'

const {
  autoBattle,
  battleVisualReady,
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
  background: v-bind('GAME_THEME_TOKENS.battleBackdrop');
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

.battle-loading-veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: 120px 26px 180px;
  pointer-events: none;
}

.battle-loading-core {
  width: min(320px, 100%);
  padding: 18px 18px 16px;
  border-radius: 26px;
  border: 1px solid rgba(162, 188, 186, 0.26);
  background:
    linear-gradient(180deg, rgba(248, 253, 255, 0.82), rgba(236, 247, 244, 0.76)),
    radial-gradient(circle at top, rgba(255, 226, 148, 0.18), transparent 62%);
  box-shadow: 0 22px 50px rgba(97, 137, 136, 0.12);
  backdrop-filter: blur(10px);
  text-align: center;
}

.battle-loading-core small {
  display: block;
  color: rgba(68, 110, 110, 0.64);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.battle-loading-core strong {
  display: block;
  margin-top: 6px;
  color: #94621e;
  font-size: 28px;
  line-height: 1.15;
}

.battle-loading-core p {
  margin: 10px 0 0;
  color: rgba(48, 76, 75, 0.82);
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 720px) {
  .battle-page::before {
    background:
      radial-gradient(circle at 50% 56%, rgba(255, 233, 170, 0.26), transparent 24%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(181, 222, 218, 0.12));
  }

  .battle-loading-veil {
    padding: 110px 16px 146px;
  }

  .battle-loading-core {
    padding: 15px 14px 14px;
    border-radius: 20px;
  }

  .battle-loading-core strong {
    font-size: 24px;
  }

  .battle-loading-core p {
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
