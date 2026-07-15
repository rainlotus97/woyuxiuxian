<template>
  <div class="cultivation-home">
    <section class="quick-actions" aria-label="快捷入口">
      <button type="button" class="quick-action" @click="router.push('/game/settings')">
        <span class="quick-action-icon">
          <Settings :size="17" />
        </span>
        <span>设置</span>
      </button>
      <button type="button" class="quick-action" @click="router.push('/game/inventory')">
        <span class="quick-action-icon">
          <Backpack :size="17" />
        </span>
        <span>背包</span>
      </button>
      <button type="button" class="quick-action" @click="openStoryOverlay">
        <span class="quick-action-icon">
          <Mail :size="17" />
        </span>
        <span>传书</span>
      </button>
    </section>

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

    <section class="entry-grid" aria-label="首页功能分区">
      <GameSurface tone="jade" padding="md" compact clickable @click="router.push('/game/adventure')">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><Compass :size="18" /></span>
            <strong>历练</strong>
          </div>
          <p>游历四方，获取资源</p>
          <small>适合补充基础资源与挂机收益。</small>
        </div>
      </GameSurface>

      <GameSurface tone="gold" padding="md" compact clickable @click="router.push('/game/map')">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><Orbit :size="18" /></span>
            <strong>秘境</strong>
          </div>
          <p>秘境探索，挑战机缘</p>
          <small>{{ mapCardDescription }}</small>
        </div>
      </GameSurface>

      <GameSurface tone="mist" padding="md" compact clickable @click="router.push('/game/sect')">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><Swords :size="18" /></span>
            <strong>斗法</strong>
          </div>
          <p>仙友切磋，争夺排名</p>
          <small>{{ sectCardDescription }}</small>
        </div>
      </GameSurface>

      <GameSurface tone="realm" padding="md" compact clickable @click="router.push('/game/map')">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><Map :size="18" /></span>
            <strong>世界地图</strong>
          </div>
          <p>查看领域推进与区域探索进度</p>
          <small>{{ mapCardDescription }}</small>
        </div>
      </GameSurface>

      <GameSurface tone="jade" padding="md" compact clickable @click="router.push('/game/sect')">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><Landmark :size="18" /></span>
            <strong>宗门</strong>
          </div>
          <p>山门发展、人事与战局调度</p>
          <small>{{ sectCardDescription }}</small>
        </div>
      </GameSurface>

      <GameSurface tone="gold" padding="md" compact clickable @click="openStoryOverlay">
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-icon"><BookOpen :size="18" /></span>
            <strong>修行之路</strong>
          </div>
          <p>顺着当前事件继续推进命线</p>
          <small>{{ storyCardDescription }}</small>
        </div>
      </GameSurface>
    </section>

    <GameSurface
      tone="mist"
      padding="md"
      eyebrow="当前节奏"
      title="世界脉动"
      :subtitle="eventBannerDescription"
    >
      <div class="pulse-panel">
        <p class="pulse-text">{{ latestPulseText }}</p>
        <div class="pulse-actions">
          <button type="button" class="pulse-chip" :disabled="!canAdvanceWorld" @click="handleAdvanceWorld">推演一时辰</button>
          <button type="button" class="pulse-chip" :disabled="playerStore.captivity.isCaptured" @click="handlePlayerFortune">处理机缘</button>
          <button type="button" class="pulse-chip" @click="router.push('/game/profile')">查看角色</button>
        </div>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { XButton, XCultivationPanel, type XCultivationMetric, type XTone } from '@xianxia/ui'
import { Backpack, BookOpen, Compass, Landmark, Mail, Map, Orbit, Settings, Swords } from 'lucide-vue-next'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useToast } from '@/composables/useToast'
import { useStoryOverlay } from '@/composables/useStoryOverlay'
import { useWorldAdvanceSummary } from '@/composables/useWorldAdvanceSummary'
import { usePlayerFortune } from '@/composables/usePlayerFortune'
import { useIdleJourneyFeedback } from '@/composables/useIdleJourneyFeedback'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'

const playerStore = usePlayerStore()
const mapStore = useMapStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const storyStore = useStoryStore()
const router = useRouter()
const { success, warning, info } = useToast()
const { openStoryOverlay: openGlobalStoryOverlay } = useStoryOverlay()
const {
  canAdvance: canAdvanceWorld,
  advanceOneTick
} = useWorldAdvanceSummary()
const { handleFortune } = usePlayerFortune()
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

const latestPulseText = computed(() => {
  if (playerStore.captivity.isCaptured) return '主角被俘，当前主循环应优先处理脱困、赎回或宗门营救。'
  if (worldStore.visibleLogViews[0]) return worldStore.visibleLogViews[0].entry.title
  return '暂无紧急异动，适合安排挂机、历险或推进主线。'
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

const eventBannerDescription = computed(() => {
  const remain = Math.max(0, 6 - worldStore.visibleLogs.length)
  return remain > 0 ? `剩余 ${remain} 个线索入口` : '线索已展开，继续向前可触发回响'
})

const sectCardDescription = computed(() => {
  if (!sectStore.currentSect) return '尚未拜入宗门'
  return `${sectStore.currentSect.name} · ${sectStore.positionName}`
})

const mapCardDescription = computed(() => {
  const total = Math.max(1, mapStore.currentRealmAreas.length)
  const progress = Math.round((mapStore.conqueredCountInCurrentRealm / total) * 100)
  return `探索进度 ${progress}%`
})

const storyCardDescription = computed(() => {
  if (storyStore.currentNodeId) return '继续眼前这件事'
  return '先去撞上第一件事'
})

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

async function openStoryOverlay() {
  const opened = await openGlobalStoryOverlay()
  if (!opened) warning('前头还没撞上事，先去修炼或出去走动。')
}

function handleAdvanceWorld() {
  const summary = advanceOneTick()
  if (summary.totalEvents > 0) {
    success(`世界推进到${summary.timeLabel}，新增 ${summary.totalEvents} 条结果`)
  } else {
    info(`世界推进到${summary.timeLabel}`)
  }
}

function handlePlayerFortune() {
  if (playerStore.captivity.isCaptured) {
    warning('被俘期间无法处理常规机缘')
    return
  }
  const result = handleFortune()
  if (!result.success) {
    warning(result.reason)
    return
  }
  success(`${result.title}：机缘已记录`)
}
</script>

<style scoped>
.cultivation-home {
  display: grid;
  gap: 0.72rem;
  min-width: 0;
  padding: 0.08rem 0 max(1rem, env(safe-area-inset-bottom, 0px));
}

.quick-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.42rem;
}

.quick-action {
  display: grid;
  justify-items: center;
  gap: 0.18rem;
  border: 0;
  background: transparent;
  color: #4f5e5e;
  font-family: var(--font-game);
  font-size: 0.68rem;
}

.quick-action-icon {
  width: 2.3rem;
  height: 2.3rem;
  display: grid;
  place-items: center;
  border-radius: 16px;
  border: 1px solid rgba(121, 165, 155, 0.26);
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(236, 247, 243, 0.86)),
    radial-gradient(circle at top, rgba(255, 220, 146, 0.18), transparent 58%);
  box-shadow: 0 12px 24px rgba(91, 121, 117, 0.1);
  color: #6f9d95;
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

.entry-card small {
  color: rgba(94, 104, 99, 0.68);
  font-size: 0.68rem;
  line-height: 1.45;
}

.entry-card p,
.pulse-text {
  margin: 0;
  color: rgba(82, 94, 89, 0.8);
  font-size: 0.78rem;
  line-height: 1.56;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.entry-card {
  display: grid;
  gap: 0.38rem;
}

.entry-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.entry-icon {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(118, 183, 173, 0.14);
  color: #6f9d95;
}

.entry-head strong {
  color: #4d4138;
  font-size: 0.98rem;
}

.pulse-panel {
  display: grid;
  gap: 0.75rem;
}

.pulse-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.46rem;
}

.pulse-chip {
  min-height: 2.1rem;
  padding: 0 0.84rem;
  border-radius: 999px;
  border: 1px solid rgba(195, 177, 147, 0.52);
  background: rgba(255, 251, 243, 0.86);
  color: #6b6052;
  font-family: var(--font-game);
  font-size: 0.72rem;
}

.pulse-chip:disabled {
  opacity: 0.5;
}

@media (max-width: 390px) {
  .cultivation-actions,
  .entry-grid {
    grid-template-columns: 1fr;
  }

  .cultivation-actions :deep(.x-button:first-child) {
    grid-column: auto;
  }
}
</style>
