<template>
  <div class="battle-hud top">
    <button class="icon-btn" @click="$emit('exit')">退</button>
    <div class="battle-title">
      <span class="eyebrow">{{ areaName || '遭遇战' }}</span>
      <strong>{{ title }}</strong>
    </div>
    <button class="speed-btn" :class="{ active: autoBattle }" @click="$emit('cycle-auto')">
      {{ autoBattle ? `${battleSpeed}x 自动` : '手动布阵' }}
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
  padding: calc(7px + env(safe-area-inset-top, 0px)) 12px 4px;
  background: linear-gradient(180deg, rgba(247, 252, 248, 0.8), rgba(247, 252, 248, 0));
}

.icon-btn,
.speed-btn {
  border: 1px solid rgba(119, 152, 143, 0.26);
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.9), rgba(239, 249, 240, 0.82)),
    radial-gradient(circle at top, rgba(255, 223, 142, 0.22), transparent 62%);
  color: #486560;
  min-width: 64px;
  height: 34px;
  border-radius: 12px;
  box-shadow: 0 10px 22px rgba(88, 130, 128, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(14px);
  font-weight: 700;
  font-size: 11px;
}

.speed-btn.active {
  color: #204b46;
  border-color: rgba(58, 156, 139, 0.44);
  background: linear-gradient(135deg, rgba(255, 240, 170, 0.94), rgba(159, 229, 206, 0.96));
}

.battle-title {
  text-align: center;
  display: grid;
  gap: 1px;
}

.battle-title .eyebrow {
  color: rgba(71, 93, 91, 0.72);
  font-size: 10px;
}

.battle-title strong {
  color: #95672a;
  font-size: 16px;
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

@media (max-width: 720px) {
  .battle-hud.top {
    padding: calc(3px + env(safe-area-inset-top, 0px)) 8px 1px;
    gap: 8px;
  }

  .icon-btn,
  .speed-btn {
    min-width: 48px;
    height: 28px;
    font-size: 9px;
    border-radius: 10px;
  }

  .battle-title .eyebrow {
    font-size: 8px;
  }

  .battle-title strong {
    font-size: 12px;
  }
}
</style>
