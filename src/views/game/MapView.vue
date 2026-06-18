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
          <div v-for="log in recentWorldLogs" :key="log.id" class="world-log-item">
            <strong>{{ log.title }}</strong>
            <p>{{ log.text }}</p>
            <small>{{ log.timeLabel }}</small>
          </div>
        </div>
      </GameSurface>
    </div>

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
            </div>
          </GameSurface>
        </div>

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
      </template>

      <template #footer>
        <GameActionButton
          v-if="selectedArea && isAreaUnlocked(selectedArea) && !mapStore.isAreaConquered(selectedArea.id)"
          icon="⚔️"
          tone="jade"
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
import { resolveMapAreaAdventureAreaId } from '@/map/runtime/mapAreaEncounterResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import { WORLD_REALMS, WORLD_REALM_CONFIGS, type MapArea } from '@/types/map'
import { getSectById } from '@/types/sect'

const router = useRouter()
const mapStore = useMapStore()
const playerStore = usePlayerStore()
const worldStore = useWorldStore()

const selectedArea = ref<MapArea | null>(null)

const recentWorldLogs = computed(() => worldStore.visibleLogs.slice(0, 3))
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

function handleRealmSelect(realm: string) {
  if (mapStore.realmUnlockStatus[realm as keyof typeof mapStore.realmUnlockStatus]) {
    mapStore.switchRealm(realm as '人界' | '妖界' | '魔界' | '仙界')
  }
}

function handleAreaClick(area: MapArea) {
  selectedArea.value = area
}

function handleChallenge(area: MapArea) {
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

.world-log-item small {
  display: block;
  margin-top: 8px;
  color: rgba(73, 97, 95, 0.62);
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

.status,
.sect-count {
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
