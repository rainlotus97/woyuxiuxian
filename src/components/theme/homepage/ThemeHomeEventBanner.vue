<template>
  <button class="theme-home-event-banner" type="button">
    <div class="banner-rail">{{ eyebrow }}</div>
    <div class="banner-copy">
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <div class="banner-cta">{{ cta }}</div>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow: string
  title: string
  description: string
  cta?: string
}>(), {
  cta: '前往'
})
</script>

<style scoped>
.theme-home-event-banner {
  position: relative;
  display: grid;
  align-items: center;
  width: 100%;
  aspect-ratio: 1855 / 848;
  padding: 0 1rem 0 0.92rem;
  border: 0;
  background:
    center / 100% 100% no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/event-banner-v2.png');
  text-align: left;
  appearance: none;
}

.banner-rail {
  position: absolute;
  left: 0.96rem;
  top: 0.8rem;
  width: 0.86rem;
  display: grid;
  justify-items: center;
  align-content: start;
  color: rgba(92, 77, 48, 0.88);
  font-family: var(--font-game);
  font-size: 0.34rem;
  line-height: 1.02;
  letter-spacing: 0.08em;
  text-align: center;
  writing-mode: vertical-rl;
}

.banner-copy {
  position: absolute;
  left: 2.42rem;
  top: 46.6%;
  display: grid;
  gap: 0.08rem;
  width: 38%;
  transform: translateY(-50%);
}

.banner-copy strong {
  color: #3f6478;
  font-family: var(--font-game);
  font-size: clamp(0.9rem, 0.84rem + 0.16vw, 0.98rem);
  line-height: 0.98;
  font-weight: 700;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.86);
}

.banner-copy p {
  margin: 0;
  color: rgba(72, 89, 97, 0.84);
  font-size: clamp(0.5rem, 0.46rem + 0.1vw, 0.56rem);
  line-height: 1.06;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.7);
}

.banner-cta {
  position: absolute;
  right: 0.44rem;
  top: 48.8%;
  display: grid;
  place-items: center;
  width: 2.34rem;
  aspect-ratio: 1;
  transform: translateY(-50%);
  color: #5a4630;
  font-family: var(--font-game);
  font-size: 0.58rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .theme-home-event-banner {
    padding: 0 0.7rem 0 0.78rem;
  }

  .banner-rail {
    left: 0.88rem;
    top: 0.7rem;
    width: 0.72rem;
    font-size: 0.28rem;
  }

  .banner-copy {
    left: 2.14rem;
    top: 46.2%;
    gap: 0.06rem;
    width: 37%;
  }

  .banner-cta {
    right: 0.3rem;
    width: 1.88rem;
    font-size: 0.44rem;
  }
}
</style>
