<template>
  <section
    v-if="illustration"
    class="story-illustration"
    :class="[
      `mode-${props.mode ?? 'default'}`,
      `type-${illustration.type}`,
      `align-${illustration.align ?? 'center'}`,
      `emphasis-${illustration.emphasis ?? 'soft'}`
    ]"
  >
    <div
      v-if="characterProfile"
      class="story-character-debut-stage"
    >
      <button
        v-if="voiceReady"
        class="story-illustration-voice voice-character"
        type="button"
        @click.stop="handleIllustrationVoice"
      >
        听其现身
      </button>

      <button
        class="story-character-stage-media"
        type="button"
        @click="previewOpen = true"
      >
        <img
          :src="characterProfile.portrait"
          :alt="`${characterProfile.name}立绘`"
          loading="eager"
        />
      </button>

      <div class="story-character-stage-copy">
        <small>{{ characterProfile.debutLabel ?? '人物现身' }}</small>
        <strong>{{ characterProfile.name }}</strong>
        <span v-if="characterProfile.title" class="story-character-stage-title">{{ characterProfile.title }}</span>
        <p>{{ characterProfile.arrivalLine ?? characterProfile.intro }}</p>
        <div class="story-character-stage-meta">
          <span>{{ characterProfile.faction }}</span>
          <button
            class="story-character-stage-codex"
            type="button"
            @click.stop="previewOpen = true"
          >
            看立绘
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="story-illustration-frame"
      :class="`frame-${illustration.type}`"
    >
      <button
        v-if="voiceReady"
        class="story-illustration-voice"
        type="button"
        @click.stop="handleIllustrationVoice"
      >
        听这一幕
      </button>
      <component
        :is="sceneMediaTag"
        class="story-illustration-media"
        v-bind="sceneMediaProps"
      >
        <img
          :src="illustration.src"
          :alt="illustration.alt"
          loading="eager"
          :class="`fit-${mediaFit}`"
        />
      </component>
    </div>

    <Teleport to="body">
      <div
        v-if="previewOpen && illustration"
        class="story-illustration-preview"
        @click.self="previewOpen = false"
      >
        <div class="story-illustration-preview-shell">
          <button class="story-illustration-preview-close" type="button" @click="previewOpen = false">×</button>
          <div class="story-illustration-preview-copy">
            <strong>{{ illustration.alt }}</strong>
            <span v-if="previewHint" class="story-illustration-preview-hint">{{ previewHint }}</span>
          </div>
          <div class="story-illustration-preview-media" :class="`preview-${illustration.type}`">
            <img
              :src="illustration.src"
              :alt="illustration.alt"
              loading="eager"
              :class="`fit-${mediaFit}`"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StoryIllustration } from '@/story/types'
import { resolveStoryCharacterProfileById } from '@/story/runtime/storyCharacterCodex'
import { emitStoryVoiceCue, hasStoryVoiceProvider } from '@/story/runtime/storyVoiceBridge'

const props = defineProps<{
  illustration: StoryIllustration | null
  mode?: 'default' | 'supporting'
}>()

const previewOpen = ref(false)

const characterProfile = computed(() => {
  if (!props.illustration || props.illustration.type !== 'character') return null
  return resolveStoryCharacterProfileById(props.illustration.subjectId ?? null)
})

const mediaFit = computed(() => {
  if (!props.illustration) return 'contain'
  return props.illustration.type === 'character' ? 'contain' : 'contain'
})
const sceneMediaTag = computed(() => (
  props.mode === 'supporting' ? 'div' : 'button'
))
const sceneMediaProps = computed(() => (
  props.mode === 'supporting'
    ? {}
    : {
        type: 'button',
        onClick: () => { previewOpen.value = true }
      }
))

const previewHint = computed(() => {
  if (!props.illustration) return ''
  if (props.illustration.type === 'scene') return '场景图保持完整展示，不做硬裁切。'
  if (props.illustration.type === 'faction') return '宗门图以卷轴式展示，优先保留建筑与标识完整。'
  return '人物初登场以竖向立绘呈现，可先记住其形貌与气质。'
})

const voiceReady = computed(() => hasStoryVoiceProvider())

async function handleIllustrationVoice() {
  if (!props.illustration) return
  const mode = props.illustration.type === 'scene'
    ? 'scene'
    : props.illustration.type === 'faction'
      ? 'faction'
      : 'debut'
  await emitStoryVoiceCue({
    key: `illustration:${props.illustration.type}:${props.illustration.subjectId ?? props.illustration.alt}`,
    text: props.illustration.alt,
    speaker: props.illustration.type === 'faction' ? '宗门映像' : props.illustration.type === 'scene' ? '场景过场' : '人物现身',
    characterId: props.illustration.subjectId,
    mode
  })
}
</script>

<style scoped>
.story-illustration {
  --story-scene-ratio: 16 / 9;
  --story-portrait-ratio: 9 / 16;
  position: relative;
  display: grid;
  gap: 4px;
  margin: 0;
  order: 2;
}

.story-illustration-frame,
.story-character-debut-stage {
  min-width: 0;
}

.story-character-debut-stage {
  position: relative;
  width: min(100%, 336px);
  margin: 0 auto;
  display: grid;
  align-content: end;
  min-height: clamp(286px, 40vh, 424px);
  aspect-ratio: var(--story-portrait-ratio);
  overflow: hidden;
  border-radius: 22px;
  background:
    radial-gradient(circle at top, rgba(240, 245, 255, 0.82), rgba(214, 226, 236, 0.92)),
    linear-gradient(180deg, rgba(250, 252, 247, 0.14), rgba(45, 61, 70, 0.24));
  border: 1px solid rgba(171, 134, 72, 0.14);
  box-shadow: 0 20px 36px rgba(34, 53, 59, 0.14);
}

.story-character-stage-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.story-character-stage-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  filter: saturate(0.94) contrast(1.02) brightness(0.98);
}

.story-character-stage-copy {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 5px;
  margin: auto 10px 10px;
  padding: 10px 12px 12px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(252, 253, 250, 0.92), rgba(241, 247, 243, 0.86));
  box-shadow: 0 14px 28px rgba(29, 44, 42, 0.12);
  backdrop-filter: blur(6px);
}

.story-character-stage-copy small {
  color: rgba(128, 90, 30, 0.78);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.story-character-stage-copy strong {
  color: #7a4f1b;
  font-size: 19px;
  line-height: 1.08;
}

.story-character-stage-title {
  color: rgba(78, 103, 100, 0.72);
  font-size: 11px;
  line-height: 1.32;
  letter-spacing: 0.08em;
}

.story-character-stage-copy p {
  margin: 0;
  color: rgba(49, 74, 70, 0.9);
  font-size: 10.5px;
  line-height: 1.5;
  text-wrap: pretty;
}

.story-character-stage-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.story-character-stage-meta span {
  color: rgba(88, 110, 106, 0.76);
  font-size: 10px;
  line-height: 1.35;
}

.story-character-stage-codex {
  min-width: 62px;
  padding: 5px 10px;
  border: 1px solid rgba(167, 124, 54, 0.16);
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.94);
  color: #8b632c;
  font-size: 9px;
  font-weight: 700;
}

.story-illustration-frame {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(154, 181, 170, 0.06);
  background:
    linear-gradient(180deg, rgba(248, 250, 244, 0.34), rgba(230, 240, 235, 0.4));
  text-align: left;
  box-shadow: none;
  opacity: 0.84;
}

.story-illustration.type-scene .story-illustration-frame,
.story-illustration.type-faction .story-illustration-frame {
  width: min(100%, 720px);
  margin: 0 auto;
  aspect-ratio: var(--story-scene-ratio);
  border-radius: 18px;
}

.story-illustration.mode-supporting {
  gap: 1px;
  margin-top: -1px;
}

.story-illustration.mode-supporting .story-illustration-frame {
  opacity: 0.44;
  border-color: rgba(154, 181, 170, 0.03);
  background:
    linear-gradient(180deg, rgba(233, 240, 236, 0.05), rgba(214, 223, 219, 0.08));
  width: 100%;
  max-width: none;
  justify-self: stretch;
}

.story-illustration.mode-supporting .story-illustration-media {
  justify-content: start;
}

.story-illustration.mode-supporting img {
  filter: saturate(0.58) contrast(0.88) brightness(0.78);
}

.story-illustration-media {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.story-illustration img {
  display: block;
  width: 100%;
  object-fit: contain;
  object-position: center;
  filter: saturate(0.88) contrast(0.98) brightness(0.94);
}

.story-illustration img.fit-contain,
.story-illustration-preview-media img.fit-contain {
  object-fit: contain;
}

.story-illustration.type-scene .story-illustration-media,
.story-illustration.type-faction .story-illustration-media,
.story-illustration-preview-media {
  background:
    radial-gradient(circle at top, rgba(226, 234, 240, 0.18), rgba(205, 217, 223, 0.32)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(48, 65, 73, 0.04));
}

.story-illustration-frame.frame-scene .story-illustration-media,
.story-illustration-frame.frame-faction .story-illustration-media {
  height: 100%;
  padding: 6px;
}

.story-illustration.type-scene .story-illustration-media {
  min-height: 0;
}

.story-illustration.type-scene img {
  height: 100%;
  max-height: none;
}

.story-illustration.type-faction .story-illustration-media {
  min-height: 0;
}

.story-illustration.type-faction img {
  height: 100%;
  max-height: none;
}

.story-illustration.mode-supporting.type-scene .story-illustration-media {
  min-height: 0;
  padding: 0;
}

.story-illustration.mode-supporting.type-scene img {
  height: 100%;
  max-height: none;
}

.story-illustration.mode-supporting.type-faction .story-illustration-media {
  min-height: 0;
  padding: 0;
}

.story-illustration.mode-supporting.type-faction img {
  height: 100%;
  max-height: none;
}

.story-illustration.align-right img {
  object-position: right center;
}

.story-illustration.align-left img {
  object-position: left center;
}

.story-illustration.emphasis-focus img {
  min-height: 204px;
}

.story-illustration.type-character {
  margin-bottom: 2px;
}

.story-illustration-voice {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  min-width: 0;
  padding: 3px 7px;
  border: 1px solid rgba(166, 129, 69, 0.14);
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.76);
  color: #8b632c;
  font-size: 7px;
  font-weight: 700;
}

.story-illustration-voice.voice-character {
  top: 8px;
  right: 8px;
  z-index: 3;
}

.story-illustration-preview {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(18, 30, 28, 0.62);
  backdrop-filter: blur(10px);
}

.story-illustration-preview-shell {
  position: relative;
  width: min(94vw, 900px);
  max-height: min(90vh, 920px);
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(248, 252, 247, 0.96), rgba(232, 242, 237, 0.94));
  box-shadow: 0 22px 56px rgba(7, 17, 16, 0.28);
}

.story-illustration-preview-copy {
  display: grid;
  gap: 4px;
  padding-right: 24px;
}

.story-illustration-preview-copy strong {
  color: #7b5223;
  font-size: 16px;
  line-height: 1.25;
}

.story-illustration-preview-hint {
  color: rgba(73, 98, 95, 0.74);
  font-size: 11px;
  line-height: 1.5;
}

.story-illustration-preview-media {
  display: grid;
  place-items: center;
  padding: 10px;
  border-radius: 18px;
}

.story-illustration-preview-media.preview-scene {
  aspect-ratio: var(--story-scene-ratio);
  min-height: min(50vh, 480px);
}

.story-illustration-preview-media.preview-faction {
  aspect-ratio: var(--story-scene-ratio);
  min-height: min(46vh, 420px);
}

.story-illustration-preview-media img {
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: contain;
  border-radius: 18px;
}

.story-illustration-preview-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: rgba(90, 106, 103, 0.82);
  font-size: 18px;
}

@media (max-width: 560px) {
  .story-illustration.mode-supporting {
    gap: 0;
    margin-top: 0;
  }

  .story-character-debut-stage {
    width: min(100%, 270px);
    min-height: clamp(248px, 34vh, 360px);
    border-radius: 18px;
  }

  .story-character-stage-copy {
    gap: 3px;
    margin: auto 9px 9px;
    padding: 10px 11px 11px;
    border-radius: 12px;
  }

  .story-character-stage-copy strong {
    font-size: 16px;
  }

  .story-character-stage-title,
  .story-character-stage-copy p,
  .story-character-stage-meta span {
    font-size: 10px;
  }

  .story-character-stage-copy small,
  .story-character-stage-codex {
    font-size: 8px;
  }

  .story-illustration {
    gap: 3px;
  }

  .story-illustration.type-scene .story-illustration-frame,
  .story-illustration.type-faction .story-illustration-frame {
    width: 100%;
    border-radius: 14px;
    opacity: 0.94;
  }

  .story-illustration-voice {
    padding: 3px 6px;
    font-size: 7px;
  }

  .story-illustration-frame.frame-scene .story-illustration-media,
  .story-illustration-frame.frame-faction .story-illustration-media {
    padding: 4px;
  }

  .story-illustration.type-scene .story-illustration-media {
    min-height: 0;
  }

  .story-illustration.type-scene img {
    height: 100%;
    max-height: none;
  }

  .story-illustration.type-faction .story-illustration-media {
    min-height: 0;
  }

  .story-illustration.type-faction img {
    height: 100%;
    max-height: none;
  }

  .story-illustration.mode-supporting.type-scene .story-illustration-media {
    min-height: 0;
    padding: 0;
  }

  .story-illustration.mode-supporting.type-scene img {
    height: 100%;
    max-height: none;
  }

  .story-illustration.mode-supporting.type-faction .story-illustration-media {
    min-height: 0;
    padding: 0;
  }

  .story-illustration.mode-supporting .story-illustration-frame {
    max-width: 100%;
    opacity: 0.96;
    border-radius: 14px 14px 0 0;
  }

  .story-illustration.mode-supporting.type-faction img {
    height: 100%;
    max-height: none;
  }

  .story-illustration.mode-supporting img {
    filter: saturate(0.84) contrast(0.94) brightness(0.88);
  }

  .story-illustration-preview {
    padding: 12px;
  }

  .story-illustration-preview-shell {
    width: min(96vw, 720px);
    padding: 12px;
    border-radius: 20px;
  }

  .story-illustration-preview-media.preview-scene,
  .story-illustration-preview-media.preview-faction {
    min-height: min(30vh, 240px);
    padding: 6px;
  }
}
</style>
