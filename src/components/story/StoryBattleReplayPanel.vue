<template>
  <GameSurface
    tone="gold"
    padding="md"
    title="剧情战纪要"
    subtitle="最近跨路由剧情战会保留完整结构化回放。"
  >
    <div v-if="records.length" class="replay-list">
      <article v-for="record in records" :key="record.id" class="replay-record">
        <XTaskEntry
          :title="record.title"
          :description="record.subtitle"
          :tag="record.resultLabel"
          :reward="`${record.turns || 1} 手`"
          icon="sword"
          :tone="resolveReplayTone(record.result)"
          state="active"
          @click="toggleReplay(record.id)"
        />

        <div class="replay-meta">
          <XStatChip
            label="战况"
            :value="record.eventCount"
            suffix="条"
            icon="scroll"
            tone="stone"
          />
          <XStatChip
            label="关键节点"
            :value="record.majorEventCount"
            suffix="个"
            icon="spark"
            tone="gold"
          />
        </div>

        <XButton
          class="replay-open"
          :tone="resolveReplayTone(record.result)"
          size-tone="sm"
          @click="toggleReplay(record.id)"
        >
          <template #icon>
            <XIcon :icon="selectedRecordId === record.id ? 'close' : 'chevron-right'" size="1rem" />
          </template>
          {{ selectedRecordId === record.id ? '收起回放' : '查看回放' }}
        </XButton>

        <ul v-if="record.highlights.length" class="highlight-list">
          <li v-for="highlight in record.highlights" :key="highlight">
            {{ highlight }}
          </li>
        </ul>
      </article>
    </div>

    <XAnnouncement
      v-else
      eyebrow="剧情战纪要"
      title="尚无剧情战记录"
      message="触发主线剧情战并返回故事页后，这里会显示战况摘要。"
      icon="sword"
      tone="stone"
    />

    <XPanel v-if="viewerState" class="replay-viewer" tone="jade">
      <XAnnouncement
        class="viewer-summary"
        :eyebrow="viewerState.resultLabel"
        :title="viewerState.title"
        :message="viewerState.subtitle"
        icon="sword"
        :tone="resolveResultLabelTone(viewerState.resultLabel)"
      >
        <template #action>
          <XButton
            class="viewer-close"
            tone="stone"
            size-tone="sm"
            icon-only
            aria-label="收起回放"
            @click="selectedRecordId = null"
          >
            <template #icon><XIcon icon="close" size="0.9rem" /></template>
          </XButton>
        </template>
      </XAnnouncement>

      <div class="viewer-stats">
        <XStatChip label="回合" :value="viewerState.totalTurns || 1" suffix="手" icon="mission" tone="jade" />
        <XStatChip label="事件" :value="viewerState.totalEvents" suffix="条" icon="scroll" tone="stone" />
        <XStatChip label="关键" :value="viewerState.majorEventCount" suffix="个" icon="spark" tone="gold" />
      </div>

      <div v-if="viewerState.actorNames.length" class="actor-strip">
        <span v-for="actor in viewerState.actorNames.slice(0, 8)" :key="actor">
          {{ actor }}
        </span>
      </div>

      <div class="turn-timeline">
        <section v-for="turn in viewerState.turns" :key="turn.turn" class="turn-block">
          <header>
            <strong>{{ turn.title }}</strong>
            <span>{{ turn.majorCount }} 关键</span>
          </header>
          <div class="event-list">
            <XTaskEntry
              v-for="event in turn.events"
              :key="event.id"
              :title="event.text"
              :description="event.detailText ?? ''"
              :tag="event.typeLabel"
              :icon="event.severity === 'major' ? 'sword' : 'scroll'"
              :tone="event.severity === 'major' ? 'gold' : 'stone'"
              :state="event.severity === 'major' ? 'ready' : 'active'"
              :interactive="false"
            />
          </div>
        </section>
      </div>
    </XPanel>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { XAnnouncement, XButton, XIcon, XPanel, XStatChip, XTaskEntry } from '@rainlotus97/ui'
import type { XTone } from '@rainlotus97/ui'
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

function resolveReplayTone(result: StoryBattleReplaySummary['result']): XTone {
  if (result === 'victory') return 'jade'
  if (result === 'defeat') return 'rose'
  return 'stone'
}

function resolveResultLabelTone(label: string): XTone {
  if (label === '胜利') return 'jade'
  if (label === '败北') return 'rose'
  return 'stone'
}

function toggleReplay(recordId: string) {
  selectedRecordId.value = selectedRecordId.value === recordId ? null : recordId
}
</script>

<style scoped>
.replay-list {
  display: grid;
  gap: 12px;
}

.replay-record {
  display: grid;
  gap: 9px;
  min-width: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(139, 103, 50, 0.14);
}

.replay-record:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.replay-meta,
.viewer-stats,
.actor-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.replay-meta :deep(.x-stat-chip),
.viewer-stats :deep(.x-stat-chip) {
  min-width: 0;
}

.replay-open {
  justify-self: start;
}

.highlight-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0 0 0 18px;
  color: rgba(49, 72, 68, 0.84);
  font-size: 12px;
  line-height: 1.6;
}

.highlight-list li::marker {
  color: #bb8235;
}

.replay-viewer {
  width: 100%;
  min-height: 0;
  margin-top: 14px;
}

.replay-viewer :deep(.x-panel__content) {
  display: grid;
  gap: 12px;
  min-height: 0;
  padding: 14px;
}

.viewer-summary {
  min-width: 0;
}

.viewer-close {
  min-width: 2.7rem;
  width: 2.7rem;
  min-height: 2.7rem;
}

.actor-strip span {
  padding: 5px 8px;
  border: 1px solid rgba(104, 142, 128, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #5f725f;
  font-size: 11px;
  font-weight: 800;
}

.turn-timeline {
  display: grid;
  gap: 10px;
  max-height: min(52vh, 520px);
  overflow-y: auto;
  padding-right: 4px;
}

.turn-block,
.event-list {
  display: grid;
  gap: 8px;
}

.turn-block {
  padding-top: 10px;
  border-top: 1px solid rgba(104, 142, 128, 0.16);
}

.turn-block:first-child {
  padding-top: 0;
  border-top: 0;
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

.event-list :deep(.x-task-entry__description) {
  display: -webkit-box;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.event-list :deep(.x-task-entry) {
  grid-template-columns: auto minmax(0, 1fr);
}

.event-list :deep(.x-task-entry__end) {
  display: none;
}

@media (max-width: 560px) {
  .replay-meta,
  .viewer-stats {
    display: grid;
    grid-template-columns: 1fr;
  }

  .replay-meta :deep(.x-stat-chip),
  .viewer-stats :deep(.x-stat-chip) {
    width: 100%;
  }

  .viewer-summary :deep(.x-announcement__actions) {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
