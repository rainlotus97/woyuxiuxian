<template>
  <div class="battle-hud top">
    <button class="icon-btn" @click="$emit('exit')">×</button>
    <div class="battle-title">
      <span class="eyebrow">{{ areaName || '遭遇战' }}</span>
      <strong>{{ title }}</strong>
    </div>
    <button class="speed-btn" :class="{ active: autoBattle }" @click="$emit('cycle-auto')">
      {{ autoBattle ? `${battleSpeed}x 自动` : '手动' }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  areaName: string | null
  title: string
  autoBattle: boolean
  battleSpeed: 1 | 2 | 3
}>()

defineEmits<{
  exit: []
  'cycle-auto': []
}>()
</script>

<style scoped>
.battle-hud.top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 20px 12px;
  background: linear-gradient(180deg, rgba(244, 251, 246, 0.88), rgba(244, 251, 246, 0));
}

.icon-btn,
.speed-btn {
  border: 1px solid rgba(128, 102, 49, 0.26);
  background: rgba(255, 252, 236, 0.78);
  color: #6c5131;
  min-width: 54px;
  height: 42px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(88, 130, 128, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  font-weight: 700;
}

.speed-btn.active {
  color: #204b46;
  border-color: rgba(58, 156, 139, 0.5);
  background: linear-gradient(135deg, #fff1a8, #9fe5ce);
}

.battle-title {
  text-align: center;
  display: grid;
  gap: 2px;
}

.battle-title .eyebrow {
  color: rgba(71, 93, 91, 0.72);
  font-size: 12px;
}

.battle-title strong {
  color: #95672a;
  font-size: 20px;
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}
</style>
