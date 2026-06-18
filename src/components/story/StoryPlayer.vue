<template>
  <div class="story-player">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">卷宗载入中...</p>
    </div>

    <template v-else-if="currentNode">
      <StorySceneHeader :map-name="currentNode.map" :node-name="currentNode.name" @back="$emit('back')" />

      <div class="story-stage">
        <StoryTextPanel>
          <TypewriterText :text="displayText" :speed="30" @complete="onTextComplete" />
        </StoryTextPanel>

        <StoryDialogList
          v-if="showDialogs"
          :dialogs="currentNode.content.npcDialogs"
          :active-index="currentDialogIndex"
          @select="showNextDialog"
        />

        <section v-if="currentNode.content.innerMonologue && textComplete" class="inner-monologue">
          <span>心念</span>
          <TypewriterText :text="currentNode.content.innerMonologue" :speed="50" />
        </section>

        <StoryChoiceList
          v-if="showChoices"
          :choices="currentNode.content.choices"
          @choose="selectChoice"
        />
      </div>
    </template>

    <div v-else class="empty-state">
      <div class="empty-mark">卷</div>
      <p>暂无故事内容</p>
    </div>

    <StoryNotificationStack v-if="notifications.length > 0" :notifications="notifications" />

    <EndingDisplay
      v-if="showEnding && currentTermination"
      :termination="currentTermination"
      @continueNextVolume="handleContinueNextVolume"
      @viewEndingGallery="handleViewEndingGallery"
      @restart="handleRestart"
      @returnToMenu="handleReturnToMenu"
    />

    <VolumeEndDisplay
      v-if="showVolumeEnd && currentTermination"
      :volumeNumber="currentTermination.volumeNumber || 1"
      :hasNextVolume="currentTermination?.hasNextVolume || false"
      @continue="handleContinueNextVolume"
      @returnToMenu="handleReturnToMenu"
    />

    <SideQuestPanel
      :visible="showSideQuestPanel && !showEnding && !showVolumeEnd && !showGameplay"
      @trigger="onSideQuestTrigger"
      @close="showSideQuestPanel = false"
    />

    <div v-if="showGameplay && currentGameplayTrigger" class="gameplay-layer">
      <GameplayEmbed
        :gameplay-type="currentGameplayTrigger.type"
        :target-id="currentGameplayTrigger.targetId"
        :params="currentGameplayTrigger.params"
        :can-skip="currentGameplayTrigger.onFailure === 'skip'"
        @complete="onGameplayComplete"
        @skip="onGameplaySkip"
      />
    </div>

    <EffectFeedback />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStoryStore } from '@/story/storyStore'
import TypewriterText from './TypewriterText.vue'
import EndingDisplay from './EndingDisplay.vue'
import VolumeEndDisplay from './VolumeEndDisplay.vue'
import SideQuestPanel from './SideQuestPanel.vue'
import EffectFeedback from './EffectFeedback.vue'
import GameplayEmbed from './GameplayEmbed.vue'
import StoryChoiceList from './StoryChoiceList.vue'
import StoryDialogList from './StoryDialogList.vue'
import StoryNotificationStack from './StoryNotificationStack.vue'
import StorySceneHeader from './StorySceneHeader.vue'
import StoryTextPanel from './StoryTextPanel.vue'
import { gameplayBridge } from '@/story/gameplayBridge'
import { registerDefaultGameplayHandlers } from '@/story/runtime/registerDefaultGameplayHandlers'
import { consumeResolvedRouteGameplaySession } from '@/story/runtime/routeGameplaySession'
import type { StoryTermination, GameplayTrigger, GameplayResult } from '@/story/types'

const emit = defineEmits<{
  back: []
}>()

const store = useStoryStore()
const router = useRouter()
let unregisterGameplayHandlers: (() => void) | null = null

const isLoading = computed(() => store.isLoading)
const currentNode = computed(() => store.currentNode)
const notifications = computed(() => store.notifications)

const textComplete = ref(false)
const currentDialogIndex = ref(0)
const dialogsViewed = ref(false)

const showEnding = ref(false)
const showVolumeEnd = ref(false)
const currentTermination = ref<StoryTermination | null>(null)

const showGameplay = ref(false)
const currentGameplayTrigger = ref<GameplayTrigger | null>(null)

const showSideQuestPanel = ref(true)

const perspectiveText = computed(() => {
  if (!currentNode.value) return null
  if (store.currentPerspective === 'male' && currentNode.value.content.maleText) {
    return currentNode.value.content.maleText
  } else if (store.currentPerspective === 'female' && currentNode.value.content.femaleText) {
    return currentNode.value.content.femaleText
  }
  return null
})

const displayText = computed(() => {
  return perspectiveText.value || currentNode.value?.content.text || ''
})

const showDialogs = computed(() => {
  return textComplete.value && (currentNode.value?.content.npcDialogs.length ?? 0) > 0
})

const showChoices = computed(() => {
  const hasChoices = (currentNode.value?.content.choices.length ?? 0) > 0
  const noDialogs = (currentNode.value?.content.npcDialogs.length ?? 0) === 0
  return textComplete.value && (noDialogs || dialogsViewed.value) && hasChoices
})

function resetReadingState() {
  textComplete.value = false
  currentDialogIndex.value = 0
  dialogsViewed.value = false
}

function tryLaunchPendingGameplay() {
  if (showGameplay.value) return

  const pendingTrigger = store.consumePendingGameplayTrigger()
  if (pendingTrigger) {
    triggerGameplay(pendingTrigger)
  }
}

function onTextComplete() {
  textComplete.value = true

  const gameplayTrigger = currentNode.value?.content.gameplayTrigger
  if (gameplayTrigger && !showGameplay.value) {
    triggerGameplay(gameplayTrigger)
    return
  }

  tryLaunchPendingGameplay()
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

  if (choice.isEndMarker || choice.targetId === null) {
    await store.makeChoice(index)
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
  resetReadingState()
}

async function handleContinueNextVolume() {
  const success = await store.transitionToNextVolume()
  if (success) {
    showEnding.value = false
    showVolumeEnd.value = false
    currentTermination.value = null
    resetReadingState()
  }
}

function handleRestart() {
  store.resetStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  resetReadingState()
}

function handleReturnToMenu() {
  store.suspendStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  emit('back')
}

function handleViewEndingGallery() {
}

async function triggerGameplay(trigger: GameplayTrigger) {
  currentGameplayTrigger.value = trigger
  showGameplay.value = true

  const success = await gameplayBridge.trigger(trigger, currentNode.value?.id || '')
  if (!success) {
    return
  }
}

async function onGameplayComplete(result: GameplayResult) {
  const { continueNodeId, shouldRetry } = await gameplayBridge.onComplete(result)

  if (shouldRetry) {
    return
  }

  showGameplay.value = false
  currentGameplayTrigger.value = null
  store.clearPendingGameplayTrigger()

  if (continueNodeId) {
    await store.goToNode(continueNodeId)
  }

  resetReadingState()
}

async function resumeRouteGameplayResult() {
  const suspendState = gameplayBridge.getSuspendState()
  const routeSession = consumeResolvedRouteGameplaySession()
  if (!routeSession?.result) return
  if (!suspendState) return

  await gameplayBridge.resolveRouteResult(routeSession.result)

  showGameplay.value = false
  currentGameplayTrigger.value = null
  store.clearPendingGameplayTrigger()

  const { continueNodeId, shouldRetry, shouldSkip } = await gameplayBridge.onComplete(routeSession.result)
  if (shouldRetry) {
    await triggerGameplay(suspendState.gameplayTrigger)
    return
  }

  if (shouldSkip) {
    resetReadingState()
    return
  }

  if (continueNodeId) {
    await store.goToNode(continueNodeId)
  }

  resetReadingState()
}

function onGameplaySkip() {
  store.clearPendingGameplayTrigger()
  gameplayBridge.skip()
  showGameplay.value = false
  currentGameplayTrigger.value = null
}

async function onSideQuestTrigger(questId: string) {
  await store.executeSideQuest(questId)
}

onMounted(async () => {
  unregisterGameplayHandlers = registerDefaultGameplayHandlers(router)
  if (!store.currentNode) {
    await store.initStory('male', 1)
  }
  await resumeRouteGameplayResult()
})

onBeforeUnmount(() => {
  unregisterGameplayHandlers?.()
  unregisterGameplayHandlers = null
})

watch(currentNode, () => {
  resetReadingState()
})

watch(currentNode, () => {
  if (!textComplete.value) return
  tryLaunchPendingGameplay()
})

defineExpose({
  triggerGameplay
})
</script>

<style scoped>
.story-player {
  position: relative;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(248, 253, 246, 0.98), rgba(230, 243, 238, 0.96)),
    radial-gradient(circle at 12% 0%, rgba(203, 153, 68, 0.16), transparent 42%);
  color: #2f4d47;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 86px;
}

.story-player > :not(.loading-overlay, .story-notification-stack, .gameplay-layer) {
  width: min(980px, 100%);
  margin-left: auto;
  margin-right: auto;
}

.story-stage {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(250, 253, 247, 0.96), rgba(232, 243, 239, 0.95));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(124, 150, 137, 0.24);
  border-top-color: #9a6827;
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
  color: rgba(49, 76, 70, 0.68);
}

.inner-monologue {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid rgba(125, 151, 139, 0.2);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(241, 249, 244, 0.9), rgba(255, 252, 236, 0.82));
  color: rgba(47, 72, 67, 0.76);
  font-style: italic;
}

.inner-monologue span {
  color: #8a5d22;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.empty-state {
  min-height: 70%;
  display: grid;
  gap: 12px;
  place-items: center;
  align-content: center;
  color: rgba(58, 82, 77, 0.62);
}

.empty-mark {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  border: 1px solid rgba(147, 101, 38, 0.2);
  background: rgba(255, 255, 255, 0.68);
  color: rgba(130, 82, 23, 0.82);
  font-size: 30px;
  font-weight: 900;
}

.gameplay-layer {
  position: fixed;
  inset: 0;
  z-index: 180;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(29, 45, 42, 0.42);
  backdrop-filter: blur(12px);
}

.gameplay-layer :deep(.gameplay-embed) {
  width: min(560px, 100%);
}

@media (max-width: 560px) {
  .story-player {
    padding: 12px;
    padding-bottom: 86px;
  }
}
</style>
