<template>
  <section v-if="profile" class="story-character-debut-banner">
    <div class="story-character-debut-copy">
      <small>{{ profile.debutLabel ?? '人物初见' }}</small>
      <strong>{{ profile.name }}{{ profile.title ? ` · ${profile.title}` : '' }}</strong>
      <p>{{ profile.arrivalLine ?? profile.intro }}</p>
    </div>
    <div class="story-character-debut-meta">
      <span>{{ profile.faction }}</span>
      <button
        class="story-character-debut-voice"
        type="button"
        :disabled="!voiceReady"
        @click.stop="handleVoicePreview"
      >
        {{ voiceReady ? '试听一句' : '语音预留' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasStoryVoiceProvider, playStoryVoice } from '@/story/runtime/storyVoiceBridge'
import type { StoryCharacterProfile } from '@/story/runtime/storyCharacterCodex'

const props = defineProps<{
  profile: StoryCharacterProfile | null
}>()

const voiceReady = computed(() => hasStoryVoiceProvider(props.profile?.voice))

async function handleVoicePreview() {
  if (!props.profile?.voice) return
  await playStoryVoice({
    key: props.profile.voice.key,
    text: props.profile.voice.sampleLine,
    speaker: props.profile.name
  })
}
</script>

<style scoped>
.story-character-debut-banner {
  display: grid;
  gap: 5px;
  padding: 10px 12px;
  border: 0;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 252, 244, 0.86), rgba(244, 248, 244, 0.9));
  box-shadow: 0 14px 28px rgba(32, 48, 45, 0.08);
  overflow: hidden;
  position: relative;
}

.story-character-debut-banner::after {
  content: '现身';
  position: absolute;
  top: 8px;
  right: 10px;
  color: rgba(116, 144, 137, 0.16);
  font-size: 14px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.story-character-debut-copy {
  display: grid;
  gap: 4px;
  padding-right: 24px;
}

.story-character-debut-copy small {
  color: rgba(131, 92, 33, 0.76);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.story-character-debut-copy strong {
  color: #7b5223;
  font-size: 13px;
  line-height: 1.2;
}

.story-character-debut-copy p {
  margin: 0;
  color: rgba(57, 84, 80, 0.8);
  font-size: 10px;
  line-height: 1.44;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.story-character-debut-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.story-character-debut-meta span {
  color: rgba(73, 99, 95, 0.76);
  font-size: 9px;
}

.story-character-debut-voice {
  min-width: 0;
  padding: 3px 8px;
  border: 1px solid rgba(167, 124, 54, 0.2);
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.72);
  color: #8b632c;
  font-size: 8px;
  font-weight: 700;
}

.story-character-debut-voice:disabled {
  opacity: 0.64;
}

@media (max-width: 560px) {
  .story-character-debut-banner {
    gap: 4px;
    padding: 9px 10px;
  }

  .story-character-debut-banner::after {
    top: 7px;
    right: 9px;
    font-size: 11px;
  }

  .story-character-debut-copy {
    padding-right: 18px;
  }

  .story-character-debut-copy strong {
    font-size: 12px;
  }

  .story-character-debut-copy p,
  .story-character-debut-meta span {
    font-size: 9px;
  }
}
</style>
