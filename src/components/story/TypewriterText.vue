<template>
  <span class="typewriter">
    <span class="text-ghost" aria-hidden="true">{{ text }}</span>
    <span class="text-live">
      <span class="text">{{ displayedText }}</span>
    </span>
    <span v-if="isTyping" class="cursor-dot" aria-hidden="true"></span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  text: string
  speed?: number
  instant?: boolean
  prefill?: number
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

watch(() => props.instant, instant => {
  if (!instant || typingComplete.value) return
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  displayedText.value = props.text
  isTyping.value = false
  typingComplete.value = true
  if (!hasEmittedComplete.value) {
    hasEmittedComplete.value = true
    nextTick(() => {
      emit('complete')
    })
  }
})

function startTyping(text: string) {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  if (props.instant) {
    displayedText.value = text
    isTyping.value = false
    typingComplete.value = true
    if (!hasEmittedComplete.value) {
      hasEmittedComplete.value = true
      nextTick(() => {
        emit('complete')
      })
    }
    return
  }

  const segments = buildRevealSegments(text)
  const prefill = Math.max(0, Math.min(segments.length, props.prefill ?? 0))
  displayedText.value = prefill > 0 ? segments.slice(0, prefill).join('') : ''
  isTyping.value = true

  let index = prefill
  timer.value = setInterval(() => {
    if (index < segments.length) {
      displayedText.value += segments[index]
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

function buildRevealSegments(text: string) {
  const source = text.replace(/\r/g, '')
  if (!source) return []

  const segments: string[] = []
  const lines = source.split('\n')

  const splitClause = (value: string) => {
    const chunks: string[] = []
    let remaining = value
    const maxChunk = /[，、；：——]/u.test(value) ? 8 : 10

    while (remaining.length > maxChunk) {
      let sliceIndex = maxChunk
      for (let index = Math.min(remaining.length - 1, maxChunk + 2); index >= Math.max(3, maxChunk - 2); index -= 1) {
        const candidate = remaining.slice(0, index)
        const lastChar = candidate.slice(-1)
        if (/[，、；：——]/u.test(lastChar)) {
          sliceIndex = index
          break
        }
      }
      chunks.push(remaining.slice(0, sliceIndex))
      remaining = remaining.slice(sliceIndex)
    }

    if (remaining) chunks.push(remaining)
    return chunks.filter(Boolean)
  }

  lines.forEach((line, lineIndex) => {
    const clauses = line.match(/[^，、；：。！？!?——]+[，、；：。！？!?——]?|[，、；：。！？!?——]/gu) ?? []
    clauses.forEach((clause, clauseIndex) => {
      splitClause(clause).forEach(chunk => {
        segments.push(chunk)
      })
      if (clauseIndex === clauses.length - 1 && lineIndex < lines.length - 1) {
        segments.push('\n')
      }
    })
  })

  return segments.filter(segment => segment.length > 0)
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.typewriter {
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  box-sizing: border-box;
  font-family: var(--font-story, inherit);
  line-height: inherit;
  color: inherit;
  contain: layout style;
}

.text-ghost {
  grid-area: 1 / 1;
  display: block;
  visibility: hidden;
  white-space: pre-wrap;
  text-wrap: wrap;
  overflow-wrap: anywhere;
  word-break: keep-all;
  min-height: inherit;
}

.text-live {
  grid-area: 1 / 1;
  position: relative;
  display: block;
  pointer-events: none;
  box-sizing: border-box;
}

.text {
  white-space: pre-wrap;
  text-wrap: wrap;
  overflow-wrap: anywhere;
  word-break: keep-all;
  display: block;
  min-height: inherit;
}

.cursor-dot {
  position: absolute;
  right: 0.08em;
  bottom: 0.22em;
  display: block;
  width: 0.28em;
  height: 0.28em;
  border-radius: 999px;
  background: rgba(126, 171, 154, 0.48);
  box-shadow: 0 0 0 0 rgba(126, 171, 154, 0.12);
  animation: pulse-dot 0.95s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.88);
    opacity: 0.48;
    box-shadow: 0 0 0 0 rgba(126, 171, 154, 0.16);
  }
  60% {
    transform: scale(1.18);
    opacity: 0.92;
    box-shadow: 0 0 0 0.28em rgba(126, 171, 154, 0);
  }
  100% {
    transform: scale(0.92);
    opacity: 0.54;
    box-shadow: 0 0 0 0 rgba(126, 171, 154, 0);
  }
}
</style>
