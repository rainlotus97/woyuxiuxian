<template>
  <div class="map-view">
    <GameSurface
      tone="mist"
      padding="lg"
      eyebrow="天下舆图"
      :title="mapStore.currentRealm"
      :subtitle="mapStore.currentRealmConfig.description"
    >
      <div class="realm-hero">
        <div class="date-stack">
          <span class="date-pill">📅 {{ worldDateLabel }}</span>
          <span class="season-pill">{{ getSeasonIcon(worldSeason) }} {{ seasonEffectLabel }}</span>
        </div>

        <div class="hero-stats">
          <GameStatChip icon="🏔️" label="已征服" :value="`${mapStore.conqueredCountInCurrentRealm}/${mapStore.currentRealmAreas.length}`" tone="gold" />
          <GameStatChip icon="🧭" label="当前界域" :value="mapStore.currentRealm" tone="jade" />
          <GameStatChip icon="📜" label="世界异闻" :value="worldStore.visibleLogs.length" tone="rose" />
        </div>
      </div>
    </GameSurface>

    <WorldBriefingPanel :items="worldBriefings" @action="handleWorldBriefingAction" />

    <div class="top-grid">
      <GameSurface
        tone="gold"
        padding="md"
        eyebrow="界门切换"
        title="四界巡览"
        subtitle="不同界域承载不同宗门、资源与风险。"
      >
        <div class="realm-tabs">
          <button
            v-for="realm in WORLD_REALMS"
            :key="realm"
            class="realm-tab"
            :class="{ active: mapStore.currentRealm === realm, locked: !mapStore.realmUnlockStatus[realm] }"
            @click="handleRealmSelect(realm)"
          >
            <span class="realm-icon">{{ WORLD_REALM_CONFIGS[realm].icon }}</span>
            <span class="realm-name">{{ realm }}</span>
          </button>
        </div>
      </GameSurface>

      <GameSurface
        tone="realm"
        padding="md"
        eyebrow="天地风闻"
        title="近期世界事件"
        subtitle="世界不会停下。宗门、天气与 NPC 都在推动局势。"
      >
        <div class="world-log-list">
          <div v-for="log in recentWorldLogs" :key="log.entry.id" class="world-log-item">
            <strong>{{ log.entry.title }}<small v-if="log.entry.repeatCount > 1">x{{ log.entry.repeatCount }}</small></strong>
            <p>{{ log.entry.text }}</p>
            <div class="world-log-context">
              <span v-for="badge in log.badges" :key="`${badge.tone}-${badge.label}`" :class="`context-${badge.tone}`">
                {{ badge.label }}
              </span>
            </div>
            <small>{{ log.entry.timeLabel }}</small>
          </div>
        </div>
      </GameSurface>
    </div>

    <GameSurface
      v-if="areaAnomalies.length > 0"
      tone="gold"
      padding="md"
      eyebrow="区域异动"
      title="灾害与机缘"
      subtitle="地图上的压力、遗迹与灵脉异动会持续反馈到世界循环。"
    >
      <div class="anomaly-strip">
        <div v-for="anomaly in areaAnomalies" :key="anomaly.id" class="anomaly-item" :class="`severity-${anomaly.severity}`">
          <div class="anomaly-head">
            <strong>{{ getAnomalyIcon(anomaly.type) }} {{ anomaly.title }}</strong>
            <span>{{ anomaly.timeLabel }}</span>
          </div>
          <p>{{ anomaly.text }}</p>
          <small>{{ anomaly.riskHint }}</small>
        </div>
      </div>
    </GameSurface>

    <div class="section-header">
      <div>
        <span class="section-eyebrow">区域图册</span>
        <h2>{{ mapStore.currentRealm }}地势</h2>
      </div>
      <span class="section-note">{{ mapStore.currentRealmAreas.length }} 个区域</span>
    </div>

    <div class="areas-grid">
      <GameSurface
        v-for="area in mapStore.currentRealmAreas"
        :key="area.id"
        class="area-card"
        :class="{
          locked: !isAreaUnlocked(area),
          conquered: mapStore.isAreaConquered(area.id)
        }"
        :tone="mapStore.isAreaConquered(area.id) ? 'realm' : 'jade'"
        padding="lg"
        clickable
        compact
        @click="handleAreaClick(area)"
      >
        <div class="area-header">
          <div class="area-icon">{{ area.icon }}</div>
          <div class="area-copy">
            <strong>{{ area.name }}</strong>
            <small>{{ area.requiredRealm }}{{ area.requiredRealmLevel }}层</small>
          </div>
        </div>

        <div class="area-status-row">
          <span v-if="mapStore.isAreaConquered(area.id)" class="status conquered">✓ 已征服</span>
          <span v-else-if="isAreaUnlocked(area)" class="status available">可挑战</span>
          <span v-else class="status locked">🔒 未解锁</span>

          <span v-if="area.sects.length > 0" class="sect-count">宗门 {{ area.sects.length }}</span>
        </div>

        <div v-if="getAreaEncounter(area.id)" class="area-risk-panel">
          <span
            class="risk-badge"
            :style="{ color: getAreaEncounter(area.id)?.riskColor, borderColor: `${getAreaEncounter(area.id)?.riskColor}55` }"
          >
            {{ getAreaEncounter(area.id)?.statusText }}
          </span>
          <p>{{ getAreaEncounter(area.id)?.encounterNote }}</p>
          <small v-if="getAreaEncounter(area.id)?.anomalyRiskHint">
            {{ getAreaEncounter(area.id)?.anomalyRiskHint }}
          </small>
        </div>

        <div class="area-access-row" :class="`state-${getAreaAccess(area.id).entryState}`">
          <span class="access-badge">{{ getAreaAccess(area.id).entryLabel }}</span>
          <p>{{ getAreaAccess(area.id).entryReason }}</p>
          <small v-if="getAreaAccess(area.id).warnings[0]">{{ getAreaAccess(area.id).warnings[0] }}</small>
        </div>

        <div class="area-access-meta">
          <span class="access-pill">⚡ {{ getAreaAccess(area.id).staminaCost }}</span>
          <span class="access-pill">{{ getAreaAccess(area.id).entryLabel }}</span>
        </div>

        <div class="resource-tags">
          <span v-for="resource in area.resources.slice(0, 3)" :key="resource" class="resource-tag">{{ resource }}</span>
        </div>
      </GameSurface>
    </div>

    <GameDialog
      :visible="Boolean(selectedArea)"
      :title="selectedArea?.name || ''"
      eyebrow="区域详览"
      @close="selectedArea = null"
    >
      <template v-if="selectedArea">
        <div class="detail-head">
          <div class="detail-icon">{{ selectedArea.icon }}</div>
          <p class="detail-desc">{{ selectedArea.description }}</p>
        </div>

        <div class="detail-grid">
          <GameSurface tone="mist" padding="md" compact>
            <div class="detail-section">
              <span class="detail-label">境界要求</span>
              <strong>{{ selectedArea.requiredRealm }}{{ selectedArea.requiredRealmLevel }}层</strong>
            </div>
          </GameSurface>

          <GameSurface tone="mist" padding="md" compact>
            <div class="detail-section">
              <span class="detail-label">区域状态</span>
              <strong>{{ mapStore.isAreaConquered(selectedArea.id) ? '已征服' : isAreaUnlocked(selectedArea) ? '可挑战' : '未解锁' }}</strong>
              <small v-if="getAreaEncounter(selectedArea.id)">{{ getAreaEncounter(selectedArea.id)?.statusText }}</small>
            </div>
          </GameSurface>

          <GameSurface tone="mist" padding="md" compact>
            <div class="detail-section">
              <span class="detail-label">行动消耗</span>
              <strong>⚡ {{ getAreaAccess(selectedArea.id).staminaCost }}</strong>
              <small>{{ getAreaAccess(selectedArea.id).entryReason }}</small>
            </div>
          </GameSurface>
        </div>

        <GameSurface v-if="getAreaEncounter(selectedArea.id)" tone="gold" padding="md" compact>
          <div class="detail-section">
            <span class="detail-label">当前态势</span>
            <strong>{{ getAreaEncounter(selectedArea.id)?.encounterNote }}</strong>
            <small v-if="getAreaEncounter(selectedArea.id)?.anomalyTitle">
              {{ getAreaEncounter(selectedArea.id)?.anomalyTitle }} · {{ getAreaEncounter(selectedArea.id)?.anomalyRiskHint }}
            </small>
          </div>
        </GameSurface>

        <GameSurface v-if="selectedArea.sects.length > 0" tone="gold" padding="md" compact>
          <div class="detail-section">
            <span class="detail-label">宗门势力</span>
            <div class="sects-list">
              <span v-for="sectId in selectedArea.sects" :key="sectId" class="sect-preview">
                {{ getSectName(sectId) }}
              </span>
            </div>
          </div>
        </GameSurface>

        <GameSurface tone="jade" padding="md" compact>
          <div class="detail-section">
            <span class="detail-label">特产资源</span>
            <div class="resources-list">
              <span v-for="resource in selectedArea.resources" :key="resource" class="resource-tag">{{ resource }}</span>
            </div>
          </div>
        </GameSurface>

        <GameSurface v-if="selectedArea.background" tone="mist" padding="md" compact>
          <div class="detail-section">
            <span class="detail-label">背景故事</span>
            <p class="background-story">{{ selectedArea.background }}</p>
          </div>
        </GameSurface>

        <MapExplorationPanel
          :points="getExplorationPoints(selectedArea)"
          :stamina="playerStore.stamina"
          :feedback="lastExploration"
          @explore="handleSelectedAreaExplore"
        />

        <MapAreaActionPanel
          :options="getAreaActionOptions(selectedArea)"
          :stamina="playerStore.stamina"
          :feedback="lastAreaActionFeedback"
          @act="handleSelectedAreaAction"
        />
      </template>

      <template #footer>
        <GameActionButton
          v-if="selectedArea && isAreaUnlocked(selectedArea) && !mapStore.isAreaConquered(selectedArea.id) && !getAreaAccess(selectedArea.id).challengeAllowed"
          icon="⛔"
          tone="stone"
          disabled
        >
          {{ getAreaAccess(selectedArea.id).entryLabel }}
        </GameActionButton>
        <GameActionButton
          v-else-if="selectedArea && isAreaUnlocked(selectedArea) && !mapStore.isAreaConquered(selectedArea.id)"
          icon="⚔️"
          tone="jade"
          :disabled="playerStore.stamina < getAreaAccess(selectedArea.id).staminaCost"
          @click="handleChallenge(selectedArea)"
        >
          前往挑战
        </GameActionButton>
        <GameActionButton
          v-else-if="selectedArea && mapStore.isAreaConquered(selectedArea.id)"
          icon="✓"
          tone="gold"
          disabled
        >
          已征服
        </GameActionButton>
        <GameActionButton
          v-else
          icon="🔒"
          tone="stone"
          disabled
        >
          境界不足
        </GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import MapAreaActionPanel from '@/components/map/MapAreaActionPanel.vue'
import MapExplorationPanel from '@/components/map/MapExplorationPanel.vue'
import WorldBriefingPanel from '@/components/world/WorldBriefingPanel.vue'
import { useToast } from '@/composables/useToast'
import { useMapAreaAction } from '@/composables/useMapAreaAction'
import { useMapExploration } from '@/composables/useMapExploration'
import { useWorldBriefingActions } from '@/composables/useWorldBriefingActions'
import { useWorldBriefings } from '@/composables/useWorldBriefings'
import type { MapAreaActionKind } from '@/map/runtime/mapAreaActionResolver'
import { resolveAreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import { resolveMapAreaAdventureAreaId, resolveMapAreaEncounter } from '@/map/runtime/mapAreaEncounterResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getAreaById as getAdventureAreaById } from '@/types/adventure'
import { WORLD_REALMS, WORLD_REALM_CONFIGS, type MapArea } from '@/types/map'
import { getSectById } from '@/types/sect'
import { getAnomalyIcon } from '@/components/world/worldUi'

const router = useRouter()
const mapStore = useMapStore()
const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const { warning, success } = useToast()
const { handleWorldBriefingAction } = useWorldBriefingActions()
const {
  lastFeedback: lastAreaActionFeedback,
  getActionOptions: getAreaActionOptions,
  applyAreaAction
} = useMapAreaAction()
const {
  lastExploration,
  getExplorationPoints,
  explorePoint
} = useMapExploration()

const selectedArea = ref<MapArea | null>(null)

const recentWorldLogs = computed(() => worldStore.visibleLogViews.slice(0, 3))
const areaAnomalies = computed(() => worldStore.activeAreaAnomalies.slice(0, 3))
const areaRiskWeight = {
  safe: 0,
  watch: 1,
  danger: 2,
  chaos: 3
}
const hotspotAreaBriefing = computed(() => {
  const area = mapStore.currentRealmAreas
    .map(item => ({
      area: item,
      encounter: getAreaEncounter(item.id)
    }))
    .filter(item => item.encounter && item.encounter.riskLevel !== 'safe')
    .sort((a, b) => {
      const aScore = a.encounter ? areaRiskWeight[a.encounter.riskLevel] + (a.encounter.contested ? 0.5 : 0) : 0
      const bScore = b.encounter ? areaRiskWeight[b.encounter.riskLevel] + (b.encounter.contested ? 0.5 : 0) : 0
      return bScore - aScore
    })[0]

  if (!area?.encounter) return null
  return {
    name: area.area.name,
    riskLevel: area.encounter.riskLevel,
    contested: area.encounter.contested,
    anomalyTitle: area.encounter.anomalyTitle
  }
})
const latestMapLogBriefing = computed(() => recentWorldLogs.value[0]
  ? {
      title: recentWorldLogs.value[0].entry.title,
      severity: recentWorldLogs.value[0].entry.severity,
      timeLabel: recentWorldLogs.value[0].entry.timeLabel
    }
  : null
)
const { worldBriefings } = useWorldBriefings({
  hotspotArea: hotspotAreaBriefing,
  latestLog: latestMapLogBriefing
})
const worldSeason = computed(() => {
  const month = worldStore.clock.month
  if (month <= 3) return '春'
  if (month <= 6) return '夏'
  if (month <= 9) return '秋'
  return '冬'
})
const worldDateLabel = computed(() => `第${worldStore.clock.year}年 ${worldStore.clock.month}月${worldStore.clock.day}日 ${worldSeason.value}`)
const seasonEffectLabel = computed(() => {
  const labels: Record<string, string> = {
    春: '万物复苏，修炼效率提升10%',
    夏: '阳气旺盛，体力恢复提升15%',
    秋: '天高气爽，修炼效率提升15%',
    冬: '冬藏时节，宜静心修炼'
  }
  return labels[worldSeason.value] ?? '天机流转'
})

const areaEncounterLookup = computed(() => {
  const entries: Record<string, ReturnType<typeof resolveMapAreaEncounter>> = {}
  for (const area of mapStore.currentRealmAreas) {
    const anomaly = worldStore.activeAreaAnomalies.find(item => item.areaId === area.id) ?? null
    entries[area.id] = resolveMapAreaEncounter(area.id, mapStore.getAreaState(area.id), worldStore.weather, anomaly)
  }
  return entries
})

const areaAccessLookup = computed(() => {
  const entries: Record<string, ReturnType<typeof resolveAreaGameplayAccess>> = {}
  for (const area of mapStore.currentRealmAreas) {
    const encounter = areaEncounterLookup.value[area.id] ?? null
    const adventureArea = getAdventureAreaById(resolveMapAreaAdventureAreaId(area.id))
    entries[area.id] = resolveAreaGameplayAccess({
      areaName: area.name,
      mapAreaId: area.id,
      mapAreaSectIds: area.sects,
      controllerSectId: encounter?.controllerSectId ?? null,
      encounter,
      baseStaminaCost: adventureArea?.staminaCost ?? 1,
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

function createFallbackAreaAccess() {
  return {
    entryState: 'open' as const,
    entryLabel: '开放',
    entryReason: '界路暂稳，可正常历练。',
    warnings: [] as string[],
    staminaCost: 1,
    sweepCost: 3,
    challengeAllowed: true,
    mapChallengeAllowed: true,
    adventureChallengeAllowed: true,
    sweepAllowed: true,
    blocker: null
  }
}

function getSeasonIcon(season: string): string {
  const icons: Record<string, string> = {
    春: '🌸',
    夏: '☀️',
    秋: '🍂',
    冬: '❄️'
  }
  return icons[season] || '🌤️'
}

function isAreaUnlocked(area: MapArea): boolean {
  const realmOrder = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']
  const playerRealmIndex = realmOrder.indexOf(playerStore.realm)
  const requiredRealmIndex = realmOrder.indexOf(area.requiredRealm)

  if (playerRealmIndex > requiredRealmIndex) return true
  if (playerRealmIndex === requiredRealmIndex && playerStore.realmLevel >= area.requiredRealmLevel) return true
  return false
}

function getSectName(sectId: string): string {
  const sect = getSectById(sectId)
  if (sect) return sect.name
  if (sectId === 'sword_mountain') return '铸剑门'
  return '未知势力'
}

function getAreaEncounter(areaId: string) {
  return areaEncounterLookup.value[areaId] ?? null
}

function getAreaAccess(areaId: string) {
  return areaAccessLookup.value[areaId] ?? createFallbackAreaAccess()
}

function handleRealmSelect(realm: string) {
  if (mapStore.realmUnlockStatus[realm as keyof typeof mapStore.realmUnlockStatus]) {
    mapStore.switchRealm(realm as '人界' | '妖界' | '魔界' | '仙界')
  }
}

function handleAreaClick(area: MapArea) {
  selectedArea.value = area
}

function handleAreaAction(area: MapArea, kind: MapAreaActionKind) {
  const result = applyAreaAction(area, kind)
  if (!result.success) {
    warning(result.message)
    return
  }
  success(`${result.option.label}完成：${result.result.title}`)
}

function handleSelectedAreaAction(kind: MapAreaActionKind) {
  if (!selectedArea.value) return
  handleAreaAction(selectedArea.value, kind)
}

function handleSelectedAreaExplore(pointId: string) {
  if (!selectedArea.value) return
  const result = explorePoint(selectedArea.value, pointId)
  if (!result.success) {
    warning(result.reason)
    return
  }
  success(result.title)
}

function handleChallenge(area: MapArea) {
  const access = getAreaAccess(area.id)
  if (!access.challengeAllowed) {
    warning(access.entryReason)
    return
  }

  if (playerStore.stamina < access.staminaCost) {
    warning(`体力不足！需要${access.staminaCost}点体力`)
    return
  }

  playerStore.consumeStamina(access.staminaCost)
  const adventureAreaId = resolveMapAreaAdventureAreaId(area.id)
  router.push({
    path: '/game/battle',
    query: {
      areaId: adventureAreaId,
      mapAreaId: area.id
    }
  })
  selectedArea.value = null
}
</script>

<style scoped>
.map-view {
  display: grid;
  gap: 14px;
  padding-bottom: 10px;
}

.realm-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
}

.date-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.date-pill,
.season-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(104, 150, 145, 0.18);
  color: rgba(73, 97, 95, 0.8);
  font-size: 11px;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.top-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(320px, 1.05fr);
  gap: 14px;
}

.realm-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.realm-tab {
  display: grid;
  gap: 6px;
  justify-items: center;
  padding: 12px 10px;
  border-radius: 16px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  background: rgba(255, 255, 255, 0.68);
  color: #5a7172;
  font-family: var(--font-game);
  font-size: 12px;
}

.realm-tab.active {
  border-color: rgba(188, 141, 58, 0.26);
  background: rgba(255, 249, 233, 0.82);
  color: #8b6226;
}

.realm-tab.locked {
  opacity: 0.45;
}

.realm-icon {
  font-size: 22px;
}

.world-log-list {
  display: grid;
  gap: 10px;
}

.anomaly-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.world-log-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(104, 150, 145, 0.16);
}

.world-log-item strong {
  color: #315257;
  font-size: 13px;
}

.world-log-item strong small {
  margin-left: 6px;
  color: rgba(49, 82, 87, 0.68);
  font-size: 11px;
}

.world-log-item p {
  margin: 7px 0 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.world-log-item small {
  display: block;
  margin-top: 8px;
  color: rgba(73, 97, 95, 0.62);
  font-size: 10px;
}

.world-log-context {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.world-log-context span {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(120, 146, 149, 0.16);
  background: rgba(252, 255, 251, 0.76);
  color: rgba(73, 97, 95, 0.76);
  font-size: 10px;
  line-height: 1.2;
}

.world-log-context .context-area {
  color: #4c7a78;
  background: rgba(239, 250, 247, 0.82);
}

.world-log-context .context-sect {
  color: #8b6226;
  background: rgba(255, 249, 233, 0.86);
}

.world-log-context .context-actor {
  color: #8f4c63;
  background: rgba(255, 244, 248, 0.82);
}

.anomaly-item {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.66);
  display: grid;
  gap: 8px;
}

.anomaly-item.severity-major {
  border-color: rgba(195, 141, 54, 0.24);
  background: rgba(255, 250, 239, 0.8);
}

.anomaly-item.severity-legendary {
  border-color: rgba(198, 121, 137, 0.24);
  background: rgba(255, 245, 247, 0.82);
}

.anomaly-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.anomaly-item strong {
  color: #315257;
  font-size: 13px;
}

.anomaly-item p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.anomaly-item small,
.anomaly-head span {
  color: rgba(73, 97, 95, 0.66);
  font-size: 10px;
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

.areas-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.area-card.locked {
  opacity: 0.65;
}

.area-card.conquered {
  border-color: rgba(95, 176, 131, 0.3);
}

.area-header {
  display: flex;
  gap: 12px;
  align-items: center;
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
  font-size: 15px;
}

.area-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.area-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}

.area-risk-panel {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.status,
.sect-count,
.risk-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  font-size: 11px;
}

.status.conquered { color: #4ca96f; }
.status.available { color: #4c95c3; }
.status.locked { color: #899595; }

.sect-count {
  color: #8b6226;
}

.risk-badge {
  width: fit-content;
  max-width: 100%;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid rgba(126, 184, 218, 0.28);
}

.area-risk-panel p {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 11px;
  line-height: 1.55;
}

.area-risk-panel small,
.detail-section small {
  color: rgba(73, 97, 95, 0.66);
  font-size: 10px;
  line-height: 1.5;
}

.area-access-row {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background: rgba(255, 255, 255, 0.64);
}

.area-access-row p,
.area-access-row small {
  margin: 0;
  color: rgba(73, 97, 95, 0.76);
  font-size: 11px;
  line-height: 1.55;
}

.access-badge,
.access-pill {
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

.area-access-row.state-risky .access-badge,
.area-access-row.state-risky .access-pill {
  color: #9b6a1c;
  border-color: rgba(214, 153, 58, 0.24);
  background: rgba(255, 248, 232, 0.92);
}

.area-access-row.state-blocked .access-badge,
.area-access-row.state-blocked .access-pill {
  color: #9b4a55;
  border-color: rgba(190, 103, 122, 0.24);
  background: rgba(255, 242, 245, 0.92);
}

.area-access-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.resource-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(103, 149, 144, 0.16);
  color: rgba(73, 97, 95, 0.82);
  font-size: 11px;
}

.detail-head {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.detail-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 34px;
}

.detail-desc {
  margin: 0;
  text-align: center;
  color: rgba(49, 82, 87, 0.82);
  font-size: 13px;
  line-height: 1.65;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.detail-section {
  display: grid;
  gap: 8px;
}

.detail-label {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.detail-section strong {
  color: #315257;
  font-size: 14px;
}

.sects-list,
.resources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sect-preview {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(103, 149, 144, 0.18);
  color: #486566;
  font-size: 11px;
}

.background-story {
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.65;
}

@media (max-width: 920px) {
  .realm-hero,
  .top-grid {
    grid-template-columns: 1fr;
  }

  .anomaly-strip {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    justify-content: flex-start;
  }

  .areas-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .realm-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-header {
    align-items: start;
    flex-direction: column;
  }

  .areas-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
