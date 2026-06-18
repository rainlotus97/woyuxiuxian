<template>
  <GameSurface tone="mist" padding="md" compact class="npc-activity-panel">
    <div class="activity-head">
      <div>
        <span>人物动向</span>
        <strong>{{ totalEvents ? `${totalEvents} 条新纪闻` : '静候消息' }}</strong>
      </div>
      <small>{{ timeLabel }}</small>
    </div>

    <div class="activity-list">
      <article
        v-for="item in items"
        :key="item.id"
        class="activity-item"
        :class="`tone-${item.tone}`"
      >
        <span class="activity-label">{{ item.label }}</span>
        <div class="activity-copy">
          <strong>{{ item.title }}</strong>
          <p>{{ item.text }}</p>
          <small>{{ item.npcName }} · {{ item.timeLabel }}</small>
        </div>
      </article>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { NpcActivityInsightItem } from '@/world/runtime/npcActivityInsightResolver'

defineProps<{
  items: NpcActivityInsightItem[]
  totalEvents: number
  timeLabel: string
}>()
</script>

<style scoped>
.npc-activity-panel {
  min-width: 0;
}

.activity-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.activity-head div {
  display: grid;
  gap: 4px;
}

.activity-head span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.activity-head strong {
  color: #315257;
  font-size: 15px;
}

.activity-head small {
  color: rgba(73, 97, 95, 0.62);
  font-size: 10px;
  text-align: right;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.activity-item {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
}

.activity-item.tone-gold {
  border-color: rgba(188, 141, 58, 0.22);
  background: rgba(255, 250, 236, 0.78);
}

.activity-item.tone-rose {
  border-color: rgba(198, 121, 137, 0.2);
  background: rgba(255, 248, 249, 0.76);
}

.activity-item.tone-mist {
  border-color: rgba(119, 158, 178, 0.18);
  background: rgba(247, 253, 255, 0.72);
}

.activity-label {
  min-width: 42px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  color: #8b6226;
  font-size: 10px;
}

.activity-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.activity-copy strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-copy p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 11px;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-copy small {
  color: rgba(73, 97, 95, 0.62);
  font-size: 10px;
}

@media (max-width: 720px) {
  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
