<template>
  <div class="story-player">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 故事内容 -->
    <template v-else-if="currentNode">
      <!-- 场景标题 -->
      <div class="scene-header">
        <span class="map-name">{{ currentNode.map }}</span>
        <span class="node-name">{{ currentNode.name }}</span>
      </div>

      <!-- 正文内容 -->
      <div class="story-content">
        <!-- 正文（统一处理，避免 v-if/v-else 导致组件切换时状态丢失） -->
        <TypewriterText
          :text="displayText"
          :speed="30"
          @complete="onTextComplete"
        />

        <!-- NPC对话 -->
        <div v-if="showDialogs" class="npc-dialogs">
          <div
            v-for="(dialog, index) in currentNode.content.npcDialogs"
            :key="index"
            class="npc-dialog"
            :class="{ active: currentDialogIndex === index }"
            @click="showNextDialog(index)"
          >
            <span class="speaker">{{ dialog.speaker }}：</span>
            <span class="content">{{ dialog.content }}</span>
          </div>
        </div>

        <!-- 选项 -->
        <div v-if="showChoices" class="choices">
          <button
            v-for="(choice, index) in currentNode.content.choices"
            :key="index"
            class="choice-button"
            @click="selectChoice(index)"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>

      <!-- 内心独白 -->
      <div v-if="currentNode.content.innerMonologue && textComplete" class="inner-monologue">
        <TypewriterText :text="currentNode.content.innerMonologue" :speed="50" />
      </div>
    </template>

    <!-- 无内容 -->
    <div v-else class="empty-state">
      <p>暂无故事内容</p>
    </div>

    <!-- 通知显示 -->
    <div v-if="notifications.length > 0" class="notifications">
      <div
        v-for="(notification, index) in notifications"
        :key="index"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
      </div>
    </div>

    <!-- 返回按钮 -->
    <button class="back-button" @click="$emit('back')">
      ← 返回
    </button>

    <!-- 结局展示 -->
    <EndingDisplay
      v-if="showEnding && currentTermination"
      :termination="currentTermination"
      @continueNextVolume="handleContinueNextVolume"
      @viewEndingGallery="handleViewEndingGallery"
      @restart="handleRestart"
      @returnToMenu="handleReturnToMenu"
    />

    <!-- 卷结束展示 -->
    <VolumeEndDisplay
      v-if="showVolumeEnd && currentTermination"
      :volumeNumber="currentTermination.volumeNumber || 1"
      :hasNextVolume="currentTermination?.hasNextVolume || false"
      @continue="handleContinueNextVolume"
      @returnToMenu="handleReturnToMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStoryStore } from '@/story/storyStore'
import TypewriterText from './TypewriterText.vue'
import EndingDisplay from './EndingDisplay.vue'
import VolumeEndDisplay from './VolumeEndDisplay.vue'
import type { StoryTermination } from '@/story/types'

const emit = defineEmits<{
  back: []
}>()

const store = useStoryStore()

// 状态
const isLoading = computed(() => store.isLoading)
const currentNode = computed(() => store.currentNode)
const notifications = computed(() => store.notifications)

// 内部状态
const textComplete = ref(false)
const currentDialogIndex = ref(0)
const dialogsViewed = ref(false)

// 结局/卷结束状态
const showEnding = ref(false)
const showVolumeEnd = ref(false)
const currentTermination = ref<StoryTermination | null>(null)

// 计算属性
const perspectiveText = computed(() => {
  if (!currentNode.value) return null
  if (store.currentPerspective === 'male' && currentNode.value.content.maleText) {
    return currentNode.value.content.maleText
  } else if (store.currentPerspective === 'female' && currentNode.value.content.femaleText) {
    return currentNode.value.content.femaleText
  }
  return null
})

// 显示的文本（优先使用视角专属文本，否则使用通用文本��
const displayText = computed(() => {
  return perspectiveText.value || currentNode.value?.content.text || ''
})

const showDialogs = computed(() => {
  return textComplete.value && (currentNode.value?.content.npcDialogs.length ?? 0) > 0
})

const showChoices = computed(() => {
  // 需要文本完成，且（没有对话或对话已查看完），且有选项
  const hasChoices = (currentNode.value?.content.choices.length ?? 0) > 0
  const noDialogs = (currentNode.value?.content.npcDialogs.length ?? 0) === 0
  return textComplete.value && (noDialogs || dialogsViewed.value) && hasChoices
})

// 方法
function onTextComplete() {
  console.log('[StoryPlayer] onTextComplete called')
  textComplete.value = true
  console.log('[StoryPlayer] textComplete is now:', textComplete.value)
}

function showNextDialog(index: number) {
  currentDialogIndex.value = index
  // 如果点击的是最后一条对话，标记对话已全部查看
  const dialogs = currentNode.value?.content.npcDialogs || []
  if (index >= dialogs.length - 1) {
    dialogsViewed.value = true
  }
}

async function selectChoice(index: number) {
  const choice = currentNode.value?.content.choices[index]
  if (!choice) return

  // 如果是结束标记
  if (choice.isEndMarker || choice.targetId === null) {
    await store.makeChoice(index)
    // 检查结束状态
    const termination = store.checkEndNode()
    if (termination) {
      currentTermination.value = termination
      if (termination.reason === 'volume_end') {
        showVolumeEnd.value = true
      } else {
        showEnding.value = true
      }
    }
    return
  }

  await store.makeChoice(index)
  // 重置状态
  textComplete.value = false
  currentDialogIndex.value = 0
  dialogsViewed.value = false
}

// 结局相关方法
async function handleContinueNextVolume() {
  const success = await store.transitionToNextVolume()
  if (success) {
    showEnding.value = false
    showVolumeEnd.value = false
    currentTermination.value = null
    textComplete.value = false
    currentDialogIndex.value = 0
    dialogsViewed.value = false
  }
}

function handleRestart() {
  store.resetStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  textComplete.value = false
  currentDialogIndex.value = 0
  dialogsViewed.value = false
}

function handleReturnToMenu() {
  store.suspendStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  emit('back')
}

function handleViewEndingGallery() {
  // TODO: 显示结局收集画廊
  console.log('View ending gallery')
}

// 生命周期
onMounted(async () => {
  if (!store.currentNode) {
    await store.initStory('male', 1)
  }
})

// 监听节点变化
watch(currentNode, (newNode, oldNode) => {
  console.log('[StoryPlayer] Node changed from', oldNode?.id, 'to', newNode?.id)
  console.log('[StoryPlayer] New node content:', newNode?.content?.text?.substring(0, 100))
  console.log('[StoryPlayer] New node choices:', newNode?.content?.choices)
  textComplete.value = false
  currentDialogIndex.value = 0
  dialogsViewed.value = false
})
</script>

<style scoped>
.story-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2a 0%, #2d2d44 50%, #1a1a2a 100%);
  color: #e8e8e8;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 60px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.scene-header {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.map-name {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.node-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.story-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 200px;
}

.npc-dialogs {
  margin-top: 20px;
}

.npc-dialog {
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.npc-dialog:hover {
  background: rgba(255, 255, 255, 0.1);
}

.npc-dialog.active {
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid #ffd700;
}

.speaker {
  font-weight: bold;
  color: #87ceeb;
}

.content {
  color: #e8e8e8;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.choice-button {
  width: 100%;
  text-align: left;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #e8e8e8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.choice-button:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
}

.inner-monologue {
  margin-top: 20px;
  padding: 15px;
  background: rgba(138, 43, 226, 0.1);
  border-left: 3px solid #8a2be2;
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

.notifications {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 200;
}

.notification {
  padding: 12px 20px;
  border-radius: 8px;
  animation: slide-in 0.3s ease-out;
}

.notification.success { background: rgba(34, 197, 94, 0.9); }
.notification.warning { background: rgba(255, 193, 7, 0.9); }
.notification.info { background: rgba(59, 130, 246, 0.9); }
.notification.error { background: rgba(239, 68, 68, 0.9); }

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
