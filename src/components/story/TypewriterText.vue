<template>
  <span class="typewriter">
    <span class="text">{{ displayedText }}</span>
    <span v-if="isTyping" class="cursor">|</span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

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
  typingComplete.value = false
  hasEmittedComplete.value = false
  startTyping(newText)
}, { immediate: true })

function startTyping(text: string) {
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
      if (!hasEmittedComplete.value) {
        hasEmittedComplete.value = true
        nextTick(() => {
          emit('complete')
        })
      }
    }
  }, props.speed || 30)
}

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
