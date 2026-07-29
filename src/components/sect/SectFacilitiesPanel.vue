<template>
  <GameSurface tone="mist" padding="md" eyebrow="山门经营" title="宗门设施" subtitle="设施等级决定炼丹、药园与后续养成系统的深度。">
    <div class="facility-list" data-ui-list="sect-facilities">
      <div
        v-for="facility in facilities"
        :key="facility.id"
        class="facility-card"
        data-ui-card="sect-facility"
        :class="{ locked: positionLevel < facility.unlockPosition }"
      >
        <div class="facility-leading">
          <GameIcon class="facility-icon" :icon="facility.icon" :size="26" />
          <div class="facility-copy">
            <strong>{{ facility.name }}</strong>
            <small>Lv.{{ getLevel(facility.id) }}/{{ facility.maxLevel }} · {{ facility.description }}</small>
          </div>
        </div>

        <div class="facility-meta">
          <span class="unlock-note">开放职位：{{ facility.unlockPosition }}阶</span>
          <span class="effect-note">{{ facility.effects[0]?.description || '暂无效果' }}</span>
        </div>

        <div class="facility-actions">
          <GameActionButton
            v-if="canUseFacility(facility.id)"
            icon="alchemy"
            tone="jade"
            @click="$emit('use-facility', facility.id)"
          >
            使用
          </GameActionButton>
          <GameActionButton
            v-if="positionLevel >= facility.unlockPosition && getLevel(facility.id) < facility.maxLevel"
            icon="progress"
            tone="gold"
            @click="$emit('upgrade-facility', facility.id)"
          >
            升级
          </GameActionButton>
        </div>
      </div>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectFacility } from '@/types/sect'

defineProps<{
  facilities: SectFacility[]
  positionLevel: number
  getLevel: (facilityId: string) => number
  canUseFacility: (facilityId: string) => boolean
}>()

defineEmits<{
  'use-facility': [facilityId: string]
  'upgrade-facility': [facilityId: string]
}>()
</script>

<style scoped>
.facility-list {
  display: grid;
  gap: 12px;
}

.facility-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(103, 149, 144, 0.16);
}

.facility-card.locked {
  opacity: 0.56;
}

.facility-leading,
.facility-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.facility-leading {
  justify-content: space-between;
  min-width: 0;
}

.facility-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.76);
  font-size: 24px;
  flex: 0 0 auto;
}

.facility-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.facility-copy strong {
  color: #315257;
  font-size: 15px;
}

.facility-copy small,
.unlock-note,
.effect-note {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.facility-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.facility-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .facility-leading {
    align-items: start;
  }

  .facility-actions {
    justify-content: stretch;
  }
}
</style>
