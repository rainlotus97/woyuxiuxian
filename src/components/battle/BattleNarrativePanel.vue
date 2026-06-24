<template>
  <div class="battle-narrative">
    <div class="narrative-log" ref="logRef">
      <TransitionGroup name="narrative-line">
        <div
          v-for="(entry, i) in narrativeEntries"
          :key="`n-${i}`"
          class="narrative-entry"
          :class="entry.cssClass"
        >
          <span class="narrative-icon">{{ entry.icon }}</span>
          <span class="narrative-text">{{ entry.text }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, type PropType } from 'vue'

export interface NarrativeEntry {
  icon: string
  text: string
  cssClass: string
}

const props = defineProps({
  entries: {
    type: Array as PropType<NarrativeEntry[]>,
    default: () => []
  }
})

const logRef = ref<HTMLElement | null>(null)
const narrativeEntries = ref<NarrativeEntry[]>([])

watch(() => props.entries.length, async () => {
  narrativeEntries.value = [...props.entries]
  await nextTick()
  if (logRef.value) {
    logRef.value.scrollTop = logRef.value.scrollHeight
  }
}, { immediate: true })
</script>

<style scoped>
.battle-narrative {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: min(90%, 380px);
  max-height: 200px;
  z-index: 20;
  pointer-events: none;
}

.narrative-log {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 14px;
  background: rgba(49, 82, 87, 0.85);
  backdrop-filter: blur(8px);
  scrollbar-width: thin;
}

.narrative-entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.narrative-icon {
  flex-shrink: 0;
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.narrative-text {
  flex: 1;
  min-width: 0;
}

.effect-fire { border-left: 3px solid #ff6b35; }
.effect-ice { border-left: 3px solid #4fc3f7; }
.effect-thunder { border-left: 3px solid #ffe082; }
.effect-slash { border-left: 3px solid #b0bec5; }
.effect-heal { border-left: 3px solid #81c784; }
.effect-critical { border-left: 3px solid #ff5252; }
.effect-knockdown { border-left: 3px solid #ce93d8; }
.effect-defend { border-left: 3px solid #64b5f6; }
.effect-hit { border-left: 3px solid #ffab91; }
.effect-attack { border-left: 3px solid #a5d6a7; }
.effect-block { border-left: 3px solid #ffcc80; }
.effect-dodge { border-left: 3px solid #90caf9; }
.effect-wind { border-left: 3px solid #80cbc4; }
.effect-earth { border-left: 3px solid #a1887f; }
.effect-water { border-left: 3px solid #42a5f5; }
.effect-wood { border-left: 3px solid #66bb6a; }
.effect-void { border-left: 3px solid #ab47bc; }

.narrative-line-enter-active {
  transition: all 0.3s ease;
}
.narrative-line-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
