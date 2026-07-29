<template>
  <div class="cultivation-home">
    <section class="cultivation-core" aria-label="今日修炼">
      <XCultivationPanel
        class="cultivation-panel"
        eyebrow="今日修行"
        title="修炼主位"
        :realm="playerStore.realmInfo.fullName"
        :current="playerStore.cultivation"
        :max="playerStore.maxCultivation"
        :progress="cultivationProgressPercent"
        :progress-label="playerStore.realmInfo.fullName"
        :timer="worldStore.currentTimeLabel"
        :efficiency="cultivationRateLabel"
        :next-breakthrough="nextBreakthroughLabel"
        :metrics="cultivationMetrics"
        :tone="cultivationTone"
      />

      <div class="cultivation-actions">
        <XButton
          :tone="playerStore.isIdling ? 'stone' : 'jade'"
          size-tone="sm"
          block
          :disabled="playerStore.captivity.isCaptured"
          @click="handlePrimaryCultivationAction"
        >
          {{ heroPrimaryActionLabel }}
        </XButton>
        <XButton
          tone="gold"
          size-tone="sm"
          block
          :disabled="offlineGains <= 0"
          @click="claimOfflineGains"
        >
          领取离线修为
        </XButton>
        <XButton tone="stone" size-tone="sm" block @click="router.push('/game/inventory')">
          服药调息
        </XButton>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { XButton, XCultivationPanel, type XCultivationMetric, type XTone } from '@rainlotus97/ui'
import { useToast } from '@/composables/useToast'
import { useIdleJourneyFeedback } from '@/composables/useIdleJourneyFeedback'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'

const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const router = useRouter()
const { success, warning, info } = useToast()
const { recordIdleJourney } = useIdleJourneyFeedback()

const IDLE_INTERVAL = 1000
const offlineGains = ref(0)
let idleTimer: number | null = null

function formatCultivationRate(value: number) {
  if (value <= 0) return '0'
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`
  return String(Math.max(1, Math.round(value)))
}

const panelBenefitHint = computed(() => {
  if (playerStore.isMaxRealm && playerStore.realmLevel === 9) return '已满'
  if (playerStore.canBreakthrough) return `成功率 ${formatPercent(playerStore.breakthroughPreview.successRate)}`
  if (playerStore.nextRealm) return `下境 ${playerStore.nextRealm}`
  return `每秒 +${formatCultivationRate(playerStore.cultivationPerSecond)}`
})

const cultivationProgressPercent = computed(() => {
  const max = Math.max(1, playerStore.maxCultivation)
  return Math.min(100, Math.round((playerStore.cultivation / max) * 100))
})

const cultivationRateLabel = computed(() => `${formatCultivationRate(playerStore.cultivationPerSecond)}/秒`)

const nextBreakthroughLabel = computed(() => {
  if (playerStore.isMaxRealm && playerStore.realmLevel === 9) return '已至当前极境'
  if (playerStore.canBreakthrough) return `成功率 ${formatPercent(playerStore.breakthroughPreview.successRate)}`
  return playerStore.nextRealm ?? '暂无下一境界'
})

const cultivationTone = computed<XTone>(() => {
  if (playerStore.captivity.isCaptured) return 'rose'
  if (playerStore.canBreakthrough) return 'gold'
  return 'jade'
})

const cultivationMetrics = computed<XCultivationMetric[]>(() => [
  {
    label: '修炼增益',
    value: panelBenefitHint.value,
    icon: 'spark',
    tone: playerStore.canBreakthrough ? 'gold' : 'jade'
  },
  {
    label: '离线积累',
    value: offlineGains.value > 0 ? `+${offlineGains.value}` : '已结算',
    icon: 'cultivation',
    tone: offlineGains.value > 0 ? 'gold' : 'stone'
  }
])

const heroPrimaryActionLabel = computed(() => (playerStore.isIdling ? '停止修炼' : '开始修炼'))

onMounted(() => {
  worldStore.simulateOffline()

  if (playerStore.idleStartTime) {
    offlineGains.value = playerStore.calculateOfflineGains()
  }

  if (playerStore.isIdling) {
    startIdleLoop()
  }
})

onUnmounted(() => {
  stopIdleLoop()
})

function claimOfflineGains() {
  if (offlineGains.value <= 0) return
  playerStore.addCultivation(offlineGains.value)
  success(`获得 ${offlineGains.value} 修为`)
  offlineGains.value = 0
}

function toggleIdle() {
  if (playerStore.captivity.isCaptured) {
    warning('被俘期间无法继续常规挂机')
    return
  }
  if (playerStore.isIdling) {
    stopIdle()
  } else {
    startIdle()
  }
}

function handlePrimaryCultivationAction() {
  toggleIdle()
}

function startIdle() {
  playerStore.startIdle()
  startIdleLoop()
  const journey = recordIdleJourney('start')
  info(journey.title)
}

function stopIdle() {
  const elapsedSeconds = playerStore.idleStartTime
    ? Math.max(0, Math.floor((Date.now() - playerStore.idleStartTime) / 1000))
    : 0
  playerStore.stopIdle()
  stopIdleLoop()
  const journey = recordIdleJourney('stop', elapsedSeconds)
  info(journey.title)
}

function startIdleLoop() {
  if (idleTimer) return
  idleTimer = window.setInterval(() => {
    if (playerStore.realmLevel === 9 && !playerStore.isMaxRealm && playerStore.cultivation >= playerStore.maxCultivation) {
      return
    }
    playerStore.addCultivation(playerStore.cultivationPerSecond)
  }, IDLE_INTERVAL)
}

function stopIdleLoop() {
  if (idleTimer) {
    clearInterval(idleTimer)
    idleTimer = null
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

</script>

<style scoped>
.cultivation-home {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
  min-height: 0;
  padding: 0.08rem 0 0.25rem;
}

.cultivation-core {
  display: grid;
  gap: 0.52rem;
  min-width: 0;
}

.cultivation-panel {
  min-width: 0;
}

.cultivation-panel :deep(.x-cultivation-panel__body) {
  grid-template-columns: minmax(0, 1fr);
  gap: 0.72rem;
}

.cultivation-panel :deep(.x-cultivation-panel__summary) {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 0.5rem;
  padding-inline: 0.25rem;
}

.cultivation-panel :deep(.x-cultivation-panel__summary-icon) {
  grid-row: span 2;
  margin: 0;
}

.cultivation-panel :deep(.x-cultivation-panel__summary > strong) {
  grid-column: 2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cultivation-panel :deep(.x-cultivation-panel__divider),
.cultivation-panel :deep(.x-cultivation-panel__summary-row) {
  grid-column: 1 / -1;
}

.cultivation-panel :deep(.x-cultivation-panel__ring-wrap) {
  min-height: 13.6rem;
}

.cultivation-panel :deep(.x-cultivation-panel__ring-core) {
  width: min(12rem, calc(100% - 1rem));
}

.cultivation-panel :deep(.x-cultivation-panel__details) {
  grid-template-columns: minmax(0, 1fr);
}

.cultivation-panel :deep(.x-cultivation-panel__figure-slot) {
  background: url('@/assets/theme/generated/meditation-core-clean-v2.png') center / contain no-repeat;
  image-rendering: auto;
}

.cultivation-panel :deep(.x-cultivation-panel__figure) {
  opacity: 0;
}

.cultivation-panel :deep(.x-cultivation-panel__action) {
  display: none;
}

.cultivation-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.48rem;
  width: 100%;
}

.cultivation-actions :deep(.x-button) {
  width: 100%;
  min-width: 0;
}

.cultivation-actions :deep(.x-button:first-child) {
  grid-column: 1 / -1;
}

@media (max-width: 390px) {
  .cultivation-panel :deep(.x-cultivation-panel__ring) {
    width: min(11rem, 56%);
    height: auto;
  }

  .cultivation-panel :deep(.x-cultivation-panel__ring-wrap) {
    min-height: 10rem;
  }

  .cultivation-panel :deep(.x-cultivation-panel__ring-core) {
    width: min(8rem, calc(100% - 1rem));
  }
}

@media (max-width: 360px) {
  .cultivation-panel :deep(.x-cultivation-panel__ring) {
    width: min(9.5rem, 48%);
  }

  .cultivation-panel :deep(.x-cultivation-panel__ring-wrap) {
    min-height: 8.5rem;
  }
}
</style>
