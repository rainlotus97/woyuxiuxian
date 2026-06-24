<template>
  <GameSurface
    tone="gold"
    padding="md"
    eyebrow="后续回响"
    title="这几股风声"
    subtitle="眼前这件事之外，别的动静也在慢慢逼近。"
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
  grid-template-columns: 1fr;
  gap: 10px;
}

.briefing-card {
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border-radius: 16px;
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
  gap: 10px;
}

.briefing-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 17px;
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
  font-size: 13px;
  line-height: 1.35;
}

.briefing-copy p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 11px;
  line-height: 1.55;
}

.briefing-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.briefing-footer small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 10px;
  line-height: 1.45;
}

@media (max-width: 860px) {
  .briefing-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
