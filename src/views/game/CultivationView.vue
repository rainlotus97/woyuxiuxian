<template>
  <div class="cultivation-v3-page">
    <div class="home-side-actions">
      <button type="button" class="side-action" @click="router.push('/game/settings')">
        <ThemeHomeIconBadge size="sm" alert>
          <Settings :size="17" />
        </ThemeHomeIconBadge>
        <span>活动</span>
      </button>
      <button type="button" class="side-action" @click="router.push('/game/inventory')">
        <ThemeHomeIconBadge size="sm" alert>
          <Backpack :size="17" />
        </ThemeHomeIconBadge>
        <span>福利</span>
      </button>
      <button type="button" class="side-action" @click="openStoryOverlay">
        <ThemeHomeIconBadge size="sm">
          <Mail :size="17" />
        </ThemeHomeIconBadge>
        <span>传书</span>
      </button>
    </div>

    <ThemeHomePanelShell class="home-main-panel">
      <div class="main-panel-stage">
        <div class="panel-copy">
          <div class="panel-copy-head">
            <strong>修炼</strong>
            <span>!</span>
          </div>
          <div class="panel-stat">
            <span>当前修为</span>
            <strong>{{ playerStore.cultivation }}/{{ playerStore.maxCultivation }}</strong>
          </div>
          <div class="panel-substats">
            <p>修炼效率：{{ cultivationRateLabel }}</p>
            <p>下次突破：{{ playerStore.nextRealm ?? '暂无下一境界' }}</p>
          </div>
        </div>

        <div class="panel-center">
          <ThemeHomeProgressRing
            class="cultivation-ring"
            :progress="cultivationProgressPercent"
            :title="playerStore.realmInfo.fullName"
            :value="`${cultivationProgressPercent}%`"
            :subtitle="worldStore.currentTimeLabel"
          />
          <ThemeHomeButton size="lg" :disabled="playerStore.captivity.isCaptured" @click="handlePrimaryCultivationAction">
            {{ heroPrimaryActionLabel }}
          </ThemeHomeButton>
        </div>

        <div class="panel-side">
          <div class="panel-side-tag">
            <span>修炼增益</span>
            <small>{{ panelBenefitHint }}</small>
          </div>
          <button type="button" class="panel-side-action" @click="router.push('/game/inventory')">
            <ThemeHomeIconBadge size="lg">
              <Pill :size="22" />
            </ThemeHomeIconBadge>
            <span>服药</span>
          </button>
        </div>
      </div>
    </ThemeHomePanelShell>

    <div v-if="offlineGains > 0" class="offline-strip">
      <div class="offline-copy">
        <span>离线积累</span>
        <strong>+{{ offlineGains }} 修为</strong>
      </div>
      <ThemeHomeButton size="sm" @click="claimOfflineGains">立即领取</ThemeHomeButton>
    </div>

    <section class="feature-grid primary-feature-grid">
      <ThemeHomeFeatureCard title="历练" description="游历四方，获取资源" @click="router.push('/game/adventure')">
        <template #icon>
          <Compass :size="16" />
        </template>
      </ThemeHomeFeatureCard>
      <ThemeHomeFeatureCard title="秘境" description="秘境探索，挑战机缘" @click="router.push('/game/map')">
        <template #icon>
          <Orbit :size="16" />
        </template>
      </ThemeHomeFeatureCard>
      <ThemeHomeFeatureCard title="斗法" description="仙友切磋，争夺排名" @click="router.push('/game/sect')">
        <template #icon>
          <Swords :size="16" />
        </template>
      </ThemeHomeFeatureCard>
    </section>

    <ThemeHomeEventBanner
      class="event-banner"
      eyebrow="限时活动"
      title="问鼎仙途"
      :description="eventBannerDescription"
      cta="前往"
      @click="openStoryOverlay"
    />

    <div class="banner-dots" aria-hidden="true">
      <span class="active"></span>
      <span></span>
      <span></span>
    </div>

    <section class="feature-grid secondary-feature-grid">
      <ThemeHomeFeatureCard
        title="宗门"
        :description="sectCardDescription"
        @click="router.push('/game/sect')"
      >
        <template #icon>
          <Landmark :size="16" />
        </template>
      </ThemeHomeFeatureCard>
      <ThemeHomeFeatureCard
        title="世界地图"
        :description="mapCardDescription"
        @click="router.push('/game/map')"
      >
        <template #icon>
          <Map :size="16" />
        </template>
      </ThemeHomeFeatureCard>
      <ThemeHomeFeatureCard
        title="修行之路"
        :description="storyCardDescription"
        @click="openStoryOverlay"
      >
        <template #icon>
          <BookOpen :size="16" />
        </template>
      </ThemeHomeFeatureCard>
    </section>

    <section class="home-pulse-panel" :data-mode="worldStore.getIdleModeLabel(worldStore.idleMode)">
      <div class="pulse-heading">
        <span>当前节奏</span>
        <strong>{{ worldStore.getIdleModeLabel(worldStore.idleMode) }}</strong>
      </div>
      <p>{{ latestPulseText }}</p>
      <div class="pulse-chips">
        <button type="button" class="pulse-chip" :disabled="!canAdvanceWorld" @click="handleAdvanceWorld">推演一时辰</button>
        <button type="button" class="pulse-chip" :disabled="playerStore.captivity.isCaptured" @click="handlePlayerFortune">处理机缘</button>
        <button type="button" class="pulse-chip" @click="router.push('/game/profile')">查看角色</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Backpack, BookOpen, Compass, Landmark, Mail, Map, Orbit, Pill, Settings, Swords } from 'lucide-vue-next'
import ThemeHomeButton from '@/components/theme/homepage/ThemeHomeButton.vue'
import ThemeHomeEventBanner from '@/components/theme/homepage/ThemeHomeEventBanner.vue'
import ThemeHomeFeatureCard from '@/components/theme/homepage/ThemeHomeFeatureCard.vue'
import ThemeHomeIconBadge from '@/components/theme/homepage/ThemeHomeIconBadge.vue'
import ThemeHomePanelShell from '@/components/theme/homepage/ThemeHomePanelShell.vue'
import ThemeHomeProgressRing from '@/components/theme/homepage/ThemeHomeProgressRing.vue'
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
  if (playerStore.canBreakthrough) return `成率 ${formatPercent(playerStore.breakthroughPreview.successRate)}`
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
.cultivation-v3-page {
  display: grid;
  gap: 0.24rem;
  padding: 0.04rem 0 calc(6rem + env(safe-area-inset-bottom, 0px));
  position: relative;
}

.cultivation-v3-page::before {
  content: '';
  position: absolute;
  inset: 3.8rem 0 auto;
  height: 18rem;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(235, 244, 242, 0.42)),
    url('@/assets/theme/generated/homepage-v3-scenic-focus-clean.png') center top / cover no-repeat;
  filter: blur(3px) saturate(0.95);
  opacity: 0.72;
  z-index: 0;
}

.cultivation-v3-page > * {
  position: relative;
  z-index: 1;
}

.home-side-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.12rem;
  padding: 0 0.02rem 0 0;
}

.side-action {
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  border: 0;
  background: transparent;
  color: #4f5e5e;
  font-family: var(--font-game);
  font-size: 0.6rem;
}

.side-action span {
  line-height: 1;
  white-space: nowrap;
}

.home-main-panel {
  margin-top: -0.12rem;
}

.main-panel-stage {
  position: relative;
  height: 100%;
}

.panel-copy,
.panel-center,
.panel-side {
  position: absolute;
  min-width: 0;
}

.panel-copy {
  left: 2.8%;
  top: 8.8%;
  width: 29%;
  display: grid;
  align-content: start;
  gap: 0.15rem;
}

.panel-copy-head {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
}

.panel-copy-head strong {
  color: #4d4138;
  font-family: var(--font-game);
  font-size: 1.24rem;
  line-height: 1;
}

.panel-copy-head span {
  color: #c0ab77;
  font-size: 0.82rem;
}

.panel-stat {
  display: grid;
  gap: 0.18rem;
}

.panel-stat span,
.panel-substats p,
.panel-side-tag span,
.panel-side-tag small {
  color: rgba(89, 87, 76, 0.82);
  font-size: 0.62rem;
  line-height: 1.14;
}

.panel-stat strong {
  color: #45413d;
  font-family: var(--font-game);
  font-size: 0.92rem;
  line-height: 1.04;
}

.panel-substats {
  display: grid;
  gap: 0.18rem;
}

.panel-substats p,
.panel-side-tag small {
  margin: 0;
}

.panel-center {
  left: 28.9%;
  top: 2.2%;
  width: 43.4%;
  height: 84.5%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.08rem;
}

.cultivation-ring {
  width: min(100%, 6.85rem);
  transform: translateY(0.04rem);
}

.panel-center :deep(.theme-home-button.size-lg) {
  --button-height: 3.04rem;
  --button-width: min(100%, 9.8rem);
  --button-content-width: 56%;
}

.panel-side {
  right: 1.6%;
  top: 12%;
  width: 18.4%;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 0.24rem;
}

.panel-side-tag {
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  text-align: center;
}

.panel-side-tag span {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.panel-side-tag small {
  max-width: 2.6rem;
  line-height: 1.1;
}

.panel-side-action {
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  border: 0;
  background: transparent;
  color: #5b4a3f;
  font-family: var(--font-game);
  font-size: 0.58rem;
  transform: translate(0, 0);
}

.panel-side-action span {
  white-space: nowrap;
}

.offline-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.46rem 0.68rem;
  border-radius: 1.1rem;
  background: rgba(255, 251, 242, 0.74);
  border: 1px solid rgba(218, 198, 154, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.offline-copy {
  display: grid;
  gap: 0.1rem;
}

.offline-copy span {
  color: rgba(113, 97, 70, 0.82);
  font-size: 0.8rem;
}

.offline-copy strong {
  color: #4b8c89;
  font-family: var(--font-game);
  font-size: 1rem;
}

.feature-grid {
  display: grid;
  gap: 0.28rem;
}

.primary-feature-grid,
.secondary-feature-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.primary-feature-grid {
  margin-top: -0.06rem;
}

.primary-feature-grid > :nth-child(3),
.secondary-feature-grid > :nth-child(3) {
  grid-column: 1 / -1;
  width: calc(50% - 0.11rem);
  justify-self: center;
}

.event-banner {
  width: 100%;
  margin-top: 0;
}

.banner-dots {
  display: flex;
  justify-content: center;
  gap: 0.28rem;
  margin-top: -0.02rem;
  margin-bottom: 0;
}

.banner-dots span {
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 999px;
  background: rgba(222, 212, 191, 0.9);
}

.banner-dots span.active {
  background: #d5bc89;
}

.home-pulse-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.42rem;
  padding: 0.88rem 0.86rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(219, 203, 179, 0.75);
  background:
    linear-gradient(180deg, rgba(255, 251, 246, 0.86), rgba(247, 248, 244, 0.76)),
    radial-gradient(circle at top left, rgba(170, 220, 210, 0.2), transparent 42%);
  box-shadow:
    0 0.8rem 1.8rem rgba(120, 148, 146, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  margin-top: 0.06rem;
}

.pulse-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

.pulse-heading span {
  color: rgba(98, 94, 85, 0.72);
  font-size: 0.82rem;
}

.pulse-heading strong {
  color: #4e8582;
  font-family: var(--font-game);
  font-size: 1.08rem;
}

.home-pulse-panel p {
  margin: 0;
  color: rgba(88, 95, 97, 0.84);
  font-size: 0.86rem;
  line-height: 1.42;
  grid-column: 1 / -1;
}

.pulse-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

.pulse-chip {
  min-height: 2rem;
  padding: 0 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(186, 172, 144, 0.65);
  background: rgba(255, 255, 255, 0.64);
  color: #5a6a6c;
  font-family: var(--font-game);
  font-size: 0.8rem;
}

@media (max-width: 720px) {
  .cultivation-v3-page {
    gap: 0.28rem;
    padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  }

  .home-side-actions {
    gap: 0.1rem;
  }

  .side-action span {
    font-size: 0.48rem;
  }

  .main-panel-grid {
    display: contents;
  }

  .panel-copy {
    left: 2.2%;
    top: 8.4%;
    width: 29.8%;
    gap: 0.12rem;
  }

  .panel-copy-head strong {
    font-size: 0.92rem;
  }

  .panel-stat strong {
    font-size: 0.78rem;
  }

  .panel-stat span,
  .panel-substats p,
  .panel-side-tag span,
  .panel-side-tag small {
    font-size: 0.52rem;
  }

  .cultivation-ring {
    width: min(100%, 5.08rem);
    transform: translateY(0.02rem);
  }

  .panel-center :deep(.theme-home-button.size-lg) {
    --button-height: 2.76rem;
    --button-width: min(100%, 8.8rem);
    --button-content-width: 55%;
  }

  .panel-center {
    left: 27.6%;
    top: 3%;
    width: 45.8%;
    height: 82%;
  }

  .panel-side {
    right: 0.8%;
    top: 13%;
    width: 19%;
    gap: 0.16rem;
  }

  .panel-side-tag {
    gap: 0.06rem;
  }

  .panel-side-tag span {
    font-size: 0.48rem;
  }

  .panel-side-tag small {
    max-width: 2.2rem;
    font-size: 0.48rem;
  }

  .panel-side-action {
    gap: 0.06rem;
    font-size: 0.46rem;
    transform: translate(0, 0.02rem);
  }

  .primary-feature-grid,
  .secondary-feature-grid {
    gap: 0.18rem 0.18rem;
  }

  .primary-feature-grid > :nth-child(3),
  .secondary-feature-grid > :nth-child(3) {
    width: calc(50% - 0.11rem);
  }

  .home-pulse-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.32rem;
    padding: 0.76rem 0.72rem;
    margin-top: 0.04rem;
  }

  .pulse-heading span {
    font-size: 0.72rem;
  }

  .pulse-heading strong {
    font-size: 0.96rem;
  }

  .home-pulse-panel p {
    font-size: 0.78rem;
    line-height: 1.34;
  }

  .pulse-chips {
    gap: 0.38rem;
  }

  .pulse-chip {
    min-height: 1.84rem;
    padding: 0 0.68rem;
    font-size: 0.72rem;
  }

  .event-banner {
    margin-top: 0;
  }

  .banner-dots {
    margin-top: 0;
    margin-bottom: 0.02rem;
  }
}
</style>
