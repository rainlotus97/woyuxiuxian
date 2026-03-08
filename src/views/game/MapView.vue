<template>
  <div class="map-view">
    <!-- 日期显示 -->
    <div class="date-display">
      <div class="current-date">
        <span class="date-icon">📅</span>
        <span class="date-text">{{ mapStore.dateDisplayText }}</span>
      </div>
      <div class="season-effect">
        <span class="season-icon">{{ getSeasonIcon(mapStore.currentDate.season) }}</span>
        <span class="season-text">{{ mapStore.currentSeasonEffect.description }}</span>
      </div>
    </div>

    <!-- 界域选择 -->
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

    <!-- 当前界域信息 -->
    <div class="realm-info" :style="{ background: mapStore.currentRealmConfig.bgColor }">
      <div class="realm-header">
        <span class="realm-title">{{ mapStore.currentRealm }}</span>
        <span class="realm-progress">
          已征服: {{ mapStore.conqueredCountInCurrentRealm }}/{{ mapStore.currentRealmAreas.length }}
        </span>
      </div>
      <p class="realm-desc">{{ mapStore.currentRealmConfig.description }}</p>
    </div>

    <!-- 区域列表 -->
    <div class="areas-grid">
      <div
        v-for="area in mapStore.currentRealmAreas"
        :key="area.id"
        class="area-card"
        :class="{
          locked: !isAreaUnlocked(area),
          conquered: mapStore.isAreaConquered(area.id)
        }"
        @click="handleAreaClick(area)"
      >
        <div class="area-icon">{{ area.icon }}</div>
        <div class="area-info">
          <div class="area-name">{{ area.name }}</div>
          <div class="area-realm-req">
            {{ area.requiredRealm }}{{ area.requiredRealmLevel }}层
          </div>
        </div>
        <div class="area-status">
          <span v-if="mapStore.isAreaConquered(area.id)" class="status-conquered">✓ 已征服</span>
          <span v-else-if="isAreaUnlocked(area)" class="status-available">可挑战</span>
          <span v-else class="status-locked">🔒 未解锁</span>
        </div>
        <div class="area-sects" v-if="area.sects.length > 0">
          <span class="sects-label">宗门:</span>
          <span class="sects-count">{{ area.sects.length }}</span>
        </div>
      </div>
    </div>

    <!-- 区域详情弹窗 -->
    <div v-if="selectedArea" class="modal-overlay" @click.self="selectedArea = null">
      <div class="modal-content area-detail-modal">
        <div class="modal-header">
          <span class="modal-title">{{ selectedArea.name }}</span>
          <button class="modal-close" @click="selectedArea = null">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-icon">{{ selectedArea.icon }}</div>
          <p class="detail-desc">{{ selectedArea.description }}</p>

          <div class="detail-section">
            <h4>境界要求</h4>
            <p>{{ selectedArea.requiredRealm }}{{ selectedArea.requiredRealmLevel }}层</p>
          </div>

          <div class="detail-section" v-if="selectedArea.sects.length > 0">
            <h4>宗门</h4>
            <div class="sects-list">
              <div v-for="sectId in selectedArea.sects" :key="sectId" class="sect-preview">
                {{ getSectName(sectId) }}
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>特产资源</h4>
            <div class="resources-list">
              <span v-for="resource in selectedArea.resources" :key="resource" class="resource-tag">
                {{ resource }}
              </span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedArea.background">
            <h4>背景故事</h4>
            <p class="background-story">{{ selectedArea.background }}</p>
          </div>

          <div class="detail-actions">
            <button
              v-if="isAreaUnlocked(selectedArea) && !mapStore.isAreaConquered(selectedArea.id)"
              class="action-btn challenge-btn"
              @click="handleChallenge(selectedArea)"
            >
              ⚔️ 前往挑战
            </button>
            <button
              v-if="mapStore.isAreaConquered(selectedArea.id)"
              class="action-btn conquered-btn"
              disabled
            >
              ✓ 已征服
            </button>
            <button
              v-if="!isAreaUnlocked(selectedArea)"
              class="action-btn locked-btn"
              disabled
            >
              🔒 境界不足
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { WORLD_REALMS, WORLD_REALM_CONFIGS, type MapArea } from '@/types/map'
import { getSectById } from '@/types/sect'

const router = useRouter()
const mapStore = useMapStore()
const playerStore = usePlayerStore()

const selectedArea = ref<MapArea | null>(null)

// 获取季节图标
function getSeasonIcon(season: string): string {
  const icons: Record<string, string> = {
    '春': '🌸',
    '夏': '☀️',
    '秋': '🍂',
    '冬': '❄️'
  }
  return icons[season] || '🌤️'
}

// 检查区域是否解锁
function isAreaUnlocked(area: MapArea): boolean {
  const realmOrder = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']
  const playerRealmIndex = realmOrder.indexOf(playerStore.realm)
  const requiredRealmIndex = realmOrder.indexOf(area.requiredRealm)

  if (playerRealmIndex > requiredRealmIndex) return true
  if (playerRealmIndex === requiredRealmIndex && playerStore.realmLevel >= area.requiredRealmLevel) return true
  return false
}

// 获取宗门名称
function getSectName(sectId: string): string {
  const sect = getSectById(sectId)
  return sect?.name ?? sectId
}

// 选择界域
function handleRealmSelect(realm: string) {
  if (mapStore.realmUnlockStatus[realm as keyof typeof mapStore.realmUnlockStatus]) {
    mapStore.switchRealm(realm as '人界' | '妖界' | '魔界' | '仙界')
  }
}

// 点击区域
function handleAreaClick(area: MapArea) {
  selectedArea.value = area
}

// 挑战区域
function handleChallenge(area: MapArea) {
  // 根据区域找到对应的冒���区域
  // 简化处理：根据境界要求匹配冒险区域
  const realmToAreaMap: Record<string, string> = {
    'qingyun_mountain': 'misty_forest',
    'azure_valley': 'misty_forest',
    'cloud_peak': 'dark_cave',
    'flame_city': 'dark_cave',
    'thunder_plains': 'barren_desert',
    'sky_temple': 'barren_desert',
    'hundred_beast_forest': 'frozen_tundra',
    'fox_den': 'frozen_tundra',
    'dragon_pool': 'volcanic_depths',
    'phoenix_nest': 'volcanic_depths',
    'blood_sea': 'abyss',
    'shadow_city': 'abyss',
    'chaos_abyss': 'celestial_ruins',
    'jade_palace': 'celestial_ruins',
    'star_sea': 'void_realm',
    'void_temple': 'void_realm'
  }

  const adventureAreaId = realmToAreaMap[area.id] || 'misty_forest'

  // 跳转到战斗页面，携带地图区域ID
  router.push({
    path: '/game/battle',
    query: {
      areaId: adventureAreaId,
      mapAreaId: area.id  // 用于攻占地图区域
    }
  })
  selectedArea.value = null
}
</script>

<style scoped>
.map-view {
  padding-bottom: 16px;
}

/* 日期显示 */
.date-display {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.current-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.date-icon {
  font-size: 1.125rem;
}

.date-text {
  color: var(--color-accent-warm);
  font-size: 0.9375rem;
  font-weight: 500;
}

.season-effect {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.season-icon {
  font-size: 0.875rem;
}

/* 界域选择 */
.realm-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.realm-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 10px;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
}

.realm-tab.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: rgba(126, 184, 218, 0.5);
  color: #7eb8da;
}

.realm-tab.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.realm-icon {
  font-size: 1.25rem;
}

.realm-name {
  font-weight: 500;
}

/* 界域信息 */
.realm-info {
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.realm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.realm-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f0f0f0;
}

.realm-progress {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.realm-desc {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* 区域网格 */
.areas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.area-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.area-card:active {
  transform: scale(0.98);
}

.area-card.locked {
  opacity: 0.6;
}

.area-card.conquered {
  border-color: rgba(74, 222, 128, 0.4);
}

.area-icon {
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 8px;
}

.area-info {
  text-align: center;
  margin-bottom: 8px;
}

.area-name {
  font-size: 0.875rem;
  color: #e8e4d0;
  font-weight: 500;
}

.area-realm-req {
  font-size: 0.6875rem;
  color: var(--color-muted);
  margin-top: 2px;
}

.area-status {
  text-align: center;
  font-size: 0.6875rem;
  margin-bottom: 6px;
}

.status-conquered {
  color: #4ade80;
}

.status-available {
  color: #7eb8da;
}

.status-locked {
  color: #6b7280;
}

.area-sects {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 0.625rem;
  color: var(--color-muted);
}

.sects-count {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(180deg, rgba(35, 38, 52, 0.98) 0%, rgba(25, 27, 38, 0.98) 100%);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(126, 184, 218, 0.15);
}

.modal-title {
  font-size: 1rem;
  color: var(--color-accent-warm);
  font-weight: 500;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 1.125rem;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.detail-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 12px;
}

.detail-desc {
  text-align: center;
  font-size: 0.875rem;
  color: #e8e4d0;
  margin-bottom: 16px;
  line-height: 1.5;
}

.detail-section {
  margin-bottom: 14px;
}

.detail-section h4 {
  font-size: 0.8125rem;
  color: var(--color-accent-warm);
  margin-bottom: 6px;
}

.detail-section p {
  font-size: 0.8125rem;
  color: #e8e4d0;
}

.sects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sect-preview {
  background: rgba(126, 184, 218, 0.15);
  border: 1px solid rgba(126, 184, 218, 0.3);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #7eb8da;
}

.resources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.resource-tag {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.6875rem;
  color: #4ade80;
}

.background-story {
  font-size: 0.8125rem;
  color: var(--color-muted);
  font-style: italic;
  line-height: 1.5;
}

.detail-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.challenge-btn {
  background: rgba(126, 184, 218, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.4);
  color: #7eb8da;
}

.challenge-btn:not(:disabled):active {
  transform: scale(0.98);
  background: rgba(126, 184, 218, 0.3);
}

.conquered-btn {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.locked-btn {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.4);
  color: #6b7280;
}

/* 横屏适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .date-display {
    padding: 8px;
    margin-bottom: 10px;
  }

  .realm-tabs {
    margin-bottom: 8px;
  }

  .realm-tab {
    padding: 6px 12px;
    min-width: 60px;
  }

  .realm-info {
    padding: 10px;
    margin-bottom: 10px;
  }

  .areas-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .area-card {
    padding: 8px;
  }

  .area-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
}
</style>
