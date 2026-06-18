<template>
  <GameSurface :tone="tone" padding="md" eyebrow="外交与战局" title="宗门外势" :subtitle="subtitle">
    <div v-if="activeWar" class="war-panel">
      <div class="war-head">
        <div class="war-copy">
          <strong>{{ activeWarLabel }}</strong>
          <small>达成 {{ activeWar.winScore }} 分即分胜负</small>
        </div>
        <span class="war-status">{{ activeWar.status }}</span>
      </div>

      <div class="war-progress-list">
        <GameProgressBar
          label="我方战功"
          :current="activeWar.attackerScore"
          :max="activeWar.winScore"
          tone="gold"
        />
        <GameProgressBar
          label="敌方战功"
          :current="activeWar.defenderScore"
          :max="activeWar.winScore"
          tone="rose"
        />
      </div>
    </div>

    <div class="diplomacy-list">
      <div v-for="relation in relations" :key="relation.sectId" class="relation-card">
        <div class="relation-head">
          <div class="relation-leading">
            <div class="relation-icon">{{ relation.icon }}</div>
            <div class="relation-copy">
              <strong>{{ relation.name }}</strong>
              <small>{{ relation.realm }} · {{ relation.description }}</small>
            </div>
          </div>
          <GameStatChip
            icon="⚑"
            label="关系"
            :value="getSectRelationLabel(relation.relation)"
            :tone="getSectRelationTone(relation.relation)"
          />
        </div>

        <div class="relation-actions">
          <GameActionButton
            v-if="relation.canDeclareWar"
            icon="⚔️"
            tone="rose"
            @click="$emit('declare-war', relation.sectId)"
          >
            宣战
          </GameActionButton>
        </div>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectWar } from '@/types/sect'
import type { SectDiplomacyRow } from './sectUi'
import { getSectRelationLabel, getSectRelationTone } from './sectUi'

const props = defineProps<{
  tone: 'jade' | 'gold' | 'mist'
  subtitle: string
  activeWar: SectWar | null
  relations: SectDiplomacyRow[]
  activeWarLabel: string
}>()

defineEmits<{
  'declare-war': [sectId: string]
}>()

const activeWar = computed(() => props.activeWar)
</script>

<style scoped>
.war-panel,
.diplomacy-list {
  display: grid;
  gap: 14px;
}

.war-panel {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 248, 232, 0.78);
  border: 1px solid rgba(194, 146, 66, 0.18);
}

.war-head,
.relation-head,
.relation-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.war-copy,
.relation-copy {
  display: grid;
  gap: 4px;
}

.war-copy strong,
.relation-copy strong {
  color: #315257;
  font-size: 15px;
}

.war-copy small,
.war-status,
.relation-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.war-progress-list {
  display: grid;
  gap: 10px;
}

.relation-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(103, 149, 144, 0.16);
}

.relation-leading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.relation-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.74);
  font-size: 22px;
}

.relation-actions {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .relation-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
