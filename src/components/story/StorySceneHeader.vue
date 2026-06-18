<template>
  <header class="story-scene-header">
    <button class="back-button" type="button" @click="$emit('back')">返</button>
    <div class="scene-title">
      <span>{{ mapName }}</span>
      <strong>{{ nodeName }}</strong>
    </div>
    <div class="scene-mark">章</div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  back: []
}>()

defineProps<{
  mapName: string
  nodeName: string
}>()
</script>

<style scoped>
.story-scene-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(131, 154, 128, 0.24);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 253, 241, 0.98), rgba(235, 248, 240, 0.92)),
    radial-gradient(circle at 88% 0%, rgba(182, 125, 50, 0.17), transparent 42%);
  box-shadow: 0 18px 42px rgba(74, 107, 97, 0.13);
}

.back-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(144, 109, 54, 0.24);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  color: #7d5525;
  font-family: var(--font-game);
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(105, 121, 93, 0.14);
}

.scene-title {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.scene-title span {
  color: rgba(77, 91, 80, 0.68);
  font-size: 12px;
}

.scene-title strong {
  color: #754f21;
  font-size: clamp(20px, 4vw, 34px);
  line-height: 1.1;
  letter-spacing: 0;
}

.scene-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(147, 101, 38, 0.2);
  background: rgba(255, 255, 255, 0.58);
  color: rgba(130, 82, 23, 0.82);
  font-size: 22px;
  font-weight: 900;
}

@media (max-width: 560px) {
  .story-scene-header {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .scene-mark {
    display: none;
  }
}
</style>
