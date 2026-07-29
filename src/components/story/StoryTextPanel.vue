<template>
  <section class="story-text-panel" :class="{ 'short-text': shortText }">
    <div v-if="showMomentBand" class="story-moment-band" :class="{ compact: !scenePulse && !sceneHint }">
      <strong v-if="sceneHint" class="moment-hint">{{ sceneHint }}</strong>
      <small v-if="pageCountLabel" class="moment-count">{{ pageCountLabel }}</small>
    </div>
    <div class="story-panel-head" :class="{ idle: !showPanelHead }">
      <div class="panel-signals">
        <span class="panel-breath" :class="{ live: typing, next: hasNext, hidden: !showPanelHead }"></span>
      </div>
    </div>
    <div class="story-main-text">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  pageStatus?: string
  pageCountLabel?: string
  typing?: boolean
  hasNext?: boolean
  autoLabel?: string
  scenePulse?: string
  sceneHint?: string
  compactMeta?: boolean
  shortText?: boolean
}>(), {
  pageStatus: '',
  pageCountLabel: '',
  typing: false,
  hasNext: false,
  autoLabel: '',
  scenePulse: '',
  sceneHint: '',
  compactMeta: false,
  shortText: false
})

const showMomentBand = computed(() => {
  if (props.compactMeta) {
    return Boolean(props.pageCountLabel && !props.sceneHint)
  }
  return Boolean(props.sceneHint || props.pageCountLabel)
})

const showPanelHead = computed(() => {
  if (props.compactMeta) return props.typing || props.hasNext
  return props.typing || props.hasNext
})
</script>

<style scoped>
.story-text-panel {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  padding: 8px 12px 10px;
  border: 0;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(252, 254, 250, 0.92), rgba(245, 249, 246, 0.9)),
    radial-gradient(circle at top left, rgba(232, 196, 118, 0.08), transparent 34%);
  box-shadow:
    0 14px 24px rgba(32, 48, 45, 0.06),
    inset 0 0 0 1px rgba(191, 155, 92, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.38);
  overflow: hidden;
}

.story-text-panel.short-text {
  min-height: 0;
}

.story-panel-head {
  position: relative;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 3px;
  min-height: 7px;
}

.story-panel-head.idle {
  opacity: 0.42;
}

.story-moment-band {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
  padding: 0;
}

.story-moment-band.compact {
  gap: 0;
  margin-bottom: 2px;
}

.moment-hint {
  color: #7b5223;
  font-size: 9px;
  line-height: 1.35;
  font-weight: 700;
  text-wrap: wrap;
  max-width: min(100%, 18ch);
  opacity: 0.44;
}

.moment-count {
  color: rgba(92, 115, 109, 0.52);
  font-size: 8px;
  line-height: 1.2;
  letter-spacing: 0.08em;
  white-space: nowrap;
  opacity: 0.58;
}

.panel-signals {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  justify-content: flex-end;
  margin-left: auto;
}

.panel-breath {
  width: 3px;
  height: 3px;
  margin-top: 1px;
  border-radius: 999px;
  background: rgba(143, 173, 162, 0.26);
  box-shadow: 0 0 0 0 rgba(123, 165, 151, 0.14);
}

.panel-breath.live {
  background: rgba(184, 133, 53, 0.86);
  animation: pulse 1.1s ease-in-out infinite;
}

.panel-breath.next {
  background: rgba(95, 151, 134, 0.82);
}

.panel-breath.hidden {
  opacity: 0;
}

.story-main-text {
  position: relative;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  color: rgba(46, 71, 66, 0.92);
  color: var(--theme-story-text, rgba(46, 71, 66, 0.92));
  font-family: var(--font-story);
  font-size: 16px;
  line-height: 1.7;
  letter-spacing: 0.01em;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: anywhere;
  text-wrap: wrap;
  padding: 2px 4px 0 10px;
  font-weight: 540;
  max-height: min(42vh, 360px);
  overflow: auto;
  text-wrap: pretty;
}

.story-text-panel.short-text .story-main-text {
  min-height: 2.1em;
}

.story-main-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2em;
  bottom: 0.18em;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(183, 135, 58, 0.26), rgba(112, 166, 148, 0.1));
  opacity: 0.5;
}

@keyframes pulse {
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(176, 126, 53, 0.22);
  }
  70% {
    transform: scale(1.12);
    box-shadow: 0 0 0 10px rgba(176, 126, 53, 0);
  }
  100% {
    transform: scale(0.94);
    box-shadow: 0 0 0 0 rgba(176, 126, 53, 0);
  }
}

@media (max-width: 560px) {
  .story-text-panel {
    min-height: 0;
    padding: 7px 10px 9px;
    border-radius: 18px;
  }

  .story-text-panel.short-text {
    min-height: 0;
  }

  .moment-hint {
    font-size: 9px;
    max-width: min(100%, 16ch);
  }

  .moment-count {
    font-size: 8px;
  }

  .story-main-text {
    min-height: 0;
    font-size: 15px;
    line-height: 1.64;
    padding-left: 10px;
  }

  .story-text-panel.short-text .story-main-text {
    min-height: 2em;
  }
}
</style>
