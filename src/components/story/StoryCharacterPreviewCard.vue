<template>
  <div
    class="story-character-card"
    :class="[variantClass, { flipped: flipped }]"
    role="button"
    tabindex="0"
    @click="flipped = !flipped"
    @keydown.enter.prevent="flipped = !flipped"
    @keydown.space.prevent="flipped = !flipped"
  >
    <span class="story-character-card-inner">
      <span class="story-character-face story-character-front">
        <span class="story-character-banner">
          <small>{{ profile.debutLabel ?? '人物现身' }}</small>
          <strong>{{ profile.faction }}</strong>
        </span>
        <span class="story-character-art">
          <img :src="profile.portrait" :alt="`${profile.name}立绘`" loading="lazy" />
        </span>
        <span class="story-character-front-copy">
          <span class="story-character-title-row">
            <strong>{{ profile.name }}</strong>
            <small>{{ profile.title }}</small>
          </span>
          <span v-if="profile.arrivalLine" class="story-character-arrival">{{ profile.arrivalLine }}</span>
          <span class="story-character-intro">{{ profile.intro }}</span>
          <span class="story-character-hint">点开可看人物小传</span>
        </span>
      </span>

      <span class="story-character-face story-character-back">
        <span class="story-character-back-copy">
          <span class="story-character-faction">{{ profile.faction }}</span>
          <strong>{{ profile.name }}</strong>
          <small class="story-character-back-title">{{ profile.title }}</small>
          <p>{{ profile.description }}</p>
          <span class="story-character-tags">
            <span v-for="tag in profile.tags" :key="tag">{{ tag }}</span>
          </span>
        </span>

        <span class="story-character-voice">
          <button
            class="voice-btn"
            type="button"
            :disabled="!voiceReady"
            @click.stop="handleVoicePreview"
          >
            {{ voiceReady ? '试听语音' : '语音预留' }}
          </button>
          <small v-if="profile.voice">{{ profile.voice.sampleLine }}</small>
          <small v-else>后续可接角色 TTS / 配音样句。</small>
        </span>
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { hasStoryVoiceProvider, playStoryVoice } from '@/story/runtime/storyVoiceBridge'
import type { StoryCharacterProfile } from '@/story/runtime/storyCharacterCodex'

const props = defineProps<{
  profile: StoryCharacterProfile
  variant?: 'codex' | 'story'
}>()

const flipped = ref(false)
const variantClass = computed(() => `variant-${props.variant ?? 'codex'}`)
const voiceReady = computed(() => hasStoryVoiceProvider(props.profile.voice))

async function handleVoicePreview() {
  if (!props.profile.voice) return
  await playStoryVoice({
    key: props.profile.voice.key,
    text: props.profile.voice.sampleLine,
    speaker: props.profile.name
  })
}
</script>

<style scoped>
.story-character-card {
  display: block;
  width: 100%;
  min-height: 0;
  padding: 0;
  background: none;
  text-align: left;
  perspective: 1200px;
  cursor: pointer;
  transform: translateZ(0);
}

.story-character-card:focus-visible {
  outline: 2px solid rgba(167, 124, 54, 0.46);
  outline-offset: 4px;
  border-radius: 22px;
}

.story-character-card-inner {
  --story-portrait-ratio: 9 / 16;
  position: relative;
  display: block;
  width: min(100%, 352px);
  margin: 0 auto;
  aspect-ratio: var(--story-portrait-ratio);
  min-height: clamp(432px, 64svh, 704px);
  transform-style: preserve-3d;
  transition: transform 0.42s ease, filter 0.28s ease;
}

.story-character-card.flipped .story-character-card-inner {
  transform: rotateY(180deg);
}

.story-character-card:hover .story-character-card-inner {
  filter: saturate(1.02);
}

.story-character-face {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: clamp(7px, 1.6vh, 10px);
  padding: clamp(10px, 1.9vh, 13px);
  border-radius: 24px;
  backface-visibility: hidden;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 251, 242, 0.98), rgba(235, 246, 241, 0.94)),
    radial-gradient(circle at top right, rgba(236, 204, 127, 0.22), transparent 45%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent 34%, rgba(113, 151, 139, 0.08) 72%, transparent);
  border: 1px solid rgba(165, 135, 81, 0.18);
  box-shadow:
    0 18px 36px rgba(56, 87, 83, 0.14),
    0 2px 0 rgba(255, 255, 255, 0.48) inset;
}

.story-character-face::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 18px;
  border: 1px solid rgba(218, 193, 143, 0.26);
  pointer-events: none;
}

.story-character-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.42), transparent 30%),
    linear-gradient(135deg, rgba(255, 245, 214, 0.1), transparent 46%, rgba(170, 213, 198, 0.08) 78%, transparent);
  pointer-events: none;
}

.story-character-front {
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.story-character-back {
  transform: rotateY(180deg);
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.story-character-art {
  position: relative;
  min-height: 0;
  height: 100%;
  min-width: 0;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(240, 245, 255, 0.72), rgba(212, 223, 236, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(52, 69, 80, 0.08));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 20px 30px rgba(38, 56, 65, 0.12);
}

.story-character-art img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
  object-position: center top;
}

.story-character-art::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 32%;
  background: linear-gradient(180deg, rgba(245, 249, 246, 0), rgba(245, 249, 246, 0.76));
}

.story-character-card.variant-story .story-character-card-inner {
  width: min(100%, 318px);
  min-height: clamp(396px, 58svh, 612px);
}

.story-character-card.variant-story .story-character-face {
  padding: 10px;
  gap: 8px;
  border-radius: 18px;
}

.story-character-card.variant-story .story-character-art {
  aspect-ratio: var(--story-portrait-ratio);
  background:
    radial-gradient(circle at top, rgba(240, 245, 255, 0.8), rgba(216, 229, 238, 0.94)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(42, 59, 68, 0.1));
}

.story-character-card.variant-story .story-character-art img {
  min-height: 0;
  max-height: none;
}

.story-character-card.variant-story .story-character-title-row strong,
.story-character-card.variant-story .story-character-back-copy strong {
  font-size: 16px;
}

.story-character-card.variant-story .story-character-intro,
.story-character-card.variant-story .story-character-back-copy p {
  font-size: 11px;
  line-height: 1.56;
}

.story-character-card.variant-story .story-character-arrival {
  font-size: 10px;
  line-height: 1.45;
}

.story-character-card.variant-story .story-character-voice {
  gap: 5px;
}

.story-character-front-copy,
.story-character-back-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.story-character-front-copy {
  padding: 10px 11px 11px;
  margin: -54px 4px 0;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(247, 251, 247, 0.16), rgba(247, 251, 247, 0.94) 22%, rgba(243, 248, 244, 0.98)),
    radial-gradient(circle at top, rgba(230, 194, 119, 0.1), transparent 56%);
  border: 1px solid rgba(199, 167, 110, 0.14);
  box-shadow:
    0 14px 28px rgba(42, 62, 59, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(8px);
}

.story-character-back-copy {
  align-content: start;
  overflow: auto;
  padding: 6px 4px 0 2px;
}

.story-character-banner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 4px 0;
}

.story-character-title-row {
  display: grid;
  gap: 2px;
}

.story-character-banner small {
  color: rgba(126, 92, 39, 0.78);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.story-character-banner strong {
  color: rgba(86, 108, 104, 0.68);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: right;
}

.story-character-title-row strong,
.story-character-back-copy strong {
  color: #7a4e19;
  font-size: 18px;
  line-height: 1.08;
}

.story-character-title-row small,
.story-character-back-title {
  color: rgba(82, 109, 104, 0.76);
  font-size: 10px;
  line-height: 1.35;
  letter-spacing: 0.08em;
}

.story-character-arrival {
  color: rgba(99, 79, 45, 0.78);
  font-size: 11px;
  line-height: 1.45;
}

.story-character-intro,
.story-character-back-copy p {
  margin: 0;
  color: #32504a;
  font-size: 12px;
  line-height: 1.62;
  text-wrap: pretty;
}

.story-character-hint {
  color: rgba(106, 132, 125, 0.72);
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.08em;
}

.story-character-faction {
  color: rgba(127, 91, 36, 0.7);
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: 0.14em;
  font-weight: 800;
}

.story-character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.story-character-tags span {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(246, 251, 247, 0.88);
  border: 1px solid rgba(168, 136, 74, 0.12);
  color: rgba(86, 108, 104, 0.82);
  font-size: 10px;
  line-height: 1.1;
}

.story-character-voice {
  display: grid;
  gap: 6px;
  align-content: end;
}

.story-character-voice small {
  color: rgba(86, 108, 104, 0.76);
  font-size: 10px;
  line-height: 1.45;
}

.voice-btn {
  width: fit-content;
  min-width: 88px;
  padding: 7px 12px;
  border: 1px solid rgba(166, 129, 69, 0.18);
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.94);
  color: #8b632c;
  font-size: 11px;
  font-weight: 700;
}

.voice-btn:disabled {
  opacity: 0.58;
}

@media (max-width: 560px) {
  .story-character-card-inner {
    width: min(100%, 320px);
    min-height: clamp(404px, 66svh, 620px);
  }

  .story-character-card.variant-story .story-character-card-inner {
    width: min(100%, 300px);
    min-height: clamp(388px, 62svh, 560px);
  }

  .story-character-front-copy {
    margin-top: -46px;
    padding: 9px 10px 10px;
  }

  .story-character-title-row strong,
  .story-character-back-copy strong {
    font-size: 16px;
  }

  .story-character-intro,
  .story-character-back-copy p {
    font-size: 11px;
    line-height: 1.56;
  }
}
</style>
