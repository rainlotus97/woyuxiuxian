<template>
  <div class="theme-home-progress-ring" :style="ringStyle">
    <svg class="ring-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="ring-track" cx="50" cy="50" r="42" />
      <circle class="ring-progress" cx="50" cy="50" r="42" />
    </svg>
    <div class="ring-core">
      <div class="ring-figure"></div>
      <div class="ring-copy">
        <span class="ring-title">{{ title }}</span>
        <strong>{{ value }}</strong>
        <small>{{ subtitle }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import coreTexture from '@/assets/theme/generated/meditation-core-clean-v2.png'

const props = withDefaults(defineProps<{
  progress: number
  title: string
  value: string
  subtitle: string
}>(), {
  progress: 0
})

const ringStyle = computed(() => ({
  '--ring-progress': String(Math.max(0, Math.min(100, props.progress))),
  '--ring-core-image': `url("${coreTexture}")`
}))
</script>

<style scoped>
.theme-home-progress-ring {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 5.78rem);
  aspect-ratio: 1;
  filter: drop-shadow(0 0.32rem 0.72rem rgba(105, 160, 154, 0.12));
}

.ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track,
.ring-progress {
  fill: none;
  stroke-width: 6;
}

.ring-track {
  stroke: rgba(198, 224, 219, 0.62);
}

.ring-progress {
  stroke: #69b8b1;
  stroke-linecap: round;
  stroke-dasharray: 264;
  stroke-dashoffset: calc(264 - (264 * var(--ring-progress)) / 100);
  filter: drop-shadow(0 0 0.22rem rgba(105, 184, 177, 0.24));
}

.ring-core {
  position: relative;
  display: grid;
  place-items: center;
  width: 72%;
  height: 72%;
  border-radius: 999px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 35%, rgba(248, 252, 251, 0.94), rgba(231, 240, 238, 0.84) 64%, rgba(222, 235, 232, 0.72) 100%);
  box-shadow:
    inset 0 0 0 0.06rem rgba(214, 196, 160, 0.34),
    inset 0 -0.16rem 0.42rem rgba(169, 206, 200, 0.18);
}

.ring-figure {
  position: absolute;
  inset: 10%;
  background: center / cover no-repeat var(--ring-core-image);
  opacity: 0.4;
  filter: saturate(0.9) brightness(1.03);
}

.ring-copy {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  text-align: center;
}

.ring-title {
  color: #47413e;
  font-family: var(--font-game);
  font-size: 0.58rem;
  line-height: 1;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.88);
}

.ring-copy strong {
  color: #4f8888;
  font-family: var(--font-game);
  font-size: 1.54rem;
  line-height: 0.92;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.76);
}

.ring-copy small {
  color: rgba(87, 97, 98, 0.72);
  font-size: 0.48rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .theme-home-progress-ring {
    filter: drop-shadow(0 0.24rem 0.5rem rgba(105, 160, 154, 0.1));
  }

  .ring-copy {
    gap: 0.06rem;
  }

  .ring-title {
    font-size: 0.52rem;
  }

  .ring-copy strong {
    font-size: 1.38rem;
  }

  .ring-copy small {
    font-size: 0.44rem;
  }
}

@media (min-width: 720px) {
  .theme-home-progress-ring {
    width: min(100%, 7rem);
  }
}
</style>
