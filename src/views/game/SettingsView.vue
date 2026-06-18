<template>
  <div class="settings-view">
    <GameSurface
      tone="mist"
      padding="lg"
      eyebrow="系统"
      title="行囊之外"
      subtitle="音频、提醒和当前存档状态集中在这里，避免进入游戏后被不可控的背景音打断。"
    >
      <div class="settings-hero">
        <div class="sound-orb" :class="{ active: bgmEnabled || sfxEnabled }">
          <component :is="bgmEnabled ? Volume2 : VolumeX" :size="28" />
        </div>
        <div class="settings-status">
          <span>{{ bgmEnabled ? '背景音已开启' : '背景音关闭' }}</span>
          <strong>{{ currentBgmName }}</strong>
          <p>当前角色 {{ playerStore.name }}，{{ playerStore.realmInfo.fullName }}，世界时间 {{ worldStore.currentTimeLabel }}。</p>
        </div>
      </div>
    </GameSurface>

    <div class="settings-grid">
      <GameSurface tone="gold" padding="md" eyebrow="音频" title="声音控制" subtitle="默认不自动播放，只有手动开启后才会发声。">
        <div class="toggle-list">
          <button class="toggle-card" :class="{ active: bgmEnabled }" @click="handleToggleBgm">
            <span class="toggle-icon">
              <component :is="bgmEnabled ? Volume2 : VolumeX" :size="20" />
            </span>
            <span class="toggle-copy">
              <strong>背景音乐</strong>
              <small>{{ bgmEnabled ? '正在允许播放' : '已关闭' }}</small>
            </span>
            <em>{{ bgmEnabled ? '开' : '关' }}</em>
          </button>

          <button class="toggle-card" :class="{ active: sfxEnabled }" @click="handleToggleSfx">
            <span class="toggle-icon"><Bell :size="20" /></span>
            <span class="toggle-copy">
              <strong>交互音效</strong>
              <small>{{ sfxEnabled ? '按钮与战斗音效可播放' : '点击音效关闭' }}</small>
            </span>
            <em>{{ sfxEnabled ? '开' : '关' }}</em>
          </button>
        </div>

        <div class="track-panel">
          <div class="panel-line">
            <span>当前曲目</span>
            <strong>{{ currentBgmName }}</strong>
          </div>
          <div class="track-grid">
            <button
              v-for="track in featuredBgms"
              :key="track.type"
              class="track-button"
              :class="{ active: currentBgmType === track.type }"
              @click="handleSwitchBgm(track.type)"
            >
              <small>{{ track.category }}</small>
              <strong>{{ track.name }}</strong>
            </button>
          </div>
          <GameActionButton icon="止" tone="stone" block @click="handleStopBgm">
            停止当前曲目
          </GameActionButton>
        </div>
      </GameSurface>

      <GameSurface tone="jade" padding="md" eyebrow="存档" title="当前进度" subtitle="这里先只展示状态，不提供危险的清档操作。">
        <div class="save-grid">
          <div class="save-chip">
            <span>角色</span>
            <strong>{{ playerStore.name }}</strong>
            <small>{{ playerStore.element }}灵根 · {{ playerStore.quality }}</small>
          </div>
          <div class="save-chip">
            <span>修为</span>
            <strong>{{ playerStore.cultivation }}/{{ playerStore.maxCultivation }}</strong>
            <small>{{ playerStore.realmInfo.fullName }}</small>
          </div>
          <div class="save-chip">
            <span>宗门</span>
            <strong>{{ sectName }}</strong>
            <small>{{ sectStatus }}</small>
          </div>
          <div class="save-chip">
            <span>世界</span>
            <strong>{{ worldStore.visibleLogs.length }} 条异闻</strong>
            <small>{{ weatherLabel }}</small>
          </div>
        </div>
      </GameSurface>
    </div>

    <GameSurface tone="realm" padding="md" eyebrow="试听" title="音效校验" subtitle="用于确认当前设备是否允许网页音频播放。">
      <div class="sfx-row">
        <GameActionButton icon="点" tone="jade" @click="playClick">
          玉磬
        </GameActionButton>
        <GameActionButton icon="修" tone="gold" @click="playMeditate">
          打坐
        </GameActionButton>
        <GameActionButton icon="破" tone="rose" @click="playBreakthrough">
          破境
        </GameActionButton>
        <GameActionButton icon="得" tone="jade" @click="playItem">
          获得
        </GameActionButton>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell, Volume2, VolumeX } from 'lucide-vue-next'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import {
  sfxBreakthrough,
  sfxClick,
  sfxItem,
  sfxMeditate,
  useAudio,
  type BgmType
} from '@/composables/useAudio'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()

const {
  sfxEnabled,
  bgmEnabled,
  currentBgmType,
  toggleSfx,
  toggleBgm,
  switchBgm,
  stopBgm,
  getBgmList
} = useAudio()

const bgmList = getBgmList()
const featuredBgms = bgmList.filter(item =>
  ['sect_bamboo', 'adventure', 'shop', 'battle_normal', 'tribulation', 'spring_rain'].includes(item.type)
)

const currentBgmName = computed(() => {
  if (!bgmEnabled.value) return '未播放'
  if (!currentBgmType.value) return '等待选择'
  return bgmList.find(item => item.type === currentBgmType.value)?.name ?? '未知曲目'
})

const sectName = computed(() => sectStore.currentSect?.name ?? '尚未拜山')
const sectStatus = computed(() => {
  if (!sectStore.currentSect) return '可在宗门页选择'
  if (sectStore.activeWar) return '战事中'
  return sectStore.positionName
})
const weatherLabel = computed(() => {
  const labels: Record<typeof worldStore.weather, string> = {
    clear: '天朗气清',
    rain: '灵雨细落',
    storm: '雷暴压境',
    flood: '洪水漫野',
    fire: '火势蔓延',
    mist: '雾锁山河'
  }
  return labels[worldStore.weather]
})

function handleToggleBgm() {
  sfxClick()
  toggleBgm()
}

function handleToggleSfx() {
  toggleSfx()
  if (sfxEnabled.value) sfxClick()
}

function handleSwitchBgm(type: BgmType) {
  sfxClick()
  if (!bgmEnabled.value) {
    toggleBgm()
  }
  switchBgm(type)
}

function handleStopBgm() {
  sfxClick()
  stopBgm()
}

function playClick() {
  sfxClick()
}

function playMeditate() {
  sfxMeditate()
}

function playBreakthrough() {
  sfxBreakthrough()
}

function playItem() {
  sfxItem()
}
</script>

<style scoped>
.settings-view {
  display: grid;
  gap: 12px;
  max-width: 1120px;
  margin: 0 auto;
}

.settings-hero {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}

.sound-orb {
  width: 74px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 24px;
  border: 1px solid rgba(119, 158, 178, 0.22);
  background: linear-gradient(145deg, rgba(245, 250, 250, 0.9), rgba(222, 234, 232, 0.82));
  color: #668080;
  box-shadow: 0 16px 32px rgba(88, 123, 116, 0.14);
}

.sound-orb.active {
  border-color: rgba(188, 141, 58, 0.34);
  background: linear-gradient(145deg, #fff1b8, #9fe2c9);
  color: #8b6226;
}

.settings-status {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.settings-status span,
.panel-line span,
.save-chip span {
  color: rgba(67, 92, 90, 0.68);
  font-size: 11px;
}

.settings-status strong {
  color: #315257;
  font-size: 22px;
}

.settings-status p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.6;
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 12px;
}

.toggle-list,
.track-panel {
  display: grid;
  gap: 10px;
}

.toggle-card {
  width: 100%;
  min-height: 74px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.6);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
}

.toggle-card.active {
  border-color: rgba(188, 141, 58, 0.34);
  background: rgba(255, 248, 224, 0.86);
}

.toggle-icon {
  width: 44px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #8b6226;
}

.toggle-copy {
  display: grid;
  gap: 5px;
}

.toggle-copy strong,
.panel-line strong,
.save-chip strong {
  color: #315257;
  font-size: 14px;
}

.toggle-copy small,
.save-chip small {
  color: rgba(67, 92, 90, 0.68);
  font-size: 11px;
  line-height: 1.45;
}

.toggle-card em {
  min-width: 36px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #8b6226;
  font-size: 11px;
  font-style: normal;
  text-align: center;
}

.track-panel {
  margin-top: 14px;
}

.panel-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.track-button {
  min-height: 58px;
  display: grid;
  gap: 4px;
  align-content: center;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
}

.track-button.active {
  border-color: rgba(188, 141, 58, 0.36);
  background: rgba(255, 248, 224, 0.92);
}

.track-button small {
  color: rgba(67, 92, 90, 0.62);
  font-size: 10px;
}

.track-button strong {
  color: #315257;
  font-size: 12px;
}

.save-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.save-chip {
  min-height: 86px;
  display: grid;
  gap: 6px;
  align-content: center;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
}

.sfx-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 760px) {
  .settings-grid,
  .settings-hero {
    grid-template-columns: 1fr;
  }

  .sound-orb {
    width: 58px;
    border-radius: 20px;
  }

  .track-grid,
  .save-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .track-grid,
  .save-grid {
    grid-template-columns: 1fr;
  }
}
</style>
