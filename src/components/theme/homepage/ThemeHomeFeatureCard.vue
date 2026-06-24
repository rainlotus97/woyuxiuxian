<template>
  <button class="theme-home-feature-card" type="button">
    <div class="card-copy">
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <div class="card-action">
      <slot name="icon">
        <span>→</span>
      </slot>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.theme-home-feature-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1024 / 1536;
  padding: 0.98rem 0.88rem 0.78rem;
  border: 0;
  background:
    center / 100% 100% no-repeat
    url('@/assets/theme/generated/component-masters-homepage-v3-transparent/feature-card-v2.png');
  text-align: left;
  appearance: none;
}

.card-copy {
  position: absolute;
  top: 14.8%;
  left: 12.8%;
  display: grid;
  align-content: start;
  gap: 0.2rem;
  width: 60%;
}

.card-copy strong {
  color: #4a4139;
  font-family: var(--font-game);
  font-size: clamp(0.9rem, 0.8rem + 0.24vw, 1rem);
  line-height: 1.08;
  font-weight: 700;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.88);
}

.card-copy p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(82, 88, 88, 0.82);
  font-size: clamp(0.62rem, 0.56rem + 0.12vw, 0.68rem);
  line-height: 1.26;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-shadow: 0 0.0625rem 0 rgba(255, 251, 244, 0.76);
}

.card-action {
  position: absolute;
  left: 50%;
  bottom: 0.48rem;
  display: grid;
  place-items: center;
  width: 1.76rem;
  height: 1.76rem;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(123, 176, 169, 0.92), rgba(105, 161, 155, 0.92));
  box-shadow:
    inset 0 0 0 0.08rem rgba(255, 248, 235, 0.7),
    0 0.26rem 0.7rem rgba(111, 159, 155, 0.18);
  color: #7ca7a1;
  transform: translateX(-50%);
}

.card-action :deep(svg) {
  width: 0.94rem;
  height: 0.94rem;
  color: #f3fbf9;
}

@media (max-width: 640px) {
  .theme-home-feature-card {
    padding: 0.86rem 0.76rem 0.68rem;
  }

  .card-copy {
    top: 14.6%;
    left: 12.2%;
    width: 62%;
    gap: 0.16rem;
  }

  .card-action {
    bottom: 0.42rem;
    width: 1.56rem;
    height: 1.56rem;
  }

  .card-action :deep(svg) {
    width: 0.76rem;
    height: 0.76rem;
  }
}
</style>
