<template>
  <div class="cultivation-home">
    <section class="quick-actions" aria-label="快捷入口">
      <button type="button" class="quick-action" @click="router.push('/game/settings')">
        <span class="quick-action-icon">
          <Settings :size="17" />
        </span>
        <span>活动</span>
      </button>
      <button type="button" class="quick-action" @click="router.push('/game/inventory')">
        <span class="quick-action-icon">
          <Backpack :size="17" />
        </span>
        <span>福利</span>
      </button>
      <button type="button" class="quick-action" @click="openStoryOverlay">
        <span class="quick-action-icon">
          <Mail :size="17" />
        </span>
        <span>传书</span>
      </button>
    </section>

    <GameSurface
      tone="gold"
      padding="lg"
      eyebrow="修炼主位"
      title="今日修行"
      :subtitle="`当前节奏：${worldStore.getIdleModeLabel(worldStore.idleMode)}`"
      class="cultivation-hero"
    >
      <div class="hero-grid">
        <div class="hero-main">
          <div class="progress-orb" :style="{ '--progress-angle': `${cultivationProgressPercent * 3.6}deg` }">
            <div class="progress-orb-inner">
              <span>{{ playerStore.realmInfo.fullName }}</span>
              <strong>{{ cultivationProgressPercent }}%</strong>
              <small>{{ worldStore.currentTimeLabel }}</small>
            </div>
          </div>

          <div class="hero-main-copy">
            <div class="hero-value-row">
              <div>
                <span>当前修为</span>
                <strong>{{ playerStore.cultivation }}/{{ playerStore.maxCultivation }}</strong>
              </div>
              <div>
                <span>修炼效率</span>
                <strong>{{ cultivationRateLabel }}</strong>
              </div>
            </div>
            <div class="hero-note-list">
              <p>下次突破：{{ playerStore.nextRealm ?? '暂无下一境界' }}</p>
              <p>修炼增益：{{ panelBenefitHint }}</p>
            </div>
          </div>
        </div>

        <div class="hero-side">
          <div class="hero-side-card">
            <span>离线积累</span>
            <strong>{{ offlineGains > 0 ? `+${offlineGains}` : '暂无' }}</strong>
            <small>{{ offlineGains > 0 ? '可立即领取修为' : '离线收益已结算' }}</small>
          </div>
          <div class="hero-side-card">
            <span>辅助修行</span>
            <strong>丹药 / 机缘</strong>
            <small>服药、机缘和推演都在这里调度</small>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="hero-footer">
          <GameActionButton
            tone="jade"
            block
            :disabled="playerStore.captivity.isCaptured"
            @click="handlePrimaryCultivationAction"
          >
            {{ heroPrimaryActionLabel }}
          </GameActionButton>
          <GameActionButton
            tone="gold"
            block
            :disabled="offlineGains <= 0"
            @click="claimOfflineGains"
          >
            领取离线修为
          </GameActionButton>
          <GameActionButton tone="stone" block @click="router.push('/game/inventory')">
            服药调息
          </GameActionButton>
        </div>
      </template>
    </GameSurface>

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
import { Backpack, BookOpen, Compass, Landmark, Mail, Map, Orbit, Settings, Swords } from 'lucide-vue-next'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
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
.cultivation-home {
  display: grid;
  gap: 0.72rem;
  padding: 0.08rem 0 calc(6rem + env(safe-area-inset-bottom, 0px));
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

.cultivation-hero {
  overflow: hidden;
}

.hero-grid {
  display: grid;
  gap: 1rem;
}

.hero-main {
  display: grid;
  grid-template-columns: 7.4rem minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
}

.progress-orb {
  position: relative;
  width: 7.4rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    conic-gradient(from 180deg, #78b8b0 0deg, #78b8b0 var(--progress-angle), rgba(120, 184, 176, 0.14) 0deg),
    radial-gradient(circle at center, rgba(255, 253, 244, 0.98) 0 58%, transparent 59%),
    linear-gradient(180deg, rgba(241, 250, 246, 0.96), rgba(255, 251, 238, 0.92));
  box-shadow:
    inset 0 0 0 1px rgba(121, 165, 155, 0.22),
    0 18px 34px rgba(88, 123, 116, 0.14);
}

.progress-orb::before {
  content: '';
  position: absolute;
  inset: 0.42rem;
  border-radius: 999px;
  border: 1px solid rgba(218, 185, 115, 0.34);
}

.progress-orb-inner {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.18rem;
  text-align: center;
}

.progress-orb-inner span,
.hero-value-row span,
.hero-side-card span {
  color: rgba(94, 104, 99, 0.74);
  font-size: 0.72rem;
}

.progress-orb-inner strong {
  color: #4d4138;
  font-family: var(--font-game);
  font-size: 1.78rem;
  line-height: 1;
}

.progress-orb-inner small,
.hero-side-card small,
.entry-card small {
  color: rgba(94, 104, 99, 0.68);
  font-size: 0.68rem;
  line-height: 1.45;
}

.hero-main-copy {
  display: grid;
  gap: 0.8rem;
}

.hero-value-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.hero-value-row strong,
.hero-side-card strong {
  display: block;
  margin-top: 0.14rem;
  color: #325154;
  font-size: 1rem;
}

.hero-note-list {
  display: grid;
  gap: 0.34rem;
}

.hero-note-list p,
.entry-card p,
.pulse-text {
  margin: 0;
  color: rgba(82, 94, 89, 0.8);
  font-size: 0.78rem;
  line-height: 1.56;
}

.hero-side {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.hero-side-card {
  padding: 0.82rem 0.88rem;
  border-radius: 16px;
  border: 1px solid rgba(121, 165, 155, 0.16);
  background: rgba(255, 255, 252, 0.68);
}

.hero-footer {
  display: grid;
  gap: 0.55rem;
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
  .hero-main {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .hero-main-copy,
  .hero-side {
    width: 100%;
  }

  .hero-value-row,
  .hero-side,
  .entry-grid {
    grid-template-columns: 1fr;
  }
}
</style>
