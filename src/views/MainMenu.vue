<template>
  <main class="main-menu">
    <button type="button" class="menu-audio-toggle" :class="{ active: bgmEnabled }" @click="handleToggleBgm">
      <span class="menu-audio-toggle-inner">
        <component :is="bgmEnabled ? Volume2 : VolumeX" :size="16" />
        <small>{{ bgmEnabled ? '静音' : '开声' }}</small>
      </span>
    </button>

    <!-- === 顶部标题 === -->
    <div class="menu-header">
      <h1 class="game-title">我欲修仙</h1>
      <p class="game-subtitle">— 文字修仙 · 万劫轮回 —</p>
    </div>

    <!-- === 存档选择 / 主页 === -->
    <div v-if="currentScreen === 'home'" class="menu-body">
      <div class="home-buttons">
        <button
          v-if="hasAnySave"
          class="btn-home btn-continue"
          @click="handleContinue"
        >
          <span class="btn-icon"><Volume2 :size="20" /></span>
          <span class="btn-label">
            <strong>继续修途</strong>
            <small>从上次离开的地方继续</small>
          </span>
        </button>

        <button class="btn-home btn-new" @click="handleNewGame">
          <span class="btn-icon"><Sparkles :size="20" /></span>
          <span class="btn-label">
            <strong>开始新篇章</strong>
            <small>创建新的角色，踏入修仙界</small>
          </span>
        </button>

        <button class="btn-home btn-slots" @click="currentScreen = 'saves'">
          <span class="btn-icon"><FolderOpen :size="20" /></span>
          <span class="btn-label">
            <strong>存档管理</strong>
            <small>{{ saveSlotsCount }} / 5 个存档槽</small>
          </span>
        </button>

        <button class="btn-home btn-settings" @click="currentScreen = 'settings'">
          <span class="btn-icon"><Settings :size="20" /></span>
          <span class="btn-label">
            <strong>设置</strong>
            <small>音画、重置与关于</small>
          </span>
        </button>
      </div>

      <!-- 版本信息 -->
      <div class="version-info">
        <small>v0.1.0 · 青云界</small>
      </div>
    </div>

    <!-- === 存档管理 === -->
    <div v-else-if="currentScreen === 'saves'" class="menu-body">
      <div class="screen-header">
        <button class="btn-back" @click="currentScreen = 'home'">← 返回</button>
        <h2>存档管理</h2>
      </div>

      <div class="save-slots">
        <div
          v-for="(slot, i) in saveSlots"
          :key="i"
          class="save-slot"
          :class="{ 'has-data': slot.hasData, 'empty': !slot.hasData }"
          @click="slot.hasData ? handleLoadSlot(i) : undefined"
        >
          <div class="slot-index">#{{ i + 1 }}</div>
          <div v-if="slot.hasData" class="slot-content">
            <div class="slot-header">
              <span class="slot-name">{{ slot.playerName }}</span>
              <span class="slot-realm">{{ slot.playerRealm }}</span>
            </div>
            <div class="slot-stats">
              <small>修为 {{ formatBigNum(slot.cultivation) }}</small>
              <small>灵石 {{ formatBigNum(slot.gold) }}</small>
            </div>
            <div class="slot-time">{{ slot.savedAtLabel }}</div>
          </div>
          <div v-else class="slot-empty">
            <span>空存档</span>
          </div>
        </div>
      </div>
    </div>

    <!-- === 设置 === -->
    <div v-else-if="currentScreen === 'settings'" class="menu-body">
      <div class="screen-header">
        <button class="btn-back" @click="currentScreen = 'home'">← 返回</button>
        <h2>设置</h2>
      </div>

      <div class="settings-card">
        <div class="setting-row">
          <span>音效</span>
          <button class="toggle-btn" :class="{ on: bgmEnabled }" @click="handleToggleBgm">
            {{ bgmEnabled ? '开' : '关' }}
          </button>
        </div>
        <div class="setting-row danger">
          <span>重置游戏</span>
          <button class="btn-danger" @click="showResetConfirm = true">重置</button>
        </div>
      </div>
    </div>

    <!-- === 创建角色（原有流程） === -->
    <div v-else class="menu-body create-body">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div
          v-for="(s, i) in steps"
          :key="s.key"
          class="step-dot"
          :class="{ active: i === currentStepIndex, done: i < currentStepIndex }"
        >
          <span>{{ i < currentStepIndex ? '✓' : s.num }}</span>
          <small>{{ s.label }}</small>
        </div>
      </div>

      <!-- Step 1: 性别 -->
      <div v-if="creation.currentStep.value === 'gender'" class="step-content">
        <div class="step-title">
          <h2>选择你的道途</h2>
          <p class="step-desc">男女性别有不同视角。</p>
        </div>
        <div class="gender-cards">
          <button class="gender-card" @click="creation.selectGender('male')">
            <span class="gender-icon">♂</span>
            <strong>男主 · 云逸</strong>
            <p>执剑问道，遇苏清鸢于微末之时。</p>
          </button>
          <button class="gender-card" @click="creation.selectGender('female')">
            <span class="gender-icon">♀</span>
            <strong>女主 · 苏清鸢</strong>
            <p>身负轮回记忆，破笼而出。</p>
          </button>
        </div>
      </div>

      <!-- Step 2: 灵根 -->
      <div v-if="creation.currentStep.value === 'spirit_root'" class="step-content">
        <div class="step-title">
          <h2>灵根觉醒</h2>
          <p class="step-desc">天机盘转动，你的根骨将决定修仙之路的起点。</p>
        </div>
        <div class="root-display" v-if="creation.spiritRoot.value">
          <div class="root-element" :style="{ color: rootColor }">
            {{ creation.spiritRoot.value.primaryElement }}
            <span v-if="creation.spiritRoot.value.secondaryElement">·{{ creation.spiritRoot.value.secondaryElement }}</span>
          </div>
          <div class="root-grade" :style="{ color: rootColor }">
            [{{ rootLabel }}] {{ rootName }}
          </div>
          <div class="root-stats">
            <div class="root-stat">
              <small>修炼速度</small>
              <strong>+{{ (creation.spiritRoot.value.cultivationSpeedBonus * 100).toFixed(0) }}%</strong>
            </div>
            <div class="root-stat">
              <small>元素亲和</small>
              <strong>+{{ (creation.spiritRoot.value.elementAffinity * 100).toFixed(0) }}%</strong>
            </div>
            <div class="root-stat">
              <small>突破加成</small>
              <strong>+{{ (creation.spiritRoot.value.breakthroughBonus * 100).toFixed(0) }}%</strong>
            </div>
            <div class="root-stat">
              <small>技能槽</small>
              <strong>{{ creation.spiritRoot.value.skillSlots }}</strong>
            </div>
          </div>
        </div>
        <div class="root-actions">
          <button class="btn-primary" @click="creation.rerollSpiritRoot()" :disabled="creation.rerollsRemaining.value <= 0">
            <RefreshCw :size="16" /> 重测 ({{ creation.rerollsRemaining.value }}/3)
          </button>
          <button class="btn-primary" @click="creation.acceptSpiritRoot()">
            ✓ 接受
          </button>
        </div>
      </div>

      <!-- Step 3: 血脉 -->
      <div v-if="creation.currentStep.value === 'bloodline'" class="step-content">
        <div class="step-title">
          <h2>血脉觉醒</h2>
          <p class="step-desc">深埋在你体内的先天血脉，开始苏醒……</p>
        </div>
        <div class="bloodline-display" v-if="creation.bloodline.value">
          <div class="bloodline-name" :style="{ color: bloodlineColor }">
            {{ bloodlineName }}
          </div>
          <p class="bloodline-desc">{{ creation.bloodline.value.description }}</p>
          <div class="bloodline-stats compact-stats">
            <div class="bl-stat" v-if="creation.bloodline.value.statBonuses.attackPercent">
              <small>攻击</small><strong>+{{ (creation.bloodline.value.statBonuses.attackPercent * 100).toFixed(0) }}%</strong>
            </div>
            <div class="bl-stat" v-if="creation.bloodline.value.statBonuses.defensePercent">
              <small>防御</small><strong>+{{ (creation.bloodline.value.statBonuses.defensePercent * 100).toFixed(0) }}%</strong>
            </div>
            <div class="bl-stat" v-if="creation.bloodline.value.statBonuses.hpPercent">
              <small>气血</small><strong>+{{ (creation.bloodline.value.statBonuses.hpPercent * 100).toFixed(0) }}%</strong>
            </div>
            <div class="bl-stat">
              <small>修炼</small><strong>+{{ (creation.bloodline.value.cultivationBonus * 100).toFixed(0) }}%</strong>
            </div>
          </div>
        </div>
        <div class="naming-section">
          <label class="name-field">
            <small>道号</small>
            <input v-model="characterName" maxlength="8" placeholder="输入你的道号…" />
          </label>
        </div>
        <button class="btn-primary btn-complete" @click="handleCompleteCreation">
          <span class="btn-icon"><Star :size="20" /></span> 踏入修仙界
        </button>
      </div>
    </div>

    <!-- 重置确认弹窗 -->
    <Transition name="fade">
      <div v-if="showResetConfirm" class="confirm-overlay" @click.self="showResetConfirm = false">
        <div class="confirm-card">
          <h3>确认重置</h3>
          <p>重置将清除所有存档数据，此操作不可撤销。</p>
          <div class="confirm-actions">
            <button class="btn-secondary" @click="showResetConfirm = false">取消</button>
            <button class="btn-danger" @click="handleReset">确认重置</button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FolderOpen, RefreshCw, Settings, Sparkles, Star, Volume2, VolumeX } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/playerStore'
import { useAudio } from '@/composables/useAudio'
import { useCharacterCreation } from '@/composables/useCharacterCreation'
import { useSaveSlots } from '@/composables/useSaveSlots'
import { getSpiritRootName } from '@/types/spiritRoot'
import { getBloodlineName } from '@/types/bloodline'
import { ROOT_GRADE_STATS } from '@/types/spiritRoot'
import { BLOODLINE_GRADE_BASE } from '@/types/bloodline'

const router = useRouter()
const playerStore = usePlayerStore()
const { bgmEnabled, toggleBgm } = useAudio()
const creation = useCharacterCreation()
const { saveSlots, hasAnySave, getLastSaveSlot, loadFromSlot, refreshSlots, saveToSlot } = useSaveSlots()
const characterName = ref('')
const showResetConfirm = ref(false)
const currentScreen = ref<'home' | 'saves' | 'settings' | 'create'>('home')

const saveSlotsCount = computed(() => saveSlots.value.filter(s => s.hasData).length)

const steps = [
  { num: '一', key: 'gender', label: '道途' },
  { num: '二', key: 'spirit_root', label: '灵根' },
  { num: '三', key: 'bloodline', label: '血脉' }
]

const currentStepIndex = computed(() => {
  const step = creation.currentStep.value
  return steps.findIndex(s => s.key === step)
})

const rootColor = computed(() => {
  if (!creation.spiritRoot.value) return '#9ca3af'
  return ROOT_GRADE_STATS[creation.spiritRoot.value.grade]?.color ?? '#9ca3af'
})

const rootLabel = computed(() => {
  if (!creation.spiritRoot.value) return ''
  return ROOT_GRADE_STATS[creation.spiritRoot.value.grade]?.label ?? ''
})

const rootName = computed(() => {
  if (!creation.spiritRoot.value) return ''
  return getSpiritRootName(creation.spiritRoot.value)
})

const bloodlineColor = computed(() => {
  if (!creation.bloodline.value) return '#9ca3af'
  return BLOODLINE_GRADE_BASE[creation.bloodline.value.grade]?.color ?? '#9ca3af'
})

const bloodlineName = computed(() => {
  if (!creation.bloodline.value) return ''
  return getBloodlineName(creation.bloodline.value)
})

function handleContinue() {
  const lastSlot = getLastSaveSlot()
  if (lastSlot >= 0) {
    loadFromSlot(lastSlot)
    router.push('/game/cultivation')
  } else {
    // 没有最近的存档，进入存档管理
    currentScreen.value = 'saves'
  }
}

function handleNewGame() {
  creation.reset()
  currentScreen.value = 'create'
}

function handleLoadSlot(slotIndex: number) {
  if (loadFromSlot(slotIndex)) {
    router.push('/game/cultivation')
  }
}

function handleCompleteCreation() {
  creation.completeCreation(characterName.value)
  if (creation.currentStep.value === 'completed') {
    // 自动保存到第一个空槽位
    const emptySlot = saveSlots.value.findIndex(s => !s.hasData)
    if (emptySlot >= 0) saveToSlot(emptySlot)
    router.push('/game/cultivation')
  }
}

function handleReset() {
  localStorage.clear()
  showResetConfirm.value = false
  refreshSlots()
  window.location.reload()
}

function handleToggleBgm() {
  toggleBgm()
}

function formatBigNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}m`
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.floor(n))
}

onMounted(() => {
  refreshSlots()
})
</script>

<style scoped>
.main-menu {
  position: relative;
  min-height: 100vh; min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 16px 40px;
  color: #315257;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 226, 145, 0.34), transparent 24%),
    radial-gradient(circle at 86% 10%, rgba(108, 203, 180, 0.26), transparent 30%),
    linear-gradient(120deg, transparent 0 34%, rgba(255, 237, 174, 0.28) 34% 35%, transparent 35% 100%),
    linear-gradient(135deg, rgba(248, 255, 244, 0.98) 0%, rgba(235, 249, 243, 0.96) 46%, rgba(255, 248, 226, 0.94) 100%);
  font-family: var(--font-game, serif);
}

/* Audio toggle */
.menu-audio-toggle {
  position: fixed;
  top: calc(14px + env(safe-area-inset-top, 0px));
  right: 14px;
  z-index: 10;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(103, 149, 144, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 250, 0.84);
  color: #4b6767;
  font-size: 11px;
  font-family: inherit;
  backdrop-filter: blur(14px);
  cursor: pointer;
}

.menu-audio-toggle.active {
  border-color: rgba(188, 141, 58, 0.3);
  background: rgba(255, 249, 233, 0.9);
  color: #8b6226;
}

/* Header */
.menu-header {
  text-align: center;
  padding: 0 0 32px;
}

.game-title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  color: #8e6227;
  letter-spacing: 8px;
  text-shadow: 0 2px 8px rgba(188, 141, 58, 0.2);
}

.game-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(49, 82, 87, 0.5);
  letter-spacing: 2px;
}

/* Menu body */
.menu-body {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Home buttons */
.home-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-home {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 60px;
  padding: 14px 18px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: transform 0.12s, box-shadow 0.12s;
}

.btn-home:active {
  transform: scale(0.98);
}

.btn-continue {
  border-color: rgba(188, 141, 58, 0.35);
  background: linear-gradient(180deg, rgba(255, 249, 233, 0.92), rgba(255, 245, 220, 0.88));
  box-shadow: 0 4px 16px rgba(188, 141, 58, 0.15);
}

.btn-icon {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(255, 248, 229, 0.9);
  font-size: 20px;
  border: 1px solid rgba(188, 141, 58, 0.2);
}

.btn-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-label strong {
  font-size: 15px;
  color: #315257;
}

.btn-label small {
  font-size: 11px;
  color: rgba(49, 82, 87, 0.6);
}

.version-info {
  text-align: center;
  padding-top: 8px;
  color: rgba(49, 82, 87, 0.3);
  font-size: 11px;
}

/* Screen header */
.screen-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 0 8px;
}

.screen-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #8e6227;
}

.btn-back {
  padding: 6px 12px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  color: #315257;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

/* Save slots */
.save-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}

.save-slot.has-data:active {
  border-color: rgba(188, 141, 58, 0.3);
  background: rgba(255, 249, 233, 0.8);
}

.slot-index {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(111, 157, 149, 0.12);
  color: rgba(49, 82, 87, 0.6);
  font-size: 11px;
  font-weight: 700;
}

.save-slot.has-data .slot-index {
  background: rgba(188, 141, 58, 0.15);
  color: #8b6226;
}

.slot-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.slot-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-name {
  font-size: 14px;
  font-weight: 600;
  color: #315257;
}

.slot-realm {
  font-size: 11px;
  color: #8b6226;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(188, 141, 58, 0.1);
}

.slot-stats {
  display: flex;
  gap: 12px;
}

.slot-stats small {
  font-size: 10px;
  color: rgba(49, 82, 87, 0.55);
}

.slot-time {
  font-size: 10px;
  color: rgba(49, 82, 87, 0.4);
}

.slot-empty {
  color: rgba(49, 82, 87, 0.35);
  font-size: 13px;
}

/* Settings */
.settings-card {
  padding: 14px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.setting-row + .setting-row {
  border-top: 1px solid rgba(111, 157, 149, 0.1);
}

.setting-row span {
  font-size: 14px;
  color: #315257;
}

.toggle-btn {
  min-width: 48px;
  padding: 6px 14px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 8px;
  background: rgba(111, 157, 149, 0.08);
  color: #315257;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.toggle-btn.on {
  border-color: rgba(188, 141, 58, 0.3);
  background: rgba(255, 249, 233, 0.8);
  color: #8b6226;
}

.btn-danger {
  padding: 6px 14px;
  border: 1px solid rgba(195, 80, 80, 0.3);
  border-radius: 8px;
  background: rgba(195, 80, 80, 0.08);
  color: #c35050;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(49, 82, 87, 0.3);
  backdrop-filter: blur(3px);
}

.confirm-card {
  width: 100%; max-width: 320px;
  padding: 24px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 250, 0.98);
  box-shadow: 0 24px 48px rgba(49, 82, 87, 0.2);
}

.confirm-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
  color: #c35050;
}

.confirm-card p {
  margin: 0 0 20px;
  font-size: 13px;
  color: rgba(49, 82, 87, 0.7);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  color: #315257;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

/* Step indicator & creation (preserved from original) */
.step-indicator {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(111,157,149,0.16);
  border-radius: 14px;
  background: rgba(255,255,255,0.66);
}

.step-dot {
  display: grid;
  place-items: center;
  gap: 4px;
}

.step-dot span {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: rgba(111,157,149,0.14);
  color: rgba(49,82,87,0.5);
  font-size: 12px; font-weight: 800;
}

.step-dot.active span {
  background: rgba(255,244,208,0.9);
  color: #8b6226;
  box-shadow: 0 0 0 2px rgba(188,141,58,0.2);
}

.step-dot.done span {
  background: #7eb8da; color: #fff;
}

.step-dot small {
  font-size: 10px;
  color: rgba(49,82,87,0.6);
}

.step-content {
  padding: 20px;
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 250, 0.92);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-title h2 {
  margin: 0;
  font-size: 20px;
  color: #8e6227;
}

.step-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(49,82,87,0.68);
  line-height: 1.5;
}

.gender-cards {
  display: grid;
  gap: 10px;
}

.gender-card {
  padding: 16px;
  border: 1px solid rgba(111,157,149,0.2);
  border-radius: 14px;
  background: rgba(255,255,255,0.58);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}

.gender-card:active {
  border-color: rgba(188,141,58,0.38);
  background: rgba(255,247,220,0.86);
}

.gender-icon {
  font-size: 30px;
}

.gender-card strong {
  font-size: 15px;
  color: #315257;
}

.gender-card p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(49,82,87,0.68);
}

.root-display {
  text-align: center;
  padding: 20px 14px;
  border: 1px solid rgba(188,141,58,0.22);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,251,236,0.78), rgba(241,252,247,0.64));
}

.root-element {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 4px;
}

.root-grade {
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
}

.root-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 14px;
}

.root-stat {
  padding: 6px;
  border-radius: 8px;
  background: rgba(255,255,255,0.56);
}

.root-stat small {
  font-size: 10px;
  color: rgba(49,82,87,0.6);
}

.root-stat strong {
  font-size: 14px;
  color: #8e6227;
  display: block;
}

.root-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-primary {
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid rgba(188, 141, 58, 0.28);
  border-radius: 12px;
  background: linear-gradient(180deg, #fff3c5, #bfe9d4);
  color: #735022;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-complete {
  min-height: 50px;
  font-size: 16px;
}

.bloodline-display {
  text-align: center;
  padding: 20px 14px;
  border: 1px solid rgba(188,141,58,0.22);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,251,236,0.78), rgba(241,252,247,0.64));
}

.bloodline-name {
  font-size: 20px;
  font-weight: 800;
}

.bloodline-desc {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(49,82,87,0.72);
  line-height: 1.6;
}

.bloodline-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 14px;
}

.bl-stat {
  padding: 6px;
  border-radius: 8px;
  background: rgba(255,255,255,0.56);
}

.bl-stat small {
  font-size: 10px;
  color: rgba(49,82,87,0.6);
}

.bl-stat strong {
  font-size: 13px;
  color: #8e6227;
  display: block;
}

.naming-section {
  display: grid;
  gap: 8px;
}

.name-field small {
  font-size: 11px;
  color: rgba(49,82,87,0.6);
}

.name-field input {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(111,157,149,0.22);
  border-radius: 10px;
  outline: none;
  background: rgba(255,255,255,0.72);
  color: #315257;
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .main-menu {
    padding: 40px 14px 30px;
  }
  .game-title {
    font-size: 30px;
  }
  .menu-body {
    gap: 10px;
  }
  .btn-home {
    min-height: 54px;
    padding: 12px 14px;
  }
}

.create-body {
  overflow-y: auto;
  max-height: 80vh;
}
</style>
