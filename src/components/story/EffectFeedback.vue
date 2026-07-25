<template>
  <Teleport to="body">
    <div class="effect-feedback-container">
      <TransitionGroup name="feedback">
        <XAnnouncement
          v-for="feedback in activeFeedbacks"
          :key="feedback.id"
          class="effect-feedback"
          :class="[feedback.type, feedback.animating ? 'animating' : '']"
          :title="feedback.text"
          :icon="feedback.icon"
          :tone="resolveFeedbackTone(feedback.type)"
        >
          <template v-if="feedback.value" #action>
            <span class="feedback-value" :class="feedback.valueClass">
              {{ feedback.value }}
            </span>
          </template>
        </XAnnouncement>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { XAnnouncement } from '@rainlotus97/ui'
import type { XIconName, XTone } from '@rainlotus97/ui'
import { storyEventBus } from '@/story/eventBus'
import type { StoryBusEvent } from '@/story/eventBus'
import { describeStoryCharacterTarget } from '@/story/runtime/storyCharacterRegistry'
import type { Effect, EffectType } from '@/story/types'

interface FeedbackItem {
  id: string
  type: string
  icon: XIconName
  text: string
  value?: string
  valueClass?: string
  animating: boolean
}

const activeFeedbacks = ref<FeedbackItem[]>([])
let unsubscribe: (() => void) | null = null
const animationFrames = new Set<number>()
const removalTimers = new Set<number>()

onMounted(() => {
  // 订阅效果执行事件
  unsubscribe = storyEventBus.on('effect:execute', handleEffectEvent)
})

onUnmounted(() => {
  unsubscribe?.()
  animationFrames.forEach(frame => window.cancelAnimationFrame(frame))
  animationFrames.clear()
  removalTimers.forEach(timer => window.clearTimeout(timer))
  removalTimers.clear()
})

function handleEffectEvent(event: StoryBusEvent<{ effect: Effect; context: unknown }>) {
  const effect = event.data.effect
  const feedback = createFeedback(effect)
  if (feedback) {
    showFeedback(feedback)
  }
}

function createFeedback(effect: Effect): FeedbackItem | null {
  const id = `feedback_${Date.now()}_${Math.random().toString(36).slice(2)}`

  // 效果类型到反馈信息的映射
  const effectFeedbackMap: Record<EffectType, () => FeedbackItem | null> = {
    gain_item: () => ({
      id,
      type: 'success',
      icon: 'gift',
      text: '获得道具',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    lose_item: () => ({
      id,
      type: 'warning',
      icon: 'backpack',
      text: '失去道具',
      value: effect.target || '',
      valueClass: 'negative',
      animating: false
    }),

    gain_clue: () => ({
      id,
      type: 'info',
      icon: 'scroll',
      text: '获得线索',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    unlock_clue: () => ({
      id,
      type: 'info',
      icon: 'lock',
      text: '解锁线索',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    favor_up: () => ({
      id,
      type: 'success',
      icon: 'jade',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}好感`,
      value: `+${effect.value || 1}`,
      valueClass: 'positive',
      animating: false
    }),

    favor_down: () => ({
      id,
      type: 'warning',
      icon: 'jade',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}好感`,
      value: `-${effect.value || 1}`,
      valueClass: 'negative',
      animating: false
    }),

    hatred_up: () => ({
      id,
      type: 'warning',
      icon: 'sword',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}仇恨`,
      value: `+${effect.value || 1}`,
      valueClass: 'negative',
      animating: false
    }),

    hatred_down: () => ({
      id,
      type: 'info',
      icon: 'jade',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}仇恨`,
      value: `-${effect.value || 1}`,
      valueClass: 'positive',
      animating: false
    }),

    debt_up: () => ({
      id,
      type: 'success',
      icon: 'gift',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}恩情`,
      value: `+${effect.value || 1}`,
      valueClass: 'positive',
      animating: false
    }),

    debt_down: () => ({
      id,
      type: 'info',
      icon: 'scroll',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}恩情`,
      value: `-${effect.value || 1}`,
      valueClass: 'neutral',
      animating: false
    }),

    fear_up: () => ({
      id,
      type: 'warning',
      icon: 'armor',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}畏惧`,
      value: `+${effect.value || 1}`,
      valueClass: 'negative',
      animating: false
    }),

    fear_down: () => ({
      id,
      type: 'info',
      icon: 'spark',
      text: `${effect.target ? describeStoryCharacterTarget(effect.target) : ''}畏惧`,
      value: `-${effect.value || 1}`,
      valueClass: 'positive',
      animating: false
    }),

    route: () => ({
      id,
      type: 'info',
      icon: 'map',
      text: '进入路线',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    realm: () => ({
      id,
      type: 'success',
      icon: 'cultivation',
      text: '境界提升',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    ability: () => ({
      id,
      type: 'success',
      icon: 'spark',
      text: '解锁能力',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    ending: () => ({
      id,
      type: 'legendary',
      icon: 'crown',
      text: '达成结局',
      value: effect.target || '',
      valueClass: 'legendary',
      animating: false
    }),

    trigger_event: () => ({
      id,
      type: 'info',
      icon: 'mission',
      text: '触发事件',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    set_var: () => ({
      id,
      type: 'info',
      icon: 'settings',
      text: '变量设置',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    unlock_feature: () => ({
      id,
      type: 'success',
      icon: 'lock',
      text: '解锁功能',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    unlock_npc: () => ({
      id,
      type: 'success',
      icon: 'crown',
      text: '结识人物',
      value: effect.target ? describeStoryCharacterTarget(effect.target) : '',
      valueClass: 'positive',
      animating: false
    }),

    unlock_companion: () => ({
      id,
      type: 'success',
      icon: 'jade',
      text: '解锁伙伴',
      value: effect.target ? describeStoryCharacterTarget(effect.target) : '',
      valueClass: 'positive',
      animating: false
    }),

    sect_reputation: () => ({
      id,
      type: 'info',
      icon: 'sect',
      text: '宗门声望',
      value: `${Number(effect.value || 0) >= 0 ? '+' : ''}${effect.value || 0}`,
      valueClass: Number(effect.value || 0) >= 0 ? 'positive' : 'negative',
      animating: false
    }),

    unlock_map: () => ({
      id,
      type: 'success',
      icon: 'map',
      text: '开放地图',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    world_flag: () => ({
      id,
      type: 'info',
      icon: 'spark',
      text: '世界标记',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    story_battle: () => ({
      id,
      type: 'warning',
      icon: 'sword',
      text: '剧情战',
      value: effect.target || '',
      valueClass: 'negative',
      animating: false
    }),

    branch_flag: () => ({
      id,
      type: 'info',
      icon: 'mission',
      text: '分支标记',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    info: () => ({
      id,
      type: 'info',
      icon: 'scroll',
      text: '得知',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    })
  }

  const creator = effectFeedbackMap[effect.type]
  return creator ? creator() : null
}

function showFeedback(feedback: FeedbackItem) {
  activeFeedbacks.value.push(feedback)

  // 触发动画
  const animationFrame = window.requestAnimationFrame(() => {
    const item = activeFeedbacks.value.find(f => f.id === feedback.id)
    if (item) {
      item.animating = true
    }
    animationFrames.delete(animationFrame)
  })
  animationFrames.add(animationFrame)

  // 自动移除
  const removalTimer = window.setTimeout(() => {
    const index = activeFeedbacks.value.findIndex(f => f.id === feedback.id)
    if (index !== -1) {
      activeFeedbacks.value.splice(index, 1)
    }
    removalTimers.delete(removalTimer)
  }, 3000)
  removalTimers.add(removalTimer)
}

function resolveFeedbackTone(type: string): XTone {
  if (type === 'success') return 'jade'
  if (type === 'warning') return 'rose'
  if (type === 'legendary') return 'gold'
  return 'stone'
}

// 暴露给外部使用的API
defineExpose({
  showCustomFeedback: (type: string, icon: XIconName, text: string, value?: string, valueClass?: string) => {
    const feedback: FeedbackItem = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type,
      icon,
      text,
      value,
      valueClass,
      animating: false
    }
    showFeedback(feedback)
  }
})
</script>

<style scoped>
.effect-feedback-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(calc(100vw - 32px), 420px);
  gap: 8px;
  z-index: 300;
  pointer-events: none;
}

.effect-feedback {
  width: 100%;
  min-width: 0;
  animation: feedback-in 0.3s ease-out;
}

.effect-feedback.animating {
  animation: feedback-in 0.3s ease-out, feedback-pop 0.5s ease-out 0.3s;
}

.effect-feedback :deep(.x-announcement__copy strong) {
  overflow-wrap: anywhere;
}

@keyframes feedback-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes feedback-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.feedback-value {
  max-width: 10rem;
  overflow: hidden;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-value.positive { color: #4b8075; }
.feedback-value.negative { color: #9a6170; }
.feedback-value.neutral { color: #5c7a82; }
.feedback-value.legendary {
  color: #9b6e24;
}

/* TransitionGroup 动画 */
.feedback-enter-active {
  transition: all 0.3s ease-out;
}

.feedback-leave-active {
  transition: all 0.3s ease-in;
}

.feedback-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.feedback-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.feedback-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .effect-feedback,
  .effect-feedback.animating,
  .feedback-enter-active,
  .feedback-leave-active,
  .feedback-move {
    animation: none;
    transition: none;
  }
}
</style>
