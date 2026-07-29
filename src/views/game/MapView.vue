<template>
  <div class="map-view">
    <section class="map-hero-strip">
      <div class="map-hero-title">
        <span class="section-eyebrow">天下舆图</span>
        <h1>{{ mapStore.currentRealm }}</h1>
        <p>{{ mapStore.currentRealmConfig.description }}</p>
      </div>
      <div class="map-hero-stats">
        <span><GameIcon icon="mission" :size="14" /> {{ worldDateLabel }}</span>
        <span><GameIcon :icon="getSeasonIcon(worldSeason)" :size="14" /> {{ worldSeason }}</span>
        <strong>{{ mapStore.conqueredCountInCurrentRealm }}/{{ mapStore.currentRealmAreas.length }} 已开路</strong>
      </div>
    </section>

    <nav class="realm-switcher" aria-label="切换界域">
      <button
        v-for="realm in WORLD_REALMS"
        :key="realm"
        type="button"
        :class="{ active: mapStore.currentRealm === realm, locked: !mapStore.realmUnlockStatus[realm] }"
        :disabled="!mapStore.realmUnlockStatus[realm]"
        @click="handleRealmSelect(realm)"
      >
        <GameIcon :icon="WORLD_REALM_CONFIGS[realm].icon" :size="17" />
        <span>{{ realm }}</span>
      </button>
    </nav>

    <section class="map-board-shell" aria-label="节点式地图">
      <div class="map-board">
        <canvas ref="terrainCanvas" class="terrain-canvas" aria-hidden="true"></canvas>
        <div class="map-route-layer">
          <button
            v-for="(area, index) in mapStore.currentRealmAreas"
            :key="area.id"
            type="button"
            class="map-node"
            :class="{
              locked: !isAreaUnlocked(area),
              conquered: mapStore.isAreaConquered(area.id),
              selected: focusedArea?.id === area.id,
              destination: currentAreaId === area.id
            }"
            :style="nodeStyle(area, index)"
            :aria-label="`${area.name}${isAreaUnlocked(area) ? '' : '，未解锁'}`"
            @click="handleAreaClick(area)"
          >
            <span class="map-node-orb"><GameIcon :icon="area.icon" :size="18" /></span>
            <span class="map-node-copy">
              <b>{{ area.name }}</b>
              <small>{{ getAreaEncounter(area.id)?.statusText ?? (isAreaUnlocked(area) ? '可抵达' : '未解锁') }}</small>
            </span>
          </button>

          <div class="player-map-marker" :style="playerMarkerStyle" aria-label="玩家当前位置">
            <span><GameIcon :icon="playerMarkerIcon" :size="15" /></span>
            <small>你</small>
          </div>
        </div>
      </div>
      <div class="map-board-footer">
        <span><GameIcon icon="compass" :size="14" /> {{ currentAreaName }}</span>
        <span>{{ worldStore.weather === 'clear' ? '天色清明' : getWeatherLabel(worldStore.weather) }}</span>
      </div>
    </section>

    <section class="map-destination" :class="{ empty: !focusedArea }">
      <template v-if="focusedArea">
        <div class="destination-copy">
          <div class="destination-icon"><GameIcon :icon="focusedArea.icon" :size="21" /></div>
          <div>
            <span>当前选中</span>
            <strong>{{ focusedArea.name }}</strong>
            <small>{{ getAreaAccess(focusedArea.id).entryReason }}</small>
          </div>
        </div>
        <div class="destination-actions">
          <button type="button" class="destination-detail" @click="openAreaDetails(focusedArea)">详情</button>
          <button
            type="button"
            class="destination-travel"
            :disabled="!canTravelToSelected"
            @click="travelToSelected"
          >
            <GameIcon icon="map" :size="15" />
            {{ travelButtonLabel }}
          </button>
        </div>
      </template>
      <div v-else class="destination-empty">
        <GameIcon icon="map" :size="18" />
        <span>点选一个节点查看路径、宗门和当前异动。</span>
      </div>
    </section>

    <section v-if="areaAnomalies.length || recentWorldLogs.length" class="map-brief-strip">
      <div v-if="areaAnomalies[0]" class="map-brief-item warning">
        <GameIcon :icon="getAnomalyIcon(areaAnomalies[0].type)" :size="17" />
        <div><strong>{{ areaAnomalies[0].title }}</strong><span>{{ areaAnomalies[0].riskHint }}</span></div>
      </div>
      <div v-else-if="recentWorldLogs[0]" class="map-brief-item">
        <GameIcon icon="scroll" :size="17" />
        <div><strong>{{ recentWorldLogs[0].entry.title }}</strong><span>{{ recentWorldLogs[0].entry.timeLabel }}</span></div>
      </div>
      <button type="button" class="map-log-link" @click="openWorldHistory">
        <span>查看世界记录</span>
        <GameIcon icon="chevron-right" :size="15" />
      </button>
    </section>

    <GameDialog
      :visible="Boolean(selectedArea)"
      :title="selectedArea?.name || ''"
      eyebrow="区域详览"
      @close="selectedArea = null"
    >
      <template v-if="selectedArea">
        <div class="detail-head">
          <GameIcon class="detail-icon" :icon="selectedArea.icon" :size="42" />
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
              <strong><GameIcon icon="thunder" :size="14" /> {{ getAreaAccess(selectedArea.id).staminaCost }}</strong>
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
          icon="close"
          tone="stone"
          disabled
        >
          {{ getAreaAccess(selectedArea.id).entryLabel }}
        </GameActionButton>
        <GameActionButton
          v-else-if="selectedArea && isAreaUnlocked(selectedArea) && !mapStore.isAreaConquered(selectedArea.id)"
          icon="sword"
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
          icon="Lock"
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import MapAreaActionPanel from '@/components/map/MapAreaActionPanel.vue'
import MapExplorationPanel from '@/components/map/MapExplorationPanel.vue'
import { useToast } from '@/composables/useToast'
import { useMapAreaAction } from '@/composables/useMapAreaAction'
import { useMapExploration } from '@/composables/useMapExploration'
import type { MapAreaActionKind } from '@/map/runtime/mapAreaActionResolver'
import { resolveAreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import { resolveMapAreaAdventureAreaId, resolveMapAreaEncounter } from '@/map/runtime/mapAreaEncounterResolver'
import { resolveMapAreaUnlock } from '@/map/runtime/mapAreaUnlockResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getAreaById as getAdventureAreaById } from '@/types/adventure'
import { WORLD_REALMS, WORLD_REALM_CONFIGS, type MapArea } from '@/types/map'
import { getSectById } from '@/types/sect'
import { getAnomalyIcon } from '@/components/world/worldUi'
import { useStoryStore } from '@/story/storyStore'

const router = useRouter()
const route = useRoute()
const mapStore = useMapStore()
const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const storyStore = useStoryStore()
const { warning, success } = useToast()
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
const focusedArea = ref<MapArea | null>(null)
const terrainCanvas = ref<HTMLCanvasElement | null>(null)

const AREA_POSITIONS: Record<string, { x: number; y: number }> = {
  qingyun_mountain: { x: 18, y: 54 },
  azure_valley: { x: 39, y: 68 },
  cloud_peak: { x: 42, y: 24 },
  flame_city: { x: 61, y: 72 },
  thunder_plains: { x: 80, y: 51 },
  sky_temple: { x: 76, y: 20 },
  hundred_beast_forest: { x: 22, y: 52 },
  fox_den: { x: 52, y: 28 },
  dragon_pool: { x: 79, y: 45 },
  phoenix_nest: { x: 66, y: 77 },
  demon_city: { x: 38, y: 78 },
  blood_marsh: { x: 83, y: 70 },
  dark_forest: { x: 20, y: 26 },
  demon_palace: { x: 61, y: 22 },
  ghost_city: { x: 42, y: 56 },
  abyss: { x: 76, y: 32 }
}

const recentWorldLogs = computed(() => worldStore.visibleLogViews.slice(0, 3))
const areaAnomalies = computed(() => worldStore.activeAreaAnomalies.slice(0, 3))
const worldSeason = computed(() => {
  const month = worldStore.clock.month
  if (month <= 3) return '春'
  if (month <= 6) return '夏'
  if (month <= 9) return '秋'
  return '冬'
})
const worldDateLabel = computed(() => `第${worldStore.clock.year}年 ${worldStore.clock.month}月${worldStore.clock.day}日 ${worldSeason.value}`)

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
    春: 'herb',
    夏: 'fire',
    秋: 'spark',
    冬: 'cloud'
  }
  return icons[season] || 'spark'
}

function isAreaUnlocked(area: MapArea): boolean {
  return resolveMapAreaUnlock({
    area,
    playerRealm: playerStore.realm,
    playerRealmLevel: playerStore.realmLevel,
    conqueredAreaIds: mapStore.conqueredAreas,
    knownAreaIds: mapStore.conqueredAreas,
    eventIds: worldStore.logs.map(log => log.id),
    worldFlags: worldStore.worldFlags,
    completedStoryNodeIds: [...storyStore.completedNodes],
    currentStoryNodeId: storyStore.currentNodeId,
    storyClueIds: [...storyStore.unlockedClues],
    unlockedSectIds: sectStore.unlockedSects,
    joinedSectId: sectStore.joinedSectId
  }).unlocked
}

function syncSelectedAreaFromRoute(areaId: unknown) {
  if (typeof areaId !== 'string') return
  const area = mapStore.getAreaInfo(areaId)
  if (!area) return
  if (!mapStore.realmUnlockStatus[area.realm] || !isAreaUnlocked(area)) return
  if (mapStore.currentRealm !== area.realm) {
    mapStore.switchRealm(area.realm)
  }
  focusedArea.value = area
  selectedArea.value = area
}

watch(
  () => route.query.areaId,
  areaId => syncSelectedAreaFromRoute(areaId),
  { immediate: true }
)

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

const currentAreaId = computed(() => {
  const savedAreaId = worldStore.playerAreaId
  if (savedAreaId && mapStore.currentRealmAreas.some(area => area.id === savedAreaId)) return savedAreaId
  return mapStore.currentRealmAreas.find(area => isAreaUnlocked(area))?.id
    ?? mapStore.currentRealmAreas[0]?.id
    ?? null
})

const currentAreaName = computed(() => {
  const area = currentAreaId.value ? mapStore.getAreaInfo(currentAreaId.value) : null
  return area?.name ?? '尚未落脚'
})

const playerMarkerIcon = computed(() => {
  if (mapStore.currentRealm === '妖界') return 'beast'
  if (mapStore.currentRealm === '魔界') return 'void'
  if (mapStore.currentRealm === '仙界') return 'cloud'
  return 'cultivation'
})

const playerMarkerStyle = computed(() => {
  const area = currentAreaId.value ? mapStore.getAreaInfo(currentAreaId.value) : null
  const position = area ? resolveAreaPosition(area, 0) : { x: 50, y: 50 }
  return {
    left: `${position.x}%`,
    top: `${position.y}%`
  }
})

const canTravelToSelected = computed(() => {
  const target = focusedArea.value
  const fromId = currentAreaId.value
  if (!target || !fromId || target.id === fromId) return false
  if (!isAreaUnlocked(target) || playerStore.captivity.isCaptured) return false
  return mapStore.getAreaInfo(fromId)?.adjacentAreas.includes(target.id) ?? false
})

const travelButtonLabel = computed(() => {
  if (!focusedArea.value) return '选择节点'
  if (focusedArea.value.id === currentAreaId.value) return '已在此处'
  if (!isAreaUnlocked(focusedArea.value)) return '未解锁'
  if (!canTravelToSelected.value) return '需先开路'
  return '赶往此处'
})

function resolveAreaPosition(area: MapArea, index: number) {
  return AREA_POSITIONS[area.id] ?? {
    x: 16 + ((index * 29) % 68),
    y: 22 + ((index * 37) % 54)
  }
}

function nodeStyle(area: MapArea, index: number) {
  const position = resolveAreaPosition(area, index)
  return { left: `${position.x}%`, top: `${position.y}%` }
}

function getWeatherLabel(weather: string) {
  const labels: Record<string, string> = {
    rain: '灵雨落山', storm: '雷暴压境', flood: '水患漫路', fire: '火潮蔓延', mist: '雾锁山河'
  }
  return labels[weather] ?? '天象平稳'
}

function drawMapTerrain() {
  const canvas = terrainCanvas.value
  if (!canvas) return
  const width = Math.max(1, canvas.clientWidth)
  const height = Math.max(1, canvas.clientHeight)
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  const context = canvas.getContext('2d')
  if (!context) return
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  const terrain = context.createLinearGradient(0, 0, width, height)
  terrain.addColorStop(0, '#d9eee0')
  terrain.addColorStop(1, '#c4ded5')
  context.fillStyle = terrain
  context.fillRect(0, 0, width, height)

  context.fillStyle = 'rgba(105, 170, 164, 0.16)'
  context.beginPath()
  context.moveTo(width * 0.04, height * 0.84)
  context.bezierCurveTo(width * 0.2, height * 0.68, width * 0.26, height * 0.86, width * 0.42, height * 0.72)
  context.bezierCurveTo(width * 0.58, height * 0.58, width * 0.72, height * 0.8, width * 1.02, height * 0.62)
  context.lineTo(width * 1.02, height * 1.02)
  context.lineTo(width * 0.04, height * 1.02)
  context.closePath()
  context.fill()

  context.fillStyle = 'rgba(72, 119, 99, 0.17)'
  for (const [x, y, size] of [[0.18, 0.2, 0.13], [0.58, 0.16, 0.11], [0.84, 0.36, 0.16], [0.5, 0.82, 0.12]]) {
    context.beginPath()
    context.moveTo(width * x, height * (y + size))
    context.lineTo(width * (x + size * 0.38), height * y)
    context.lineTo(width * (x + size), height * (y + size))
    context.closePath()
    context.fill()
  }

  const areas = mapStore.currentRealmAreas
  const indexById = new Map(areas.map((area, index) => [area.id, index]))
  context.lineWidth = 2
  context.setLineDash([5, 6])
  for (const area of areas) {
    const from = resolveAreaPosition(area, indexById.get(area.id) ?? 0)
    for (const adjacentId of area.adjacentAreas) {
      const adjacent = areas.find(item => item.id === adjacentId)
      if (!adjacent || (indexById.get(adjacentId) ?? 0) < (indexById.get(area.id) ?? 0)) continue
      const to = resolveAreaPosition(adjacent, indexById.get(adjacent.id) ?? 0)
      context.strokeStyle = 'rgba(74, 124, 108, 0.46)'
      context.beginPath()
      context.moveTo(width * from.x / 100, height * from.y / 100)
      context.lineTo(width * to.x / 100, height * to.y / 100)
      context.stroke()
    }
  }
  context.setLineDash([])
}

function handleRealmSelect(realm: string) {
  if (mapStore.realmUnlockStatus[realm as keyof typeof mapStore.realmUnlockStatus]) {
    focusedArea.value = null
    selectedArea.value = null
    mapStore.switchRealm(realm as '人界' | '妖界' | '魔界' | '仙界')
  }
}

function handleAreaClick(area: MapArea) {
  focusedArea.value = area
}

function openAreaDetails(area: MapArea) {
  focusedArea.value = area
  selectedArea.value = area
}

function travelToSelected() {
  const target = focusedArea.value
  const fromId = currentAreaId.value
  if (!target || !fromId || !canTravelToSelected.value) return
  const result = worldStore.travelTo({ fromAreaId: fromId, toAreaId: target.id })
  const travel = result.travel
  if (!travel) return
  if (travel.status === 'arrived') {
    success(`已抵达${target.name}`)
    return
  }
  warning(travel.message)
}

function openWorldHistory() {
  window.dispatchEvent(new CustomEvent('open-world-drawer'))
}

function handleAreaAction(area: MapArea, kind: MapAreaActionKind) {
  if (!isAreaUnlocked(area)) {
    warning(`尚未找到前往${area.name}的有效路径`)
    return
  }
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
  if (!isAreaUnlocked(selectedArea.value)) {
    warning(`尚未找到前往${selectedArea.value.name}的有效路径`)
    return
  }
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

onMounted(() => {
  drawMapTerrain()
  window.addEventListener('resize', drawMapTerrain)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawMapTerrain)
})

watch(
  () => mapStore.currentRealm,
  () => requestAnimationFrame(drawMapTerrain)
)
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

.world-log-item p {
  margin: 7px 0 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.world-log-repeat {
  display: block;
  margin-top: 6px;
  color: rgba(126, 89, 35, 0.72);
  font-size: 11px;
  line-height: 1.45;
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
  flex: 0 0 auto;
}

.area-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
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

@container game-stage (max-width: 920px) {
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

@container game-stage (max-width: 640px) {
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

/* The map is a single viewport object. Details and actions stay in the node dialog. */
.map-view {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  gap: 0.52rem;
  padding: 0.12rem 0 0.2rem;
  overflow: hidden;
}

.map-hero-strip {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.68rem 0.78rem;
  border: 1px solid rgba(92, 145, 127, 0.18);
  border-radius: 0.95rem;
  background: rgba(248, 255, 249, 0.78);
}

.map-hero-title {
  min-width: 0;
}

.map-hero-title h1 {
  margin: 0.12rem 0 0.16rem;
  color: #315d58;
  font-size: clamp(1.15rem, 5vw, 1.45rem);
  line-height: 1.1;
}

.map-hero-title p {
  max-width: 18rem;
  margin: 0;
  overflow: hidden;
  color: rgba(67, 99, 94, 0.72);
  font-size: 0.68rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-hero-stats {
  display: grid;
  justify-items: end;
  gap: 0.32rem;
  flex: 0 0 auto;
  color: rgba(67, 99, 94, 0.7);
  font-size: 0.62rem;
  text-align: right;
}

.map-hero-stats span {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  white-space: nowrap;
}

.map-hero-stats strong {
  color: #9b6e24;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.realm-switcher {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.32rem;
}

.realm-switcher button {
  display: grid;
  place-items: center;
  gap: 0.18rem;
  min-height: 2.65rem;
  padding: 0.28rem 0.12rem;
  border: 1px solid rgba(86, 139, 122, 0.16);
  border-radius: 0.72rem;
  background: rgba(250, 255, 249, 0.72);
  color: #547e74;
  font-family: var(--font-game);
  font-size: 0.66rem;
}

.realm-switcher button.active {
  border-color: rgba(155, 110, 36, 0.35);
  background: rgba(255, 249, 231, 0.92);
  color: #8b6326;
}

.realm-switcher button.locked {
  opacity: 0.42;
}

.map-board-shell {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(74, 127, 110, 0.24);
  border-radius: 1rem;
  background: rgba(214, 236, 221, 0.76);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.map-board {
  position: relative;
  min-height: 16rem;
  flex: 1 1 auto;
  overflow: hidden;
}

.terrain-canvas,
.map-route-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.terrain-canvas {
  display: block;
}

.map-route-layer {
  pointer-events: none;
}

.map-node {
  position: absolute;
  z-index: 2;
  display: grid;
  grid-template-columns: 2.15rem minmax(0, 1fr);
  align-items: center;
  gap: 0.28rem;
  width: 6.7rem;
  min-height: 2.25rem;
  padding: 0.22rem 0.3rem 0.22rem 0.22rem;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(66, 119, 104, 0.24);
  border-radius: 0.78rem;
  background: rgba(247, 255, 247, 0.9);
  color: #3d6b61;
  font-family: var(--font-game);
  text-align: left;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 0.35rem 1rem rgba(58, 106, 86, 0.11);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.map-node:active {
  transform: translate(-50%, -50%) scale(0.97);
}

.map-node:hover,
.map-node.selected {
  transform: translate(-50%, -50%) translateY(-0.1rem);
  border-color: rgba(155, 110, 36, 0.52);
  background: rgba(255, 249, 231, 0.97);
}

.map-node.destination {
  border-color: rgba(66, 143, 111, 0.58);
}

.map-node.locked {
  opacity: 0.48;
  filter: saturate(0.55);
}

.map-node-orb {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(215, 240, 222, 0.96);
  color: #528d7c;
}

.map-node.conquered .map-node-orb {
  background: rgba(255, 239, 194, 0.96);
  color: #a87824;
}

.map-node-copy {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.map-node-copy b,
.map-node-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-node-copy b {
  color: #3e6b62;
  font-size: 0.68rem;
}

.map-node-copy small {
  color: rgba(67, 99, 94, 0.66);
  font-size: 0.57rem;
}

.player-map-marker {
  position: absolute;
  z-index: 3;
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  transform: translate(-50%, -100%);
  pointer-events: none;
  transition: left 520ms cubic-bezier(0.2, 0.8, 0.2, 1), top 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.player-map-marker > span {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 2px solid #fffaf0;
  border-radius: 50%;
  background: #4e9480;
  color: #fffaf0;
  box-shadow: 0 0 0 3px rgba(78, 148, 128, 0.2), 0 0.36rem 0.7rem rgba(47, 93, 76, 0.2);
}

.player-map-marker small {
  padding: 0.08rem 0.25rem;
  border-radius: 999px;
  background: rgba(255, 252, 236, 0.9);
  color: #876125;
  font-size: 0.56rem;
}

.map-board-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  min-height: 2.2rem;
  padding: 0 0.7rem;
  border-top: 1px solid rgba(74, 127, 110, 0.16);
  background: rgba(248, 255, 248, 0.74);
  color: rgba(67, 99, 94, 0.76);
  font-size: 0.64rem;
}

.map-board-footer span {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  min-width: 0;
}

.map-board-footer span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-destination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  min-height: 3.65rem;
  padding: 0.48rem 0.58rem;
  border: 1px solid rgba(155, 110, 36, 0.22);
  border-radius: 0.88rem;
  background: rgba(255, 251, 239, 0.88);
}

.map-destination.empty {
  justify-content: flex-start;
  border-color: rgba(83, 134, 119, 0.16);
  background: rgba(248, 255, 249, 0.76);
}

.destination-copy {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.5rem;
}

.destination-icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  border-radius: 0.72rem;
  background: rgba(237, 248, 239, 0.95);
  color: #528c79;
}

.destination-copy > div:last-child {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
}

.destination-copy span,
.destination-copy small {
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.59rem;
}

.destination-copy strong {
  overflow: hidden;
  color: #3e6a61;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.destination-copy small {
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.destination-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.3rem;
}

.destination-detail,
.destination-travel,
.map-log-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  min-height: 2.25rem;
  padding: 0 0.55rem;
  border-radius: 0.62rem;
  font-family: var(--font-game);
  font-size: 0.64rem;
  cursor: pointer;
}

.destination-detail {
  border: 1px solid rgba(83, 134, 119, 0.18);
  background: rgba(242, 251, 244, 0.9);
  color: #4b7a70;
}

.destination-travel {
  border: 1px solid rgba(155, 110, 36, 0.34);
  background: rgba(255, 240, 193, 0.9);
  color: #815c25;
}

.destination-travel:disabled {
  opacity: 0.46;
  cursor: not-allowed;
}

.destination-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  color: rgba(73, 97, 95, 0.7);
  font-size: 0.7rem;
}

.map-brief-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 2.55rem;
  padding: 0.34rem 0.55rem;
  border: 1px solid rgba(83, 134, 119, 0.15);
  border-radius: 0.78rem;
  background: rgba(248, 255, 249, 0.74);
}

.map-brief-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.42rem;
  color: #4d8677;
}

.map-brief-item.warning {
  color: #a87329;
}

.map-brief-item > div {
  display: grid;
  min-width: 0;
  gap: 0.06rem;
}

.map-brief-item strong,
.map-brief-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-brief-item strong {
  color: #416f66;
  font-size: 0.68rem;
}

.map-brief-item span {
  max-width: 12rem;
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.58rem;
}

.map-log-link {
  flex: 0 0 auto;
  min-height: 2rem;
  border: 1px solid rgba(155, 110, 36, 0.22);
  background: rgba(255, 250, 232, 0.82);
  color: #8a6328;
}

@media (max-width: 350px) {
  .map-node {
    width: 6rem;
  }

  .map-node-copy b {
    font-size: 0.62rem;
  }

  .map-destination {
    align-items: stretch;
  }

  .destination-copy small {
    max-width: 8rem;
  }

  .destination-actions {
    flex-direction: column;
  }
}
</style>
