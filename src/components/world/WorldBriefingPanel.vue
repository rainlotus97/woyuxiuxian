<template>
  <GameSurface
    tone="gold"
    padding="md"
    eyebrow="世界简报"
    title="此刻要事"
    subtitle="把主角处境、宗门压力、区域异动与关键人物动向压成当前最值得处理的几件事。"
  >
    <div class="briefing-grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="briefing-card"
        :class="`tone-${item.tone}`"
      >
        <div class="briefing-head">
          <span class="briefing-icon">{{ item.icon }}</span>
          <div class="briefing-copy">
            <span class="briefing-badge">{{ item.badge }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.summary }}</p>
          </div>
        </div>

        <div class="briefing-footer">
          <small>{{ item.meta }}</small>
          <GameActionButton
            v-if="item.action"
            :tone="item.tone === 'mist' ? 'rose' : item.tone === 'gold' ? 'gold' : 'jade'"
            :disabled="item.action.disabled"
            @click="$emit('action', item)"
          >
            {{ item.action.label }}
          </GameActionButton>
        </div>
      </article>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { WorldBriefingItem } from '@/world/runtime/worldBriefingResolver'

defineProps<{
  items: WorldBriefingItem[]
}>()

defineEmits<{
  action: [item: WorldBriefingItem]
}>()
</script>

<style scoped>
.briefing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.briefing-card {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(104, 147, 142, 0.18);
  background: rgba(255, 255, 255, 0.74);
}

.briefing-card.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 238, 0.86);
}

.briefing-card.tone-mist {
  border-color: rgba(126, 153, 181, 0.2);
  background: rgba(247, 251, 255, 0.88);
}

.briefing-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.briefing-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 20px;
}

.briefing-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.briefing-badge {
  color: rgba(75, 100, 98, 0.72);
  font-size: 11px;
}

.briefing-copy strong {
  color: #315257;
  font-size: 14px;
  line-height: 1.4;
}

.briefing-copy p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 12px;
  line-height: 1.65;
}

.briefing-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.briefing-footer small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 860px) {
  .briefing-grid {
    grid-template-columns: 1fr;
  }

  .briefing-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
