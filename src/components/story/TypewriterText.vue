<template>
  <span class="typewriter">
    <span class="text">{{ displayedText }}</span>
    <span v-if="isTyping" class="cursor">|</span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

import { onMounted } from 'vue'

const props = defineProps<{
  text: string
  speed?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const displayedText = ref('')
const isTyping = ref(false)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const typingComplete = ref(false)

const hasEmittedComplete = ref(false)

watch(() => props.text, (newText) => {
  console.log('[TypewriterText] watch triggered, text length:', newText?.length)
  typingComplete.value = false
  hasEmittedComplete.value = false
  startTyping(newText)
}, { immediate: true })

function startTyping(text: string) {
  console.log('[TypewriterText] startTyping called, text length:', text?.length)

  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  displayedText.value = ''
  isTyping.value = true

  let index = 0
  timer.value = setInterval(() => {
    if (index < text.length) {
      displayedText.value += text[index]
      index++
    } else {
      clearInterval(timer.value!)
      timer.value = null
      isTyping.value = false
      typingComplete.value = true
      console.log('[TypewriterText] Typing complete, about to emit complete event')
      // 使用 nextTick 确保事件在下一个 tick 中发出
      if (!hasEmittedComplete.value) {
        hasEmittedComplete.value = true
        nextTick(() => {
          console.log('[TypewriterText] Emitting complete event')
          emit('complete')
          console.log('[TypewriterText] Complete event emitted')
        })
      }
    }
  }, props.speed || 30)
}

onMounted(() => {
  console.log('[TypewriterText] Component mounted, text prop:', props.text?.substring(0, 50))
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.typewriter {
  font-family: var(--font-story, inherit);
  line-height: 1.8;
  color: inherit;
}

.cursor {
  animation: blink 0.7s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
