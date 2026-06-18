<template>
  <GameSurface :tone="tone" padding="lg" eyebrow="宗门态势" title="山门总览" :subtitle="subtitle">
    <div class="overview-grid">
      <div class="sect-hero">
        <div class="sect-head">
          <div class="sect-icon">{{ sect.icon }}</div>
          <div class="sect-copy">
            <span class="sect-pill">{{ worldStatusLabel }}</span>
            <strong>{{ sect.name }}</strong>
            <small>{{ positionName }} · {{ sect.specialty }} · {{ sect.realm }}</small>
          </div>
        </div>

        <p>{{ sect.description }}</p>

        <div v-if="activeEvent" class="event-banner">
          <strong>{{ activeEvent.title }}</strong>
          <p>{{ activeEvent.description }}</p>
          <div v-if="activeEvent.choices.length > 0" class="event-actions">
            <GameActionButton
              v-for="choice in activeEvent.choices"
              :key="choice.id"
              icon="⚑"
              tone="gold"
              @click="$emit('event-choice', choice.id)"
            >
              {{ choice.text }}
            </GameActionButton>
          </div>
        </div>
      </div>

      <div class="sect-stats">
        <GameStatChip icon="⭐" label="贡献" :value="contribution" tone="gold" />
        <GameStatChip icon="🏅" label="声望" :value="reputation" tone="jade" />
        <GameStatChip icon="💰" label="日俸" :value="`${salary} 灵石`" tone="gold" />
      </div>
    </div>

    <div class="progress-grid">
      <GameProgressBar
        label="宗门血量"
        :current="sectHp"
        :max="sectMaxHp"
        :hint="captivityHint"
        tone="rose"
      />
      <GameProgressBar
        label="晋升贡献"
        :current="nextRequirementProgress.current"
        :max="nextRequirementProgress.max"
        :hint="nextRequirementProgress.hint"
        tone="jade"
      />
    </div>

    <template #footer>
      <div class="footer-actions">
        <GameActionButton
          v-if="canPromote && nextPositionName"
          icon="📈"
          tone="gold"
          @click="$emit('promote')"
        >
          晋升为 {{ nextPositionName }}
        </GameActionButton>
      </div>
    </template>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectDefinition, SectEvent } from '@/types/sect'

const props = defineProps<{
  sect: SectDefinition
  tone: 'jade' | 'gold' | 'mist'
  worldStatusLabel: string
  subtitle: string
  positionName: string
  nextPositionName: string | null
  canPromote: boolean
  contribution: number
  reputation: number
  salary: number
  sectHp: number
  sectMaxHp: number
  captivityHint: string
  activeEvent: SectEvent | null
  nextRequirementProgress: {
    current: number
    max: number
    hint: string
  }
}>()

defineEmits<{
  promote: []
  'event-choice': [choiceId: string]
}>()

const salary = computed(() => props.salary)
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 14px;
}

.sect-hero,
.sect-copy,
.sect-stats,
.progress-grid {
  display: grid;
  gap: 12px;
}

.sect-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sect-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.76);
  font-size: 34px;
}

.sect-copy {
  gap: 4px;
}

.sect-pill {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(105, 148, 145, 0.18);
  color: rgba(73, 97, 95, 0.78);
  font-size: 11px;
}

.sect-copy strong {
  color: #315257;
  font-size: 20px;
}

.sect-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.sect-hero p,
.event-banner p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 13px;
  line-height: 1.65;
}

.sect-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.progress-grid {
  margin-top: 14px;
}

.event-banner {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 248, 231, 0.8);
  border: 1px solid rgba(194, 146, 66, 0.18);
}

.event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.event-banner strong {
  color: #8b6226;
  font-size: 14px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .sect-stats {
    grid-template-columns: 1fr;
  }
}
</style>
