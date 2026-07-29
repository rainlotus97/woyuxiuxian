<template>
  <div class="cultivation-home">
    <section class="cultivation-core" aria-label="今日修炼">
      <article class="cultivation-panel" :class="`cultivation-panel--${cultivationTone}`">
        <header class="cultivation-panel__header">
          <h2>修炼</h2>
          <span class="cultivation-panel__realm">{{ playerStore.realmInfo.fullName }}</span>
        </header>

        <div class="cultivation-panel__summary">
          <div class="cultivation-panel__current">
            <span class="cultivation-panel__summary-icon" aria-hidden="true">
              <GameIcon icon="cultivation" :size="18" />
            </span>
            <span>
              <small>修为</small>
              <strong>
                {{ playerStore.cultivation }}
                <em>/{{ playerStore.maxCultivation }}</em>
              </strong>
            </span>
          </div>
          <div class="cultivation-panel__summary-item">
            <small>效率</small>
            <strong>{{ cultivationRateLabel }}</strong>
          </div>
          <div class="cultivation-panel__summary-item cultivation-panel__summary-item--breakthrough">
            <small>下一境</small>
            <strong>{{ nextBreakthroughLabel }}</strong>
          </div>
        </div>

        <div class="cultivation-panel__stage">
          <div class="cultivation-panel__figure-field" aria-hidden="true">
            <span class="cultivation-panel__figure-halo"></span>
            <img
              class="cultivation-figure-art"
              :src="cultivationFigureAsset"
              alt=""
            />
          </div>

          <div
            class="cultivation-panel__progress-field"
            role="img"
            :aria-label="`修炼进度 ${cultivationProgressPercent}%`"
          >
            <svg class="cultivation-panel__ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="cultivation-panel__ring-inner" cx="60" cy="60" r="39" />
              <circle class="cultivation-panel__ring-track" cx="60" cy="60" r="48" pathLength="100" />
              <circle
                class="cultivation-panel__ring-progress"
                cx="60"
                cy="60"
                r="48"
                pathLength="100"
                :style="{ strokeDashoffset: 100 - cultivationProgressPercent }"
              />
            </svg>
            <div class="cultivation-panel__progress-copy">
              <strong>{{ cultivationProgressPercent }}<small>%</small></strong>
              <time>{{ worldStore.currentTimeLabel }}</time>
            </div>
          </div>
        </div>

        <div class="cultivation-panel__metrics">
          <div
            v-for="metric in cultivationMetrics"
            :key="metric.label"
            class="cultivation-panel__metric"
            :class="`cultivation-panel__metric--${metric.tone || 'jade'}`"
          >
            <GameIcon :icon="metric.icon || 'spark'" :size="15" />
            <span>
              <small>{{ metric.label }}</small>
              <strong>{{ metric.value }}</strong>
            </span>
          </div>
        </div>
      </article>

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
        <XButton tone="stone" size-tone="sm" block @click="pillDialogOpen = true">
          服药调息
        </XButton>
      </div>
    </section>

    <GameDialog
      :visible="pillDialogOpen"
      title="服药调息"
      @close="pillDialogOpen = false"
    >
      <div class="pill-dialog">
        <div class="pill-grid" aria-label="可服用丹药">
          <button
            v-for="item in pillItems"
            :key="item.id"
            type="button"
            class="pill-slot"
            :disabled="item.quantity <= 0"
            @click="useCultivationPill(item)"
          >
            <ItemArt
              :icon="item.icon"
              :art-key="item.artKey"
              :label="item.name"
              tone="gold"
              size="3.2rem"
              :icon-size="22"
            />
            <span class="pill-slot-copy">
              <strong>{{ item.name }}</strong>
              <small>{{ pillEffectLabel(item) }}</small>
            </span>
            <em>x{{ item.quantity }}</em>
          </button>

          <div v-if="pillItems.length === 0" class="pill-empty">
            背包里暂无可服用丹药
          </div>
        </div>
      </div>

      <template #footer>
        <GameActionButton tone="stone" @click="pillDialogOpen = false">关闭</GameActionButton>
      </template>
    </GameDialog>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { XButton, type XCultivationMetric, type XTone } from '@rainlotus97/ui'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import ItemArt from '@/components/game-ui/ItemArt.vue'
import { useToast } from '@/composables/useToast'
import { useIdleJourneyFeedback } from '@/composables/useIdleJourneyFeedback'
import { usePlayerStore, type InventoryItem } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import cultivationFigureAsset from '@/assets/theme/generated/meditation-figure-line-v2.png'

const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const { success, warning, info } = useToast()
const { recordIdleJourney } = useIdleJourneyFeedback()

const IDLE_INTERVAL = 1000
const offlineGains = ref(0)
const pillDialogOpen = ref(false)
let idleTimer: number | null = null

const pillItems = computed(() => playerStore.inventory.filter(isCultivationPill))

const PILL_EFFECT_LABELS: Record<string, string> = {
  cultivation: '修为调息',
  hp: '恢复气血',
  mp: '恢复灵力',
  buff_atk: '攻击增益',
  buff_def: '防御增益',
  buff_speed: '身法增益',
  breakthrough_success: '突破助力'
}

function isCultivationPill(item: InventoryItem) {
  if (item.type !== 'consumable') return false
  return !(item.effects ?? []).some(effect => effect.type === 'stamina' || effect.type === 'food_cultivation')
}

function pillEffectLabel(item: InventoryItem) {
  const effect = item.effects?.[0]
  return effect ? (PILL_EFFECT_LABELS[effect.type] ?? '丹药效果') : '调息用丹'
}

function useCultivationPill(item: InventoryItem) {
  const result = playerStore.useConsumable(item.id)
  if (result.success) {
    success(result.message ?? `服用了${item.name}`)
  } else {
    info(result.message ?? '当前无法服用')
  }
}

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
  height: 100%;
  padding: 0.08rem 0 0.25rem;
  overflow: hidden;
}

.cultivation-core {
  display: grid;
  gap: 0.52rem;
  min-width: 0;
}

.cultivation-panel {
  display: grid;
  gap: 0.62rem;
  min-width: 0;
  padding: 0.78rem 0.78rem 0.7rem;
  border: 1px solid rgba(104, 160, 146, 0.32);
  border-radius: 1.05rem;
  background:
    linear-gradient(145deg, rgba(249, 254, 248, 0.96), rgba(222, 240, 228, 0.9)),
    radial-gradient(circle at 80% 0%, rgba(255, 248, 214, 0.58), transparent 42%);
  box-shadow: 0 0.45rem 1.3rem rgba(58, 106, 89, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.86);
  color: #315d59;
}

.cultivation-panel__header,
.cultivation-panel__summary,
.cultivation-panel__metrics {
  min-width: 0;
}

.cultivation-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.12rem 0.58rem;
  border-bottom: 1px solid rgba(104, 160, 146, 0.2);
}

.cultivation-panel__header h2 {
  margin: 0;
  color: #315d59;
  font-family: var(--font-game);
  font-size: 1.26rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.cultivation-panel__realm {
  flex: 0 1 auto;
  max-width: 60%;
  overflow: hidden;
  padding: 0.25rem 0.52rem;
  border: 1px solid rgba(188, 141, 58, 0.36);
  border-radius: 999px;
  background: rgba(255, 249, 225, 0.76);
  color: #8b6429;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cultivation-panel__summary {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(4.4rem, 0.75fr) minmax(5.7rem, 1fr);
  gap: 0.42rem;
  align-items: stretch;
}

.cultivation-panel__current,
.cultivation-panel__summary-item {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0.34rem 0.38rem;
  border: 1px solid rgba(104, 160, 146, 0.16);
  border-radius: 0.68rem;
  background: rgba(255, 255, 250, 0.42);
}

.cultivation-panel__current {
  gap: 0.38rem;
}

.cultivation-panel__summary-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.58rem;
  background: rgba(207, 235, 216, 0.76);
  color: #4b8c79;
}

.cultivation-panel__current > span:last-child,
.cultivation-panel__summary-item {
  display: grid;
  gap: 0.08rem;
  align-content: center;
}

.cultivation-panel__summary small {
  color: rgba(68, 100, 93, 0.64);
  font-size: 0.6rem;
  line-height: 1.2;
}

.cultivation-panel__summary strong {
  min-width: 0;
  overflow: hidden;
  color: #426d64;
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cultivation-panel__current strong {
  font-size: 0.78rem;
}

.cultivation-panel__current em {
  color: rgba(68, 100, 93, 0.58);
  font-size: 0.6rem;
  font-style: normal;
  font-weight: 500;
}

.cultivation-panel__summary-item--breakthrough {
  border-color: rgba(188, 141, 58, 0.2);
  background: rgba(255, 250, 230, 0.48);
}

.cultivation-panel__summary-item--breakthrough strong {
  color: #936b29;
}

.cultivation-panel__stage {
  display: grid;
  grid-template-columns: minmax(7.5rem, 0.92fr) minmax(9.8rem, 1.08fr);
  gap: 0.35rem;
  min-width: 0;
  height: clamp(168px, 24vw, 188px);
  min-height: 168px;
  padding: 0.1rem 0.16rem 0;
}

.cultivation-panel__figure-field,
.cultivation-panel__progress-field {
  position: relative;
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.cultivation-panel__figure-field {
  display: grid;
  place-items: end center;
  overflow: hidden;
  border-radius: 0.82rem;
  background:
    linear-gradient(180deg, rgba(239, 248, 235, 0.42), rgba(202, 230, 211, 0.18)),
    radial-gradient(circle at 50% 70%, rgba(255, 247, 208, 0.58), transparent 54%);
}

.cultivation-panel__figure-field::after {
  position: absolute;
  right: 10%;
  bottom: 0.55rem;
  left: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(169, 133, 61, 0.34), transparent);
  content: '';
}

.cultivation-figure-art {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, 9.4rem);
  height: 164px;
  object-fit: contain;
  object-position: center bottom;
  opacity: 0.76;
  filter: brightness(0.7) saturate(1.3) sepia(0.14) contrast(1.12);
  mix-blend-mode: multiply;
}

.cultivation-panel__figure-halo {
  position: absolute;
  right: 12%;
  bottom: 1.15rem;
  left: 12%;
  height: 4.8rem;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(236, 194, 99, 0.3), transparent 68%);
  filter: blur(0.2rem);
}

.cultivation-panel__progress-field {
  display: grid;
  place-items: center;
}

.cultivation-panel__ring {
  width: min(176px, 46vw);
  height: auto;
  overflow: visible;
  transform: rotate(-90deg);
}

.cultivation-panel__ring-inner {
  fill: rgba(248, 252, 245, 0.28);
  stroke: rgba(104, 160, 146, 0.18);
  stroke-width: 1;
}

.cultivation-panel__ring-track,
.cultivation-panel__ring-progress {
  fill: none;
  stroke-width: 4.5;
}

.cultivation-panel__ring-track {
  stroke: rgba(113, 163, 144, 0.2);
}

.cultivation-panel__ring-progress {
  stroke: #4d927d;
  stroke-linecap: round;
  stroke-dasharray: 100;
  filter: drop-shadow(0 0 1px rgba(164, 126, 47, 0.18));
  transition: stroke-dashoffset 0.3s ease;
}

.cultivation-panel--gold .cultivation-panel__ring-progress {
  stroke: #4d927d;
}

.cultivation-panel--rose .cultivation-panel__ring-progress {
  stroke: #ad6575;
}

.cultivation-panel__progress-copy {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(116px, 74%);
  min-height: 66px;
  transform: translate(-50%, -50%);
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.12rem;
  border: 1px solid rgba(104, 160, 146, 0.2);
  border-radius: 0.9rem;
  background: rgba(249, 254, 248, 0.56);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
  pointer-events: none;
}

.cultivation-panel__progress-copy strong {
  color: #3d7066;
  font-size: 1.65rem;
  font-weight: 600;
  line-height: 1;
}

.cultivation-panel--gold .cultivation-panel__progress-copy strong {
  color: #956a26;
}

.cultivation-panel__progress-copy strong small {
  margin-left: 0.08rem;
  font-size: 0.72rem;
  font-weight: 500;
}

.cultivation-panel__progress-copy time {
  padding: 0.2rem 0.42rem;
  border: 1px solid rgba(104, 160, 146, 0.22);
  border-radius: 999px;
  background: rgba(249, 254, 248, 0.78);
  color: rgba(68, 100, 93, 0.72);
  font-size: 0.58rem;
  line-height: 1;
  white-space: nowrap;
}

.cultivation-panel__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(104, 160, 146, 0.2);
}

.cultivation-panel__metric {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  min-height: 2.55rem;
  padding: 0.16rem 0.56rem 0.18rem;
  color: #4b8a79;
}

.cultivation-panel__metric + .cultivation-panel__metric {
  border-left: 1px solid rgba(104, 160, 146, 0.18);
}

.cultivation-panel__metric > :deep(.game-icon) {
  display: grid;
  place-items: center;
  width: 1.48rem;
  height: 1.48rem;
  color: currentColor;
}

.cultivation-panel__metric > span {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
}

.cultivation-panel__metric small,
.cultivation-panel__metric strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cultivation-panel__metric small {
  color: rgba(68, 100, 93, 0.62);
  font-size: 0.58rem;
}

.cultivation-panel__metric strong {
  color: #426d64;
  font-size: 0.7rem;
  font-weight: 600;
}

.cultivation-panel__metric--gold {
  color: #aa7b2c;
}

.cultivation-panel__metric--gold > :deep(.game-icon) {
  color: #aa7b2c;
}

.cultivation-panel__metric--gold strong {
  color: #956a26;
}

.cultivation-panel__metric--stone {
  color: #66858a;
}

.cultivation-panel__metric--stone > :deep(.game-icon) {
  color: #66858a;
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

.pill-dialog {
  display: grid;
  gap: 0.8rem;
  min-width: 0;
}

.pill-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  min-width: 0;
}

.pill-slot {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.35rem;
  min-width: 0;
  min-height: 7.1rem;
  padding: 0.58rem 0.35rem 0.62rem;
  border: 1px solid rgba(190, 145, 57, 0.28);
  border-radius: 0.82rem;
  background: linear-gradient(145deg, rgba(255, 252, 235, 0.86), rgba(241, 247, 230, 0.76));
  color: #44645d;
  font-family: var(--font-game);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.pill-slot:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(190, 145, 57, 0.62);
  background: linear-gradient(145deg, rgba(255, 249, 219, 0.98), rgba(235, 247, 233, 0.9));
}

.pill-slot:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.pill-slot-copy {
  display: grid;
  justify-items: center;
  gap: 0.12rem;
  min-width: 0;
  max-width: 100%;
}

.pill-slot-copy strong,
.pill-slot-copy small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-slot-copy strong {
  color: #536d64;
  font-size: 0.76rem;
}

.pill-slot-copy small {
  color: rgba(84, 113, 109, 0.68);
  font-size: 0.6rem;
}

.pill-slot em {
  position: absolute;
  right: 0.42rem;
  bottom: 0.35rem;
  color: #9a6b27;
  font-size: 0.62rem;
  font-style: normal;
}

.pill-empty {
  grid-column: 1 / -1;
  padding: 1.4rem 0.8rem;
  border: 1px dashed rgba(105, 157, 146, 0.28);
  border-radius: 0.82rem;
  color: rgba(68, 100, 93, 0.68);
  font-size: 0.72rem;
  text-align: center;
}

@media (max-width: 360px) {
  .cultivation-panel {
    padding-inline: 0.62rem;
  }

  .cultivation-panel__summary {
    grid-template-columns: minmax(0, 1.18fr) minmax(4rem, 0.82fr);
  }

  .cultivation-panel__summary-item--breakthrough {
    grid-column: 1 / -1;
  }

  .cultivation-panel__stage {
    grid-template-columns: minmax(6.8rem, 0.8fr) minmax(9.4rem, 1.2fr);
  }

  .cultivation-figure-art {
    width: min(100%, 7.7rem);
  }
}

@media (max-height: 700px) {
  .cultivation-panel {
    gap: 0.46rem;
    padding-block: 0.58rem;
  }

  .cultivation-panel__stage {
    height: 156px;
    min-height: 156px;
  }

  .cultivation-figure-art {
    height: 148px;
  }

  .cultivation-panel__figure-halo {
    bottom: 0.85rem;
  }
}
</style>
