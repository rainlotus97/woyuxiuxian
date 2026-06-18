<template>
  <GameSurface
    class="area-card"
    :class="{ locked: !unlocked, cleared: stars > 0 }"
    :tone="stars > 0 ? 'realm' : 'jade'"
    padding="lg"
    compact
  >
    <div class="area-header">
      <div class="area-leading">
        <div class="area-icon">{{ area.icon }}</div>
        <div class="area-copy">
          <strong>{{ area.name }}</strong>
          <small :style="{ color: realmColor }">
            {{ getRealmRequirementText(area.requiredRealm, area.requiredRealmLevel) }}
          </small>
        </div>
      </div>
      <span class="difficulty-badge" :style="{ color: difficultyColor }">
        {{ difficultyLabel }}
      </span>
    </div>

    <p class="area-desc">{{ area.description }}</p>

    <div v-if="encounter" class="area-world-state">
      <span
        class="risk-badge"
        :style="{ color: encounter.riskColor, borderColor: `${encounter.riskColor}55` }"
      >
        {{ encounter.statusText }}
      </span>
      <p>{{ encounter.encounterNote }}</p>
    </div>

    <div class="area-access-row" :class="`state-${access.entryState}`">
      <span class="access-badge">{{ access.entryLabel }}</span>
      <p>{{ access.entryReason }}</p>
    </div>
    <small v-if="access.warnings[0]" class="access-warning">
      {{ access.warnings[0] }}
    </small>

    <div class="area-meta-grid">
      <div class="drop-strip">
        <span class="meta-label">掉落</span>
        <div class="drops-items">
          <span
            v-for="drop in area.drops.slice(0, 4)"
            :key="drop.id"
            class="drop-preview"
            :class="drop.quality"
            :title="drop.name"
          >
            {{ drop.icon }}
          </span>
          <span v-if="area.drops.length > 4" class="more-drops">+{{ area.drops.length - 4 }}</span>
        </div>
      </div>

      <div class="meta-chips">
        <GameStatChip icon="⚡" label="体力" :value="access.staminaCost" tone="gold" />
        <GameStatChip icon="🌊" label="波次" :value="`${difficultyWaves}波`" tone="jade" />
      </div>
    </div>

    <div v-if="stars > 0" class="area-stars">
      <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= stars }">★</span>
    </div>

    <template #footer>
      <div class="area-actions">
        <GameActionButton
          v-if="!unlocked"
          icon="🔒"
          tone="stone"
          block
          disabled
        >
          境界不足
        </GameActionButton>

        <GameActionButton
          v-else-if="!access.challengeAllowed"
          icon="⛔"
          tone="stone"
          block
          disabled
        >
          {{ access.entryLabel }}
        </GameActionButton>

        <template v-else-if="stars === 0">
          <GameActionButton
            icon="⚔️"
            tone="jade"
            block
            :disabled="stamina < access.staminaCost"
            @click="$emit('challenge', area)"
          >
            挑战
          </GameActionButton>
        </template>

        <template v-else>
          <GameActionButton
            icon="⚔️"
            tone="jade"
            block
            :disabled="stamina < access.staminaCost"
            @click="$emit('challenge', area)"
          >
            挑战
          </GameActionButton>
          <GameActionButton
            icon="🔄"
            tone="gold"
            block
            :disabled="stamina < access.sweepCost || !access.sweepAllowed"
            @click="$emit('sweep', area)"
          >
            扫荡x3
          </GameActionButton>
        </template>
      </div>
    </template>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import type { MapAreaEncounterContext } from '@/map/runtime/mapAreaEncounterResolver'
import {
  DIFFICULTY_CONFIG,
  REALM_PRIMARY_COLOR,
  getRealmRequirementText,
  type AreaDefinition
} from '@/types/adventure'

const props = defineProps<{
  area: AreaDefinition
  access: AreaGameplayAccess
  encounter: MapAreaEncounterContext | null
  unlocked: boolean
  stars: number
  stamina: number
}>()

defineEmits<{
  challenge: [area: AreaDefinition]
  sweep: [area: AreaDefinition]
}>()

const realmColor = computed(() => REALM_PRIMARY_COLOR[props.area.requiredRealm] || '#7eb8da')
const difficultyConfig = computed(() => DIFFICULTY_CONFIG[props.area.difficulty as keyof typeof DIFFICULTY_CONFIG])
const difficultyColor = computed(() => difficultyConfig.value?.color || '#7eb8da')
const difficultyLabel = computed(() => difficultyConfig.value?.label || props.area.difficulty)
const difficultyWaves = computed(() => difficultyConfig.value?.waves || 1)
</script>

<style scoped>
.area-card.locked {
  opacity: 0.74;
}

.area-card.cleared {
  border-color: rgba(98, 177, 132, 0.28);
}

.area-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.area-leading {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.area-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 24px;
}

.area-copy {
  display: grid;
  gap: 4px;
}

.area-copy strong {
  color: #315257;
  font-size: 16px;
}

.area-copy small {
  font-size: 11px;
}

.difficulty-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(105, 149, 143, 0.16);
  font-size: 11px;
  white-space: nowrap;
}

.area-desc {
  margin: 12px 0 0;
  color: rgba(49, 82, 87, 0.8);
  font-size: 12px;
  line-height: 1.65;
}

.area-world-state {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 4px 9px;
  border: 1px solid rgba(126, 184, 218, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-weight: 700;
}

.area-world-state p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 11px;
  line-height: 1.55;
}

.area-access-row {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background: rgba(255, 255, 255, 0.62);
}

.area-access-row p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.access-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  color: #4c7a78;
  background: rgba(239, 250, 247, 0.78);
  font-size: 11px;
}

.area-access-row.state-risky .access-badge {
  color: #9b6a1c;
  border-color: rgba(214, 153, 58, 0.24);
  background: rgba(255, 248, 232, 0.92);
}

.area-access-row.state-blocked .access-badge {
  color: #9b4a55;
  border-color: rgba(190, 103, 122, 0.24);
  background: rgba(255, 242, 245, 0.92);
}

.access-warning {
  display: block;
  margin-top: 8px;
  color: rgba(73, 97, 95, 0.64);
  font-size: 11px;
  line-height: 1.55;
}

.area-meta-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
}

.drop-strip {
  display: grid;
  gap: 8px;
}

.meta-label {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.drops-items {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.drop-preview {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  font-size: 13px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.74);
}

.drop-preview.common { border: 1px solid #9ca3af; }
.drop-preview.fine { border: 1px solid #4ade80; }
.drop-preview.rare { border: 1px solid #7eb8da; }
.drop-preview.epic { border: 1px solid #a78bfa; }
.drop-preview.legendary { border: 1px solid #fbbf24; }

.more-drops {
  display: inline-flex;
  align-items: center;
  color: rgba(73, 97, 95, 0.72);
  font-size: 10px;
}

.meta-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.area-stars {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}

.star {
  font-size: 14px;
  color: rgba(251, 191, 36, 0.26);
}

.star.filled {
  color: #f0b84d;
}

.area-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 880px) {
  .area-meta-grid {
    grid-template-columns: 1fr;
  }

  .meta-chips {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .area-header {
    flex-direction: column;
  }

  .area-actions {
    grid-template-columns: 1fr;
  }
}
</style>
