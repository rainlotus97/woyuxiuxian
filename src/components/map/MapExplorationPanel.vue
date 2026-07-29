<template>
  <GameSurface tone="gold" padding="md" compact>
    <div class="exploration-panel">
      <div class="exploration-head">
        <div>
          <span>区域探索</span>
          <strong>可踏勘地点</strong>
        </div>
        <small>{{ feedback ? '最近探索已写入主角行程' : '点击地点进行一次短探索' }}</small>
      </div>

      <div class="point-grid">
        <button
          v-for="point in points"
          :key="point.id"
          class="point-card"
          :class="`kind-${point.kind}`"
          :disabled="Boolean(point.disabledReason) || stamina < point.staminaCost"
          @click="$emit('explore', point.id)"
        >
          <span class="point-icon"><GameIcon :icon="getPointIcon(point.kind)" :size="16" /></span>
          <strong>{{ point.title }}</strong>
          <small>{{ point.disabledReason ?? point.description }}</small>
          <em>{{ point.staminaCost }} 体力 · {{ point.rewardHint }}</em>
        </button>
      </div>

      <div v-if="feedback" class="exploration-feedback">
        <strong>{{ feedback.title }}</strong>
        <p>{{ feedback.text }}</p>
        <div class="reward-row">
          <span>修为 +{{ feedback.rewards.cultivation }}</span>
          <span>灵石 +{{ feedback.rewards.gold }}</span>
          <span v-if="feedback.rewards.itemName">{{ feedback.rewards.itemName }}</span>
        </div>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { MapExplorationPoint, MapExplorationResult, MapExplorationPointKind } from '@/map/runtime/mapExplorationResolver'

defineProps<{
  points: MapExplorationPoint[]
  stamina: number
  feedback: MapExplorationResult | null
}>()

defineEmits<{
  explore: [pointId: string]
}>()

function getPointIcon(kind: MapExplorationPointKind) {
  if (kind === 'resource') return 'herb'
  if (kind === 'trail') return 'map'
  return 'landmark'
}
</script>

<style scoped>
.exploration-panel,
.exploration-feedback {
  display: grid;
  gap: 12px;
}

.exploration-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.exploration-head div {
  display: grid;
  gap: 4px;
}

.exploration-head span,
.exploration-head small,
.point-card small,
.point-card em {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  line-height: 1.45;
}

.exploration-head strong {
  color: #8b6226;
  font-size: 14px;
}

.point-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.point-card {
  min-width: 0;
  display: grid;
  gap: 6px;
  align-content: start;
  min-height: 132px;
  padding: 11px;
  border-radius: 14px;
  border: 1px solid rgba(194, 146, 66, 0.2);
  background: rgba(255, 255, 255, 0.72);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
}

.point-card:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.point-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 240, 177, 0.82);
  color: #8b6226;
  font-size: 12px;
  font-weight: 800;
}

.point-card strong {
  color: #315257;
  font-size: 13px;
  line-height: 1.35;
}

.point-card em {
  font-style: normal;
}

.kind-resource {
  background: rgba(244, 252, 248, 0.84);
  border-color: rgba(103, 149, 144, 0.18);
}

.kind-trail {
  background: rgba(248, 253, 255, 0.84);
  border-color: rgba(119, 158, 178, 0.18);
}

.exploration-feedback {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.8);
}

.exploration-feedback strong {
  color: #8b6226;
  font-size: 13px;
}

.exploration-feedback p {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.reward-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-row span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(73, 97, 95, 0.8);
  font-size: 10px;
}

@media (max-width: 720px) {
  .exploration-head {
    display: grid;
  }

  .point-grid {
    grid-template-columns: 1fr;
  }
}
</style>
