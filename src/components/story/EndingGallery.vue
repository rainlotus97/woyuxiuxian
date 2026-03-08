<template>
  <div class="ending-gallery">
    <div class="gallery-header">
      <h2 class="gallery-title">结局收集</h2>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercent + '%' }"></div>
        <span class="progress-text">{{ unlockedCount }} / {{ totalCount }}</span>
      </div>
    </div>

    <div class="ending-list">
      <div
        v-for="ending in endingsWithStatus"
        :key="ending.id"
        class="ending-card"
        :class="{ unlocked: ending.unlocked, [ending.type]: true }"
        @click="ending.unlocked && $emit('select', ending)"
      >
        <div class="ending-icon">
          {{ getEndingIcon(ending.type) }}
        </div>
        <div class="ending-info">
          <h3 class="ending-name">
            {{ ending.unlocked ? ending.name : '???' }}
          </h3>
          <p class="ending-type">{{ getTypeLabel(ending.type) }}</p>
          <p class="ending-date" v-if="ending.unlocked && ending.unlockedAt">
            解锁于第{{ ending.loopNumber }}周目
          </p>
        </div>
      </div>
    </div>

    <button class="close-btn" @click="$emit('close')">
      返回
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStoryStore } from '@/story/storyStore'

defineEmits<{
  close: []
  select: [ending: { id: string; name: string; type: string }]
}>()

const store = useStoryStore()

const endingsWithStatus = computed(() => store.getAllEndingsWithStatus())

const unlockedCount = computed(() => store.unlockedEndingCount)
const totalCount = computed(() => store.totalEndingCount)
const progressPercent = computed(() =>
  totalCount.value > 0 ? (unlockedCount.value / totalCount.value) * 100 : 0
)

function getEndingIcon(type: string): string {
  const icons: Record<string, string> = {
    normal: '📖',
    hidden: '⭐',
    true: '👑'
  }
  return icons[type] || '📖'
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    normal: '普通结局',
    hidden: '隐藏结局',
    true: '真结局'
  }
  return labels[type] || '未知'
}
</script>

<style scoped>
.ending-gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px 20px;
}

.gallery-header {
  text-align: center;
  margin-bottom: 30px;
}

.gallery-title {
  font-size: 24px;
  color: #ffd700;
  margin: 0 0 20px 0;
}

.progress-bar {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #ffd700,0%, #ff8c00 100%);
  border-radius: 4px;
  transition: width 0.3s ease-out;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.ending-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.ending-card {
  background: rgba(30, 30, 50, 0.8);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.ending-card:hover {
  background: rgba(40, 40, 60, 0.9);
  transform: translateY(-2px);
}

.ending-card.unlocked {
  border-color: rgba(255, 215, 0, 0.3);
}

.ending-card.unlocked:hover {
  border-color: rgba(255, 215, 0, 0.5);
}

.ending-card.normal.unlocked {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(50, 50, 80, 0.9) 100%);
}

.ending-card.hidden.unlocked {
  background: linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(60, 30, 80, 0.9) 100%);
}

.ending-card.true.unlocked {
  background: linear-gradient(135deg, rgba(50, 40, 30, 0.9) 0%, rgba(80, 60, 40, 0.9) 100%);
  border-color: rgba(255, 215, 0, 0.5);
}

.ending-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.ending-card.unlocked .ending-icon {
  background: rgba(255, 215, 0, 0.2);
}

.ending-info {
  flex: 1;
}

.ending-name {
  font-size: 16px;
  font-weight: bold;
  color: #e8e8e8;
  margin: 0 0 8px 0;
}

.ending-card:not(.unlocked) .ending-name {
  color: rgba(255, 255, 255, 0.5);
}

.ending-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.ending-date {
  font-size: 11px;
  color: rgba(255, 215, 0, 0.7);
  margin: 4px 0 0 0;
}

.close-btn {
  margin-top: 30px;
  padding: 12px 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #e8e8e8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
