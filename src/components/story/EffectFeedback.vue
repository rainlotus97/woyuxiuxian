<template>
  <Teleport to="body">
    <div class="effect-feedback-container">
      <TransitionGroup name="feedback">
        <div
          v-for="feedback in activeFeedbacks"
          :key="feedback.id"
          class="effect-feedback"
          :class="[feedback.type, feedback.animating ? 'animating' : '']"
        >
          <span class="feedback-icon">{{ feedback.icon }}</span>
          <span class="feedback-text">{{ feedback.text }}</span>
          <span v-if="feedback.value" class="feedback-value" :class="feedback.valueClass">
            {{ feedback.value }}
          </span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storyEventBus } from '@/story/eventBus'
import type { StoryEvent, Effect, EffectType } from '@/story/types'

interface FeedbackItem {
  id: string
  type: string
  icon: string
  text: string
  value?: string
  valueClass?: string
  animating: boolean
}

const activeFeedbacks = ref<FeedbackItem[]>([])
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // 订阅效果执行事件
  unsubscribe = storyEventBus.on('effect:execute', handleEffectEvent)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

function handleEffectEvent(event: StoryEvent<{ effect: Effect; context: unknown }>) {
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
      icon: '📦',
      text: '获得道具',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    lose_item: () => ({
      id,
      type: 'warning',
      icon: '📤',
      text: '失去道具',
      value: effect.target || '',
      valueClass: 'negative',
      animating: false
    }),

    gain_clue: () => ({
      id,
      type: 'info',
      icon: '🔍',
      text: '获得线索',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    unlock_clue: () => ({
      id,
      type: 'info',
      icon: '🔓',
      text: '解锁线索',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    favor_up: () => ({
      id,
      type: 'success',
      icon: '❤️',
      text: `${effect.target || ''}好感`,
      value: `+${effect.value || 1}`,
      valueClass: 'positive',
      animating: false
    }),

    favor_down: () => ({
      id,
      type: 'warning',
      icon: '💔',
      text: `${effect.target || ''}好感`,
      value: `-${effect.value || 1}`,
      valueClass: 'negative',
      animating: false
    }),

    route: () => ({
      id,
      type: 'info',
      icon: '🛤️',
      text: '进入路线',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    realm: () => ({
      id,
      type: 'success',
      icon: '⬆️',
      text: '境界提升',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    ability: () => ({
      id,
      type: 'success',
      icon: '✨',
      text: '解锁能力',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    ending: () => ({
      id,
      type: 'legendary',
      icon: '🏆',
      text: '达成结局',
      value: effect.target || '',
      valueClass: 'legendary',
      animating: false
    }),

    trigger_event: () => ({
      id,
      type: 'info',
      icon: '⚡',
      text: '触发事件',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    set_var: () => ({
      id,
      type: 'info',
      icon: '🔧',
      text: '变量设置',
      value: effect.target || '',
      valueClass: 'neutral',
      animating: false
    }),

    unlock_feature: () => ({
      id,
      type: 'success',
      icon: '🔓',
      text: '解锁功能',
      value: effect.target || '',
      valueClass: 'positive',
      animating: false
    }),

    info: () => ({
      id,
      type: 'info',
      icon: '💡',
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
  requestAnimationFrame(() => {
    const item = activeFeedbacks.value.find(f => f.id === feedback.id)
    if (item) {
      item.animating = true
    }
  })

  // 自动移除
  setTimeout(() => {
    const index = activeFeedbacks.value.findIndex(f => f.id === feedback.id)
    if (index !== -1) {
      activeFeedbacks.value.splice(index, 1)
    }
  }, 3000)
}

// 暴露给外部使用的API
defineExpose({
  showCustomFeedback: (type: string, icon: string, text: string, value?: string, valueClass?: string) => {
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
  gap: 8px;
  z-index: 300;
  pointer-events: none;
}

.effect-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: feedback-in 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.effect-feedback.animating {
  animation: feedback-in 0.3s ease-out, feedback-pop 0.5s ease-out 0.3s;
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

/* 类型样式 */
.effect-feedback.success {
  border-color: rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(0, 0, 0, 0.9) 100%);
}

.effect-feedback.warning {
  border-color: rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(0, 0, 0, 0.9) 100%);
}

.effect-feedback.info {
  border-color: rgba(56, 189, 248, 0.4);
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0.9) 100%);
}

.effect-feedback.legendary {
  border-color: rgba(255, 215, 0, 0.6);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%);
  animation: feedback-in 0.3s ease-out, legendary-glow 1s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
  }
}

.feedback-icon {
  font-size: 20px;
}

.feedback-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.feedback-value {
  font-weight: bold;
  font-size: 14px;
}

.feedback-value.positive { color: #4ade80; }
.feedback-value.negative { color: #f87171; }
.feedback-value.neutral { color: #e8e8e8; }
.feedback-value.legendary {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
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
</style>
