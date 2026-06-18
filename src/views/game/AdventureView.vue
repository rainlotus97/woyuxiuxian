<template>
  <div class="adventure-view">
    <GameSurface
      tone="mist"
      padding="lg"
      eyebrow="历练日程"
      title="界域历险"
      subtitle="按宗门边境与天地气象择地修行。高风险区域机缘与凶险并存。"
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
          <GameStatChip icon="📍" label="开放区域" :value="unlockedAreaCount" tone="jade" />
          <GameStatChip icon="⭐" label="历练星级" :value="clearedAreaCount" tone="gold" />
          <GameStatChip icon="🏷️" label="高压区域" :value="highRiskAreaCount" tone="rose" />
        </div>
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
        <GameActionButton icon="💎" tone="gold" @click="showBuyStaminaModal = true">
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

    <div class="section-header">
      <div>
        <span class="section-eyebrow">历练图册</span>
        <h2>可挑战区域</h2>
      </div>
      <span class="section-note">{{ areas.length }} 个区域</span>
    </div>

    <div class="areas-list">
      <AdventureAreaCard
        v-for="area in areas"
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
            <span>💎</span>
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
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useToast } from '@/composables/useToast'
import { useAdventureSweep } from '@/composables/useAdventureSweep'
import { resolveAreaGameplayAccess, type AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import { resolveAdventureAreaEncounter } from '@/map/runtime/mapAreaEncounterResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
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
const { info, warning, success } = useToast()
const { lastSweepFeedback, applySweep } = useAdventureSweep()

const showBuyStaminaModal = ref(false)

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
    return `当前有 ${highRisk} 处高压区域正在酝酿冲突，适合夺取机缘，也更容易遭遇强敌。`
  }
  return '今日边境相对平稳，适合循序推进历练、扫荡已通关区域并积累修为。'
})

const unlockedAreaCount = computed(() => areas.filter(area => isAreaUnlockedByPlayer(area)).length)
const clearedAreaCount = computed(() => areas.filter(area => getAreaStars(area.id) > 0).length)
const highRiskAreaCount = computed(() => {
  return areas.filter(area => {
    const encounter = getAreaEncounterHint(area)
    return encounter?.riskLevel === 'danger' || encounter?.riskLevel === 'chaos'
  }).length
})

const staminaHint = computed(() => {
  if (playerStore.stamina >= playerStore.maxStamina) return '灵息充盈，可立即远行。'
  return '体力不足时可先扫荡低耗区域，或暂回宗门修整。'
})

const staminaRecoverLabel = computed(() => {
  if (playerStore.stamina >= playerStore.maxStamina) return '体力已满'
  return `${Math.floor(playerStore.nextRecoverCountdown / 60)}:${String(playerStore.nextRecoverCountdown % 60).padStart(2, '0')} 后恢复+1`
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
  gap: 14px;
  padding-bottom: 10px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 14px;
  align-items: start;
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

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
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

.section-note {
  color: rgba(73, 97, 95, 0.72);
  font-size: 12px;
}

.areas-list {
  display: grid;
  gap: 12px;
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
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
