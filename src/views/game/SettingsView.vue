<template>
  <div class="settings-view">
    <div class="game-panel">
      <h2 class="panel-title">音效测试</h2>
      <p class="panel-desc">试听修仙音效与背景音乐</p>

      <!-- 音频开关 -->
      <div class="section">
        <h3 class="section-title">音频设置</h3>
        <div class="setting-item">
          <span class="setting-label">音效</span>
          <GameButton @click="toggleSfx">
            {{ sfxEnabled ? '开启' : '关闭' }}
          </GameButton>
        </div>
        <div class="setting-item">
          <span class="setting-label">背景音乐</span>
          <GameButton @click="toggleBgm">
            {{ bgmEnabled ? '开启' : '关闭' }}
          </GameButton>
        </div>
      </div>

      <!-- BGM 切换 -->
      <div class="section">
        <h3 class="section-title">背景音乐</h3>
        <p class="current-bgm" v-if="currentBgmType">
          当前播放: {{ getCurrentBgmName() }}
        </p>
        <p class="current-bgm" v-else>
          未播放
        </p>

        <div v-for="category in bgmCategories" :key="category" class="bgm-category">
          <h4 class="category-title">{{ category }}</h4>
          <div class="bgm-grid">
            <GameButton
              v-for="bgm in getBgmByCategory(category)"
              :key="bgm.type"
              @click="handleSwitchBgm(bgm.type)"
              :class="{ active: currentBgmType === bgm.type }"
            >
              {{ bgm.name }}
            </GameButton>
          </div>
        </div>

        <div class="bgm-controls">
          <GameButton @click="handleStopBgm">停止播放</GameButton>
        </div>
      </div>

      <!-- 音效试听 -->
      <div class="section">
        <h3 class="section-title">音效试听</h3>

        <div v-for="category in sfxCategories" :key="category" class="sfx-category">
          <h4 class="category-title">{{ category }}</h4>
          <div class="sfx-grid">
            <div
              v-for="sfx in getSfxByCategory(category)"
              :key="sfx.name"
              class="sfx-item"
              @click="handlePlaySfx(sfx)"
            >
              <div class="sfx-name">{{ sfx.description }}</div>
              <div class="sfx-fn">{{ sfx.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他测试 -->
      <div class="section">
        <h3 class="section-title">其他测试</h3>
        <div class="test-buttons">
          <GameButton @click="testToast">测试Toast</GameButton>
          <GameButton @click="testAnnouncement">测试公告</GameButton>
          <GameButton @click="testItem">测试物品</GameButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudio, SFX_LIST, sfxClick } from '@/composables/useAudio'
import { useToast } from '@/composables/useToast'
import { useModal } from '@/composables/useModal'
import GameButton from '@/components/common/GameButton.vue'
import type { BgmType } from '@/composables/useAudio'

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

const { info, success, warning, error } = useToast()
const { showAnnouncement, showItemAcquire } = useModal()

const bgmList = getBgmList()

// BGM 分类
const bgmCategories = ['门派', '四季', '战斗', '特殊']

const getBgmByCategory = (category: string) => {
  return bgmList.filter(bgm => bgm.category === category)
}

const getCurrentBgmName = (): string => {
  if (!currentBgmType.value) return ''
  const bgm = bgmList.find(b => b.type === currentBgmType.value)
  return bgm?.name || ''
}

// 音效分类
const sfxCategories = ['基础', '修炼', '武器', '战斗', '仙法', '天气', '特殊']

const getSfxByCategory = (category: string) => {
  return SFX_LIST.filter(sfx => sfx.category === category)
}

const handleSwitchBgm = (type: BgmType) => {
  sfxClick()
  switchBgm(type)
}

const handleStopBgm = () => {
  sfxClick()
  stopBgm()
}

const handlePlaySfx = (sfx: { name: string; fn: () => void; description: string }) => {
  sfx.fn()
}

const testToast = () => {
  sfxClick()
  info('这是一条信息提示')
  setTimeout(() => success('这是一条成功提示'), 500)
  setTimeout(() => warning('这是一条警告提示'), 1000)
  setTimeout(() => error('这是一条错误提示'), 1500)
}

const testAnnouncement = () => {
  sfxClick()
  showAnnouncement('系统公告', [
    '欢迎来到《我欲修仙》！',
    '这是一款文字修仙游戏。',
    '祝你修仙愉快！',
    '大道三千，只取一瓢。'
  ])
}

const testItem = () => {
  sfxClick()
  showItemAcquire([
    { name: '聚气丹', quantity: 5, quality: 'fine', icon: '丹', description: '可加速修炼的丹药' },
    { name: '玄铁剑', quantity: 1, quality: 'excellent', icon: '剑', description: '由玄铁锻造的利剑' },
    { name: '仙草', quantity: 1, quality: 'supreme', icon: '草', description: '生长于仙界的灵草' }
  ])
}
</script>

<style scoped>
.settings-view {
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 16px 0;
  text-align: center;
}

.section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(126, 184, 218, 0.1);
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  color: var(--color-accent);
  margin: 0 0 12px 0;
}

.category-title {
  font-size: 0.75rem;
  color: var(--color-accent-warm);
  margin: 12px 0 8px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-label {
  font-size: 0.875rem;
  color: rgb(232 228 217);
}

.current-bgm {
  font-size: 0.75rem;
  color: var(--color-success);
  margin: 0 0 12px 0;
  text-align: center;
}

.bgm-category {
  margin-bottom: 8px;
}

.bgm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.bgm-controls {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.sfx-category {
  margin-bottom: 12px;
}

.sfx-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.sfx-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 4px;
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sfx-item:hover {
  border-color: var(--color-accent);
  background: rgba(126, 184, 218, 0.1);
}

.sfx-item:active {
  transform: scale(0.95);
}

.sfx-name {
  font-size: 0.7rem;
  color: rgb(232 228 217);
  margin-bottom: 2px;
}

.sfx-fn {
  font-size: 0.5rem;
  color: var(--color-muted);
  font-family: monospace;
}

.test-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
