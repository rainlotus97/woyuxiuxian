<template>
  <button
    class="story-profile-fallback-card"
    :class="{ flipped }"
    type="button"
    @click="flipped = !flipped"
  >
    <span class="story-profile-fallback-inner">
      <span class="story-profile-fallback-face story-profile-fallback-front">
        <span class="story-profile-fallback-banner">
          <small>人物在册</small>
          <strong>{{ faction }}</strong>
        </span>
        <span class="story-profile-fallback-crest" :style="{ background: accentBg }">
          <GameIcon class="story-profile-fallback-crest-icon" :icon="icon" :size="42" />
          <em>{{ quality }}</em>
        </span>
        <span class="story-profile-fallback-copy">
          <strong>{{ name }}</strong>
          <small>{{ title }}</small>
          <p>{{ intro }}</p>
          <span class="story-profile-fallback-hint">点开可看人物简介</span>
        </span>
      </span>

      <span class="story-profile-fallback-face story-profile-fallback-back">
        <span class="story-profile-fallback-copy">
          <small>{{ specialty }} · {{ quality }}</small>
          <strong>{{ name }}</strong>
          <p>{{ description }}</p>
        </span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'

const props = defineProps<{
  name: string
  title: string
  faction: string
  specialty: string
  quality: string
  icon: string
  intro: string
  description: string
  accentColor?: string
}>()

const flipped = ref(false)

const accentBg = computed(() => {
  const color = props.accentColor ?? '#8fb8aa'
  return `radial-gradient(circle at top, ${color}55, ${color}18 68%, rgba(255,255,255,0.92) 100%)`
})
</script>

<style scoped>
.story-profile-fallback-card {
  display: block;
  width: 100%;
  min-height: 100%;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  perspective: 1200px;
  cursor: pointer;
}

.story-profile-fallback-inner {
  position: relative;
  display: block;
  min-height: 412px;
  transform-style: preserve-3d;
  transition: transform 0.42s ease;
}

.story-profile-fallback-card.flipped .story-profile-fallback-inner {
  transform: rotateY(180deg);
}

.story-profile-fallback-face {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  backface-visibility: hidden;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 251, 242, 0.98), rgba(235, 246, 241, 0.94)),
    radial-gradient(circle at top right, rgba(236, 204, 127, 0.18), transparent 45%);
  border: 1px solid rgba(165, 135, 81, 0.18);
  box-shadow: 0 18px 36px rgba(56, 87, 83, 0.14);
}

.story-profile-fallback-back {
  transform: rotateY(180deg);
}

.story-profile-fallback-banner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.story-profile-fallback-banner small {
  color: rgba(126, 92, 39, 0.78);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.story-profile-fallback-banner strong {
  color: rgba(86, 108, 104, 0.68);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: right;
}

.story-profile-fallback-crest {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 220px;
  aspect-ratio: 3 / 4.2;
  border-radius: 18px;
  border: 1px solid rgba(140, 171, 160, 0.14);
  background: radial-gradient(circle at top, rgba(235, 244, 239, 0.88), rgba(222, 233, 229, 0.92));
}

.story-profile-fallback-crest-icon {
  color: #7b5223;
  font-size: 54px;
  font-style: normal;
  line-height: 1;
}

.story-profile-fallback-crest em {
  color: rgba(67, 94, 89, 0.76);
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.08em;
}

.story-profile-fallback-copy {
  display: grid;
  gap: 6px;
  align-content: start;
}

.story-profile-fallback-copy strong {
  color: #7e5521;
  font-size: 17px;
  line-height: 1.2;
}

.story-profile-fallback-copy small {
  color: rgba(78, 105, 102, 0.72);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.story-profile-fallback-copy p {
  margin: 0;
  color: #35504b;
  font-size: 12px;
  line-height: 1.65;
  text-wrap: pretty;
}

.story-profile-fallback-hint {
  color: rgba(115, 131, 125, 0.76);
  font-size: 10px;
}

@media (max-width: 560px) {
  .story-profile-fallback-inner {
    min-height: 438px;
  }

  .story-profile-fallback-face {
    padding: 12px;
    gap: 10px;
  }

  .story-profile-fallback-crest {
    min-height: 248px;
    aspect-ratio: 3 / 4.45;
  }

  .story-profile-fallback-copy p {
    font-size: 11px;
    line-height: 1.58;
  }
}
</style>
