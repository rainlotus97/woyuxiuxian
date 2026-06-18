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
        <button class="replay-open" @click="toggleReplay(record.id)">
          {{ selectedRecordId === record.id ? '收起回放' : '查看回放' }}
        </button>
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

    <section v-if="viewerState" class="replay-viewer">
      <div class="viewer-head">
        <div>
          <span>{{ viewerState.resultLabel }}</span>
          <strong>{{ viewerState.title }}</strong>
          <p>{{ viewerState.subtitle }}</p>
        </div>
        <button @click="selectedRecordId = null">×</button>
      </div>

      <div class="viewer-stats">
        <b>{{ viewerState.totalTurns || 1 }} 手</b>
        <b>{{ viewerState.totalEvents }} 条事件</b>
        <b>{{ viewerState.majorEventCount }} 个关键节点</b>
      </div>

      <div v-if="viewerState.actorNames.length" class="actor-strip">
        <span v-for="actor in viewerState.actorNames.slice(0, 8)" :key="actor">
          {{ actor }}
        </span>
      </div>

      <div class="turn-timeline">
        <article
          v-for="turn in viewerState.turns"
          :key="turn.turn"
          class="turn-block"
        >
          <header>
            <strong>{{ turn.title }}</strong>
            <span>{{ turn.majorCount }} 关键</span>
          </header>
          <ol>
            <li
              v-for="event in turn.events"
              :key="event.id"
              :class="`severity-${event.severity}`"
            >
              <i>{{ event.typeLabel }}</i>
              <div>
                <strong>{{ event.text }}</strong>
                <p v-if="event.detailText">{{ event.detailText }}</p>
              </div>
            </li>
          </ol>
        </article>
      </div>
    </section>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import {
  getStoryBattleReplayRecord,
  type StoryBattleReplaySummary
} from '@/story/runtime/storyBattleReplayArchive'
import { createStoryBattleReplayViewerState } from '@/story/runtime/storyBattleReplayViewer'

defineProps<{
  records: StoryBattleReplaySummary[]
}>()

const selectedRecordId = ref<string | null>(null)

const viewerState = computed(() => {
  if (!selectedRecordId.value) return null
  const record = getStoryBattleReplayRecord(selectedRecordId.value)
  return record ? createStoryBattleReplayViewerState(record) : null
})

function toggleReplay(recordId: string) {
  selectedRecordId.value = selectedRecordId.value === recordId ? null : recordId
}
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

.replay-open,
.viewer-head button {
  width: fit-content;
  min-height: 34px;
  border: 1px solid rgba(135, 103, 52, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: #735529;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 800;
  padding: 0 12px;
}

.replay-open:hover,
.viewer-head button:hover {
  background: rgba(255, 250, 232, 0.95);
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

.replay-viewer {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid rgba(94, 138, 124, 0.2);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(246, 255, 251, 0.94), rgba(255, 250, 232, 0.9)),
    repeating-linear-gradient(90deg, rgba(82, 132, 116, 0.04) 0 1px, transparent 1px 16px);
}

.viewer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.viewer-head div {
  display: grid;
  gap: 5px;
}

.viewer-head span {
  width: fit-content;
  border-radius: 999px;
  background: rgba(91, 138, 122, 0.12);
  color: #426e62;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 8px;
}

.viewer-head strong {
  color: #315d55;
  font-size: 16px;
}

.viewer-head p {
  margin: 0;
  color: rgba(49, 78, 73, 0.7);
  font-size: 12px;
  line-height: 1.6;
}

.viewer-head button {
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  font-size: 16px;
}

.viewer-stats,
.actor-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.viewer-stats b,
.actor-strip span {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #5f725f;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 8px;
}

.turn-timeline {
  display: grid;
  gap: 10px;
  max-height: min(52vh, 520px);
  overflow-y: auto;
  padding-right: 4px;
}

.turn-block {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(104, 142, 128, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
}

.turn-block header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.turn-block header strong {
  color: #315d55;
  font-size: 13px;
}

.turn-block header span {
  color: rgba(97, 112, 91, 0.76);
  font-size: 11px;
  font-weight: 800;
}

.turn-block ol {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.turn-block li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: flex-start;
  padding: 8px;
  border-radius: 12px;
  background: rgba(238, 248, 242, 0.78);
}

.turn-block li.severity-major {
  background: rgba(255, 242, 207, 0.86);
}

.turn-block li i {
  min-width: 38px;
  border-radius: 999px;
  background: rgba(57, 97, 88, 0.1);
  color: #426d63;
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
  line-height: 1;
  padding: 6px 7px;
  text-align: center;
}

.turn-block li.severity-major i {
  background: rgba(178, 124, 47, 0.14);
  color: #8a5a1f;
}

.turn-block li div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.turn-block li strong {
  color: #355751;
  font-size: 12px;
  line-height: 1.5;
}

.turn-block li p {
  margin: 0;
  color: rgba(55, 82, 76, 0.66);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 560px) {
  .viewer-head {
    align-items: stretch;
  }

  .turn-block li {
    grid-template-columns: 1fr;
  }
}
</style>
