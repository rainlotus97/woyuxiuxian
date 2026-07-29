<template>
  <GameSurface
    class="weather-panel"
    :class="`weather-${weather}`"
    :tone="profile.tone"
    padding="md"
    eyebrow="当前天象"
    :title="profile.label"
    :subtitle="profile.detail"
  >
    <template #header>
      <div class="weather-mark" :aria-label="profile.label">
        <GameIcon :icon="profile.icon" :size="22" />
      </div>
    </template>

    <div class="weather-impact-grid">
      <div>
        <span>已生效</span>
        <strong>{{ profile.effect }}</strong>
      </div>
      <div>
        <span>行动提示</span>
        <strong>{{ profile.advice }}</strong>
      </div>
    </div>

    <p v-if="latestNotice" class="weather-notice">
      <GameIcon icon="scroll" :size="13" />
      {{ latestNotice.message }}
    </p>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { getWorldWeatherProfile } from '@/world/runtime/weatherCatalog'
import type { WorldWeather } from '@/types/world'
import type { WorldNotification } from '@/types/worldEvent'

const props = defineProps<{
  weather: WorldWeather
  latestNotice?: WorldNotification | null
}>()

const profile = computed(() => getWorldWeatherProfile(props.weather))
</script>

<style scoped>
.weather-panel {
  min-width: 0;
}

.weather-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(184, 144, 65, 0.24);
  border-radius: 14px;
  background: rgba(255, 250, 225, 0.68);
  color: #9a6b25;
}

.weather-impact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.weather-impact-grid > div {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(99, 143, 130, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.42);
}

.weather-impact-grid span {
  color: rgba(62, 99, 93, 0.62);
  font-size: 10px;
}

.weather-impact-grid strong {
  color: #315b57;
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.weather-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 10px 0 0;
  color: rgba(62, 91, 86, 0.74);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 360px) {
  .weather-impact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
