<template>
  <div class="ending-display" :class="endingType">
    <div class="ending-overlay">
      <div class="ending-card">
        <!-- 结局类型徽章 -->
        <div class="ending-badge" :class="endingType">
          {{ endingTypeLabel }}
        </div>

        <!-- 结局标题 -->
        <h2 class="ending-title">{{ endingName }}</h2>

        <!-- 结局描述 -->
        <p class="ending-summary" v-if="summaryText">
          {{ summaryText }}
        </p>

        <!-- 统计信息 -->
        <div class="ending-stats">
          <div class="stat-item">
            <span class="stat-label">周目</span>
            <span class="stat-value">{{ store.currentLoop }}</span>
          </div>
          <div class="stat-item" v-if="store.currentRoute">
            <span class="stat-label">路线</span>
            <span class="stat-value">{{ store.currentRoute }}</span>
          </div>
          <div class="stat-item" v-if="volumeNumber">
            <span class="stat-label">卷</span>
            <span class="stat-value">{{ volumeNumber }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="ending-actions">
          <button
            v-if="canContinue && hasNextVolume"
            class="action-btn primary"
            @click="$emit('continueNextVolume')"
          >
            继续下一卷
          </button>
          <button
            class="action-btn secondary"
            @click="$emit('viewEndingGallery')"
          >
            查看结局收集
          </button>
          <button
            class="action-btn"
            @click="$emit('restart')"
          >
            重新开始
          </button>
          <button
            class="action-btn"
            @click="$emit('returnToMenu')"
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StoryTermination } from '@/story/types'
import { useStoryStore } from '@/story/storyStore'

const props = defineProps<{
  termination: StoryTermination
}>()

defineEmits<{
  continueNextVolume: []
  viewEndingGallery: []
  restart: []
  returnToMenu: []
}>()

const store = useStoryStore()

const endingType = computed(() => {
  return props.termination.endingInfo?.type || 'normal'
})

const endingTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    normal: '普通结局',
    hidden: '隐藏结局',
    true: '真结局'
  }
  return labels[endingType.value] || '完结'
})

const endingName = computed(() => {
  if (props.termination.endingInfo) {
    return props.termination.endingInfo.name
  }
  if (props.termination.reason === 'volume_end') {
    return `卷${props.termination.volumeNumber} 完`
  }
  return '故事完结'
})

const summaryText = computed(() => {
  if (props.termination.reason === 'volume_end' && props.termination.hasNextVolume) {
    return `卷${props.termination.volumeNumber}已完结，敬请期待后续内容！`
  }
  if (props.termination.reason === 'story_end') {
    return '感谢游玩！'
  }
  return null
})

const canContinue = computed(() => props.termination.canContinue)
const hasNextVolume = computed(() => props.termination.hasNextVolume)
const volumeNumber = computed(() => props.termination.volumeNumber)
</script>

<style scoped>
.ending-display {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.ending-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ending-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.1);
  animation: card-appear 0.6s ease-out 0.2s both;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ending-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 20px;
}

.ending-badge.normal {
  background: rgba(100, 149, 237, 0.2);
  color: #6495ed;
  border: 1px solid rgba(100, 149, 237, 0.4);
}

.ending-badge.hidden {
  background: rgba(138, 43, 226, 0.2);
  color: #9370db;
  border: 1px solid rgba(138, 43, 226, 0.4);
}

.ending-badge.true {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.ending-title {
  font-size: 28px;
  color: #ffd700;
  margin: 0 0 16px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.ending-summary {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.ending-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  color: #e8e8e8;
  font-weight: bold;
}

.ending-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #e8e8e8;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.action-btn.primary {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.action-btn.primary:hover {
  background: rgba(255, 215, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.6);
}

.action-btn.secondary {
  background: rgba(100, 149, 237, 0.2);
  border-color: rgba(100, 149, 237, 0.4);
  color: #6495ed;
}

.action-btn.secondary:hover {
  background: rgba(100, 149, 237, 0.3);
}
</style>
