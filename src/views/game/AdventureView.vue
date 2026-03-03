<template>
  <div class="adventure-view">
    <div class="game-panel">
      <h2 class="panel-title">历险</h2>
      <p class="panel-desc">探索未知，遭遇妖魔</p>

      <div class="map-area">
        <div class="location" v-for="loc in locations" :key="loc.id" @click="handleExplore(loc)">
          <div class="location-icon">{{ loc.icon }}</div>
          <div class="location-name">{{ loc.name }}</div>
          <div class="location-level">Lv.{{ loc.level }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { sfxDiscovery, sfxEncounter } from '@/composables/useAudio'

const { info, warning } = useToast()

const locations = ref([
  { id: 1, name: '迷雾森林', icon: '林', level: 1 },
  { id: 2, name: '幽暗洞穴', icon: '洞', level: 3 },
  { id: 3, name: '荒芜沙漠', icon: '漠', level: 5 },
  { id: 4, name: '冰封雪原', icon: '雪', level: 8 },
  { id: 5, name: '熔岩火山', icon: '火', level: 12 },
  { id: 6, name: '仙界遗迹', icon: '迹', level: 15 }
])

const handleExplore = (location: { id: number; name: string; level: number }) => {
  const random = Math.random()
  if (random > 0.5) {
    sfxEncounter()
    warning(`在${location.name}遭遇了妖魔！`)
  } else {
    sfxDiscovery()
    info(`在${location.name}发现了灵草`)
  }
}
</script>

<style scoped>
.adventure-view {
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 16px 0;
  text-align: center;
}

.map-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.location {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.location:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px rgba(126, 184, 218, 0.2);
}

.location-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.location-name {
  font-size: 0.75rem;
  color: rgb(232 228 217);
  margin-bottom: 2px;
}

.location-level {
  font-size: 0.625rem;
  color: var(--color-muted);
}
</style>
