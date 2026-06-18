<template>
  <main class="main-menu">
    <button
      type="button"
      class="menu-audio-toggle"
      :class="{ active: bgmEnabled }"
      :aria-label="bgmEnabled ? '关闭背景音' : '开启背景音'"
      @click="handleToggleBgm"
    >
      <component :is="bgmEnabled ? Volume2 : VolumeX" :size="16" />
      <span>{{ bgmEnabled ? '关闭背景音' : '静音入场' }}</span>
    </button>

    <section class="start-shell" :class="{ 'has-save': playerStore.created }">
      <div class="brand-panel">
        <div class="brand-art" aria-hidden="true">
          <div class="moon-ring">
            <span class="seal">修</span>
          </div>
          <div class="mountain-line"></div>
        </div>
        <div class="brand-copy">
          <p>2D 挂机修仙 · 明亮手游主界</p>
          <h1>我欲修仙</h1>
          <strong>挂机修炼、奇遇历险、宗门势力与 NPC 命运会在同一个世界时钟里推进。</strong>
          <div class="brand-tags" aria-label="当前版本重点">
            <span><Sparkles :size="13" />明亮主界</span>
            <span><LockKeyhole :size="13" />本命锁定</span>
            <span>
              <component :is="bgmEnabled ? Volume2 : VolumeX" :size="13" />
              {{ bgmEnabled ? '声音开启' : '默认静音' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!playerStore.created" class="guide-panel creation-panel">
        <div class="guide-head">
          <span>首次创建</span>
          <strong>定下本命</strong>
          <p>这里仅用于建立第一份角色档案。创建后灵根与气质不再从首页反复修改，后续成长交给角色、功法、剧情与机缘系统。</p>
        </div>

        <div class="creation-step-row" aria-label="创建流程">
          <div v-for="step in creationSteps" :key="step.label" class="creation-step">
            <span>{{ step.index }}</span>
            <strong>{{ step.label }}</strong>
          </div>
        </div>

        <label class="name-field">
          <span>道号</span>
          <input v-model="draftName" maxlength="8" placeholder="云逸" />
        </label>

        <div class="choice-group">
          <span>灵根</span>
          <div class="choice-grid">
            <button
              v-for="option in elementOptions"
              :key="option.id"
              :class="{ active: draftElement === option.id }"
              @click="draftElement = option.id"
            >
              <i :style="{ color: option.color }">{{ option.icon }}</i>
              <strong>{{ option.label }}</strong>
            </button>
          </div>
        </div>

        <div class="choice-group">
          <span>气质</span>
          <div class="avatar-row">
            <button
              v-for="option in avatarOptions"
              :key="option.icon"
              :class="{ active: draftIcon === option.icon }"
              @click="draftIcon = option.icon"
            >
              {{ option.icon }}
            </button>
          </div>
        </div>

        <div class="creation-lock-note">
          <strong>创建后锁定</strong>
          <p>本命设定会写入存档。首页后续只显示继续入口，灵根、气质、头像不再从这里反复改动。</p>
        </div>

        <div class="start-actions">
          <button class="primary-action" @click="handleStart">
            <Play :size="18" />
            <span>开始修仙</span>
            <small>进入主循环</small>
          </button>
        </div>
      </div>

      <div v-else class="guide-panel save-panel">
        <div class="guide-head">
          <span>当前存档</span>
          <strong>继续修途</strong>
          <p>本命已写入存档。首页只保留继续入口、声音状态和 P0 目标，不再承担角色编辑器职责。</p>
        </div>

        <div class="save-hero-card">
          <div class="save-profile">
            <div class="save-avatar">{{ playerStore.icon }}</div>
            <div class="save-profile-copy">
              <span>{{ playerStore.realmInfo.fullName }} · {{ playerStore.element }}灵根 · {{ playerStore.quality }}</span>
              <strong>{{ playerStore.name }}</strong>
              <p>进入后直接落在主界行动台，优先跑通挂机、历险、故事、人物、地图、宗门六项闭环。</p>
            </div>
          </div>

          <button class="primary-action docket-action" @click="handleContinue">
            <Play :size="18" />
            <span>进入游戏</span>
            <small>修炼首页</small>
          </button>
        </div>

        <div class="save-lock-row" aria-label="创建设定状态">
          <span>本命锁定</span>
          <span>入场静音</span>
          <span>优先 P0 闭环</span>
        </div>

        <div class="save-stats">
          <div>
            <span>修为</span>
            <strong>{{ formatAmount(playerStore.cultivation) }}/{{ formatAmount(playerStore.maxCultivation) }}</strong>
          </div>
          <div>
            <span>灵石</span>
            <strong>{{ formatAmount(playerStore.gold) }}</strong>
          </div>
          <div>
            <span>体力</span>
            <strong>{{ formatAmount(playerStore.stamina) }}/{{ formatAmount(playerStore.maxStamina) }}</strong>
          </div>
        </div>

        <div class="priority-board">
          <div class="priority-title">
            <span>P0 当前目标</span>
            <strong>{{ p0Audit.title }} · {{ p0Audit.progressText }}</strong>
            <small>{{ p0Acceptance.headline }}</small>
          </div>
          <div class="priority-grid">
            <button
              v-for="item in priorityItems"
              :key="item.id"
              type="button"
              class="priority-item"
              :class="`state-${item.state}`"
              @click="handlePriorityItem(item.id)"
            >
              <span>{{ item.icon }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.desc }}</small>
              <em>{{ item.actionLabel }}</em>
            </button>
          </div>
        </div>

        <div class="start-actions">
          <button
            v-if="p0Acceptance.primaryGap"
            class="primary-action compact"
            type="button"
            @click="handlePrimaryGap"
          >
            <Play :size="18" />
            <span>处理当前缺口</span>
            <small>{{ p0Acceptance.primaryGap.nextAction }}</small>
          </button>
          <div class="save-action-row">
            <button class="secondary-action" @click="handleSettings">
              <Settings :size="16" />
              系统设置
            </button>
            <button class="secondary-action ghost" @click="handleStory">
              <ScrollText :size="16" />
              命簿卷宗
            </button>
          </div>
        </div>
      </div>

      <aside class="world-preview">
        <div
          v-for="card in roadmapCards"
          :key="card.title"
          class="preview-card"
          :class="{ active: card.active }"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.title }}</strong>
          <p>{{ card.desc }}</p>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, Play, ScrollText, Settings, Sparkles, Volume2, VolumeX } from 'lucide-vue-next'
import { useAudio } from '@/composables/useAudio'
import { useP0LoopActions } from '@/composables/useP0LoopActions'
import { useP0LoopStatus } from '@/composables/useP0LoopStatus'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/playerStore'
import type { Element } from '@/types/unit'
import type { MainLoopReadinessKey } from '@/world/runtime/mainLoopReadinessResolver'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()
const { info } = useToast()
const { p0Audit, p0Acceptance } = useP0LoopStatus()
const { handleP0LoopAction } = useP0LoopActions()
const { bgmEnabled, toggleBgm } = useAudio()

const draftName = ref(playerStore.name || '云逸')
const draftElement = ref<Element>(playerStore.element)
const draftIcon = ref(playerStore.icon || '剑')

const elementOptions: Array<{ id: Element; label: string; icon: string; color: string }> = [
  { id: '金', label: '金灵根', icon: '金', color: '#b48a2d' },
  { id: '木', label: '木灵根', icon: '木', color: '#438f65' },
  { id: '水', label: '水灵根', icon: '水', color: '#3f8ba8' },
  { id: '火', label: '火灵根', icon: '火', color: '#bd5a45' },
  { id: '土', label: '土灵根', icon: '土', color: '#967047' }
]

const avatarOptions = [
  { icon: '剑' },
  { icon: '丹' },
  { icon: '符' },
  { icon: '阵' },
  { icon: '灵' }
]

const creationSteps = [
  { index: '一', label: '道号' },
  { index: '二', label: '灵根' },
  { index: '三', label: '入世' }
]

const priorityIcons = {
  idle: '修',
  adventure: '游',
  story: '卷',
  npc: '人',
  map: '图',
  sect: '门'
} as const

const priorityItems = computed(() => p0Audit.value.checklist.map(item => ({
  id: item.id,
  icon: priorityIcons[item.id],
  title: item.label,
  desc: `${item.stateLabel} · ${item.detail}`,
  state: item.state,
  actionLabel: item.state === 'closed' ? '查看' : item.nextAction
})))

const roadmapCards = [
  {
    label: 'P0 主循环',
    title: '修炼 / 历险 / 故事',
    desc: '先保证进入、行动、反馈、返回这些基础链路稳定可玩。',
    active: true
  },
  {
    label: 'P0 世界',
    title: 'NPC / 奇遇 / 日志',
    desc: '挂机时世界继续推进，人物关系与异闻会写入主界面。',
    active: false
  },
  {
    label: 'P1 扩展',
    title: '地图 / 宗门 / 战斗深化',
    desc: '可玩闭环稳定后，再扩展大世界、势力吞并和表现层。',
    active: false
  }
]

function applyProfile() {
  playerStore.applyCreationProfile({
    name: draftName.value || '云逸',
    icon: draftIcon.value,
    element: draftElement.value
  })
}

function handleStart() {
  applyProfile()
  info('本命已定，踏入修仙界。')
  void router.push(getRedirectPath())
}

function handleContinue() {
  info('读取当前存档。')
  void router.push(getRedirectPath())
}

function handleSettings() {
  void router.push('/game/settings')
}

function handleStory() {
  void router.push('/game/story')
}

function handleToggleBgm() {
  toggleBgm()
}

function handlePrimaryGap() {
  const gap = p0Acceptance.value.primaryGap
  if (!gap) return
  handleP0LoopAction(gap.id)
}

function handlePriorityItem(id: MainLoopReadinessKey) {
  handleP0LoopAction(id)
}

function getRedirectPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/game')) return redirect
  return '/game/cultivation'
}

function formatAmount(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
</script>

<style scoped>
.main-menu {
  position: relative;
  height: 100vh;
  height: 100dvh;
  overflow: auto;
  padding: 14px;
  color: #315257;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 226, 145, 0.34), transparent 24%),
    radial-gradient(circle at 86% 10%, rgba(108, 203, 180, 0.26), transparent 30%),
    linear-gradient(90deg, rgba(69, 118, 104, 0.052) 1px, transparent 1px),
    linear-gradient(0deg, rgba(69, 118, 104, 0.044) 1px, transparent 1px),
    linear-gradient(120deg, transparent 0 34%, rgba(255, 237, 174, 0.28) 34% 35%, transparent 35% 100%),
    linear-gradient(135deg, rgba(248, 255, 244, 0.98) 0%, rgba(235, 249, 243, 0.96) 46%, rgba(255, 248, 226, 0.94) 100%);
  background-size: 44px 44px, 44px 44px, auto, auto, auto, auto;
}

.menu-audio-toggle {
  position: fixed;
  top: calc(14px + env(safe-area-inset-top, 0px));
  right: 14px;
  z-index: 10;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid rgba(103, 149, 144, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 250, 0.84);
  color: #4b6767;
  font-family: var(--font-game);
  font-size: 11px;
  box-shadow: 0 12px 28px rgba(88, 123, 116, 0.12);
  backdrop-filter: blur(14px);
  cursor: pointer;
  touch-action: manipulation;
}

.menu-audio-toggle.active {
  border-color: rgba(188, 141, 58, 0.3);
  background: rgba(255, 249, 233, 0.9);
  color: #8b6226;
}

.start-shell {
  min-height: calc(100dvh - 36px);
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.82fr);
  grid-template-areas:
    "brand guide"
    "preview guide";
  gap: 16px;
  align-content: center;
}

.start-shell.has-save {
  grid-template-columns: minmax(0, 0.72fr) minmax(480px, 0.96fr);
  align-content: center;
}

.brand-panel,
.guide-panel,
.world-preview {
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.9), rgba(244, 252, 247, 0.78)),
    linear-gradient(90deg, rgba(255, 235, 170, 0.18), transparent 38%);
  box-shadow: 0 24px 56px rgba(88, 123, 116, 0.16);
  backdrop-filter: blur(16px);
}

.brand-panel {
  position: relative;
  overflow: hidden;
  grid-area: brand;
  min-height: 310px;
  display: grid;
  grid-template-columns: 144px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  padding: 34px;
}

.brand-panel::before {
  content: '';
  position: absolute;
  inset: auto -6% 0 -6%;
  height: 92px;
  background:
    linear-gradient(140deg, transparent 0 28%, rgba(85, 135, 119, 0.2) 28% 38%, transparent 38%),
    linear-gradient(38deg, transparent 0 34%, rgba(151, 99, 38, 0.14) 34% 48%, transparent 48%),
    linear-gradient(180deg, transparent, rgba(95, 151, 137, 0.16));
  opacity: 0.92;
  pointer-events: none;
}

.brand-art {
  position: relative;
  min-height: 188px;
  display: grid;
  place-items: center;
}

.moon-ring {
  width: 136px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(151, 99, 38, 0.18);
  background:
    radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.86), transparent 24%),
    linear-gradient(145deg, #fff3c0, #bfead6);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 18px 34px rgba(91, 151, 132, 0.24);
}

.mountain-line {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 18px;
  height: 64px;
  border-radius: 999px 999px 14px 14px;
  background:
    linear-gradient(135deg, transparent 0 28%, rgba(96, 143, 126, 0.34) 28% 42%, transparent 42%),
    linear-gradient(45deg, transparent 0 34%, rgba(139, 98, 38, 0.18) 34% 50%, transparent 50%),
    linear-gradient(180deg, transparent, rgba(115, 196, 177, 0.16));
  opacity: 0.8;
}

.seal {
  width: 92px;
  height: 92px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  border: 1px solid rgba(151, 99, 38, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 248, 221, 0.88), rgba(235, 252, 244, 0.8)),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #9a6827;
  font-size: 44px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7);
}

.brand-copy {
  display: grid;
  gap: 12px;
}

.brand-copy p,
.guide-head span,
.choice-group > span,
.name-field span,
.preview-card span,
.priority-title span {
  margin: 0;
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.guide-head p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

.save-panel {
  align-content: center;
  gap: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.97), rgba(241, 252, 247, 0.88)),
    linear-gradient(135deg, rgba(127, 205, 180, 0.18), transparent 42%),
    linear-gradient(90deg, rgba(255, 226, 145, 0.24), transparent 62%);
}

.save-panel .guide-head {
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(111, 157, 149, 0.14);
}

.creation-lock-note {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.78), rgba(241, 252, 247, 0.64)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.18), transparent 64%);
}

.creation-lock-note strong {
  color: #8e6227;
  font-size: 14px;
}

.creation-lock-note p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

.save-hero-card {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 168px;
  gap: 12px;
  align-items: stretch;
  padding: 14px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.92), rgba(242, 252, 247, 0.76)),
    radial-gradient(circle at top right, rgba(255, 224, 151, 0.2), transparent 64%);
}

.save-hero-card::after {
  content: '';
  position: absolute;
  right: 18px;
  bottom: 12px;
  width: 150px;
  height: 52px;
  border-radius: 999px 999px 14px 14px;
  background:
    linear-gradient(130deg, transparent 0 30%, rgba(104, 156, 137, 0.2) 30% 44%, transparent 44%),
    linear-gradient(40deg, transparent 0 38%, rgba(188, 141, 58, 0.18) 38% 52%, transparent 52%);
  opacity: 0.68;
  pointer-events: none;
}

.save-profile {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.save-lock-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.save-lock-row span {
  min-height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(188, 141, 58, 0.18);
  border-radius: 10px;
  background: rgba(255, 250, 233, 0.72);
  color: #8b6226;
  font-size: 11px;
}

.save-avatar {
  width: 76px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 16px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  background:
    linear-gradient(145deg, #fff2bd, #91dfc2),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #8e6227;
  font-size: 31px;
  box-shadow: 0 16px 30px rgba(94, 144, 130, 0.18);
}

.save-profile-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.save-profile span,
.save-stats span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.save-profile strong {
  color: #315257;
  font-size: 24px;
}

.save-profile p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 13px;
  line-height: 1.7;
}

.save-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.save-stats div {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.52);
}

.save-stats strong {
  color: #8e6227;
  font-size: 15px;
}

.priority-board {
  display: grid;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.64), rgba(244, 252, 248, 0.56)),
    radial-gradient(circle at top right, rgba(255, 224, 151, 0.18), transparent 64%);
}

.priority-title {
  display: grid;
  gap: 4px;
}

.priority-title strong {
  color: #315257;
  font-size: 15px;
}

.priority-title small {
  color: rgba(49, 82, 87, 0.7);
  font-size: 11px;
  line-height: 1.55;
}

.priority-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.priority-item {
  min-width: 0;
  display: grid;
  gap: 5px;
  min-height: 96px;
  padding: 10px;
  border: 1px solid rgba(111, 157, 149, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.58);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.priority-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(88, 123, 116, 0.12);
}

.priority-item.state-closed {
  border-color: rgba(88, 164, 143, 0.22);
  background: rgba(239, 252, 247, 0.72);
}

.priority-item.state-actionable {
  border-color: rgba(194, 146, 66, 0.2);
  background: rgba(255, 249, 232, 0.72);
}

.priority-item.state-blocked {
  border-color: rgba(199, 121, 138, 0.22);
  background: rgba(255, 244, 247, 0.72);
}

.priority-item span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: rgba(255, 246, 218, 0.84);
  color: #8b6226;
  font-size: 13px;
  font-weight: 800;
}

.priority-item strong {
  color: #315257;
  font-size: 12px;
}

.priority-item small {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(49, 82, 87, 0.68);
  font-size: 10px;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.priority-item em {
  overflow: hidden;
  color: #8b6226;
  font-size: 10px;
  font-style: normal;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-copy h1 {
  margin: 0;
  color: #8e6227;
  font-size: clamp(42px, 7vw, 78px);
  line-height: 1;
  letter-spacing: 0;
}

.brand-copy strong {
  max-width: 620px;
  color: #315257;
  font-size: 18px;
  line-height: 1.7;
}

.brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.brand-tags span {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  border-radius: 10px;
  background: rgba(255, 249, 231, 0.76);
  color: #8b6226;
  font-size: 11px;
}

.guide-panel {
  grid-area: guide;
  display: grid;
  gap: 14px;
  padding: 24px;
}

.guide-head {
  display: grid;
  gap: 6px;
}

.guide-head strong {
  color: #8e6227;
  font-size: 26px;
}

.creation-step-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(242, 252, 247, 0.54)),
    radial-gradient(circle at top right, rgba(255, 226, 145, 0.18), transparent 70%);
}

.creation-step {
  min-width: 0;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 6px 8px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.56);
}

.creation-step span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 244, 208, 0.9);
  color: #8b6226;
  font-size: 12px;
  font-weight: 800;
}

.creation-step strong {
  min-width: 0;
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-field,
.choice-group {
  display: grid;
  gap: 10px;
}

.name-field input {
  width: 100%;
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid rgba(111, 157, 149, 0.22);
  border-radius: 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.72);
  color: #315257;
  font-family: var(--font-game);
  font-size: 16px;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.choice-grid button,
.avatar-row button {
  min-height: 62px;
  border: 1px solid rgba(111, 157, 149, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  color: #315257;
  font-family: var(--font-game);
}

.choice-grid button {
  display: grid;
  place-items: center;
  gap: 6px;
}

.choice-grid i {
  font-style: normal;
  font-size: 20px;
}

.choice-grid strong {
  font-size: 11px;
}

.avatar-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.avatar-row button {
  font-size: 22px;
}

.choice-grid button.active,
.avatar-row button.active {
  border-color: rgba(188, 141, 58, 0.38);
  background: rgba(255, 247, 220, 0.86);
  box-shadow: 0 12px 26px rgba(145, 104, 41, 0.12);
}

.start-actions {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}

.save-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.primary-action,
.secondary-action {
  min-height: 56px;
  border-radius: 14px;
  border: 1px solid rgba(188, 141, 58, 0.28);
  font-family: var(--font-game);
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.primary-action {
  display: inline-grid;
  grid-template-columns: auto auto;
  place-content: center;
  align-items: center;
  gap: 4px;
  background:
    linear-gradient(180deg, #fff3c5, #bfe9d4),
    linear-gradient(90deg, rgba(255, 255, 255, 0.38), transparent);
  color: #735022;
  box-shadow: 0 16px 30px rgba(104, 151, 132, 0.18);
}

.primary-action span {
  font-size: 16px;
}

.primary-action small {
  grid-column: 1 / -1;
  color: rgba(88, 72, 44, 0.66);
  font-size: 11px;
}

.primary-action.compact {
  min-height: 66px;
}

.primary-action.compact small {
  overflow: hidden;
  max-width: min(360px, 80vw);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.primary-action.docket-action {
  position: relative;
  z-index: 1;
  min-height: 68px;
  border-radius: 12px;
}

.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.68);
  color: #496463;
}

.secondary-action.ghost {
  border-color: rgba(111, 157, 149, 0.2);
  background: rgba(243, 252, 248, 0.64);
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(104, 151, 132, 0.15);
}

.world-preview {
  grid-area: preview;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 16px;
}

.preview-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(111, 157, 149, 0.14);
}

.preview-card.active {
  background: rgba(255, 247, 220, 0.72);
  border-color: rgba(188, 141, 58, 0.22);
}

.preview-card strong {
  color: #315257;
  font-size: 14px;
}

.preview-card p {
  margin: 0;
  color: rgba(70, 99, 96, 0.72);
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .main-menu {
    padding: 10px;
  }

  .start-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "brand"
      "guide"
      "preview";
  }

  .brand-panel {
    min-height: auto;
    grid-template-columns: 92px minmax(0, 1fr);
    padding: 16px;
  }

  .brand-copy h1 {
    font-size: 40px;
  }

  .brand-copy strong {
    font-size: 14px;
  }

  .guide-panel {
    padding: 16px;
  }

  .brand-art {
    min-height: 116px;
  }

  .moon-ring {
    width: 88px;
  }

  .mountain-line {
    bottom: 8px;
    height: 42px;
  }

  .seal {
    width: 62px;
    height: 62px;
    font-size: 30px;
  }

  .choice-grid,
  .avatar-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .world-preview {
    grid-template-columns: 1fr;
  }

  .creation-step-row,
  .save-lock-row,
  .save-hero-card,
  .save-stats,
  .save-action-row {
    grid-template-columns: 1fr;
  }

  .priority-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .main-menu {
    padding-top: 58px;
  }

  .menu-audio-toggle {
    left: 10px;
    right: 10px;
    justify-content: center;
  }

  .start-shell {
    min-height: auto;
  }

  .brand-panel {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .brand-art {
    min-height: 88px;
  }

  .brand-copy {
    gap: 8px;
  }

  .brand-copy h1 {
    font-size: 34px;
  }

  .guide-head strong {
    font-size: 22px;
  }

  .choice-grid,
  .avatar-row,
  .priority-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .save-profile {
    grid-template-columns: 60px minmax(0, 1fr);
  }

  .save-avatar {
    width: 60px;
    border-radius: 14px;
    font-size: 26px;
  }

  .save-profile strong {
    font-size: 20px;
  }
}
</style>
