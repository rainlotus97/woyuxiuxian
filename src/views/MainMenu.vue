<template>
  <main class="main-menu">
    <div class="menu-backdrop"></div>

    <button type="button" class="menu-audio-toggle" :class="{ active: bgmEnabled }" @click="handleToggleBgm">
      <ThemeHomeIconBadge size="sm">
        <component :is="bgmEnabled ? Volume2 : VolumeX" :size="16" />
      </ThemeHomeIconBadge>
      <span>{{ bgmEnabled ? '静音' : '开声' }}</span>
    </button>

    <div class="menu-shell">
      <template v-if="currentScreen === 'home'">
        <ThemeHomePanelShell class="hero-panel">
          <div class="hero-content">
            <div class="hero-copy">
              <span class="hero-tag">凡骨问道</span>
              <h1 class="game-title">我欲修仙</h1>
              <p class="game-subtitle">文字修仙 · 万劫轮回</p>
            </div>

            <div class="hero-side">
              <div class="hero-stat">
                <span>存档进度</span>
                <strong>{{ saveSlotsCount }}/5</strong>
              </div>
              <div class="hero-stat">
                <span>当前版本</span>
                <strong>青云界 v0.1.0</strong>
              </div>
            </div>

            <div class="hero-actions">
              <ThemeHomeButton
                v-if="hasAnySave"
                size="lg"
                block
                @click="handleContinue"
              >
                <template #icon>
                  <Sparkles :size="16" />
                </template>
                继续修途
              </ThemeHomeButton>

              <ThemeHomeButton size="lg" block @click="handleNewGame">
                <template #icon>
                  <Star :size="16" />
                </template>
                开启新篇
              </ThemeHomeButton>
            </div>
          </div>
        </ThemeHomePanelShell>

        <div class="home-grid">
          <GameSurface
            tone="gold"
            padding="md"
            compact
            clickable
            eyebrow="主线入口"
            title="继续修行"
            :subtitle="hasAnySave ? '沿着最近一次闭关后的进度继续前行。' : '当前没有可继续的进度，请先开启新的修行。'"
            @click="hasAnySave ? handleContinue() : handleNewGame()"
          >
            <div class="menu-card-meta">
              <span>{{ hasAnySave ? '最近存档可直接进入修炼页' : '从性别、灵根与血脉开始塑造角色' }}</span>
              <ThemeHomeIconBadge size="sm">
                <Sparkles :size="16" />
              </ThemeHomeIconBadge>
            </div>
          </GameSurface>

          <GameSurface
            tone="jade"
            padding="md"
            compact
            clickable
            eyebrow="角色创建"
            title="新建道途"
            subtitle="重新投身轮回，选择新的起点与资质。"
            @click="handleNewGame"
          >
            <div class="menu-card-meta">
              <span>保留现有世界风格，用卡片式流程完成建角</span>
              <ThemeHomeIconBadge size="sm">
                <Star :size="16" />
              </ThemeHomeIconBadge>
            </div>
          </GameSurface>

          <GameSurface
            tone="mist"
            padding="md"
            compact
            clickable
            eyebrow="存档"
            title="存档管理"
            :subtitle="`${saveSlotsCount} 个槽位已写入，支持切换不同修行进度。`"
            @click="currentScreen = 'saves'"
          >
            <div class="menu-card-meta">
              <span>查看角色境界、修为、灵石与保存时间</span>
              <ThemeHomeIconBadge size="sm">
                <FolderOpen :size="16" />
              </ThemeHomeIconBadge>
            </div>
          </GameSurface>

          <GameSurface
            tone="realm"
            padding="md"
            compact
            clickable
            eyebrow="系统"
            title="音频与设置"
            subtitle="管理声音开关，并保留危险操作的二次确认。"
            @click="currentScreen = 'settings'"
          >
            <div class="menu-card-meta">
              <span>{{ bgmEnabled ? '背景音当前已开启' : '背景音当前处于关闭状态' }}</span>
              <ThemeHomeIconBadge size="sm">
                <Settings :size="16" />
              </ThemeHomeIconBadge>
            </div>
          </GameSurface>
        </div>

        <GameSurface tone="mist" padding="md" compact class="menu-note-card">
          <div class="menu-note">
            <div>
              <span>界面基准</span>
              <strong>iPhone 12 Pro</strong>
            </div>
            <p>首页已回归与修炼、地图、设置页一致的玉青金边卡片体系。</p>
          </div>
        </GameSurface>
      </template>

      <template v-else-if="currentScreen === 'saves'">
        <GameSurface
          tone="gold"
          padding="lg"
          eyebrow="存档总览"
          title="存档管理"
          subtitle="不同轮回与角色进度统一陈列，点击已有槽位即可载入。"
          class="screen-shell"
        >
          <template #header>
            <button class="ghost-back" type="button" @click="currentScreen = 'home'">返回首页</button>
          </template>

          <div class="save-list">
            <GameSurface
              v-for="(slot, i) in saveSlots"
              :key="i"
              :tone="slot.hasData ? 'gold' : 'mist'"
              padding="md"
              compact
              :clickable="slot.hasData"
              class="save-slot-card"
              @click="slot.hasData ? handleLoadSlot(i) : undefined"
            >
              <div class="save-slot-head">
                <div class="save-slot-index">存档 {{ i + 1 }}</div>
                <span class="save-slot-state" :class="{ empty: !slot.hasData }">
                  {{ slot.hasData ? '可载入' : '空槽位' }}
                </span>
              </div>

              <template v-if="slot.hasData">
                <div class="save-slot-main">
                  <strong>{{ slot.playerName }}</strong>
                  <span>{{ slot.playerRealm }}</span>
                </div>
                <div class="save-slot-stats">
                  <div>
                    <small>修为</small>
                    <strong>{{ formatBigNum(slot.cultivation) }}</strong>
                  </div>
                  <div>
                    <small>灵石</small>
                    <strong>{{ formatBigNum(slot.gold) }}</strong>
                  </div>
                </div>
                <p class="save-slot-time">{{ slot.savedAtLabel }}</p>
              </template>

              <p v-else class="save-slot-empty-copy">尚未写入角色进度，可在创建角色后自动保存到空槽位。</p>
            </GameSurface>
          </div>
        </GameSurface>
      </template>

      <template v-else-if="currentScreen === 'settings'">
        <div class="settings-stack">
          <GameSurface
            tone="mist"
            padding="lg"
            eyebrow="系统设置"
            title="音频与数据"
            subtitle="保持与游戏内设置页一致的清爽玉色结构，只保留首页真正需要的控制项。"
          >
            <template #header>
              <button class="ghost-back" type="button" @click="currentScreen = 'home'">返回首页</button>
            </template>

            <div class="settings-hero">
              <ThemeHomeIconBadge size="lg">
                <component :is="bgmEnabled ? Volume2 : VolumeX" :size="24" />
              </ThemeHomeIconBadge>
              <div class="settings-hero-copy">
                <span>声音状态</span>
                <strong>{{ bgmEnabled ? '背景音已开启' : '背景音已关闭' }}</strong>
                <p>默认不自动播放，保留用户主动开启的行为方式。</p>
              </div>
            </div>
          </GameSurface>

          <GameSurface tone="gold" padding="md" title="声音控制" subtitle="保持轻量，只在首页提供最常用的开关。">
            <div class="settings-row">
              <div class="settings-row-copy">
                <strong>背景音乐</strong>
                <small>{{ bgmEnabled ? '当前允许播放 BGM' : '当前已静音' }}</small>
              </div>
              <ThemeHomeButton size="sm" @click="handleToggleBgm">
                {{ bgmEnabled ? '关闭' : '开启' }}
              </ThemeHomeButton>
            </div>
          </GameSurface>

          <GameSurface tone="realm" padding="md" title="危险操作" subtitle="清除本地数据前维持二次确认，避免误触。">
            <div class="settings-row danger-row">
              <div class="settings-row-copy">
                <strong>重置游戏</strong>
                <small>会清空全部本地存档与缓存状态。</small>
              </div>
              <GameActionButton tone="rose" @click="showResetConfirm = true">重置</GameActionButton>
            </div>
          </GameSurface>
        </div>
      </template>

      <template v-else>
        <div class="creation-shell">
          <GameSurface
            tone="gold"
            padding="lg"
            eyebrow="角色创建"
            title="踏入修仙界"
            subtitle="维持游戏内页的卡片布局，将建角流程收束成一组移动端可读性更高的步骤卡。"
          >
            <template #header>
              <button class="ghost-back" type="button" @click="currentScreen = 'home'">返回首页</button>
            </template>

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
          </GameSurface>

          <GameSurface
            v-if="creation.currentStep.value === 'gender'"
            tone="mist"
            padding="lg"
            title="选择你的道途"
            subtitle="男女性别会带来不同叙事视角，整体保持与现有世界观一致。"
          >
            <div class="option-grid">
              <button class="choice-card" type="button" @click="creation.selectGender('male')">
                <span class="choice-symbol">♂</span>
                <strong>男主 · 云逸</strong>
                <p>执剑问道，于微末之间起势。</p>
              </button>
              <button class="choice-card" type="button" @click="creation.selectGender('female')">
                <span class="choice-symbol">♀</span>
                <strong>女主 · 苏清鸢</strong>
                <p>身负轮回残忆，自困局中破局。</p>
              </button>
            </div>
          </GameSurface>

          <GameSurface
            v-if="creation.currentStep.value === 'spirit_root'"
            tone="gold"
            padding="lg"
            title="灵根觉醒"
            subtitle="天机盘转动后，根骨资质会决定修炼效率与突破优势。"
          >
            <div v-if="creation.spiritRoot.value" class="awakening-card" :style="{ '--accent-color': rootColor }">
              <div class="awakening-heading">
                <span class="awakening-element">
                  {{ creation.spiritRoot.value.primaryElement }}
                  <small v-if="creation.spiritRoot.value.secondaryElement">·{{ creation.spiritRoot.value.secondaryElement }}</small>
                </span>
                <strong>[{{ rootLabel }}] {{ rootName }}</strong>
              </div>

              <div class="awakening-stats">
                <div class="awakening-stat">
                  <small>修炼速度</small>
                  <strong>+{{ (creation.spiritRoot.value.cultivationSpeedBonus * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat">
                  <small>元素亲和</small>
                  <strong>+{{ (creation.spiritRoot.value.elementAffinity * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat">
                  <small>突破加成</small>
                  <strong>+{{ (creation.spiritRoot.value.breakthroughBonus * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat">
                  <small>技能槽</small>
                  <strong>{{ creation.spiritRoot.value.skillSlots }}</strong>
                </div>
              </div>
            </div>

            <div class="action-row">
              <ThemeHomeButton size="md" block :disabled="creation.rerollsRemaining.value <= 0" @click="creation.rerollSpiritRoot()">
                <template #icon>
                  <RefreshCw :size="16" />
                </template>
                重测 ({{ creation.rerollsRemaining.value }}/3)
              </ThemeHomeButton>
              <ThemeHomeButton size="md" block @click="creation.acceptSpiritRoot()">接受灵根</ThemeHomeButton>
            </div>
          </GameSurface>

          <GameSurface
            v-if="creation.currentStep.value === 'bloodline'"
            tone="realm"
            padding="lg"
            title="血脉觉醒"
            subtitle="最后确认你的血脉与道号，随后正式踏入修仙界。"
          >
            <div v-if="creation.bloodline.value" class="awakening-card bloodline-card" :style="{ '--accent-color': bloodlineColor }">
              <div class="awakening-heading">
                <span class="awakening-eyebrow">先天血脉</span>
                <strong>{{ bloodlineName }}</strong>
              </div>
              <p class="bloodline-desc">{{ creation.bloodline.value.description }}</p>

              <div class="awakening-stats">
                <div class="awakening-stat" v-if="creation.bloodline.value.statBonuses.attackPercent">
                  <small>攻击</small>
                  <strong>+{{ (creation.bloodline.value.statBonuses.attackPercent * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat" v-if="creation.bloodline.value.statBonuses.defensePercent">
                  <small>防御</small>
                  <strong>+{{ (creation.bloodline.value.statBonuses.defensePercent * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat" v-if="creation.bloodline.value.statBonuses.hpPercent">
                  <small>气血</small>
                  <strong>+{{ (creation.bloodline.value.statBonuses.hpPercent * 100).toFixed(0) }}%</strong>
                </div>
                <div class="awakening-stat">
                  <small>修炼</small>
                  <strong>+{{ (creation.bloodline.value.cultivationBonus * 100).toFixed(0) }}%</strong>
                </div>
              </div>
            </div>

            <label class="name-field">
              <span>道号</span>
              <input v-model="characterName" maxlength="8" placeholder="输入你的道号" />
            </label>

            <ThemeHomeButton size="lg" block @click="handleCompleteCreation">
              <template #icon>
                <Star :size="18" />
              </template>
              踏入修仙界
            </ThemeHomeButton>
          </GameSurface>
        </div>
      </template>
    </div>

    <GameDialog
      :visible="showResetConfirm"
      title="此操作不可撤销"
      eyebrow="确认重置"
      @close="showResetConfirm = false"
    >
      <p class="confirm-dialog-copy">将清除所有本地存档、设置与缓存状态，请确认当前没有需要保留的进度。</p>
      <template #footer>
        <GameActionButton tone="stone" @click="showResetConfirm = false">取消</GameActionButton>
        <GameActionButton tone="rose" @click="handleReset">确认重置</GameActionButton>
      </template>
    </GameDialog>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FolderOpen, RefreshCw, Settings, Sparkles, Star, Volume2, VolumeX } from 'lucide-vue-next'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import ThemeHomeButton from '@/components/theme/homepage/ThemeHomeButton.vue'
import ThemeHomeIconBadge from '@/components/theme/homepage/ThemeHomeIconBadge.vue'
import ThemeHomePanelShell from '@/components/theme/homepage/ThemeHomePanelShell.vue'
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
    currentScreen.value = 'saves'
  }
}

function handleNewGame() {
  creation.reset()
  characterName.value = ''
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
  void playerStore
  refreshSlots()
})
</script>

<style scoped>
.main-menu {
  position: relative;
  width: 100%;
  max-width: 100vw;
  min-width: 0;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding:
    calc(var(--ui-page-padding-top) + env(safe-area-inset-top, 0px))
    var(--ui-page-padding-x)
    calc(var(--ui-page-padding-bottom) + env(safe-area-inset-bottom, 0px));
  color: #315257;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 218, 140, 0.24), transparent 24%),
    radial-gradient(circle at 88% 12%, rgba(123, 187, 176, 0.26), transparent 28%),
    linear-gradient(180deg, rgba(248, 255, 250, 0.98), rgba(239, 249, 244, 0.96) 48%, rgba(250, 246, 234, 0.98));
}

.menu-shell {
  width: 100%;
  max-width: var(--ui-page-max-width);
  min-width: 0;
  margin: 0 auto;
  display: grid;
  gap: var(--ui-page-gap);
}

.menu-audio-toggle {
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  right: max(12px, calc((100vw - var(--ui-phone-base-width)) / 2 + 12px));
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.18rem 0.28rem 0.18rem 0.18rem;
  border: 1px solid rgba(120, 161, 154, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 249, 0.86);
  color: rgba(61, 90, 89, 0.82);
  font: inherit;
  font-size: 0.75rem;
  backdrop-filter: blur(14px);
  box-shadow: 0 14px 30px rgba(88, 123, 116, 0.12);
}

.menu-audio-toggle.active {
  border-color: rgba(188, 141, 58, 0.24);
  color: #8b6226;
}

.hero-panel {
  margin-top: 1.7rem;
}

.hero-content {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.82fr);
  grid-template-areas:
    "copy side"
    "actions actions";
  gap: 0.95rem 1rem;
}

.hero-copy {
  grid-area: copy;
  align-self: start;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.62rem;
  border-radius: 999px;
  background: rgba(255, 247, 220, 0.82);
  color: rgba(143, 97, 36, 0.9);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.game-title {
  margin: 0.38rem 0 0;
  color: #8d6328;
  font-size: clamp(2rem, 1.46rem + 2.4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.24em;
  line-height: 1.05;
  text-shadow: 0 4px 16px rgba(188, 141, 58, 0.16);
}

.game-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(67, 92, 90, 0.76);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}

.hero-side {
  grid-area: side;
  display: grid;
  gap: 0.55rem;
  align-self: start;
}

.hero-stat {
  padding: 0.7rem 0.78rem;
  border: 1px solid rgba(188, 141, 58, 0.16);
  border-radius: 16px;
  background: rgba(255, 252, 244, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.hero-stat span {
  display: block;
  color: rgba(67, 92, 90, 0.66);
  font-size: 0.68rem;
}

.hero-stat strong {
  display: block;
  margin-top: 0.2rem;
  color: #325154;
  font-size: 0.92rem;
  line-height: 1.2;
}

.hero-actions {
  grid-area: actions;
  display: grid;
  gap: 0.5rem;
  align-content: end;
}

.home-grid,
.settings-stack,
.creation-shell {
  display: grid;
  gap: var(--ui-page-gap);
}

.menu-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: rgba(67, 92, 90, 0.78);
  font-size: 0.78rem;
  line-height: 1.5;
}

.menu-note-card {
  margin-top: -0.1rem;
}

.menu-note {
  display: grid;
  gap: 0.45rem;
}

.menu-note span {
  display: block;
  color: rgba(67, 92, 90, 0.62);
  font-size: 0.72rem;
}

.menu-note strong {
  color: #8d6328;
  font-size: 0.92rem;
}

.menu-note p {
  margin: 0;
  color: rgba(67, 92, 90, 0.74);
  font-size: 0.78rem;
  line-height: 1.55;
}

.screen-shell {
  display: grid;
  gap: 1rem;
}

.ghost-back {
  border: 1px solid rgba(120, 161, 154, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 249, 0.76);
  color: #4b6767;
  font: inherit;
  font-size: 0.75rem;
  padding: 0.45rem 0.82rem;
}

.save-list {
  display: grid;
  gap: 0.75rem;
}

.save-slot-card {
  display: grid;
  gap: 0.8rem;
}

.save-slot-head,
.save-slot-main,
.save-slot-stats,
.settings-row,
.settings-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.save-slot-head {
  align-items: flex-start;
}

.save-slot-index {
  color: #8b6226;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.save-slot-state {
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 247, 220, 0.82);
  color: #8b6226;
  font-size: 0.7rem;
}

.save-slot-state.empty {
  background: rgba(229, 239, 238, 0.82);
  color: rgba(67, 92, 90, 0.68);
}

.save-slot-main {
  justify-content: space-between;
  align-items: flex-end;
}

.save-slot-main strong {
  color: #325154;
  font-size: 1rem;
}

.save-slot-main span {
  color: rgba(143, 97, 36, 0.9);
  font-size: 0.76rem;
}

.save-slot-stats {
  justify-content: flex-start;
  gap: 1rem;
}

.save-slot-stats div {
  min-width: 5.2rem;
}

.save-slot-stats small,
.settings-row-copy small,
.settings-hero-copy span {
  display: block;
  color: rgba(67, 92, 90, 0.66);
  font-size: 0.72rem;
}

.save-slot-stats strong {
  color: #325154;
  font-size: 0.92rem;
}

.save-slot-time,
.save-slot-empty-copy,
.settings-hero-copy p,
.bloodline-desc {
  margin: 0;
  color: rgba(67, 92, 90, 0.74);
  font-size: 0.78rem;
  line-height: 1.55;
}

.settings-hero {
  align-items: center;
}

.settings-hero-copy {
  flex: 1;
}

.settings-hero-copy strong,
.settings-row-copy strong {
  display: block;
  margin-top: 0.15rem;
  color: #325154;
  font-size: 0.96rem;
}

.danger-row {
  align-items: center;
}

.step-indicator {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.step-dot {
  display: grid;
  justify-items: center;
  gap: 0.35rem;
}

.step-dot span {
  width: 2.05rem;
  height: 2.05rem;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(229, 239, 238, 0.92);
  color: rgba(67, 92, 90, 0.58);
  font-size: 0.8rem;
  font-weight: 700;
}

.step-dot small {
  color: rgba(67, 92, 90, 0.72);
  font-size: 0.68rem;
}

.step-dot.active span {
  background: rgba(255, 244, 208, 0.96);
  color: #8b6226;
  box-shadow: 0 0 0 2px rgba(188, 141, 58, 0.18);
}

.step-dot.done span {
  background: rgba(114, 176, 167, 0.9);
  color: #f4fcfa;
}

.option-grid {
  display: grid;
  gap: 0.85rem;
}

.choice-card {
  display: grid;
  gap: 0.38rem;
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(120, 161, 154, 0.2);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(240, 249, 244, 0.86)),
    radial-gradient(circle at top right, rgba(255, 220, 146, 0.16), transparent 58%);
  color: #325154;
  font: inherit;
  text-align: left;
  box-shadow: 0 18px 34px rgba(88, 123, 116, 0.09);
}

.choice-symbol {
  color: #8b6226;
  font-size: 1.8rem;
  line-height: 1;
}

.choice-card strong {
  font-size: 1rem;
}

.choice-card p {
  margin: 0;
  color: rgba(67, 92, 90, 0.72);
  font-size: 0.78rem;
  line-height: 1.55;
}

.awakening-card {
  --accent-color: #8b6226;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--accent-color) 28%, white);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 252, 241, 0.94), rgba(239, 249, 244, 0.88)),
    radial-gradient(circle at top, color-mix(in srgb, var(--accent-color) 16%, white), transparent 56%);
}

.awakening-heading {
  display: grid;
  gap: 0.24rem;
  text-align: center;
}

.awakening-element {
  color: var(--accent-color);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.awakening-element small,
.awakening-eyebrow {
  font-size: 0.9rem;
}

.awakening-heading strong {
  color: var(--accent-color);
  font-size: 1rem;
}

.awakening-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.awakening-stat {
  padding: 0.7rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.74);
}

.awakening-stat small {
  display: block;
  color: rgba(67, 92, 90, 0.62);
  font-size: 0.68rem;
}

.awakening-stat strong {
  display: block;
  margin-top: 0.12rem;
  color: #325154;
  font-size: 0.9rem;
}

.bloodline-card .awakening-heading strong {
  font-size: 1.08rem;
}

.action-row {
  display: grid;
  gap: 0.6rem;
}

.name-field {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}

.name-field span {
  color: rgba(67, 92, 90, 0.7);
  font-size: 0.74rem;
}

.name-field input {
  width: 100%;
  min-height: 3rem;
  padding: 0 0.95rem;
  border: 1px solid rgba(120, 161, 154, 0.24);
  border-radius: 16px;
  background: rgba(255, 255, 250, 0.9);
  color: #325154;
  font: inherit;
  font-size: 0.92rem;
  box-sizing: border-box;
}

.name-field input::placeholder {
  color: rgba(67, 92, 90, 0.42);
}

.confirm-dialog-copy {
  margin: 0;
  color: rgba(67, 92, 90, 0.76);
  font-size: 0.82rem;
  line-height: 1.6;
}

@media (min-width: 500px) {
  .home-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 390px) {
  .hero-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      "copy"
      "side"
      "actions";
  }

  .save-slot-main,
  .save-slot-stats,
  .settings-row,
  .settings-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .save-slot-main {
    gap: 0.2rem;
  }
}
</style>
