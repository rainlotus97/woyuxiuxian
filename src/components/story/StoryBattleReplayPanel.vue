<template>
  <GameSurface
    tone="gold"
    padding="md"
    title="剧情战纪要"
    subtitle="最近跨路由剧情战会保留完整结构化回放。"
  >
    <div v-if="records.length" class="replay-list">
      <article
        v-for="record in records"
        :key="record.id"
        class="replay-card"
      >
        <div class="replay-head">
          <div>
            <span>{{ record.resultLabel }}</span>
            <strong>{{ record.title }}</strong>
          </div>
          <i>{{ record.turns || 1 }} 手</i>
        </div>
        <p>{{ record.subtitle }}</p>
        <div class="replay-meta">
          <b>{{ record.eventCount }} 条战况</b>
          <b>{{ record.majorEventCount }} 个关键节点</b>
        </div>
        <ul v-if="record.highlights.length" class="highlight-list">
          <li v-for="highlight in record.highlights" :key="highlight">
            {{ highlight }}
          </li>
        </ul>
      </article>
    </div>

    <div v-else class="replay-empty">
      <strong>尚无剧情战记录</strong>
      <p>触发主线剧情战并返回故事页后，这里会显示战况摘要。</p>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { StoryBattleReplaySummary } from '@/story/runtime/storyBattleReplayArchive'

defineProps<{
  records: StoryBattleReplaySummary[]
}>()
</script>

<style scoped>
.replay-list {
  display: grid;
  gap: 10px;
}

.replay-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(139, 103, 50, 0.18);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(255, 253, 238, 0.96), rgba(235, 248, 236, 0.9)),
    radial-gradient(circle at 100% 0%, rgba(210, 151, 68, 0.14), transparent 42%);
}

.replay-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.replay-head div {
  display: grid;
  gap: 4px;
}

.replay-head span,
.replay-head i,
.replay-meta b {
  width: fit-content;
  border-radius: 999px;
  background: rgba(137, 105, 51, 0.1);
  color: #7b5b26;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 4px 8px;
}

.replay-head strong {
  color: #5b4a25;
  font-size: 14px;
}

.replay-card p,
.replay-empty p {
  margin: 0;
  color: rgba(51, 76, 69, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

.replay-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.highlight-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.highlight-list li {
  position: relative;
  padding-left: 14px;
  color: rgba(49, 72, 68, 0.84);
  font-size: 12px;
  line-height: 1.6;
}

.highlight-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 6px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #bb8235;
}

.replay-empty {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.56);
}

.replay-empty strong {
  color: #587166;
  font-size: 13px;
}
</style>
