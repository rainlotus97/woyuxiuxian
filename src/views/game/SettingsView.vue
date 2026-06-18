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

    <GameSurface
      tone="mist"
      padding="md"
      eyebrow="P0 验收"
      title="当前计划"
      :subtitle="p0Report.headline"
    >
      <div class="p0-report">
        <div class="p0-report-head">
          <div>
            <span>{{ p0Report.stageLabel }} · {{ p0Report.gateLabel }}</span>
            <strong>{{ p0Report.progressText }}</strong>
          </div>
          <i class="p0-report-meter" aria-hidden="true">
            <b :style="{ width: `${p0Report.progressPercent}%` }"></b>
          </i>
        </div>

        <div class="p0-next-card">
          <span>下一步</span>
          <strong>{{ p0Report.nextActionTitle }}</strong>
          <p>{{ p0Report.nextActionReason }}</p>
        </div>

        <div class="p0-report-columns">
          <div class="p0-report-column">
            <div class="p0-column-title">
              <span>已闭环</span>
              <strong>{{ p0Report.acceptedCount }}</strong>
            </div>
            <div class="p0-chip-list">
              <span
                v-for="item in p0Report.acceptedItems"
                :key="item.id"
                class="p0-report-chip"
                :class="`p0-tone-${item.tone}`"
              >
                {{ item.label }} · {{ item.stateLabel }}
              </span>
              <span v-if="p0Report.acceptedItems.length === 0" class="p0-report-empty">暂无闭环项</span>
            </div>
          </div>

          <div class="p0-report-column">
            <div class="p0-column-title">
              <span>待补</span>
              <strong>{{ p0Report.remainingCount }}</strong>
            </div>
            <div class="p0-gap-list">
              <article
                v-for="item in p0Report.remainingItems"
                :key="item.id"
                class="p0-gap-card"
                :class="`p0-tone-${item.tone}`"
              >
                <span>{{ item.stateLabel }}</span>
                <strong>{{ item.label }}</strong>
                <p>{{ item.detail }}</p>
                <small>{{ item.nextAction }}</small>
              </article>
            </div>
          </div>
        </div>
      </div>
    </GameSurface>

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
import { useP0LoopStatus } from '@/composables/useP0LoopStatus'
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
const { p0Report } = useP0LoopStatus()

const {
  sfxEnabled,
  bgmEnabled,
  currentBgmType,
  toggleSfx,
  toggleBgm,
  setBgmEnabled,
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
  setBgmEnabled(false)
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

.p0-report {
  display: grid;
  gap: 12px;
}

.p0-report-head {
  display: grid;
  grid-template-columns: minmax(0, 0.4fr) minmax(180px, 1fr);
  gap: 14px;
  align-items: center;
}

.p0-report-head > div {
  display: grid;
  gap: 4px;
}

.p0-report-head span,
.p0-next-card span,
.p0-column-title span,
.p0-gap-card span {
  color: rgba(67, 92, 90, 0.68);
  font-size: 11px;
}

.p0-report-head strong {
  color: #8b6226;
  font-size: 18px;
}

.p0-report-meter {
  height: 10px;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(103, 149, 144, 0.12);
  box-shadow: inset 0 0 0 1px rgba(103, 149, 144, 0.1);
}

.p0-report-meter b {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, #74d3b7, #ffd66f);
}

.p0-next-card {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(194, 146, 66, 0.2);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.82), rgba(242, 253, 247, 0.66)),
    radial-gradient(circle at top right, rgba(255, 220, 132, 0.16), transparent 60%);
}

.p0-next-card strong {
  color: #315257;
  font-size: 14px;
}

.p0-next-card p,
.p0-gap-card p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 11px;
  line-height: 1.6;
}

.p0-report-columns {
  display: grid;
  grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
  gap: 12px;
}

.p0-report-column,
.p0-chip-list,
.p0-gap-list {
  display: grid;
  gap: 8px;
}

.p0-column-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.p0-column-title strong {
  color: #8b6226;
  font-size: 14px;
}

.p0-chip-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.p0-report-chip,
.p0-report-empty {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.62);
  color: rgba(49, 82, 87, 0.74);
  font-size: 10px;
  text-align: center;
}

.p0-gap-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.p0-gap-card {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
}

.p0-gap-card strong {
  color: #315257;
  font-size: 13px;
}

.p0-gap-card small {
  overflow: hidden;
  color: #8b6226;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p0-tone-jade {
  border-color: rgba(88, 164, 143, 0.22);
  background: rgba(239, 252, 247, 0.84);
}

.p0-tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 249, 232, 0.84);
}

.p0-tone-rose {
  border-color: rgba(199, 121, 138, 0.22);
  background: rgba(255, 244, 247, 0.84);
}

.sfx-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 760px) {
  .settings-grid,
  .settings-hero,
  .p0-report-head,
  .p0-report-columns {
    grid-template-columns: 1fr;
  }

  .sound-orb {
    width: 58px;
    border-radius: 20px;
  }

  .track-grid,
  .save-grid,
  .p0-chip-list,
  .p0-gap-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .track-grid,
  .save-grid,
  .p0-chip-list,
  .p0-gap-list {
    grid-template-columns: 1fr;
  }
}
</style>
