<template>
  <div class="recruit-panel">
    <GameSurface tone="mist" padding="lg" eyebrow="宗门归属" title="尚未拜入宗门" subtitle="攻占区域、推进剧情与世界事件后，可解锁更多宗门选择。">
      <div class="empty-hero">
        <div class="empty-icon">🏛️</div>
        <p>当前尚无正式师承。你可以先通过地图与历练扩大接触面，再决定投向哪方势力。</p>
      </div>
    </GameSurface>

    <GameSurface v-if="sects.length > 0" tone="gold" padding="md" eyebrow="可加入势力" title="待选宗门" subtitle="不同宗门会决定任务、外交、设施与后续战事走向。">
      <div class="sect-list">
        <button v-for="sect in sects" :key="sect.id" class="sect-card" @click="$emit('join', sect.id)">
          <div class="sect-leading">
            <div class="sect-icon">{{ sect.icon }}</div>
            <div class="sect-copy">
              <strong>{{ sect.name }}</strong>
              <small>{{ sect.realm }} · {{ sect.specialty }}</small>
            </div>
          </div>
          <p>{{ sect.description }}</p>
        </button>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectDefinition } from '@/types/sect'

defineProps<{
  sects: SectDefinition[]
}>()

defineEmits<{
  join: [sectId: string]
}>()
</script>

<style scoped>
.recruit-panel,
.sect-list {
  display: grid;
  gap: 14px;
}

.empty-hero {
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
  font-size: 34px;
}

.empty-hero p,
.sect-card p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 13px;
  line-height: 1.65;
}

.sect-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  background: rgba(255, 255, 255, 0.72);
  text-align: left;
}

.sect-leading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sect-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 248, 234, 0.9);
  font-size: 24px;
}

.sect-copy {
  display: grid;
  gap: 4px;
}

.sect-copy strong {
  color: #315257;
  font-size: 15px;
}

.sect-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}
</style>
