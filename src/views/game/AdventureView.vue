<template>
  <div class="adventure-view">
    <GameSurface
      tone="mist"
      padding="lg"
      eyebrow="历练日程"
      title="界域历险"
      subtitle="先看路上哪件事在逼近，再决定脚往哪边落。"
    >
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="hero-tags">
            <span class="hero-pill">{{ worldStore.currentTimeLabel }}</span>
            <span class="hero-pill">{{ weatherLabel }}</span>
          </div>
          <p>{{ heroSummary }}</p>
        </div>

        <div class="hero-stats">
          <GameStatChip icon="MapPin" label="开放区域" :value="unlockedAreaCount" tone="jade" />
          <GameStatChip icon="Star" label="历练星级" :value="clearedAreaCount" tone="gold" />
          <GameStatChip icon="Crosshair" label="高压区域" :value="highRiskAreaCount" tone="rose" />
        </div>
      </div>

      <div class="story-embedded-surface story-embedded-surface-inline">
        <div class="encounter-throttle-strip">
          <div class="encounter-throttle-copy">
            <span>{{ encounterThrottleSummary }}</span>
            <small>{{ encounterThrottleDetail }}</small>
          </div>
        </div>
        <StoryEventCard
          :data="storyAdventureCard"
          compact
          @primary="openStoryOverlay"
          @secondary="focusRecommendedArea"
        />
      </div>
    </GameSurface>

    <GameSurface
      class="stamina-panel"
      tone="gold"
      padding="md"
      eyebrow="行脚消耗"
      title="体力调息"
      :subtitle="staminaHint"
    >
      <template #header>
        <GameActionButton icon="Diamond" tone="gold" @click="showBuyStaminaModal = true">
          购买体力
        </GameActionButton>
      </template>

      <GameProgressBar
        label="当前体力"
        :current="playerStore.stamina"
        :max="playerStore.maxStamina"
        :hint="staminaRecoverLabel"
        tone="gold"
      />
    </GameSurface>

    <AdventureSweepFeedbackPanel
      v-if="lastSweepFeedback"
      :feedback="lastSweepFeedback"
    />

    <div class="section-header compact-section-header">
      <div class="section-title-stack">
        <span class="section-eyebrow">今日行路</span>
        <h2>先往哪边撞</h2>
      </div>
      <button type="button" class="section-flow-chip" @click="focusRecommendedArea">
        先撞推荐那一处
      </button>
    </div>

    <div class="area-section">
      <div class="area-section-head">
        <strong>优先推荐</strong>
        <span>先撞 {{ featuredAreas.length }} 处</span>
      </div>
      <div class="areas-list featured">
        <AdventureAreaCard
          v-for="area in featuredAreas"
          :key="area.id"
          :area="area"
          :access="getAreaAccess(area)"
          :encounter="getAreaEncounterHint(area)"
          :unlocked="isAreaUnlockedByPlayer(area)"
          :stars="getAreaStars(area.id)"
          :stamina="playerStore.stamina"
          @challenge="handleChallenge"
          @sweep="handleSweep"
        />
      </div>
    </div>

    <div v-if="highRiskAreas.length" class="area-section">
      <div class="area-section-head">
        <strong>风头正紧</strong>
        <span>先盯这 {{ highRiskAreas.length }} 处</span>
      </div>
      <div class="areas-list">
        <AdventureAreaCard
          v-for="area in highRiskAreas"
          :key="area.id"
          :area="area"
          :access="getAreaAccess(area)"
          :encounter="getAreaEncounterHint(area)"
          :unlocked="isAreaUnlockedByPlayer(area)"
          :stars="getAreaStars(area.id)"
          :stamina="playerStore.stamina"
          @challenge="handleChallenge"
          @sweep="handleSweep"
        />
      </div>
    </div>

    <div v-if="clearedAreas.length" class="area-section">
      <div class="area-section-head">
        <strong>已打通，可扫荡</strong>
        <span>顺手拿资源先看 {{ clearedAreas.length }} 处</span>
      </div>
      <div class="areas-list">
        <AdventureAreaCard
          v-for="area in clearedAreas"
          :key="area.id"
          :area="area"
          :access="getAreaAccess(area)"
          :encounter="getAreaEncounterHint(area)"
          :unlocked="isAreaUnlockedByPlayer(area)"
          :stars="getAreaStars(area.id)"
          :stamina="playerStore.stamina"
          @challenge="handleChallenge"
          @sweep="handleSweep"
        />
      </div>
    </div>

    <div class="area-section">
      <div class="area-section-head">
        <strong>{{ showAllAreas ? '其余地界' : '剩下那些路' }}</strong>
        <button type="button" class="section-toggle" @click="showAllAreas = !showAllAreas">
          {{ showAllAreas ? '先收起' : `再看剩余 ${overflowAreas.length} 处` }}
        </button>
      </div>
      <div v-if="showAllAreas" class="areas-list">
        <AdventureAreaCard
          v-for="area in overflowAreas"
          :key="area.id"
          :area="area"
          :access="getAreaAccess(area)"
          :encounter="getAreaEncounterHint(area)"
          :unlocked="isAreaUnlockedByPlayer(area)"
          :stars="getAreaStars(area.id)"
          :stamina="playerStore.stamina"
          @challenge="handleChallenge"
          @sweep="handleSweep"
        />
      </div>
      <p v-else class="section-collapsed-note">
        其余 {{ overflowAreas.length }} 处地界先放着，别让长列表把眼前这桩事盖住。
      </p>
    </div>

    <div class="areas-list legacy-hidden" aria-hidden="true">
      <AdventureAreaCard
        v-for="area in []"
        :key="area.id"
        :area="area"
        :access="getAreaAccess(area)"
        :encounter="getAreaEncounterHint(area)"
        :unlocked="isAreaUnlockedByPlayer(area)"
        :stars="getAreaStars(area.id)"
        :stamina="playerStore.stamina"
        @challenge="handleChallenge"
        @sweep="handleSweep"
      />
    </div>

    <GameDialog
      :visible="showBuyStaminaModal"
      title="购买体力"
      eyebrow="坊市补给"
      @close="showBuyStaminaModal = false"
    >
      <div class="stamina-options">
        <button
          v-for="option in staminaBuyOptions"
          :key="option.amount"
          class="stamina-option"
          :class="{ disabled: playerStore.gold < option.cost || playerStore.stamina >= playerStore.maxStamina }"
          @click="handleBuyStamina(option)"
        >
          <div class="option-amount">
            <span class="option-icon">⚡</span>
            <strong>+{{ option.amount }}</strong>
          </div>
          <div class="option-cost">
            <span><GameIcon icon="Diamond" :size="14" /></span>
            <b>{{ option.cost }}</b>
          </div>
        </button>
      </div>
      <p class="dialog-tip">体力每分钟自动恢复 {{ playerStore.staminaRecoverRate }} 点。</p>
    </GameDialog>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdventureAreaCard from '@/components/adventure/AdventureAreaCard.vue'
import AdventureSweepFeedbackPanel from '@/components/adventure/AdventureSweepFeedbackPanel.vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import StoryEventCard from '@/components/story/StoryEventCard.vue'
import { useRandomEvent } from '@/composables/useRandomEvent'
import { useStoryOverlay } from '@/composables/useStoryOverlay'
import { useToast } from '@/composables/useToast'
import { useAdventureSweep } from '@/composables/useAdventureSweep'
import { resolveAreaGameplayAccess, type AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import { resolveAdventureAreaEncounter } from '@/map/runtime/mapAreaEncounterResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import { resolveStoryEventCard } from '@/story/runtime/storyEventCardResolver'
import {
  AREAS,
  isAreaUnlocked,
  type AreaDefinition
} from '@/types/adventure'

const router = useRouter()
const mapStore = useMapStore()
const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const storyStore = useStoryStore()
const randomEvent = useRandomEvent()
const { info, warning, success } = useToast()
const { lastSweepFeedback, applySweep } = useAdventureSweep()
const { openStoryOverlay: openGlobalStoryOverlay } = useStoryOverlay()

const showBuyStaminaModal = ref(false)
const showAllAreas = ref(false)

const staminaBuyOptions = [
  { amount: 20, cost: 50 },
  { amount: 50, cost: 100 },
  { amount: 100, cost: 180 }
]

let recoverTimer: number | null = null

const areas = AREAS

const weatherLabel = computed(() => {
  const labels = {
    clear: '天朗气清',
    rain: '细雨浸山',
    storm: '雷雨压境',
    flood: '洪水漫野',
    fire: '火势蔓延',
    mist: '雾锁荒林'
  }
  return labels[worldStore.weather]
})

const heroSummary = computed(() => {
  const highRisk = areas.filter(area => {
    const encounter = getAreaEncounterHint(area)
    return encounter?.riskLevel === 'danger' || encounter?.riskLevel === 'chaos'
  }).length
  if (highRisk > 0) {
    return `眼下有 ${highRisk} 处地方风头正紧，想夺机缘，就得冒险。`
  }
  return '今天路上还算平稳，适合慢慢推进，顺手扫荡旧路。'
})

const unlockedAreaCount = computed(() => areas.filter(area => isAreaUnlockedByPlayer(area)).length)
const clearedAreaCount = computed(() => areas.filter(area => getAreaStars(area.id) > 0).length)
const highRiskAreaCount = computed(() => {
  return areas.filter(area => {
    const encounter = getAreaEncounterHint(area)
    return encounter?.riskLevel === 'danger' || encounter?.riskLevel === 'chaos'
  }).length
})

const unlockedAreas = computed(() => areas.filter(area => isAreaUnlockedByPlayer(area)))
const availableAreas = computed(() => unlockedAreas.value.filter(area => getAreaAccess(area).challengeAllowed))
const highRiskAreas = computed(() => {
  return availableAreas.value
    .filter(area => {
      const encounter = getAreaEncounterHint(area)
      return encounter?.riskLevel === 'danger' || encounter?.riskLevel === 'chaos'
    })
    .slice(0, 1)
})
const clearedAreas = computed(() => {
  return unlockedAreas.value
    .filter(area => getAreaStars(area.id) > 0)
    .slice(0, 1)
})
const featuredAreas = computed(() => {
  const picks: AreaDefinition[] = []
  const pushUnique = (list: AreaDefinition[]) => {
    for (const area of list) {
      if (!picks.some(item => item.id === area.id)) picks.push(area)
      if (picks.length >= 2) break
    }
  }

  pushUnique(availableAreas.value)
  pushUnique(unlockedAreas.value)
  pushUnique(areas)
  return picks.slice(0, 2)
})
const overflowAreas = computed(() => {
  const featuredIds = new Set(featuredAreas.value.map(area => area.id))
  const highRiskIds = new Set(highRiskAreas.value.map(area => area.id))
  const clearedIds = new Set(clearedAreas.value.map(area => area.id))
  return areas.filter(area => !featuredIds.has(area.id) && !highRiskIds.has(area.id) && !clearedIds.has(area.id))
})

const staminaHint = computed(() => {
  if (playerStore.stamina >= playerStore.maxStamina) return '灵息充盈，可立即远行。'
  return '体力不够，就先扫低耗地界，或回去歇口气。'
})

const staminaRecoverLabel = computed(() => {
  if (playerStore.stamina >= playerStore.maxStamina) return '体力已满'
  return `${Math.floor(playerStore.nextRecoverCountdown / 60)}:${String(playerStore.nextRecoverCountdown % 60).padStart(2, '0')} 后恢复+1`
})

const storyAdventureCard = computed(() => resolveStoryEventCard({
  currentNodeId: storyStore.currentNodeId,
  currentNodeName: storyStore.currentReadableHeadline,
  currentNodeMap: storyStore.currentReadableMap,
  currentNodeText: storyStore.currentReadableText,
  currentNodeChoiceText: storyStore.currentNode?.content.choices?.[0]?.text ?? '',
  currentPerspective: storyStore.currentPerspective,
  completedCount: storyStore.completedNodes.size,
  unlockedClueCount: storyStore.unlockedClues.size,
  favorabilityCount: storyStore.favorability.size,
  availableSideQuests: storyStore.availableSideQuests,
  notifications: storyStore.notifications,
  mode: 'adventure',
  currentNodeIllustration: storyStore.currentNode?.content.illustration ?? null
}))

const encounterStatus = computed(() => randomEvent.getEncounterStatus())

const encounterThrottleSummary = computed(() => {
  const status = encounterStatus.value
  const base = status.isDailyBlocked
    ? '今日奇遇已满'
    : `今日奇遇 ${status.dailyCount}/${status.dailyLimit}`
  const story = status.isStoryDailyBlocked
    ? '命线相关今日已露过脸'
    : `命线相关 ${status.storyCount}/${status.storyLimit}`
  return `${base} · ${story}`
})

const encounterThrottleDetail = computed(() => {
  const status = encounterStatus.value
  if (status.memoryHighlights.length > 0) {
    return `路上还记着：${status.memoryHighlights.join('、')}`
  }
  if (status.weightedStoryPreview.length > 0) {
    return `路上更可能回头的事：${status.weightedStoryPreview.join('、')}`
  }
  return status.storyGateReason
})

const areaEncounterLookup = computed(() => {
  const entries: Record<string, ReturnType<typeof resolveAdventureAreaEncounter>> = {}
  for (const area of areas) {
    entries[area.id] = resolveAdventureAreaEncounter(
      area.id,
      mapStore.areaStates,
      worldStore.weather,
      worldStore.activeAreaAnomalies
    )
  }
  return entries
})

const areaAccessLookup = computed<Record<string, AreaGameplayAccess>>(() => {
  const entries: Record<string, AreaGameplayAccess> = {}
  for (const area of areas) {
    const encounter = areaEncounterLookup.value[area.id] ?? null
    entries[area.id] = resolveAreaGameplayAccess({
      areaName: area.name,
      mapAreaId: encounter?.mapAreaId ?? null,
      mapAreaSectIds: encounter?.mapArea.sects ?? [],
      controllerSectId: encounter?.controllerSectId ?? null,
      encounter,
      baseStaminaCost: area.staminaCost,
      playerCaptivity: playerStore.captivity,
      sectRuntime: {
        joinedSectId: sectStore.joinedSectId,
        currentSectName: sectStore.currentSect?.name ?? null,
        homeAreaId: sectStore.currentSect?.areaId ?? null,
        worldCondition: sectStore.worldCondition,
        activeWar: sectStore.activeWar
      }
    })
  }
  return entries
})

function createFallbackAreaAccess(area: AreaDefinition): AreaGameplayAccess {
  return {
    entryState: 'open',
    entryLabel: '开放',
    entryReason: '界路暂稳，可正常历练。',
    warnings: [],
    staminaCost: area.staminaCost,
    sweepCost: area.staminaCost * 3,
    challengeAllowed: true,
    mapChallengeAllowed: true,
    adventureChallengeAllowed: true,
    sweepAllowed: true,
    blocker: null
  }
}

function isAreaUnlockedByPlayer(area: AreaDefinition): boolean {
  return isAreaUnlocked(area, playerStore.realm, playerStore.realmLevel)
}

function getAreaStars(areaId: string): number {
  const progress = playerStore.getAreaProgress(areaId)
  return progress?.stars ?? 0
}

function handleChallenge(area: AreaDefinition) {
  const access = getAreaAccess(area)
  if (!access.challengeAllowed) {
    warning(access.entryReason)
    return
  }

  if (playerStore.stamina < access.staminaCost) {
    warning(`体力不足！需要${access.staminaCost}点体力`)
    return
  }

  playerStore.consumeStamina(access.staminaCost)
  router.push({
    path: '/game/battle',
    query: { areaId: area.id }
  })
}

function focusRecommendedArea() {
  const preferred = areas.find(area => isAreaUnlockedByPlayer(area))
  if (!preferred) {
    info('当前还没有可直接前往的历练区域')
    return
  }
  handleChallenge(preferred)
}

async function openStoryOverlay() {
  const opened = await openGlobalStoryOverlay()
  if (!opened) warning('这条线现在还没在路上露头，先去历练、结识人物或推进境界。')
}

function handleSweep(area: AreaDefinition) {
  const access = getAreaAccess(area)
  const encounter = getAreaEncounterHint(area)
  const result = applySweep(area, access, encounter)
  if (!result.success) {
    warning(result.reason)
    return
  }

  success(result.summary)
  if (lastSweepFeedback.value?.dropMessages.length) {
    const dropMessages = lastSweepFeedback.value.dropMessages
    info(`获得物品: ${dropMessages.slice(0, 3).join(', ')}${dropMessages.length > 3 ? '...' : ''}`)
  }
}

function handleBuyStamina(option: { amount: number; cost: number }) {
  const result = playerStore.buyStamina(option.cost, option.amount)
  if (result.success) {
    success(result.message)
    showBuyStaminaModal.value = false
  } else {
    warning(result.message)
  }
}

function getAreaEncounterHint(area: AreaDefinition) {
  return areaEncounterLookup.value[area.id] ?? null
}

function getAreaAccess(area: AreaDefinition) {
  return areaAccessLookup.value[area.id] ?? createFallbackAreaAccess(area)
}

onMounted(() => {
  recoverTimer = window.setInterval(() => {
    playerStore.recoverStamina()
  }, 1000)
})

onUnmounted(() => {
  if (recoverTimer) {
    clearInterval(recoverTimer)
  }
})
</script>

<style scoped>
.adventure-view {
  display: grid;
  gap: 12px;
  padding-bottom: 10px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 14px;
  align-items: start;
}

.story-embedded-surface-inline {
  margin-top: 2px;
  padding: 4px 0 0 8px;
  border-left-width: 2px;
}

.hero-copy {
  display: grid;
  gap: 10px;
}

.hero-copy p {
  margin: 0;
  color: rgba(49, 82, 87, 0.84);
  line-height: 1.7;
  font-size: 13px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(104, 150, 145, 0.2);
  color: rgba(74, 97, 96, 0.78);
  font-size: 11px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stamina-panel {
  margin-top: -2px;
}

.adventure-view :deep(.surface-copy) {
  gap: 4px;
}

.adventure-view :deep(.surface-copy p) {
  display: none;
}

.adventure-view :deep(.surface-copy strong) {
  color: #744b1f;
  font-size: 16px;
}

.story-embedded-surface {
  position: relative;
  display: grid;
  gap: 6px;
  margin-top: 0;
  padding: 8px 10px 8px 12px;
  overflow: hidden;
  border-radius: 22px;
  border-left: 0;
  background:
    linear-gradient(180deg, rgba(241, 251, 247, 0.8), rgba(248, 252, 250, 0.86)),
    radial-gradient(circle at top left, rgba(100, 170, 150, 0.12), transparent 38%);
  box-shadow:
    0 16px 32px rgba(36, 62, 57, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.story-embedded-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(87, 157, 138, 0.08), transparent 18%, transparent 100%);
}

.story-embedded-surface :deep(.story-event-card) {
  gap: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.story-embedded-surface :deep(.story-event-card::before),
.story-embedded-surface :deep(.story-event-card::after) {
  display: none;
}

.story-embedded-surface :deep(.event-topline) {
  padding: 0 0 1px;
  border-bottom-color: rgba(140, 107, 48, 0.03);
}

.story-embedded-surface :deep(.event-head),
.story-embedded-surface :deep(.event-rail),
.story-embedded-surface :deep(.event-foot) {
  padding-left: 0;
}

.story-embedded-surface :deep(.event-copy strong) {
  font-size: 12px;
  line-height: 1.2;
}

.story-embedded-surface :deep(.event-hook p.lead) {
  font-size: 9px;
}

.story-embedded-surface :deep(.event-hook p.muted),
.story-embedded-surface :deep(.rail-copy p) {
  font-size: 8px;
}

.story-embedded-surface :deep(.rail-scene) {
  background: rgba(255, 255, 255, 0.22);
}

.story-embedded-surface :deep(.event-actions) {
  gap: 2px;
}

.encounter-throttle-strip {
  margin-bottom: 2px;
  padding: 0 0 2px;
  border-left: 0;
  border-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  background: transparent;
}

.story-embedded-surface {
  display: grid;
  gap: 6px;
  margin-top: 0;
}

.story-embedded-surface :deep(.story-event-card.compact .event-topline) {
  padding-left: 0;
}

.story-embedded-surface :deep(.story-event-card.compact .event-mark) {
  width: 16px;
  height: 16px;
  font-size: 7px;
}

.story-embedded-surface-inline :deep(.story-event-card.compact .event-copy strong) {
  font-size: 15px;
  line-height: 1.22;
}

.story-embedded-surface-inline :deep(.story-event-card.compact .event-hook p.lead) {
  font-size: 11px;
  line-height: 1.42;
}

.story-embedded-surface-inline :deep(.story-event-card.compact .inline-primary-label) {
  font-size: 11px;
}

.story-embedded-surface-inline :deep(.story-event-card.compact .inline-secondary) {
  font-size: 9px;
}

.encounter-throttle-copy {
  display: grid;
  gap: 0;
  min-width: 0;
}

.encounter-throttle-copy span {
  color: #7b5526;
  font-size: 8px;
  font-weight: 700;
  line-height: 1.2;
}

.encounter-throttle-copy small {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(71, 94, 89, 0.7);
  font-size: 7px;
  line-height: 1.26;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}


.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
}

.compact-section-header {
  align-items: center;
  gap: 10px;
  margin-top: -2px;
}

.section-title-stack {
  display: grid;
  gap: 2px;
}

.section-eyebrow {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.section-header h2 {
  margin: 4px 0 0;
  color: #8e6227;
  font-size: 20px;
}

.section-flow-chip {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  border-radius: 999px;
  background: rgba(245, 251, 248, 0.88);
  color: #4c6e6b;
  font-family: var(--font-game);
  font-size: 10px;
  font-weight: 700;
}

.areas-list {
  display: grid;
  gap: 10px;
}

.areas-list.featured {
  grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
}

.area-section {
  display: grid;
  gap: 8px;
}

.area-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.area-section-head strong {
  color: #36555a;
  font-size: 15px;
}

.area-section-head span {
  color: rgba(73, 97, 95, 0.7);
  font-size: 11px;
}

.section-toggle {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  background: rgba(255, 255, 255, 0.76);
  color: #486a68;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 700;
}

.section-collapsed-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px dashed rgba(104, 150, 145, 0.2);
  color: rgba(58, 82, 84, 0.78);
  font-size: 11px;
  line-height: 1.55;
  background: rgba(247, 252, 249, 0.74);
}

.legacy-hidden {
  display: none;
}

.stamina-options {
  display: grid;
  gap: 10px;
}

.stamina-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  background: rgba(255, 255, 255, 0.72);
  color: #355256;
  font-family: var(--font-game);
  text-align: left;
}

.stamina-option.disabled {
  opacity: 0.45;
}

.option-amount,
.option-cost {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff0b0, #ffcc79);
  color: #8e6227;
}

.dialog-tip {
  margin: 14px 0 0;
  color: rgba(73, 97, 95, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 880px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .adventure-view {
    gap: 10px;
  }

  .encounter-throttle-strip {
    margin-bottom: 1px;
    padding: 0;
  }

  .story-travel-strip {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    padding-left: 6px;
  }

  .travel-action {
    width: fit-content;
  }

  .encounter-throttle-copy span {
    font-size: 9px;
  }

  .encounter-throttle-copy small {
    font-size: 7px;
  }

  .story-embedded-surface :deep(.story-event-card) {
    gap: 0;
  }

  .story-embedded-surface :deep(.event-copy strong) {
    font-size: 11px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: start;
    flex-direction: column;
  }

  .section-flow-chip {
    width: fit-content;
  }

  .area-section-head {
    align-items: start;
    flex-direction: column;
  }

  .story-adventure-actions {
    grid-template-columns: 1fr;
  }
}
</style>
