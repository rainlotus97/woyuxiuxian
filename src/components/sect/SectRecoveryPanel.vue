<template>
  <GameSurface
    v-if="state.active || capturedNpc"
    :tone="state.tone"
    padding="md"
    :eyebrow="state.active ? '宗门恢复' : '宗门救援'"
    :title="state.active ? '山门复原' : '营救同门'"
    :subtitle="state.active ? state.summary : '重要人物被俘后会牵动宗门关系与世界态势，可派人接应救回。'"
  >
    <div class="recovery-grid">
      <div v-if="state.active" class="recovery-summary">
        <GameProgressBar
          label="恢复进度"
          :current="state.progressCurrent"
          :max="state.progressMax"
          :hint="state.progressHint"
          :tone="state.tone === 'mist' ? 'rose' : state.tone"
        />
        <div class="summary-pills">
          <span class="summary-pill">{{ state.stageLabel }}</span>
          <span class="summary-pill">可用行动 {{ state.options.length }}</span>
        </div>
      </div>

      <div class="action-list">
        <button
          v-if="capturedNpc"
          class="action-card tone-mist"
          @click="$emit('rescue-npc', capturedNpc.id)"
        >
          <div class="action-head">
            <strong>营救{{ capturedNpc.name }}</strong>
            <span>{{ capturedNpc.severity === 'legendary' ? '高危' : '要事' }}</span>
          </div>
          <p>{{ capturedNpc.title }}被{{ capturedNpc.captorName || '敌手' }}控制，现踪{{ capturedNpc.locationName }}。派出同门接应，可将其救回宗门范围。</p>
          <small>
            消耗 {{ npcRescueCost.contribution }} 贡献 · {{ npcRescueCost.gold }} 灵石 · 救回后转入疗伤
          </small>
        </button>

        <button
          v-for="option in state.options"
          :key="option.id"
          class="action-card"
          :class="`tone-${option.tone}`"
          @click="$emit('act', option.id)"
        >
          <div class="action-head">
            <strong>{{ option.label }}</strong>
            <span>+{{ option.progressGain }} 进度</span>
          </div>
          <p>{{ option.description }}</p>
          <small>
            消耗 {{ option.contributionCost }} 贡献 · {{ option.goldCost }} 灵石
            <template v-if="option.clearsCaptivity"> · 可处理主角囚局</template>
          </small>
        </button>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectRecoveryActionId, SectRecoveryState } from '@/sect/runtime/sectRecoveryResolver'

defineProps<{
  state: SectRecoveryState
  capturedNpc?: {
    id: string
    name: string
    title: string
    captorName: string | null
    locationName: string
    severity: 'major' | 'legendary'
  } | null
  npcRescueCost: {
    contribution: number
    gold: number
  }
}>()

defineEmits<{
  act: [actionId: SectRecoveryActionId]
  'rescue-npc': [npcId: string]
}>()
</script>

<style scoped>
.recovery-grid,
.recovery-summary,
.action-list {
  display: grid;
  gap: 12px;
}

.summary-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(120, 146, 149, 0.18);
  color: rgba(73, 97, 95, 0.82);
  font-size: 11px;
}

.action-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-card {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  background: rgba(255, 255, 255, 0.72);
  color: #315257;
  text-align: left;
  font-family: var(--font-game);
}

.action-card.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 238, 0.86);
}

.action-card.tone-mist {
  border-color: rgba(126, 153, 181, 0.2);
  background: rgba(247, 251, 255, 0.88);
}

.action-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.action-head strong {
  color: #315257;
  font-size: 14px;
}

.action-head span,
.action-card small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.action-card p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .action-list {
    grid-template-columns: 1fr;
  }
}
</style>
