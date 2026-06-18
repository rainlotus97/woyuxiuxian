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

    <div class="section-header">
      <div>
        <span class="section-eyebrow">历练图册</span>
        <h2>可挑战区域</h2>
      </div>
      <span class="section-note">{{ areas.length }} 个区域</span>
    </div>

    <div class="areas-list">
      <GameSurface
        v-for="area in areas"
        :key="area.id"
        class="area-card"
        :class="{
          locked: !isAreaUnlockedByPlayer(area),
          cleared: getAreaStars(area.id) > 0
        }"
        :tone="getAreaStars(area.id) > 0 ? 'realm' : 'jade'"
        padding="lg"
        clickable
        compact
      >
        <div class="area-header">
          <div class="area-leading">
            <div class="area-icon">{{ area.icon }}</div>
            <div class="area-copy">
              <strong>{{ area.name }}</strong>
              <small :style="{ color: getRealmColor(area.requiredRealm) }">
                {{ getRealmRequirementText(area.requiredRealm, area.requiredRealmLevel) }}
              </small>
            </div>
          </div>
          <span class="difficulty-badge" :style="{ color: getDifficultyColor(area.difficulty) }">
            {{ getDifficultyLabel(area.difficulty) }}
          </span>
        </div>

        <p class="area-desc">{{ area.description }}</p>

        <div v-if="getAreaEncounterHint(area)" class="area-world-state">
          <span
            class="risk-badge"
            :style="{ color: getAreaEncounterHint(area)?.riskColor, borderColor: `${getAreaEncounterHint(area)?.riskColor}55` }"
          >
            {{ getAreaEncounterHint(area)?.statusText }}
          </span>
          <p>{{ getAreaEncounterHint(area)?.encounterNote }}</p>
        </div>

        <div class="area-access-row" :class="`state-${getAreaAccess(area).entryState}`">
          <span class="access-badge">{{ getAreaAccess(area).entryLabel }}</span>
          <p>{{ getAreaAccess(area).entryReason }}</p>
        </div>
        <small v-if="getAreaAccess(area).warnings[0]" class="access-warning">
          {{ getAreaAccess(area).warnings[0] }}
        </small>

        <div class="area-meta-grid">
          <div class="drop-strip">
            <span class="meta-label">掉落</span>
            <div class="drops-items">
              <span
                v-for="drop in area.drops.slice(0, 4)"
                :key="drop.id"
                class="drop-preview"
                :class="drop.quality"
                :title="drop.name"
              >
                {{ drop.icon }}
              </span>
              <span v-if="area.drops.length > 4" class="more-drops">+{{ area.drops.length - 4 }}</span>
            </div>
          </div>

          <div class="meta-chips">
            <GameStatChip icon="⚡" label="体力" :value="getAreaAccess(area).staminaCost" tone="gold" />
            <GameStatChip icon="🌊" label="波次" :value="`${getDifficultyWaves(area.difficulty)}波`" tone="jade" />
          </div>
        </div>

        <div v-if="getAreaStars(area.id) > 0" class="area-stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= getAreaStars(area.id) }">★</span>
        </div>

        <template #footer>
          <div class="area-actions">
            <GameActionButton
              v-if="!isAreaUnlockedByPlayer(area)"
              icon="🔒"
              tone="stone"
              block
              disabled
            >
              境界不足
            </GameActionButton>

            <GameActionButton
              v-else-if="!getAreaAccess(area).challengeAllowed"
              icon="⛔"
              tone="stone"
              block
              disabled
            >
              {{ getAreaAccess(area).entryLabel }}
            </GameActionButton>

            <template v-else-if="getAreaStars(area.id) === 0">
              <GameActionButton
                icon="⚔️"
                tone="jade"
                block
                :disabled="playerStore.stamina < getAreaAccess(area).staminaCost"
                @click="handleChallenge(area)"
              >
                挑战
              </GameActionButton>
            </template>

            <template v-else>
              <GameActionButton
                icon="⚔️"
                tone="jade"
                block
                :disabled="playerStore.stamina < getAreaAccess(area).staminaCost"
                @click="handleChallenge(area)"
              >
                挑战
              </GameActionButton>
              <GameActionButton
                icon="🔄"
                tone="gold"
                block
                :disabled="playerStore.stamina < getAreaAccess(area).sweepCost || !getAreaAccess(area).sweepAllowed"
                @click="handleSweep(area)"
              >
                扫荡x3
              </GameActionButton>
            </template>
          </div>
        </template>
      </GameSurface>
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
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useToast } from '@/composables/useToast'
import { resolveAreaGameplayAccess, type AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import { resolveAdventureAreaEncounter } from '@/map/runtime/mapAreaEncounterResolver'
import { resolveEncounterDrops } from '@/map/runtime/mapEncounterComposition'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import {
  AREAS,
  DIFFICULTY_CONFIG,
  REALM_PRIMARY_COLOR,
  getRealmRequirementText,
  isAreaUnlocked,
  rollReward,
  type AreaDefinition,
  type DropItem,
  type Realm
} from '@/types/adventure'

const router = useRouter()
const mapStore = useMapStore()
const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const { info, warning, success } = useToast()

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

function getRealmColor(realm: Realm): string {
  return REALM_PRIMARY_COLOR[realm] || '#7eb8da'
}

function getDifficultyColor(difficulty: string): string {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color || '#7eb8da'
}

function getDifficultyLabel(difficulty: string): string {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.label || difficulty
}

function getDifficultyWaves(difficulty: string): number {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.waves || 1
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
  if (!access.sweepAllowed) {
    warning(access.entryReason)
    return
  }

  const sweepCost = access.sweepCost
  if (playerStore.stamina < sweepCost) {
    warning(`体力不足！需要${sweepCost}点体力`)
    return
  }

  playerStore.consumeStamina(sweepCost)

  let totalExp = 0
  let totalGold = 0
  const allDrops: Map<string, { item: DropItem; quantity: number }> = new Map()
  const encounter = getAreaEncounterHint(area)
  const rewardMultiplier = encounter?.rewardMultiplier ?? 1

  for (let index = 0; index < 3; index++) {
    totalExp += Math.max(1, Math.floor(rollReward(area.expReward) * rewardMultiplier))
    totalGold += Math.max(1, Math.floor(rollReward(area.goldReward) * rewardMultiplier))

    const drops = resolveEncounterDrops(area.drops, encounter)
    for (const drop of drops) {
      const existing = allDrops.get(drop.item.id)
      if (existing) {
        existing.quantity += drop.quantity
      } else {
        allDrops.set(drop.item.id, { item: drop.item, quantity: drop.quantity })
      }
    }
  }

  playerStore.addCultivation(totalExp)
  playerStore.addGold(totalGold)

  const dropMessages: string[] = []
  for (const [, drop] of allDrops) {
    const added = playerStore.addToInventory({
      id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: drop.item.name,
      icon: drop.item.icon,
      type: drop.item.type === 'equipment' ? 'equipment' : 'material',
      quality: drop.item.quality,
      quantity: drop.quantity,
      description: drop.item.description
    })
    if (added) {
      dropMessages.push(`${drop.item.icon}${drop.item.name} x${drop.quantity}`)
    }
  }

  const progress = playerStore.getAreaProgress(area.id)
  if (progress) {
    playerStore.updateAreaProgress(area.id, {
      clearCount: progress.clearCount + 3,
      stars: Math.max(progress.stars, 1)
    })
  }

  success(`扫荡完成！获得 ${totalExp} 修为, ${totalGold} 灵石`)
  if (dropMessages.length > 0) {
    info(`获得物品: ${dropMessages.slice(0, 3).join(', ')}${dropMessages.length > 3 ? '...' : ''}`)
  }

  for (let index = 0; index < 3; index++) {
    sectStore.updateTaskProgress('battle', 'monster')
    sectStore.updateTaskProgress('explore', area.id)
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

.area-card.locked {
  opacity: 0.74;
}

.area-card.cleared {
  border-color: rgba(98, 177, 132, 0.28);
}

.area-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.area-leading {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.area-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 24px;
}

.area-copy {
  display: grid;
  gap: 4px;
}

.area-copy strong {
  color: #315257;
  font-size: 16px;
}

.area-copy small {
  font-size: 11px;
}

.difficulty-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(105, 149, 143, 0.16);
  font-size: 11px;
  white-space: nowrap;
}

.area-desc {
  margin: 12px 0 0;
  color: rgba(49, 82, 87, 0.8);
  font-size: 12px;
  line-height: 1.65;
}

.area-world-state {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 4px 9px;
  border: 1px solid rgba(126, 184, 218, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-weight: 700;
}

.area-world-state p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 11px;
  line-height: 1.55;
}

.area-access-row {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background: rgba(255, 255, 255, 0.62);
}

.area-access-row p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.access-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  color: #4c7a78;
  background: rgba(239, 250, 247, 0.78);
  font-size: 11px;
}

.area-access-row.state-risky .access-badge {
  color: #9b6a1c;
  border-color: rgba(214, 153, 58, 0.24);
  background: rgba(255, 248, 232, 0.92);
}

.area-access-row.state-blocked .access-badge {
  color: #9b4a55;
  border-color: rgba(190, 103, 122, 0.24);
  background: rgba(255, 242, 245, 0.92);
}

.access-warning {
  display: block;
  margin-top: 8px;
  color: rgba(73, 97, 95, 0.64);
  font-size: 11px;
  line-height: 1.55;
}

.area-meta-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
}

.drop-strip {
  display: grid;
  gap: 8px;
}

.meta-label {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.drops-items {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.drop-preview {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  font-size: 13px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.74);
}

.drop-preview.common { border: 1px solid #9ca3af; }
.drop-preview.fine { border: 1px solid #4ade80; }
.drop-preview.rare { border: 1px solid #7eb8da; }
.drop-preview.epic { border: 1px solid #a78bfa; }
.drop-preview.legendary { border: 1px solid #fbbf24; }

.more-drops {
  display: inline-flex;
  align-items: center;
  color: rgba(73, 97, 95, 0.72);
  font-size: 10px;
}

.meta-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.area-stars {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}

.star {
  font-size: 14px;
  color: rgba(251, 191, 36, 0.26);
}

.star.filled {
  color: #f0b84d;
}

.area-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
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

  .area-meta-grid {
    grid-template-columns: 1fr;
  }

  .meta-chips {
    justify-content: flex-start;
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

  .area-header {
    flex-direction: column;
  }

  .area-actions {
    grid-template-columns: 1fr;
  }
}
</style>
