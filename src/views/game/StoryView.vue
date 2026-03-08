<template>
  <div class="story-view">
    <!-- 故事选择界面 -->
    <div v-if="!isPlaying" class="story-select">
      <h2 class="title">📖 故事模式</h2>
      <p class="subtitle">选择视角开始你的修仙之旅</p>

      <div class="perspective-select">
        <button
          class="perspective-btn male"
          :class="{ active: selectedPerspective === 'male' }"
          @click="selectedPerspective = 'male'"
        >
          <span class="icon">👨</span>
          <span class="label">男主线</span>
          <span class="desc">凌辰视角</span>
        </button>

        <button
          class="perspective-btn female"
          :class="{ active: selectedPerspective === 'female' }"
          @click="selectedPerspective = 'female'"
        >
          <span class="icon">👩</span>
          <span class="label">女主线</span>
          <span class="desc">苏清鸢视角</span>
        </button>
      </div>

      <div class="info-panel">
        <h3>当前状态</h3>
        <div class="info-item">
          <span class="info-label">视角:</span>
          <span class="info-value">{{ perspectiveLabel }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">周目:</span>
          <span class="info-value">{{ storyStore.currentLoop }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">当前卷:</span>
          <span class="info-value">第{{ storyStore.currentVolume }}卷</span>
        </div>
        <div class="info-item">
          <span class="info-label">已完成节点:</span>
          <span class="info-value">{{ storyStore.completedNodes.size }}</span>
        </div>
      </div>

      <!-- 有存档时的按钮区域 -->
      <div v-if="storyStore.currentNodeId" class="button-group">
        <!-- 如果选择的视角与存档视角不同，显示两个按钮 -->
        <template v-if="selectedPerspective !== storyStore.currentPerspective">
          <button
            class="continue-btn"
            @click="continueSavedStory"
          >
            继续之前的进度 ({{ storyStore.currentPerspective === 'male' ? '男主线' : '女主线' }})
          </button>
          <button
            class="restart-btn"
            @click="startNewPerspective"
          >
            以 {{ selectedPerspective === 'male' ? '男主线' : '女主线' }} 重新开始
          </button>
        </template>
        <!-- 如果选择的视角与存档视角相同，只显示继续按钮 -->
        <template v-else>
          <button class="continue-btn" @click="continueSavedStory">
            继续故事
          </button>
          <button class="restart-btn" @click="restartStory">
            重新开始
          </button>
        </template>
      </div>
      <!-- 无存档时只显示开始按钮 -->
      <button
        v-else
        class="start-btn"
        :disabled="!selectedPerspective"
        @click="startStory"
      >
        开始故事
      </button>

      <div class="debug-panel">
        <h4>调试选项</h4>
        <button class="debug-btn" @click="testParser">测试解析器</button>
        <button class="debug-btn" @click="testLoader">测试加载器</button>
        <div v-if="debugOutput" class="debug-output">
          <pre>{{ debugOutput }}</pre>
        </div>
      </div>
    </div>

    <!-- 故事播放器 -->
    <StoryPlayer v-else @back="isPlaying = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStoryStore } from '@/story/storyStore'
import StoryPlayer from '@/components/story/StoryPlayer.vue'
import type { Perspective } from '@/story/types'

const storyStore = useStoryStore()

const isPlaying = ref(false)
const selectedPerspective = ref<'male' | 'female' | null>(null)
const debugOutput = ref<string | null>(null)

// 计算属性：显示当前视角的标签
const perspectiveLabel = computed(() => {
  const perspective = storyStore.currentPerspective
  return perspective === 'male' ? '男主线' : perspective === 'female' ? '女主线' : '未选择'
})

// 开始新故事
async function startStory() {
  if (!selectedPerspective.value) return

  try {
    await storyStore.initStory(selectedPerspective.value, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to start story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

// 继续保存的进度（忽略用户选择的视角，使用保存的视角）
async function continueSavedStory() {
  try {
    await storyStore.continueStory()
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to continue story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

// 以新视角重新开始
async function startNewPerspective() {
  if (!selectedPerspective.value) return

  try {
    // 重置故事状态
    storyStore.resetStory()
    // 以新视角开始
    await storyStore.initStory(selectedPerspective.value, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to start new perspective:', error)
    debugOutput.value = `Error: ${error}`
  }
}

// 重新开始（同一视角）
async function restartStory() {
  try {
    const perspective = storyStore.currentPerspective as Perspective
    storyStore.resetStory()
    await storyStore.initStory(perspective, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to restart story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

async function testParser() {
  try {
    // 测试读取故事文件
    const response = await fetch('/src/assets/story/volume-1/main.md')
    if (!response.ok) {
      throw new Error('Failed to fetch story file')
    }
    const content = await response.text()

    debugOutput.value = `Story file loaded, length: ${content.length} chars\nFirst 500 chars:\n${content.substring(0, 500)}`
  } catch (error) {
    debugOutput.value = `Parser Error: ${error}`
  }
}

async function testLoader() {
  try {
    debugOutput.value = JSON.stringify(
      {
        currentVolume: storyStore.currentVolume,
        currentLoop: storyStore.currentLoop,
        currentPerspective: storyStore.currentPerspective,
        completedNodes: storyStore.completedNodes.size,
        nodeCount: storyStore.allNodes.length,
      },
      null,
      2
    )
  } catch (error) {
    debugOutput.value = `Loader Error: ${error}`
  }
}
</script>

<style scoped>
.story-view {
  height: 100%;
  overflow-y: auto;
}

.story-select {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.title {
  font-size: 1.5rem;
  color: #ffd700;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.perspective-select {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.perspective-btn {
  flex: 1;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.perspective-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.perspective-btn.active.male {
  background: rgba(100, 149, 237, 0.2);
  border-color: #6495ed;
}

.perspective-btn.active.female {
  background: rgba(255, 182, 193, 0.2);
  border-color: #ffb6c1;
}

.perspective-btn .icon {
  font-size: 2rem;
}

.perspective-btn .label {
  font-size: 1rem;
  font-weight: bold;
  color: #e8e8e8;
}

.perspective-btn .desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.info-panel {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-panel h3 {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  color: #ffd700;
  font-weight: bold;
}

.start-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  color: #1a1a2a;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.start-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.continue-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.button-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.restart-btn {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s;
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.debug-panel {
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.debug-panel h4 {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.debug-btn {
  padding: 8px 16px;
  margin-right: 8px;
  margin-bottom: 8px;
  background: rgba(138, 43, 226, 0.3);
  border: 1px solid rgba(138, 43, 226, 0.5);
  border-radius: 4px;
  color: #e8e8e8;
  cursor: pointer;
  font-size: 0.75rem;
}

.debug-btn:hover {
  background: rgba(138, 43, 226, 0.5);
}

.debug-output {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow-x: auto;
}

.debug-output pre {
  margin: 0;
  font-size: 0.75rem;
  color: #7eb8da;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
