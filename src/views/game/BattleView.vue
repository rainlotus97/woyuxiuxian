<template>
  <main class="battle-page">
    <CanvasBattleHost
      :selected-target-id="selectedTargetId"
      :area-name="currentArea?.name || null"
      :weather="worldStore.weather"
    />

    <div v-if="!battleVisualReady" class="battle-loading" aria-live="polite">
      <div class="loading-orbit"><span></span><i></i></div>
      <small>战场正在聚形</small>
      <strong>灵气落位中</strong>
    </div>

    <BattleArenaHud
      :snapshot="runtimeSnapshot"
      :area-name="currentArea?.name || null"
      :current-time="worldStore.currentTimeLabel"
      :status-label="areaStatusLabel"
      :encounter-note="encounterNote"
      :auto-battle="autoBattle"
      :battle-speed="battleSpeed"
      :actor-name="currentActorName"
      :target-hint="targetHint"
      :targets="targetOptions"
      :selected-skill-id="selectedSkillId"
      :selected-target-id="selectedTargetId"
      :skills="playerSkills"
      :result-label="resultLabel"
      :rewards="pendingRewards"
      :drops="battleDrops"
      :is-player-selecting="isPlayerSelecting"
      @exit="exitBattle"
      @cycle-auto="cycleAuto"
      @attack="playerAttack"
      @skill="playerSkill"
      @flee="fleeBattle"
      @select-target="setSelectedTargetId"
      @confirm="claimAndExit"
    />
  </main>
</template>

<script setup lang="ts">
import CanvasBattleHost from '@/game/engine/CanvasBattleHost.vue'
import BattleArenaHud from '@/components/battle/BattleArenaHud.vue'
import { useBattleSession } from '@/composables/useBattleSession'

const {
  autoBattle,
  battleVisualReady,
  battleSpeed,
  battleDrops,
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
  isolation: isolate;
  background: #07131d;
  color: #e8f3ed;
  font-family: var(--font-reading-sans), sans-serif;
}

.battle-page::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(3, 12, 18, 0.18), transparent 28%, rgba(3, 12, 18, 0.24)),
    radial-gradient(circle at 50% 52%, transparent 20%, rgba(2, 9, 15, 0.26) 100%);
}

.battle-loading {
  position: absolute;
  inset: 0;
  z-index: 7;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 5px;
  background: rgba(5, 16, 24, 0.78);
  color: rgba(207, 233, 222, 0.72);
  pointer-events: none;
}

.battle-loading small {
  margin-top: 7px;
  color: rgba(156, 196, 181, 0.7);
  font-size: 10px;
  letter-spacing: 0.16em;
}

.battle-loading strong {
  color: #e9c982;
  font-family: var(--font-game), serif;
  font-size: 20px;
  font-weight: 650;
}

.loading-orbit {
  position: relative;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(112, 213, 189, 0.54);
  border-radius: 50%;
  box-shadow: 0 0 28px rgba(112, 213, 189, 0.18);
  animation: loading-spin 2.2s linear infinite;
}

.loading-orbit::before,
.loading-orbit::after,
.loading-orbit span,
.loading-orbit i {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  display: block;
  border-radius: 50%;
  background: #70d5bd;
  box-shadow: 0 0 11px rgba(112, 213, 189, 0.9);
}

.loading-orbit::before { transform: translate(-50%, -50%) translateX(21px); }
.loading-orbit::after { transform: translate(-50%, -50%) translateX(-21px); background: #e4b866; box-shadow: 0 0 11px rgba(228, 184, 102, 0.9); }
.loading-orbit span { transform: translate(-50%, -50%) translateY(21px); }
.loading-orbit i { transform: translate(-50%, -50%) translateY(-21px); background: #f08476; box-shadow: 0 0 11px rgba(240, 132, 118, 0.82); }

@keyframes loading-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .loading-orbit {
    animation: none;
  }
}
</style>
