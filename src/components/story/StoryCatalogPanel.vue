<template>
  <GameSurface tone="mist" padding="md" title="命线去向" subtitle="这些事会顺着人物、境界和地图慢慢展开；卡住时先去修炼或历练。">
    <div class="catalog-list">
      <article
        v-for="entry in entries"
        :key="entry.id"
        class="catalog-item"
        :class="{
          current: entry.isCurrent,
          completed: entry.completed,
          blocked: Boolean(entry.blockReason)
        }"
      >
        <div class="catalog-head">
          <div class="catalog-copy">
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.map }} · {{ perspectiveLabel(entry.perspective) }}</span>
          </div>
          <i>{{ entry.id }}</i>
        </div>

        <div class="catalog-meta">
          <b v-if="entry.isCurrent">进行中</b>
          <b v-else-if="entry.completed">已完成</b>
          <b v-else-if="entry.blockReason">{{ entry.blockReason }}</b>
          <b v-else-if="entry.unlocked">眼下能接上</b>
          <b v-else>待解锁</b>
        </div>
      </article>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { StoryCatalogEntry } from '@/story/storyStore'

defineProps<{
  entries: StoryCatalogEntry[]
}>()

function perspectiveLabel(perspective: StoryCatalogEntry['perspective']) {
  if (perspective === 'male') return '男主这边'
  if (perspective === 'female') return '女主这边'
  return '共通事件'
}
</script>

<style scoped>
.catalog-list {
  display: grid;
  gap: 10px;
}

.catalog-item {
  display: grid;
  gap: 8px;
  padding: 14px 14px 12px;
  border-radius: 18px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(242, 249, 246, 0.74)),
    radial-gradient(circle at 0 0, rgba(191, 142, 63, 0.08), transparent 48%);
  box-shadow: 0 16px 34px rgba(83, 112, 98, 0.08);
}

.catalog-item.current {
  border-color: rgba(188, 141, 58, 0.3);
  background: rgba(255, 249, 233, 0.82);
}

.catalog-item.completed {
  background: rgba(242, 252, 247, 0.8);
}

.catalog-item.blocked {
  background: rgba(255, 244, 247, 0.82);
}

.catalog-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.catalog-copy {
  display: grid;
  gap: 4px;
}

.catalog-copy strong {
  color: #315257;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.catalog-copy span,
.catalog-head i {
  color: rgba(53, 81, 83, 0.68);
  font-size: 11px;
  font-style: normal;
}

.catalog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.catalog-meta b {
  width: fit-content;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(126, 162, 146, 0.12);
  color: #6d5d2f;
  font-size: 11px;
  font-weight: 800;
}
</style>
