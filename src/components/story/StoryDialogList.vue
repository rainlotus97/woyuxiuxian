<template>
  <section
    v-if="currentDialog"
    class="story-dialog-stage"
    :class="{
      active: true,
      'has-avatar': Boolean(currentDialog.avatar),
      'has-emotion': Boolean(currentDialog.emotion),
      'has-backdrop': Boolean(portraitBackdrop),
      'variant-debut': variant === 'debut'
    }"
    :style="stageStyle"
    role="button"
    tabindex="0"
    @click="$emit('select', currentDialog.sourceIndex)"
    @keydown.enter.prevent="$emit('select', currentDialog.sourceIndex)"
    @keydown.space.prevent="$emit('select', currentDialog.sourceIndex)"
  >
    <div v-if="portraitBackdrop" class="story-dialog-backdrop" aria-hidden="true">
      <img :src="portraitBackdrop" :alt="`${currentDialog.speaker}立绘`" loading="eager" />
      <span class="story-dialog-backdrop-mark">{{ currentDialog.speaker }}</span>
    </div>

    <div class="story-dialog-atmosphere" aria-hidden="true"></div>

    <div class="story-dialog-body">
      <div class="story-dialog-head">
        <div class="speaker-chip">
          <span v-if="speakerAvatarMode === 'focus'" class="speaker-avatar speaker-avatar-focus">
            <img :src="currentDialog.portrait || currentDialog.avatar" :alt="currentDialog.speaker" loading="lazy" />
          </span>
          <span v-else-if="currentDialog.avatar" class="speaker-avatar">
            <img :src="currentDialog.avatar" :alt="currentDialog.speaker" loading="lazy" />
          </span>
          <span v-else class="speaker-seal">{{ currentDialog.speaker.slice(0, 1) }}</span>
        </div>

        <div class="speaker-stack">
          <strong class="speaker">{{ currentDialog.speaker }}</strong>
          <span v-if="currentDialog.speakerTitle" class="speaker-title">{{ currentDialog.speakerTitle }}</span>
        </div>

        <span v-if="contentMark" class="dialog-beat">{{ contentMark }}</span>
      </div>

      <div class="dialog-bubble">
        <p v-if="currentDialog.emotion" class="dialog-emotion">{{ compactEmotion(currentDialog.emotion) }}</p>

        <div class="dialog-content">
          <TypewriterText
            :text="displayDialogText"
            :speed="14"
            :instant="instant"
            :prefill="displayDialogText.length <= 10 ? 2 : 4"
            @complete="$emit('complete')"
          />
        </div>
      </div>

      <div v-if="showProgress" class="story-dialog-foot" aria-hidden="true">
        <span class="dialog-progress-rail">
          <span class="dialog-progress-fill" :style="progressStyle"></span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NpcDialog } from '@/story/types'
import TypewriterText from './TypewriterText.vue'

defineEmits<{
  select: [index: number]
  complete: []
}>()

const props = withDefaults(defineProps<{
  dialogs: NpcDialog[]
  activeIndex: number
  singleMode?: boolean
  instant?: boolean
  variant?: 'default' | 'debut'
}>(), {
  singleMode: false,
  instant: false,
  variant: 'default'
})

const currentDialog = computed(() => {
  const dialog = props.dialogs[props.activeIndex]
  if (!dialog) return null
  return {
    ...dialog,
    sourceIndex: props.activeIndex
  }
})

const showProgress = computed(() => props.dialogs.length > 1)
const instant = computed(() => props.instant)
const variant = computed(() => props.variant)
const contentMark = computed(() => resolveContentMark(currentDialog.value?.emotion))
const displayDialogText = computed(() => formatReadableDialogText(currentDialog.value?.content ?? ''))
const progressStyle = computed(() => ({
  width: `${((props.activeIndex + 1) / Math.max(props.dialogs.length, 1)) * 100}%`
}))
const portraitBackdrop = computed(() => currentDialog.value?.portrait || currentDialog.value?.avatar || '')
const speakerAvatarMode = computed(() => (
  currentDialog.value?.portrait && currentDialog.value?.avatarFocus
    ? 'focus'
    : currentDialog.value?.avatar
      ? 'avatar'
      : 'seal'
))
const stageStyle = computed(() => (
  {
    ...(portraitBackdrop.value
      ? { '--dialog-backdrop-url': `url("${portraitBackdrop.value}")` }
      : {}),
    ...(currentDialog.value?.avatarFocus
      ? {
        '--speaker-avatar-pos-x': `${currentDialog.value.avatarFocus.x}%`,
        '--speaker-avatar-pos-y': `${currentDialog.value.avatarFocus.y}%`,
        '--speaker-avatar-scale': `${currentDialog.value.avatarFocus.scale}`
      }
      : {})
  }
))

function compactEmotion(emotion: string) {
  const trimmed = emotion.trim()
  if (!trimmed) return ''
  return trimmed.length > 34 ? `${trimmed.slice(0, 34)}…` : trimmed
}

function resolveContentMark(emotion?: string) {
  if (!emotion) return ''
  if (/低声|轻声|极轻|压低|耳语/u.test(emotion)) return '压低了声音'
  if (/平静|冷淡|淡淡|稳|极稳/u.test(emotion)) return '话音很稳'
  if (/打断|猛地|喝|厉声|骤然/u.test(emotion)) return '话锋陡然一变'
  if (/笑|微笑|嘴角|翘/u.test(emotion)) return '像带着一点别意'
  return ''
}

function formatReadableDialogText(text: string) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')
}
</script>

<style scoped>
.story-dialog-stage {
  position: relative;
  display: grid;
  align-items: end;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: clamp(198px, 28vh, 272px);
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  transition: box-shadow 0.16s ease, border-color 0.16s ease;
  overflow: hidden;
  contain: layout paint;
}

.story-dialog-stage.variant-debut {
  min-height: clamp(204px, 28vh, 254px);
  border: 0;
  border-radius: 20px;
  background:
    radial-gradient(circle at top, rgba(231, 197, 122, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(247, 250, 245, 0.22), rgba(232, 241, 236, 0.44));
}

.story-dialog-stage:focus-visible {
  outline: 2px solid rgba(170, 126, 58, 0.34);
  outline-offset: 2px;
}

.story-dialog-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.story-dialog-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(232, 241, 236, 0.02), rgba(232, 241, 236, 0.08) 20%, rgba(232, 241, 236, 0.78) 74%),
    linear-gradient(90deg, rgba(240, 246, 241, 0.08), rgba(240, 246, 241, 0.02) 20%, rgba(240, 246, 241, 0.01) 56%, rgba(240, 246, 241, 0.1));
}

.story-dialog-backdrop::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--dialog-backdrop-url);
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  opacity: 0.04;
  filter: blur(22px) saturate(0.62);
  transform: scale(1.01);
}

.story-dialog-backdrop img {
  position: absolute;
  left: 50%;
  top: 10%;
  width: min(100%, 228px);
  height: 100%;
  object-fit: contain;
  object-position: center top;
  opacity: 0.09;
  filter: saturate(0.56) contrast(0.88) brightness(0.94);
  transform: translateX(-50%) scale(0.98);
}

.story-dialog-backdrop-mark {
  position: absolute;
  top: 12px;
  right: 14px;
  color: rgba(112, 140, 132, 0.1);
  font-size: 14px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.16em;
  writing-mode: vertical-rl;
}

.story-dialog-atmosphere {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(circle at 52% 18%, rgba(255, 241, 205, 0.08), transparent 24%),
    radial-gradient(circle at 18% 16%, rgba(110, 150, 134, 0.04), transparent 32%),
    radial-gradient(circle at 78% 16%, rgba(110, 150, 134, 0.03), transparent 24%),
    linear-gradient(180deg, rgba(228, 238, 234, 0), rgba(228, 238, 234, 0.04) 48%, rgba(228, 238, 234, 0.08));
  pointer-events: none;
}

.speaker-avatar,
.speaker-seal {
  width: 34px;
  height: 42px;
  overflow: hidden;
  border-radius: 15px;
  background: rgba(255, 252, 243, 0.9);
  box-shadow:
    inset 0 0 0 1px rgba(174, 132, 66, 0.16),
    0 12px 22px rgba(68, 52, 24, 0.12);
}

.speaker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.speaker-avatar-focus img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--speaker-avatar-pos-x, 50%) var(--speaker-avatar-pos-y, 12%);
  transform: scale(var(--speaker-avatar-scale, 2.6));
  transform-origin: center top;
}

.speaker-seal {
  display: grid;
  place-items: center;
  color: #8a5c24;
  font-size: 13px;
  font-weight: 800;
}

.story-dialog-body {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 8px;
  min-width: 0;
  width: min(100%, 342px);
  box-sizing: border-box;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
  margin: auto 0 0;
  background:
    linear-gradient(180deg, rgba(252, 253, 250, 0.88), rgba(246, 250, 247, 0.96) 18%, rgba(243, 248, 244, 0.98)),
    radial-gradient(circle at top, rgba(226, 194, 122, 0.05), transparent 56%);
  border-top: 1px solid rgba(202, 169, 108, 0.06);
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
  border-radius: 18px;
  backdrop-filter: blur(6px);
  box-shadow:
    0 8px 20px rgba(28, 44, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.story-dialog-stage.variant-debut .story-dialog-body {
  margin: auto 0 0;
  width: min(100%, 332px);
  padding: 8px 8px 8px;
  background:
    linear-gradient(180deg, rgba(248, 251, 247, 0.74), rgba(244, 249, 245, 0.98)),
    radial-gradient(circle at top, rgba(226, 194, 122, 0.12), transparent 56%);
  border-radius: 0;
  border: 0;
  box-shadow: none;
}

.story-dialog-stage.variant-debut .story-dialog-backdrop img {
  top: 4%;
  width: min(68%, 210px);
  opacity: 0.1;
}

.story-dialog-stage.variant-debut .story-dialog-backdrop::before {
  opacity: 0.12;
}

.story-dialog-stage.variant-debut .story-dialog-backdrop-mark {
  font-size: 18px;
  opacity: 0.8;
}

.story-dialog-stage.variant-debut .dialog-content {
  max-width: none;
  min-height: 2.4em;
}

.speaker-chip {
  display: grid;
  align-content: start;
}

.story-dialog-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 7px;
}

.speaker-stack {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.speaker {
  color: #7a4e19;
  font-size: 17px;
  line-height: 1.1;
  font-family: var(--font-ui);
}

.speaker-title {
  color: rgba(82, 109, 104, 0.68);
  font-size: 10px;
  line-height: 1.25;
  letter-spacing: 0.08em;
  text-wrap: wrap;
}

.dialog-beat {
  color: rgba(122, 95, 44, 0.66);
  font-size: 8px;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-align: right;
  max-width: 8ch;
  padding-top: 3px;
  text-wrap: pretty;
}

.dialog-bubble {
  display: grid;
  gap: 6px;
  width: 100%;
  min-height: 98px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 9px 9px 10px;
  border-radius: 15px;
  background:
    linear-gradient(180deg, rgba(255, 253, 247, 0.95), rgba(246, 250, 246, 0.97)),
    radial-gradient(circle at top left, rgba(231, 196, 118, 0.08), transparent 42%);
  box-shadow:
    0 10px 20px rgba(43, 61, 57, 0.06),
    inset 0 0 0 1px rgba(188, 153, 93, 0.1);
  overflow: hidden;
}

.dialog-emotion {
  margin: 0;
  padding-left: 10px;
  border-left: 2px solid rgba(191, 155, 92, 0.34);
  color: rgba(86, 108, 104, 0.74);
  font-size: 10px;
  line-height: 1.45;
  text-wrap: wrap;
}

.dialog-content {
  margin: 0;
  min-width: 0;
  color: #2f4742;
  font-family: var(--font-story);
  font-size: 14px;
  line-height: 1.58;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-wrap: wrap;
  min-height: 4.8em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.24);
  max-width: none;
  overflow-wrap: break-word;
  word-break: normal;
  overflow-wrap: anywhere;
  max-height: min(28vh, 240px);
  overflow: auto;
  overscroll-behavior: contain;
}

.dialog-content :deep(.text),
.dialog-content :deep(.text-ghost) {
  text-wrap: wrap;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.story-dialog-foot {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1px;
}

.dialog-progress-rail {
  position: relative;
  width: clamp(52px, 24vw, 84px);
  height: 2px;
  border-radius: 999px;
  background: rgba(127, 153, 145, 0.16);
  overflow: hidden;
}

.dialog-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(191, 147, 72, 0.66), rgba(106, 155, 138, 0.56));
  transition: width 0.22s ease;
}

@media (max-width: 560px) {
  .story-dialog-stage {
    min-height: clamp(188px, 26vh, 248px);
    border-radius: 0;
  }

  .story-dialog-stage.variant-debut {
    min-height: clamp(188px, 24vh, 228px);
    border-radius: 18px;
  }

  .story-dialog-backdrop img {
    left: 50%;
    width: min(100%, 196px);
    transform: translateX(-50%) scale(0.98);
  }

  .story-dialog-backdrop-mark {
    top: 12px;
    right: 12px;
    font-size: 12px;
  }

  .story-dialog-body {
    width: min(100%, 324px);
    gap: 7px;
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
    margin: auto 0 0;
    border-radius: 18px;
  }

  .speaker-avatar,
  .speaker-seal {
    width: 30px;
    height: 38px;
    border-radius: 11px;
  }

  .speaker {
    font-size: 16px;
  }

  .speaker-cue,
  .dialog-beat {
    font-size: 8px;
  }

  .dialog-content {
    font-size: 13.5px;
    line-height: 1.56;
    min-height: 4.4em;
    max-width: none;
  }

  .story-dialog-stage.variant-debut .dialog-content {
    min-height: 2.4em;
    max-width: none;
  }

  .dialog-bubble {
    width: min(100%, 100%);
    min-height: 92px;
    padding: 8px 8px 9px;
    border-radius: 14px;
  }

  .speaker-title,
  .dialog-emotion {
    font-size: 10px;
  }

  .dialog-progress-rail {
    width: clamp(48px, 20vw, 64px);
  }
}
</style>
